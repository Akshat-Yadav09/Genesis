# Genesis motion system

> Design specification for this repository. It does not mean the site has been changed.

## Intent
Use motion to communicate interactive feedback, reveal meaningful hierarchy, and create an engaging game-event identity. Animations should remain fast, readable, and optional for sensitive users. Avoid an animation on every element merely because the library makes it easy.

## Technology decision tree
| Need | Preferred tool | Why |
|---|---|---|
| Hover, press, focus, glow, floating emblem | CSS / Tailwind | Smallest dependency and easy reduced-motion fallback. |
| Simple entrance that needs React state / presence | Motion for React (optional) | Declarative state-driven transitions. |
| Complex staged hero or scroll choreography | Existing GSAP | Timelines / ScrollTrigger already present. |
| Scroll progress indicator | CSS if possible, otherwise existing GSAP or Motion | Choose only one owner. |
| FAQ expand/collapse | CSS with accessible button and state | Prefer content-first semantics. |
| Page transitions | Evaluate requirement first | A single-page event site may not need a routing animation library. |

### Ownership rule
A DOM element should have **one animation controller per property at a time**. Never let a Tailwind transform utility, GSAP, and Motion all fight over `transform` on the same node. If necessary, animate a parent and child separately.

## Motion tokens (suggested defaults, tune with design review)
- Feedback: 120-200ms; standard interface movement: 220-350ms.
- Storytelling reveal: 450-700ms, restrained and only where it improves comprehension.
- Easing: ease-out for entrances; ease-in-out for looping decorations.
- Transform distance: keep entrances small (~12-24px) rather than sliding in from off-screen.
- Infinite loops: only decorative nonessential items; disable under reduced motion.
- Animate `transform` and `opacity` when possible; avoid layout-thrashing changes to `top`, `left`, `width` and `height`.

## CSS baseline: add to app/globals.css only after checking existing names
```css
:root {
  --genesis-motion-fast: 160ms;
  --genesis-motion-standard: 280ms;
  --genesis-motion-reveal: 560ms;
  --genesis-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}

.genesis-interactive {
  transition: transform var(--genesis-motion-fast) var(--genesis-ease-out),
              opacity var(--genesis-motion-fast) ease;
}

@media (hover: hover) and (pointer: fine) {
  .genesis-interactive:hover { transform: translateY(-3px); }
}

.genesis-interactive:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 4px;
}

.genesis-floating-art { animation: genesis-float 5s ease-in-out infinite; }

@keyframes genesis-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@media (prefers-reduced-motion: reduce) {
  .genesis-interactive { transition: none; }
  .genesis-floating-art { animation: none; }
}
```

## Motion for React (optional)
Install only when needed:
```bash
npm install motion
```
Client-only component example:
```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function GentleReveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```
For existing GSAP-controlled areas, don't wrap in a second animator without an explicit property ownership design.

## GSAP cleanup pattern
For React component effects, scope with `gsap.context()` (or an approved `useGSAP` setup) and call `revert()` on cleanup. Use `gsap.matchMedia()` for responsive and reduced-motion variants. Check Timeline/Memories for duplicate ScrollTriggers and event listeners after React remounts.

## Memories curve gallery (faithful port of gaspoorf/curve-gallery)
- Faithful React/Next.js port of `gaspoorf/curve-gallery` rendered in a scoped WebGL canvas with black-blue background (`#020817`) and fog (`#061936`).
- Uses the 5 original path JSON files (`path1.json` through `path5.json`) with `SCALE = 16` and closed Catmull-Rom curves (`tension: 0.5`).
- Maintains reference density: exactly 500 planes on desktop and mobile (`SIZE_RANGE = [0.18, 0.4]`, `LATERAL_OFFSET_RANGE = [-1, 1]`, `DEPTH_OFFSET_RANGE = [-0.75, 0.75]`).
- 19 texture slots (`TEX_VARIANTS = 19`) populated with the eight approved Genesis event photographs, randomly assigned across all 500 planes.
- Camera and motion: inverted wrapped progress `t = ((1 - camProxy.t) % 1 + 1) % 1`, smooth tracking with `gsap.quickTo(camProxy, "t", { duration: 1, ease: "power3.out" })`, 10s auto-scroll cycle, and 1.4s `power3.inOut` path redistribution and camera retargeting.
- Near-camera focus enlargement using the reference cubic formula: `1 + (1 - d/5.5)^3 * 13` animated with `gsap.quickTo` (`duration: 0.4`, `ease: "power3.out"`).
- Scoped GSAP Observer (`type: "wheel,touch,pointer"`) bound to the homepage `<main>` scroller without `preventDefault`. Activated via `IntersectionObserver` only when Memories is in view, pausing the render loop when outside.
- Controls: bottom-left vertical Path 1-5 buttons and bottom-center Scroll/Auto toggle with accessible focus rings and touch-safe targets.
- Reduced-motion fallback: immediately unmounts WebGL and presents the accessible static photo grid. Full React cleanup on unmount disposes all geometries, materials, textures, listeners, and WebGL context.

## Accessibility contract
- Respect `prefers-reduced-motion` in CSS and JavaScript.
- Do not hide important information behind a scroll reveal when motion is reduced, scripts are blocked, or animation fails.
- Keep pointer feedback matched with focus-visible states.
- Avoid forced scrolling, scroll-jacking, automatic audio and flashing effects.
- Verify interaction without hover and on touch devices.

## Review rubric for animation changes
1. What is this movement communicating?
2. Why this library instead of CSS?
3. Who owns the element and its properties?
4. What happens on rerender, navigation, resize and reduced motion?
5. Was the result tested on low-end/mobile hardware and at 200% zoom?

## References
- https://motion.dev/docs/react
- https://motion.dev/docs/react-use-reduced-motion
- https://gsap.com/docs/v3/GSAP/gsap.context()/
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
