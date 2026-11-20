"use client";

import { useEffect, useLayoutEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// useLayoutEffect on the client (applies the hidden start state before the
// browser paints, so sections never flash visible first), useEffect on the
// server (where layout effects cannot run).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Per-section tuning. y is how far below its final spot the section starts,
// scale is a subtle grow-in, duration in seconds.
type EntranceConfig = {
  y?: number;
  scale?: number;
  duration?: number;
};

const SECTION_ENTRANCES: Record<string, EntranceConfig> = {
  about: { y: 72, duration: 0.9 },
  timeline: { y: 48, duration: 0.8 },
  prizepool: { y: 72, scale: 0.96, duration: 1 },
  memories: { y: 48, duration: 0.8 },
  sponsors: { y: 72, scale: 0.97, duration: 0.9 },
  faq: { y: 56, duration: 0.9 },
  contact: { y: 40, duration: 0.7 },
};

/**
 * Reveal-on-scroll entrances for the sections inside <main>.
 * Each listed section fades and rises into place the first time it scrolls
 * into view. Hero and the countdown widget are skipped on purpose: the hero
 * is already on screen, and the countdown straddles the hero/about seam.
 *
 * Reduced-motion users get the plain page: no hidden start state is ever
 * applied, so nothing can end up stuck invisible.
 */
export function useSectionEntrances(
  scrollContainerRef: RefObject<HTMLElement | null>
) {
  useIsomorphicLayoutEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      for (const [id, config] of Object.entries(SECTION_ENTRANCES)) {
        const section = document.getElementById(id);
        if (!section) continue;

        gsap.from(section, {
          y: config.y ?? 56,
          scale: config.scale ?? 1,
          autoAlpha: 0,
          duration: config.duration ?? 0.9,
          ease: "power3.out",
          transformOrigin: "50% 100%",
          scrollTrigger: {
            trigger: section,
            scroller,
            start: "top 88%",
            once: true,
          },
          onComplete: () => {
            // Drop the inline transform/opacity once the reveal is done so the
            // section returns to a clean layout state without stripping sticky styles.
            gsap.set(section, { clearProps: "transform,opacity,visibility" });
          },
        });
      }

      // Section heights settle as their images finish loading; re-measure so
      // every trigger still fires at the right scroll position.
      const handleLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    });

    return () => mm.revert();
  }, [scrollContainerRef]);
}

export default useSectionEntrances;

