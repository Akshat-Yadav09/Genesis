"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * useSectionTransitions — varied scroll-driven transitions BETWEEN sections.
 *
 * How it works (no ScrollTrigger pinning, no layout shifts):
 * - Sections become `position: sticky` with `top = min(0, viewportHeight - sectionHeight)`.
 *   This preserves exact document flow and offsetTops for nav tracking, Timeline markers,
 *   and Memories Three.js camera tracking.
 * - Outgoing sections receive subtle physical depth scaling (scale: 0.97-0.98, yPercent: -4 to -6)
 *   without any destructive `filter: brightness()` that causes black overlays and GPU thrashing.
 * - Scrubbing uses `scrub: 0.6` for smooth inertial damping in both scroll directions.
 * - Reduced-motion users get the plain static page layout with zero animation overhead.
 */

const STACKED_IDS = [
  "about",
  "timeline",
  "prizepool",
  "sponsors",
  "faq",
] as const;

export function useSectionTransitions(
  scrollContainerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ctx: gsap.Context | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let rafId = 0;
    let refreshTimeout = 0;
    let removeWindowResize = () => { };

    const getSection = (id: string) => document.getElementById(id);

    const teardown = () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(refreshTimeout);
      removeWindowResize();
      resizeObserver?.disconnect();
      resizeObserver = null;
      ctx?.revert(); // Kills all GSAP tweens and ScrollTriggers created in context
      ctx = null;
      const allSections = [
        getSection("about"),
        getSection("timeline"),
        getSection("prizepool"),
        getSection("memories"),
        getSection("sponsors"),
        getSection("faq"),
        getSection("contact"),
      ];
      for (const el of allSections) {
        if (el) {
          el.style.position = "";
          el.style.top = "";
          el.style.visibility = "";
        }
      }
    };

    const setup = () => {
      const stacked = STACKED_IDS.map(getSection).filter(
        (el): el is HTMLElement => el !== null,
      );
      const about = getSection("about");
      const timeline = getSection("timeline");
      const prizepool = getSection("prizepool");
      const memories = getSection("memories");
      const sponsors = getSection("sponsors");
      const faq = getSection("faq");
      const contact = getSection("contact");
      if (
        !about ||
        !timeline ||
        !prizepool ||
        !memories ||
        !sponsors ||
        !faq ||
        !contact
      ) {
        return;
      }

      // Sticky stack foundation. top = min(0, viewport - height):
      // A standard 100vh section pins at top: 0. A taller section (Timeline)
      // scrolls through fully, then locks with its bottom edge at viewport bottom.
      const applyStickyGeometry = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          for (const el of stacked) {
            el.style.position = "sticky";
            el.style.top = `${Math.min(0, scroller.clientHeight - el.offsetHeight)}px`;
          }
          // Throttled ScrollTrigger refresh to prevent layout thrashing
          window.clearTimeout(refreshTimeout);
          refreshTimeout = window.setTimeout(() => {
            ScrollTrigger.refresh();
          }, 120);
        });
      };
      applyStickyGeometry();

      resizeObserver = new ResizeObserver(applyStickyGeometry);
      stacked.forEach((el) => resizeObserver!.observe(el));
      window.addEventListener("resize", applyStickyGeometry, { passive: true });
      removeWindowResize = () =>
        window.removeEventListener("resize", applyStickyGeometry);

      // Absolute, layout-based trigger ranges (sticky-proof)
      const seamStart = (incoming: HTMLElement) => () =>
        incoming.offsetTop - scroller.clientHeight;
      const seamEnd = (incoming: HTMLElement) => () => incoming.offsetTop;

      ctx = gsap.context(() => {
        // Outgoing section scales slightly and lifts as incoming section covers it.
        // Once incoming fully covers outgoing (at seamEnd), hide outgoing so it
        // cannot bleed through or show behind subsequent sections.
        const cover = (
          outgoing: HTMLElement,
          incoming: HTMLElement,
          fx: gsap.TweenVars,
        ) => {
          gsap.to(outgoing, {
            ...fx,
            ease: "none",
            scrollTrigger: {
              scroller,
              trigger: incoming,
              start: seamStart(incoming),
              end: seamEnd(incoming),
              scrub: 0.6,
            },
          });

          ScrollTrigger.create({
            scroller,
            trigger: incoming,
            start: seamEnd(incoming),
            end: "max",
            onToggle: (self) => {
              outgoing.style.visibility = self.isActive ? "hidden" : "";
            },
          });
        };

        // 1. About -> Timeline: About subtly slides up with gentle depth scale
        cover(about, timeline, {
          yPercent: -6,
          scale: 0.98,
          transformOrigin: "50% 100%",
        });

        // 2. Timeline -> PrizePool: Timeline recedes gently as PrizePool covers it
        cover(timeline, prizepool, {
          scale: 0.97,
          yPercent: -4,
          transformOrigin: "50% 80%",
        });

        // 3. PrizePool -> Memories: PrizePool recedes gently into background
        cover(prizepool, memories, {
          yPercent: -6,
          scale: 0.98,
          transformOrigin: "50% 100%",
        });

        // 4. Memories -> Sponsors: Sponsors naturally covers Memories.
        // Once Sponsors fully covers the viewport, hide Memories to free GPU cycles
        // and eliminate any background bleeding.
        ScrollTrigger.create({
          scroller,
          trigger: sponsors,
          start: seamEnd(sponsors),
          end: "max",
          onToggle: (self) => {
            memories.style.visibility = self.isActive ? "hidden" : "";
          },
        });

        // 5. Sponsors -> FAQ: Sponsors recedes gently as FAQ arrives
        cover(sponsors, faq, {
          scale: 0.98,
          yPercent: -6,
          transformOrigin: "50% 100%",
        });

        // 6. FAQ -> Contact: FAQ recedes smoothly into the grand finale
        cover(faq, contact, {
          yPercent: -6,
          scale: 0.98,
          transformOrigin: "50% 100%",
        });
      });
    };

    if (!motionQuery.matches) setup();
    const handleMotionChange = () => {
      teardown();
      if (!motionQuery.matches) setup();
    };
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      teardown();
    };
  }, [scrollContainerRef]);
}

export default useSectionTransitions;
