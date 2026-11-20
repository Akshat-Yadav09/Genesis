# Genesis architecture decision log

Record material choices with status and evidence. Do not retroactively describe plans as implemented.

## ADR-001: Preserve GSAP for current scroll storytelling
- **Status:** Proposed project convention, based on reported implementation.
- **Context:** Timeline and Memories already use GSAP.
- **Decision:** Prefer improving existing GSAP behavior rather than introducing a second library for the same DOM transitions.
- **Consequence:** Less duplicated animation logic; component cleanup and responsive matchMedia remain necessary.

## ADR-002: CSS for small interactions
- **Status:** Proposed.
- **Context:** Hover/press/focus and gentle looping artwork do not need JS orchestration.
- **Decision:** Use CSS transitions/keyframes and reduced-motion media query by default.
- **Consequence:** Lower JS cost and easier consistency, but more advanced presence/gesture effects can justify Motion.

## ADR-003: Motion for React is optional
- **Status:** Proposed / not installed by this kit.
- **Context:** Report does not list `motion`; Motion can help with state-driven component transitions.
- **Decision:** Add `motion` only after a concrete use case and owner approval. Avoid overlapping GSAP controls.
- **Consequence:** No unnecessary new dependency today.

## ADR-004: Main branch protected by deterministic CI
- **Status:** Proposed.
- **Context:** A static-information event site still needs reliable builds, accessibility and content accuracy.
- **Decision:** Require lint, typecheck and build on pull requests; human reviews before merges/deploys.
- **Consequence:** Predictable releases; AI review remains optional and advisory.

## ADR-005: Faithful React/Next.js port of gaspoorf/curve-gallery for Memories
- **Status:** Accepted.
- **Date:** 2026-11-20.
- **Context:** The Memories section requires an engaging 3D photo journey along curved paths. The reference implementation [gaspoorf/curve-gallery](https://github.com/gaspoorf/curve-gallery) provides five distinct Catmull-Rom closed paths, smooth GSAP-controlled camera tracking, 500 square planes with cubic focus enlargement, and interactive Path 1-5 and Scroll/Auto controls.
- **Decision:** Faithfully port `gaspoorf/curve-gallery` to Next.js/React while preserving exact mathematical and animation parameters:
  1. Load all five original path JSON files (`path1.json` through `path5.json`) byte-for-byte from `/landing-pages/memories/curve-gallery/paths/` with `SCALE = 16`.
  2. Maintain exact reference density: 500 planes, `CAM_Z = 10`, `FOCUS_DIST = 5.5`, `MAX_SCALE = 14`, `Z_GATE = 11`, `LATERAL_OFFSET_RANGE = [-1, 1]`, `DEPTH_OFFSET_RANGE = [-0.75, 0.75]`, `SIZE_RANGE = [0.18, 0.4]`.
  3. Create 29 texture slots from the authentic Genesis event photographs (`memory-01.webp` through `memory-29.webp`) to match `TEX_VARIANTS = 29`, randomly assigned across all 500 planes.
  4. Retain reference motion algorithms literally: `t = i / TOTAL` distribution, curve-normal placement (`nx = -tangent.y`, `ny = tangent.x`), `gsap.quickTo` focus scaling (`duration: 0.4`, `ease: "power3.out"`), cubic focus scale formula, wrapped camera progress, 10s full-cycle auto-scroll, 1.4s `power3.inOut` path redistribution and camera retargeting.
  5. Scope GSAP Observer (`type: "wheel,touch,pointer"`, `preventDefault: false`) to the homepage's internal `<main>` scroller. Enable Observer only while Memories is in viewport via IntersectionObserver; disable on exit so standard page scrolling continues into adjacent sections.
  6. Recolor scene to Genesis dark blue (`scene.background = new THREE.Color("#020817")`, `scene.fog = new THREE.Fog("#061936", 10, 40)`). The gallery defaults to Path 1 with demo button clutter removed (Path 1–5 selector removed; clean scroll-driven presentation).
  7. Implement comprehensive React lifecycle cleanup: cancel requestAnimationFrame, kill GSAP Observer, kill tweens/quickTo instances, disconnect observers, dispose geometries, materials, textures, renderer, and force WebGL context loss.
  8. Provide accessible static photo grid fallback under `prefers-reduced-motion: reduce` and WebGL context unavailability.
- **Alternatives considered:** Simplified 22/40 plane approximation, ScrollTrigger section progress mapping, CSS 3D transforms.
- **Consequences:** Faithful visual parity with the reference design, full responsive behavior without scroll locking, safe memory management, and zero regressions to neighboring sections.
- **Verification:** Verified with `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm run build`, and headless browser comparison screenshots across Path 1, Path 3, dense scene, focus zoom, path transition, mobile (320px/375px), and reduced-motion modes.

## ADR-006: Unified reveal-on-scroll section entrances via useSectionEntrances
- **Status:** Accepted.
- **Date:** 2026-11-20.
- **Context:** Below-the-fold sections previously lacked unified entrance choreography as users scrolled through the single-page application.
- **Decision:** Implement `useSectionEntrances` hook attached to the `<main>` scroller:
  1. Target sections by DOM ID: `#about`, `#timeline`, `#prizepool`, `#memories`, `#sponsors`, `#faq`, `#contact`.
  2. Skip `#hero` and the countdown widget to prevent above-the-fold delay or flash of unstyled content.
  3. Use isomorphic layout effect (`useLayoutEffect` on client) to initialize start states before first paint.
  4. Scope triggers with `ScrollTrigger` bound to `containerRef` (`start: "top 88%"`, `once: true`).
  5. Upon completion, execute `gsap.set(section, { clearProps: "transform,opacity,visibility" })` to avoid leaving residual inline `transform` properties without stripping `position: sticky` in `#memories` or `#timeline`.
  6. Enforce `prefers-reduced-motion` safety via `gsap.matchMedia()`, rendering the default layout immediately when motion is reduced.
- **Consequences:** Polished, consistent entrance feel across all sections without layout thrashing, scroll jank, or accessibility compromises.

## ADR-007: Sticky-stack section transitions via useSectionTransitions & card polish CSS
- **Status:** Accepted.
- **Date:** 2026-11-20.
- **Context:** While section contents had reveal entrances, the seams between sections scrolled as a standard flat linear list without tangible depth or narrative progression.
- **Decision:** Implement a sticky card-stack transition architecture:
  1. Use CSS `position: sticky` with dynamic `top: min(0, scrollerHeight - sectionHeight)` computed per section. 100vh sections pin immediately at `top: 0`; taller sections (`#timeline`, `#memories`) scroll naturally through their full content before their bottom edge pins to the viewport bottom.
  2. Implement per-seam GSAP ScrollTrigger scrub tweens for the 6 seams between `#about` and `#contact`: curtain pull-ups, depth sinks (`scale: 0.9`), right-to-left slide-in for `#sponsors`, zoom reveal for `#faq`, and curtain finale for `#contact`.
  3. Keep `#memories` stationary during the Sponsors transition to preserve its Three.js WebGL canvas and GSAP Observer lifecycle.
  4. Enforce `isolation: isolate` on all content sections and give `#contact` `z-index: 20` over FAQ's `z-index: 10`.
  5. Add card lip elevation (`border-radius: clamp(...)` and `box-shadow: 0 -22px 55px rgba(0, 0, 0, 0.55)`).
  6. Enforce full `prefers-reduced-motion` safety in both CSS and JavaScript.
- **Consequences:** Tactile, polished section transitions with zero layout shift, smooth performance on desktop and mobile, and full accessibility fallback.

## New decision template
```
## ADR-XXX: Title
- Status: Proposed / Accepted / Superseded
- Date:
- Context:
- Decision:
- Alternatives considered:
- Consequences:
- Verification / rollback:
```
