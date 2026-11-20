---
name: genesis-gsap-scroll
description: Debug, refine or build GSAP and ScrollTrigger interactions for GenesisWebsite2026 Timeline, Memories, hero effects and scroll-driven storytelling with React cleanup, responsive variants and reduced-motion behavior.
---

# Genesis GSAP Scroll

## Workflow
1. Read `ANIMATION_SYSTEM.md` plus `TimelineSection.tsx`, `MemoriesSection.tsx` or the current animation owner.
2. Inventory existing GSAP timelines, ScrollTriggers, event listeners and CSS transforms on the relevant nodes.
3. Describe the animation's trigger, desired end state, and mobile/reduced-motion behavior before editing.
4. Scope via `gsap.context()` or an approved `useGSAP` hook; ensure teardown on component unmount/remount.
5. Use `gsap.matchMedia()` for viewport and `prefers-reduced-motion` variants; do not add duplicate controls for the same properties.
6. Avoid pinned sections and heavy continuous transforms on narrow screens unless proven necessary.
7. Test the effect by scrolling forward/backward, resizing, navigating away/back, and toggling reduced-motion. Check for duplicate triggers and console issues.
8. Run available static checks; report validation evidence and performance risks.

## Minimal client-component pattern
```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollStory() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(".story-title", { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.65,
          scrollTrigger: { trigger: ".story-title", start: "top 85%", once: true },
        });
      }, root);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);
  return <div ref={root}><h2 className="story-title">Timeline</h2></div>;
}
```

Note: the title remains visible by default outside JS animation, including when reduced motion is selected.

## Avoid
Initializing the same ScrollTrigger on every render, missing cleanup, stale element refs, duplicate animation systems, and full-page smooth-scroll libraries without a clear need.
