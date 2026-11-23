"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./memories.css";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type MemoryItem = {
  id: number;
  src: string;
  alt: string;
  caption: string;
};

// 16 photo tiles preserving authentic Genesis event photos
export const MEMORIES_16: readonly MemoryItem[] = [
  { id: 1, src: "/landing-pages/memories/photos/photo-01.webp", alt: "Genesis Opening Ceremony", caption: "Opening Ceremony" },
  { id: 2, src: "/landing-pages/memories/photos/photo-02.webp", alt: "Esports Arena Crowd", caption: "Main Arena" },
  { id: 3, src: "/landing-pages/memories/photos/photo-03.webp", alt: "Tournament Stage Match", caption: "Tournament Stage" },
  { id: 4, src: "/landing-pages/memories/photos/photo-04.webp", alt: "Cheering Audience", caption: "The Audience" },
  { id: 5, src: "/landing-pages/memories/photos/photo-05.webp", alt: "Team Collaboration", caption: "Team Spirit" },
  { id: 6, src: "/landing-pages/memories/photos/photo-06.webp", alt: "Production Crew Setup", caption: "Production Crew" },
  { id: 7, src: "/landing-pages/memories/photos/photo-07.webp", alt: "Final Showdown Match", caption: "Final Showdown" },
  { id: 8, src: "/landing-pages/memories/photos/photo-08.webp", alt: "Award Ceremony Celebrations", caption: "Award Ceremony" },
  { id: 9, src: "/landing-pages/memories/photos/photo-09.webp", alt: "Player Strategy Discussion", caption: "Tactical Briefing" },
  { id: 10, src: "/landing-pages/memories/photos/photo-10.webp", alt: "Championship Trophy Display", caption: "The Genesis Cup" },
  { id: 11, src: "/landing-pages/memories/photos/photo-11.webp", alt: "Cosplay & Fan Community", caption: "Brawler Community" },
  { id: 12, src: "/landing-pages/memories/photos/photo-12.webp", alt: "Intense 3v3 Showdown", caption: "3v3 Showdown" },
  { id: 13, src: "/landing-pages/memories/photos/photo-13.webp", alt: "Victory Cheers", caption: "Victory Moment" },
  { id: 14, src: "/landing-pages/memories/photos/photo-14.webp", alt: "Backstage Preparation", caption: "Backstage Prep" },
  { id: 15, src: "/landing-pages/memories/photos/photo-15.webp", alt: "Grand Final Highlights", caption: "Grand Finals" },
  { id: 16, src: "/landing-pages/memories/photos/photo-16.webp", alt: "Closing Celebration & Confetti", caption: "Genesis Finale" },
];

export type MemoriesSectionProps = {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
};

// Compute dynamic oval ring, expanded ring, and 4x4 grid coordinates
function computeMorphGeometry(vw: number, vh: number) {
  // 1. Grid State (Occupies roughly 90% of viewport)
  const gridW = Math.min(vw * 0.90, 1260);
  const gridH = Math.min(vh * 0.86, 820);
  const gap = Math.max(6, Math.min(16, vw * 0.012));
  const tileW = Math.round((gridW - 3 * gap) / 4);
  const tileH = Math.round((gridH - 3 * gap) / 4);

  const gridCoords = [];
  for (let i = 0; i < 16; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = Math.round((col - 1.5) * (tileW + gap));
    const y = Math.round((row - 1.5) * (tileH + gap));
    gridCoords.push({ x, y, rot: 0, scale: 1 });
  }

  // 2. Initial Oval Ring State around the central banner
  const bannerW = Math.max(220, Math.min(vw * 0.28, 400));
  const bannerH = bannerW * 0.26;
  const rx0 = Math.max(bannerW * 0.72, Math.min(vw * 0.38, 520));
  const ry0 = Math.max(bannerH * 1.55, Math.min(vh * 0.30, 320));
  const ringScale0 = Math.max(0.42, Math.min(0.68, (Math.min(vw, vh) * 0.12) / tileW));

  const ringInitial = [];
  for (let i = 0; i < 16; i++) {
    const theta = (i / 16) * 2 * Math.PI - Math.PI / 2;
    const x = Math.round(rx0 * Math.cos(theta));
    const y = Math.round(ry0 * Math.sin(theta));
    const rot = Math.round((theta * 180) / Math.PI + 90);
    const normalizedRot = ((rot + 180) % 360) - 180;
    ringInitial.push({ x, y, rot: normalizedRot, scale: ringScale0 });
  }

  // 3. Expanded & Revolved Ring State (Intermediate phase at ~0.35 scroll)
  const rx1 = rx0 * 1.30;
  const ry1 = ry0 * 1.25;
  const deltaTheta = 0.40 * Math.PI; // ~72 degrees orbital drift
  const ringScale1 = ringScale0 * 1.15;

  const ringExpanded = [];
  for (let i = 0; i < 16; i++) {
    const theta0 = (i / 16) * 2 * Math.PI - Math.PI / 2;
    const theta1 = theta0 + deltaTheta;
    const x = Math.round(rx1 * Math.cos(theta1));
    const y = Math.round(ry1 * Math.sin(theta1));
    const rot = Math.round((theta1 * 180) / Math.PI + 90);
    const normalizedRot = ((rot + 180) % 360) - 180;
    ringExpanded.push({ x, y, rot: normalizedRot, scale: ringScale1 });
  }

  return {
    tileW,
    tileH,
    gridCoords,
    ringInitial,
    ringExpanded,
  };
}

export default function MemoriesSection({ scrollContainerRef }: MemoriesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<(HTMLDivElement | null)[]>([]);

  const [activeMemory, setActiveMemory] = useState<MemoryItem | null>(null);
  const [tileDimensions, setTileDimensions] = useState<{ w: number; h: number }>({ w: 260, h: 180 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Lightbox handlers with scroll locking on scrollContainerRef
  const openLightbox = useCallback((item: MemoryItem) => {
    setActiveMemory(item);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.overflow = "hidden";
    }
  }, [scrollContainerRef]);

  const closeLightbox = useCallback(() => {
    setActiveMemory(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.overflow = "auto";
    }
  }, [scrollContainerRef]);

  // Escape key handler for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      }
    };

    if (activeMemory) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [activeMemory, closeLightbox]);

  // Clean up scroll lock on unmount
  useEffect(() => {
    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.overflow = "auto";
      }
    };
  }, [scrollContainerRef]);

  // GSAP ScrollTrigger timeline setup
  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller || !sectionRef.current) return;

    // Check reduced motion
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotionQuery.matches) {
      setIsReducedMotion(true);
      return;
    }

    const ctx = gsap.context(() => {
      const buildAnimation = () => {
        if (!stageRef.current) return;
        const rect = stageRef.current.getBoundingClientRect();
        const vw = rect.width || window.innerWidth;
        const vh = rect.height || window.innerHeight;

        const geom = computeMorphGeometry(vw, vh);
        setTileDimensions({ w: geom.tileW, h: geom.tileH });

        const tiles = tilesRef.current;

        // Set initial state at t = 0 (Oval Ring around banner)
        tiles.forEach((tile, i) => {
          if (!tile || !geom.ringInitial[i]) return;
          gsap.set(tile, {
            x: geom.ringInitial[i].x,
            y: geom.ringInitial[i].y,
            rotation: geom.ringInitial[i].rot,
            scale: geom.ringInitial[i].scale,
            opacity: 1,
          });
        });

        if (bannerRef.current) {
          gsap.set(bannerRef.current, { opacity: 1, scale: 1 });
        }
        if (hintRef.current) {
          gsap.set(hintRef.current, { opacity: 1, y: 0 });
        }

        // Single GSAP timeline scrubbed to scroll
        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "none" },
        });

        // 1. Banner and scroll hint fade out over first 35%
        if (bannerRef.current) {
          tl.to(
            bannerRef.current,
            {
              opacity: 0,
              scale: 0.85,
              duration: 0.35,
              ease: "power1.out",
            },
            0,
          );
        }

        if (hintRef.current) {
          tl.to(
            hintRef.current,
            {
              opacity: 0,
              y: -12,
              duration: 0.20,
              ease: "power1.out",
            },
            0,
          );
        }

        // 2. Animate all 16 tiles
        tiles.forEach((tile, i) => {
          if (!tile) return;
          const exp = geom.ringExpanded[i];
          const gr = geom.gridCoords[i];

          // Phase A (0 -> 0.35): Ring gently expands and tiles move around the oval
          tl.to(
            tile,
            {
              x: exp.x,
              y: exp.y,
              rotation: exp.rot,
              scale: exp.scale,
              duration: 0.35,
              ease: "power1.inOut",
            },
            0,
          );

          // Phase B (0.35 -> 1.0): SAME tiles grow, move and straighten into 4x4 grid
          tl.to(
            tile,
            {
              x: gr.x,
              y: gr.y,
              rotation: 0,
              scale: 1,
              duration: 0.65,
              ease: "power2.out",
            },
            0.35,
          );
        });

        // Create ScrollTrigger bound to the containerRef scroller
        ScrollTrigger.create({
          id: "memories-morph-trigger",
          trigger: sectionRef.current,
          scroller: scroller,
          start: "top top",
          end: "bottom bottom",
          animation: tl,
          scrub: 1.1,
          invalidateOnRefresh: true,
        });
      };

      buildAnimation();

      // Recalculate geometry on resize and refresh ScrollTrigger
      let resizeTimer: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const existingTrigger = ScrollTrigger.getById("memories-morph-trigger");
          if (existingTrigger) {
            existingTrigger.kill();
          }
          buildAnimation();
          ScrollTrigger.refresh();
        }, 150);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(resizeTimer);
      };
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [scrollContainerRef]);

  return (
    <section
      ref={sectionRef}
      id="memories"
      aria-label="Genesis Event Memories"
      className="genesis-memories"
    >
      <div className="memories-viewport">
        {/* ── Recovered Original Background Layer (Skull/Star Cosmic WebP + Dual Gradient) ── */}
        <div className="memories-background" aria-hidden="true" />

        {/* ── Reduced Motion Static 4x4 Grid Fallback ── */}
        {isReducedMotion ? (
          <div className="relative w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center z-10">
            <header className="mb-8">
              <Image
                src="/landing-pages/memories/ui/memories-title.svg"
                width={490}
                height={130}
                alt="MEMORIES"
                className="w-64 sm:w-80 h-auto"
                priority
              />
            </header>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
              {MEMORIES_16.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(item)}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/20 hover:border-amber-400 cursor-pointer shadow-lg bg-slate-900"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 py-1 px-2 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-[11px] font-lilita text-white truncate block">
                      {item.caption}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Scroll-Morph Stage: Oval Ring to 4x4 Grid ── */
          <div ref={stageRef} className="memories-stage">
            {/* Center Orange Memories Banner & Scroll Hint */}
            <div ref={bannerRef} className="memories-banner-group">
              <Image
                src="/landing-pages/memories/ui/memories-title.svg"
                width={490}
                height={130}
                alt="MEMORIES"
                className="memories-title-img"
                priority
              />
              <div ref={hintRef} className="memories-scroll-hint">
                <span>SCROLL TO EXPLORE</span>
                <span className="animate-bounce">↓</span>
              </div>
            </div>

            {/* 16 Morphing Photo Tiles */}
            {MEMORIES_16.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  tilesRef.current[index] = el;
                }}
                className="memories-tile border border-white/20 hover:border-amber-400/90 transition-colors duration-200"
                style={{
                  width: `${tileDimensions.w}px`,
                  height: `${tileDimensions.h}px`,
                  left: "50%",
                  top: "50%",
                  marginLeft: `${-tileDimensions.w / 2}px`,
                  marginTop: `${-tileDimensions.h / 2}px`,
                  willChange: "transform",
                }}
                onClick={() => openLightbox(item)}
              >
                {/* Numbered gradient placeholder visible even if image is loading/missing */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-[#020817] flex flex-col items-center justify-center p-2 text-center select-none">
                  <span className="font-lilita text-amber-400/40 text-lg sm:text-2xl font-bold">
                    #{String(item.id).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-neutral-400/80 font-sans truncate max-w-full">
                    {item.caption}
                  </span>
                </div>

                {/* Real photo with object-fit: cover */}
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 25vw, 22vw"
                  className="object-cover z-10 transition-transform duration-300 hover:scale-[1.03]"
                  loading="lazy"
                />

                {/* Caption overlay on hover */}
                <div className="absolute inset-x-0 bottom-0 py-1.5 px-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[11px] sm:text-xs font-lilita text-white tracking-wide truncate block">
                    {item.caption}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Fixed Lightbox with uncropped photo, backdrop close, close button, and escape close ── */}
      {activeMemory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeMemory.caption}
          className="fixed inset-0 z-[999999] bg-black/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            aria-label="Close image lightbox"
            onClick={closeLightbox}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center text-xl font-bold transition-all z-30 cursor-pointer shadow-lg"
          >
            ✕
          </button>

          {/* Uncropped full image */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-h-[75vh] flex items-center justify-center">
              <Image
                src={activeMemory.src}
                alt={activeMemory.alt}
                width={1600}
                height={1100}
                className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-lg shadow-2xl border border-white/15"
                priority
              />
            </div>

            {/* Caption bar */}
            <div className="mt-3 text-center">
              <h3 className="font-lilita text-lg sm:text-xl text-white tracking-wider">
                {activeMemory.caption}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                {activeMemory.alt}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
