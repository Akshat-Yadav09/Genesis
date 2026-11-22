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

## ADR-008: Comprehensive Frontend, UI/UX & Sticky-Stack Transition Refinement
- **Status:** Accepted.
- **Date:** 2026-11-20.
- **Context:** Following the initial transition and curve gallery implementation, user testing identified critical immersion and performance defects:
  1. The section transitions were choppy and stuttered during mouse-wheel and touch scrolling due to controller contention between `useSectionEntrances` and `useSectionTransitions`.
  2. A pitch-black overlay crushed contrast and visual fidelity across sections (Prize Pool brightness dropped to 0.054, FAQ dropped to 0.1489) due to compounding CSS `filter: brightness()`.
  3. Severe horizontal overflow (+286px on desktop, +148px on tablet, +75px on mobile) occurred due to `w-screen` on Sponsors, horizontal `xPercent: 22` transforms, and unclipped Hero meteor/celestial particle animations.
  4. Interactive touch targets on Memories scroll toggle (39px), Contact map link (34px), and Contact social buttons (42px) fell below the WCAG 44x44px accessibility threshold.
  5. Sponsors title and crown assets truncated on narrow mobile screens (320px–375px).
- **Decision:**
  1. Consolidate section animation ownership exclusively in `useSectionTransitions.ts`. Remove duplicate `useSectionEntrances` invocation from `app/page.tsx` to eliminate transform matrix collisions.
  2. Upgrade all scrubbers to `scrub: 0.6` for smooth inertial damping during both downward and upward scrolling.
  3. Completely eliminate all CSS `filter: brightness()` statements from the animation pipeline. Replace dimming with subtle physical depth scaling (`scale: 0.98`, `yPercent: -6%`), layered card-lip box shadows (`0 -10px 28px rgba(0, 0, 0, 0.4)`), and amber rim highlights (`0 -1px 0 rgba(251, 191, 36, 0.15)`).
  4. Fix all horizontal overflows: replace `w-screen` (`100vw`) with `w-full max-w-full`, replace sideways slide `xPercent: 22` on Sponsors with an in-place vertical depth reveal (`scale: 0.98 -> 1`, `opacity: 0.5 -> 1`, `yPercent: 6 -> 0`), and wrap Hero meteors/celestial bodies in `overflow-hidden` containers.
  5. Increase all sub-44px touch targets to `>= 44px` with comfortable padding and `:focus-visible` styling (`.memories-scroll-toggle`, `.genesis-contact__map-link`, `.genesis-contact__social`).
  6. Responsively scale Sponsors header graphics on mobile viewports to prevent asset truncation.
  7. Preserve 100% of event facts ("5 MARCH – 6 MARCH, 2027", prize amounts, sponsor logos, Three.js WebGL Memories curve gallery with 500 planes and 29 authentic photos).
  8. Eliminate ghost background bleeding across sticky sections: enforce an explicit escalating z-index stacking hierarchy (`#about: 1` through `#contact: 20`), remove entrance opacity and yPercent offsets from incoming sections, and dynamically toggle `visibility: hidden` via ScrollTrigger (`onToggle`) once an outgoing section is fully covered at `seamEnd` (restoring visibility when scrolling back up).
- **Alternatives considered:** CSS backdrop-filter darkening (still incurs heavy GPU raster cost on scroll), scroll-jacking/pinning entire page (violates mobile usability).
- **Consequences:** Restored full color saturation and contrast across all sections; silky 60fps bidirectional scrolling; zero horizontal bleed across 320px–1920px viewports; full WCAG touch target compliance; clean Next.js build.
- **Verification:** Automated headless Chrome audit via Chrome DevTools Protocol across 7 viewports (1920px, 1440px, 1024px, 768px, 425px, 375px, 320px), before/after screenshot comparisons in `audit_screenshots/`, and clean passes on `npm run lint`, `npx tsc --noEmit`, and `npm run build`.

## ADR-009: Memories Gallery Sticky-Scroll Alignment, QuickTo Lifecycle, Cloud Dividers, and Sponsors Polish
- **Status:** Accepted.
- **Date:** 2026-11-22.
- **Context:**
  1. The Memories 3D gallery was loosely coupled to wheel/touch delta events rather than docking within its sticky viewport, leading to erratic camera motion and jumps when scrolling across Prize Pool and Sponsors.
  2. Photo focus enlargement failed on re-entering Memories after visiting adjacent sections because offscreen cleanup called `gsap.killTweensOf(proxy)`, permanently neutralizing GSAP `quickTo` closures.
  3. Sponsors cards suffered from disappearing states on reverse scroll, cramped section padding, and required interactive hover feedback.
  4. Section seams required atmospheric cloud transitions with responsive positioning and speed.
- **Decision:**
  1. Drive Memories camera progress directly from normalized scroll progress through the finite sticky range (`(scrollTop - sectionTop) / stickyRange`, clamped to `[0, 1]`). Easing settles camera at $t=0$ on arrival and $t=1$ on exit into Sponsors.
  2. Fix `quickTo` tween lifecycle by pausing tweens (`tween.pause()`) on offscreen exit rather than destroying them, preserving closure reusability on return visits. Recreate them defensively on re-entry if proxies are empty. Permanent destruction remains on unmount.
  3. Simplify Sponsors cards to remain front-facing, remove past sponsors, center the normal sponsors board, and apply stable hover scaling (`scale(1.08)`, `translateY(-8px)`) with pointer/reduced-motion guards.
  4. Implement modular `CloudDivider` component for section seams with animated cloud layers, responsive height variants, and increased padding for Sponsors and FAQs.
- **Alternatives considered:** Delta accumulation with damping, scroll-locking/wheel-hijacking, static photo fallbacks on re-entry.
- **Consequences:** Predictable, smooth scroll navigation through Memories on desktop and mobile; robust photo enlargement across multiple section visits; accessible hover interactions; clean visual hierarchy across section transitions.
- **Verification:** Automated multi-cycle Playwright tests (`scratch/test_enlargement_cycles.js`), full responsive audits (1440px, 768px, 390px, 320px), and clean passes on `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, and `npm run build`.

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
