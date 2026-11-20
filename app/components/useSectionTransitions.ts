"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * useSectionTransitions — varied scroll-driven transitions BETWEEN sections.
 *
 * How it works (no ScrollTrigger pinning, no layout changes):
 * - Each section from About onward becomes `position: sticky` with
 *   `top = min(0, viewportHeight - sectionHeight)`. Sticky never changes
 *   document flow, so every section keeps its exact layout offset — the
 *   page.tsx nav tracker (cached offsetTops), TimelineSection's cached
 *   marker geometry, and MemoriesSection's GSAP Observer + Three.js camera
 *   all keep working untouched. A section simply "sticks" once fully
 *   revealed while the next section scrolls up and covers it.
 * - On top of that stack, GSAP ScrollTrigger scrubs (scroller = the <main>
 *   container) add per-seam effects. Start/end are absolute scroll offsets
 *   derived from offsetTop (layout-based, immune to sticky measurement
 *   drift on mid-page refresh).
 *
 * Effect map (hero and the countdown widget are intentionally skipped):
 *   about     -> timeline   CURTAIN PULL-UP: about lifts and dims like a curtain
 *   timeline  -> prizepool  DEPTH STACK: timeline sinks back (scale 0.9) and dims
 *   prizepool -> memories   CURTAIN PULL-UP (gentle; memories keeps its own scene)
 *   memories  -> sponsors   SLIDE-IN FROM THE RIGHT as sponsors rises
 *   sponsors  -> faq        SCALE/FADE REVEAL as faq rises
 *   faq       -> contact    CURTAIN FINALE: faq lifts and dims
 *
 * prefers-reduced-motion: the hook does nothing at all — plain static page.
 * Pair with useSectionEntrances (entrances play inside each section once it
 * is revealed); transitions only touch whole-section transforms/filters.
 */

const STACKED_IDS = [
  "about",
  "timeline",
  "prizepool",
  "memories",
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
    let removeWindowResize = () => {};

    const getSection = (id: string) => document.getElementById(id);

    const teardown = () => {
      cancelAnimationFrame(rafId);
      removeWindowResize();
      resizeObserver?.disconnect();
      resizeObserver = null;
      ctx?.revert(); // also kills every ScrollTrigger created inside it
      ctx = null;
      for (const id of STACKED_IDS) {
        const el = getSection(id);
        if (el) {
          el.style.position = "";
          el.style.top = "";
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

      // Sticky stack foundation. top = min(0, viewport - height): a section
      // exactly one viewport tall pins at top:0; a taller one (timeline,
      // memories) scrolls through fully, then pins with its bottom edge at
      // the viewport bottom while the next section covers it.
      const applyStickyGeometry = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          for (const el of stacked) {
            el.style.position = "sticky";
            el.style.top = `${Math.min(0, scroller.clientHeight - el.offsetHeight)}px`;
          }
          ScrollTrigger.refresh();
        });
      };
      applyStickyGeometry();

      resizeObserver = new ResizeObserver(applyStickyGeometry);
      stacked.forEach((el) => resizeObserver!.observe(el));
      window.addEventListener("resize", applyStickyGeometry, { passive: true });
      removeWindowResize = () =>
        window.removeEventListener("resize", applyStickyGeometry);

      // Absolute, layout-based trigger ranges (sticky-proof).
      const seamStart = (incoming: HTMLElement) => () =>
        incoming.offsetTop - scroller.clientHeight;
      const seamEnd = (incoming: HTMLElement) => () => incoming.offsetTop;

      ctx = gsap.context(() => {
        // Outgoing section lifts/sinks while the incoming one covers it.
        const cover = (
          outgoing: HTMLElement,
          incoming: HTMLElement,
          fx: gsap.TweenVars,
        ) =>
          gsap.to(outgoing, {
            ...fx,
            ease: "none",
            scrollTrigger: {
              scroller,
              trigger: incoming,
              start: seamStart(incoming),
              end: seamEnd(incoming),
              scrub: true,
            },
          });

        // 1. CURTAIN PULL-UP — about lifts like a curtain, timeline slides over
        cover(about, timeline, {
          yPercent: -16,
          scale: 0.96,
          filter: "brightness(0.45)",
        });

        // 2. DEPTH STACK — timeline sinks back while prizepool covers it
        cover(timeline, prizepool, {
          scale: 0.9,
          yPercent: -5,
          filter: "brightness(0.5)",
        });

        // 3. CURTAIN PULL-UP — prizepool lifts while memories covers it
        cover(prizepool, memories, {
          yPercent: -16,
          scale: 0.96,
          filter: "brightness(0.45)",
        });

        // 4. SLIDE-IN FROM THE RIGHT — sponsors glides in sideways as it rises
        gsap.fromTo(
          sponsors,
          { xPercent: 22, opacity: 0.2 },
          {
            xPercent: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              scroller,
              trigger: sponsors,
              start: seamStart(sponsors),
              end: () => sponsors.offsetTop - scroller.clientHeight * 0.45,
              scrub: true,
            },
          },
        );

        // 5. SCALE/FADE REVEAL — faq zooms into place as it rises
        gsap.fromTo(
          faq,
          { opacity: 0, scale: 0.92 },
          {
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              scroller,
              trigger: faq,
              start: seamStart(faq),
              end: () => faq.offsetTop - scroller.clientHeight * 0.4,
              scrub: true,
            },
          },
        );

        // 6. CURTAIN FINALE — faq lifts and dims while contact covers it
        cover(faq, contact, { yPercent: -14, filter: "brightness(0.4)" });
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

