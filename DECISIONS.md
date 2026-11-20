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
  3. Create 19 texture slots from the eight approved Genesis photographs (`memory-01.webp` through `memory-08.webp`) to match `TEX_VARIANTS = 19`, randomly assigned across all 500 planes.
  4. Retain reference motion algorithms literally: `t = i / TOTAL` distribution, curve-normal placement (`nx = -tangent.y`, `ny = tangent.x`), `gsap.quickTo` focus scaling (`duration: 0.4`, `ease: "power3.out"`), cubic focus scale formula, wrapped camera progress, 10s full-cycle auto-scroll, 1.4s `power3.inOut` path redistribution and camera retargeting.
  5. Scope GSAP Observer (`type: "wheel,touch,pointer"`, `preventDefault: false`) to the homepage's internal `<main>` scroller. Enable Observer only while Memories is in viewport via IntersectionObserver; disable on exit so standard page scrolling continues into adjacent sections.
  6. Recolor scene to Genesis dark blue (`scene.background = new THREE.Color("#020817")`, `scene.fog = new THREE.Fog("#061936", 10, 40)`). The gallery defaults to Path 1 with demo button clutter removed (Path 1–5 selector removed; clean scroll-driven presentation).
  7. Implement comprehensive React lifecycle cleanup: cancel requestAnimationFrame, kill GSAP Observer, kill tweens/quickTo instances, disconnect observers, dispose geometries, materials, textures, renderer, and force WebGL context loss.
  8. Provide accessible static photo grid fallback under `prefers-reduced-motion: reduce` and WebGL context unavailability.
- **Alternatives considered:** Simplified 22/40 plane approximation, ScrollTrigger section progress mapping, CSS 3D transforms.
- **Consequences:** Faithful visual parity with the reference design, full responsive behavior without scroll locking, safe memory management, and zero regressions to neighboring sections.
- **Verification:** Verified with `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm run build`, and headless browser comparison screenshots across Path 1, Path 3, dense scene, focus zoom, path transition, mobile (320px/375px), and reduced-motion modes.

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
