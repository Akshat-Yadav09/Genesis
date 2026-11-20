"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  MEMORIES,
  type CurveMemoriesGalleryProps,
} from "./memoriesData";
import "./memories.css";

type MemoriesSectionProps = {
  scrollContainerRef: CurveMemoriesGalleryProps["scrollContainerRef"];
};

type GalleryState = "loading" | "ready" | "unavailable";

function GalleryLoadFailure({ onUnavailable }: CurveMemoriesGalleryProps) {
  useEffect(() => {
    onUnavailable();
  }, [onUnavailable]);

  return null;
}

const CurveMemoriesGallery = dynamic<CurveMemoriesGalleryProps>(
  () =>
    import("./CurveMemoriesGallery").catch(() => ({
      default: GalleryLoadFailure,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

const sectionStyle = {
  "--memories-travel-desktop": `${100 + (MEMORIES.length - 1) * 66}svh`,
  "--memories-travel-mobile": `${100 + (MEMORIES.length - 1) * 44}svh`,
} as CSSProperties;

export default function MemoriesSection({ scrollContainerRef }: MemoriesSectionProps) {
  // Reserve the finite journey from the first render so the homepage's
  // section-offset measurement does not become stale after hydration.
  // The reduced-motion media query collapses this space before JS runs.
  const [galleryState, setGalleryState] = useState<GalleryState>("loading");
  const [shouldMountGallery, setShouldMountGallery] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncMotionPreference = () => {
      const canUseGallery = !reducedMotion.matches;

      if (!canUseGallery) {
        setShouldMountGallery(false);
        setGalleryState("unavailable");
        return;
      }

      setGalleryState("loading");
      setShouldMountGallery(true);
    };

    syncMotionPreference();
    reducedMotion.addEventListener("change", syncMotionPreference);

    return () => {
      reducedMotion.removeEventListener("change", syncMotionPreference);
    };
  }, []);

  const handleGalleryReady = useCallback(() => {
    setGalleryState("ready");
  }, []);

  const handleGalleryUnavailable = useCallback(() => {
    setGalleryState("unavailable");
    setAutoScroll(false);
  }, []);

  const toggleAutoScroll = useCallback(() => {
    setAutoScroll((enabled) => {
      const nextEnabled = !enabled;
      sectionRef.current?.dispatchEvent(
        new CustomEvent("genesis:memories-auto", {
          detail: { enabled: nextEnabled },
        }),
      );
      return nextEnabled;
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="memories"
      aria-labelledby="memories-heading"
      className="genesis-memories"
      data-gallery-state={galleryState}
      style={sectionStyle}
    >
      <div className="memories-viewport">
        <div className="memories-background" aria-hidden="true" />

        <header className="memories-header">
          <h2 id="memories-heading" className="memories-heading">
            <span className="memories-visually-hidden">Memories</span>
            <Image
              className="memories-title"
              src="/landing-pages/memories/ui/memories-title.svg"
              width={490}
              height={130}
              alt=""
            />
          </h2>
        </header>

        <div className="memories-static-grid" data-visual-fallback="true">
          <ul className="memories-photo-list">
            {MEMORIES.map((memory) => (
              <li key={memory.id} className="memories-photo-item">
                <figure className="memories-photo-card">
                  <Image
                    src={memory.src}
                    alt={memory.alt}
                    width={960}
                    height={700}
                    sizes="(max-width: 639px) 44vw, (max-width: 1023px) 22vw, 21vw"
                    className="memories-photo-image"
                    loading="lazy"
                  />
                  <figcaption className="memories-photo-caption">
                    {memory.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>

        {shouldMountGallery ? (
          <div className="memories-gallery-host" aria-hidden="true">
            <CurveMemoriesGallery
              scrollContainerRef={scrollContainerRef}
              memories={MEMORIES}
              onReady={handleGalleryReady}
              onUnavailable={handleGalleryUnavailable}
            />
          </div>
        ) : null}

        {galleryState === "ready" ? (
          <div className="memories-gallery-controls">
            <button
              type="button"
              className="memories-scroll-toggle"
              aria-label={
                autoScroll
                  ? "Stop automatic Memories gallery motion"
                  : "Start automatic Memories gallery motion"
              }
              aria-pressed={autoScroll}
              onClick={toggleAutoScroll}
            >
              {autoScroll ? "Auto" : "Scroll"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
