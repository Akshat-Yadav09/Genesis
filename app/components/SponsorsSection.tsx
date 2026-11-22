"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { sounds } from "./sound";

interface SponsorCardData {
  id: string;
  name: string;
  svgPath: string;
  tier: string;
}

const SPONSOR_CARDS: SponsorCardData[] = [
  {
    id: "title-sponsor",
    name: "Title Sponsor",
    svgPath: "/landing-pages/sponsors/cards/card-title-sponsor.svg",
    tier: "TITLE SPONSOR",
  },
  {
    id: "event-partner",
    name: "Event Partner",
    svgPath: "/landing-pages/sponsors/cards/card-event-partner.svg",
    tier: "EVENT PARTNER",
  },
  {
    id: "platform-sponsor",
    name: "Platform Sponsor",
    svgPath: "/landing-pages/sponsors/cards/card-platform-sponsor.svg",
    tier: "PLATFORM SPONSOR",
  },
  {
    id: "sponsor-tier-04",
    name: "Tier 4 Sponsor",
    svgPath: "/landing-pages/sponsors/cards/card-brawl-ball.svg",
    tier: "???????",
  },
  {
    id: "sponsor-tier-05",
    name: "Tier 5 Sponsor",
    svgPath: "/landing-pages/sponsors/cards/card-5v5.svg",
    tier: "?????",
  },
  {
    id: "sponsor-tier-06",
    name: "Tier 6 Sponsor",
    svgPath: "/landing-pages/sponsors/cards/card-target.svg",
    tier: "????",
  },
];

export default function SponsorsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealedSponsorIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const section = sectionRef.current;
    const scroller = section?.closest<HTMLElement>("main");
    if (!section || !scroller) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const updateCards = () => {
      frame = 0;

      // Always mark already-revealed cards so layout switches (desktop/tablet/mobile) keep them revealed
      revealedSponsorIdsRef.current.forEach((id) => {
        section
          .querySelectorAll<HTMLElement>(`[data-sponsor-id="${id}"]`)
          .forEach((el) => {
            if (!el.classList.contains("is-revealed")) {
              el.classList.add("is-revealed");
            }
          });
      });

      if (reducedMotion.matches) {
        SPONSOR_CARDS.forEach((card) => {
          revealedSponsorIdsRef.current.add(card.id);
          section
            .querySelectorAll<HTMLElement>(`[data-sponsor-id="${card.id}"]`)
            .forEach((el) => el.classList.add("is-revealed"));
        });
        return;
      }

      // If all sponsor cards are revealed, no more checks are needed
      if (revealedSponsorIdsRef.current.size >= SPONSOR_CARDS.length) return;

      const scrollerRect = scroller.getBoundingClientRect();
      const activationY = scroller.scrollTop + scroller.clientHeight * 0.68;

      const unrevealedCards = section.querySelectorAll<HTMLElement>(
        ".genesis-sponsor-flip-card:not(.is-revealed)",
      );

      unrevealedCards.forEach((card) => {
        const id = card.dataset.sponsorId;
        if (!id || revealedSponsorIdsRef.current.has(id)) return;

        const rect = card.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const cardCenter =
            scroller.scrollTop + rect.top + rect.height / 2 - scrollerRect.top;
          if (activationY >= cardCenter) {
            revealedSponsorIdsRef.current.add(id);
            // Crossing activation line adds is-revealed once per card; reverse scroll never removes it
            section
              .querySelectorAll<HTMLElement>(`[data-sponsor-id="${id}"]`)
              .forEach((el) => el.classList.add("is-revealed"));
          }
        }
      });
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateCards);
    };

    // Activate the flip-ready class after hydration
    section.classList.add("genesis-sponsors-flip-ready");
    scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    reducedMotion.addEventListener("change", scheduleUpdate);

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(section);

    // Initial check
    updateCards();

    return () => {
      scroller.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      resizeObserver.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const handleCardHover = () => {
    sounds.playHover();
  };

  const handleCardClick = () => {
    sounds.playClick();
  };

  return (
    <section
      ref={sectionRef}
      id="sponsors"
      className="genesis-sponsors relative w-full max-w-full min-h-screen flex flex-col items-center justify-between overflow-x-hidden overflow-y-visible select-none bg-[#030015]"
      style={{
        background: "radial-gradient(ellipse at 50% 30%, #150a3c 0%, #0c0424 45%, #030014 100%)",
        minHeight: "100vh",
        paddingTop: "clamp(48px, 6vw, 84px)",
        paddingBottom: "clamp(140px, 16vw, 220px)",
        paddingLeft: "clamp(16px, 4vw, 32px)",
        paddingRight: "clamp(16px, 4vw, 32px)",
        boxSizing: "border-box",
      }}
    >
      {/* ── Background Cosmic Texture ─────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <Image
          src="/landing-pages/sponsors/backgrounds/cosmic-brawl-stars-pattern-hd.webp"
          alt="Cosmic Brawl Stars Pattern"
          fill
          sizes="100vw"
          className="object-cover opacity-85 mix-blend-screen select-none pointer-events-none"
          loading="lazy"
          decoding="async"
        />
        {/* Soft vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,0,21,0.3)_60%,rgba(3,0,21,0.8)_100%)] pointer-events-none" />
        {/* Subtle Edge Transitions: Visual continuity between Prize Pool above and FAQs below */}
        <div className="absolute top-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-b from-[#030015] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-t from-[#030015] to-transparent pointer-events-none" />
      </div>

      {/* ── Content Centering Container ───────────────────── */}
      <div className="relative z-10 w-full max-w-[1440px] flex flex-col items-center flex-grow justify-between">

        {/* ── 1. Top SPONSORS Header ──────────────────────── */}
        <header className="relative w-full flex items-center justify-center gap-2 sm:gap-4 md:gap-5 pt-1 pb-3 sm:pb-5 md:pb-6">
          {/* Crown Left with Pop-out Animation */}
          <div className="relative w-[32px] h-[42px] sm:w-[56px] sm:h-[72px] md:w-[68px] md:h-[86px] flex-shrink-0 animate-icon-pop-crown transition-transform duration-200 hover:scale-110 active:scale-95 cursor-default">
            <Image
              src="/landing-pages/sponsors/ui/header-crown.svg"
              alt="Genesis Crown"
              fill
              className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] drop-shadow-[0_0_12px_rgba(234,179,8,0.4)]"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* SPONSORS Title Center (Steady, No Text Jitter) */}
          <div className="relative w-[170px] sm:w-[270px] md:w-[327px] aspect-[327/68] flex-shrink-0">
            <Image
              src="/landing-pages/sponsors/ui/header-sponsors-title.svg"
              alt="SPONSORS"
              fill
              className="object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.8)]"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Gems Box Right with Pop-out Animation */}
          <div className="relative w-[52px] h-[42px] sm:w-[98px] sm:h-[78px] md:w-[124px] md:h-[100px] flex-shrink-0 animate-icon-pop-gems transition-transform duration-200 hover:scale-110 active:scale-95 cursor-default">
            <Image
              src="/landing-pages/sponsors/ui/header-gems.svg"
              alt="Gems and Credits Box"
              fill
              className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] drop-shadow-[0_0_14px_rgba(6,182,212,0.45)]"
              loading="lazy"
              decoding="async"
            />
          </div>
        </header>

        {/* ── 2. Main Sponsors Stage (Centered Normal Sponsors Board) ── */}
        <div className="w-full flex flex-col items-center justify-center pb-6 sm:pb-8 flex-grow">

          {/* DESKTOP & LAPTOP: Console Frame with 3-col × 2-row Grid */}
          <div className="hidden lg:flex relative w-full max-w-[880px] xl:max-w-[1000px] aspect-[947/404] flex-shrink-0 flex-col items-center justify-center my-auto">
            {/* Console Frame with "SPONSORS" subheader tab */}
            <div className="absolute inset-0 pointer-events-none z-1">
              <Image
                src="/landing-pages/sponsors/ui/console-frame-empty.svg"
                alt="Sponsors Console Frame"
                fill
                className="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)]"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* 6 Cards Grid inside Console Frame */}
            <div className="relative z-3 w-[95%] h-[80%] mt-[5%] grid grid-cols-3 grid-rows-2 gap-x-3 gap-y-3 px-3">
              {SPONSOR_CARDS.map((card) => (
                <div
                  key={card.id}
                  data-sponsor-id={card.id}
                  onMouseEnter={handleCardHover}
                  onClick={handleCardClick}
                  className="genesis-sponsor-flip-card relative w-full h-full flex items-center justify-center cursor-pointer select-none group"
                >
                  <div className="genesis-sponsor-flip-inner relative w-full h-full">
                    <div className="genesis-sponsor-hover-wrapper relative w-full h-full">
                      <Image
                        src={card.svgPath}
                        alt={card.name}
                        fill
                        className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TABLET / MID-WIDTH (md to lg): Clean 3-col or 2-col Grid */}
          <div className="hidden md:flex lg:hidden w-full max-w-[680px] flex-col items-center my-auto">
            <div className="bg-blue-950/80 border border-blue-500/40 rounded-full px-5 py-1 text-xs font-bold text-cyan-300 uppercase tracking-widest mb-4 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              Sponsors
            </div>
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4">
              {SPONSOR_CARDS.map((card) => (
                <div
                  key={card.id}
                  data-sponsor-id={card.id}
                  onMouseEnter={handleCardHover}
                  onClick={handleCardClick}
                  className="genesis-sponsor-flip-card relative w-full aspect-[320/180] flex items-center justify-center cursor-pointer select-none group"
                >
                  <div className="genesis-sponsor-flip-inner relative w-full h-full">
                    <div className="genesis-sponsor-hover-wrapper relative w-full h-full">
                      <Image
                        src={card.svgPath}
                        alt={card.name}
                        fill
                        className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MOBILE (< 768px): Centered Vertical Sponsor Showcase */}
          <div className="md:hidden w-full flex flex-col items-center mt-3">
            <div className="bg-blue-950/80 border border-blue-500/40 rounded-full px-4 py-1 text-xs font-bold text-cyan-300 uppercase tracking-widest mb-3 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              Sponsors
            </div>

            <div className="w-full flex flex-col items-center gap-4 sm:gap-5 px-2 py-3">
              {SPONSOR_CARDS.map((card) => (
                <div
                  key={card.id}
                  data-sponsor-id={card.id}
                  onMouseEnter={handleCardHover}
                  onClick={handleCardClick}
                  className="genesis-sponsor-flip-card relative w-[90%] max-w-[340px] aspect-[320/180] flex items-center justify-center cursor-pointer select-none group"
                >
                  <div className="genesis-sponsor-flip-inner relative w-full h-full">
                    <div className="genesis-sponsor-hover-wrapper relative w-full h-full transition-transform duration-200 active:scale-[0.98]">
                      <Image
                        src={card.svgPath}
                        alt={card.name}
                        fill
                        sizes="(max-width: 377px) 90vw, 340px"
                        className="object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)]"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative w-full max-w-[480px] flex justify-end px-4 sm:px-6 pt-1 pb-2 pointer-events-none">
              <div
                className="relative w-[clamp(110px,32vw,155px)] aspect-[245/300] animate-spike-pop select-none"
                style={{
                  filter: "drop-shadow(0 0 22px rgba(34, 211, 238, 0.55)) drop-shadow(0 14px 28px rgba(0, 0, 0, 0.9))",
                }}
                aria-hidden="true"
              >
                <Image
                  src="/landing-pages/sponsors/ui/shadow-spike.svg"
                  alt=""
                  fill
                  sizes="(max-width: 767px) 32vw, 155px"
                  className="object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── 3. Bottom-Right Character Decoration: Shadow Spike (Popping Out, Non-Clickable) ──────── */}
      <div
        className="hidden md:block absolute right-2 sm:right-4 md:right-8 lg:right-10 w-[155px] h-[190px] sm:w-[185px] sm:h-[227px] md:w-[215px] md:h-[264px] lg:w-[245px] lg:h-[300px] pointer-events-none z-30 animate-spike-pop select-none"
        style={{
          bottom: "clamp(70px, 9vw, 120px)",
          filter: "drop-shadow(0 0 22px rgba(34, 211, 238, 0.55)) drop-shadow(0 14px 28px rgba(0, 0, 0, 0.9))",
        }}
        aria-hidden="true"
      >
        <Image
          src="/landing-pages/sponsors/ui/shadow-spike.svg"
          alt="Shadow Spike"
          fill
          className="object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}
