---
name: genesis-motion-react
description: Evaluate and implement optional Motion for React animations in GenesisWebsite2026 for menus, presence, interactive cards and state-driven React transitions without conflicting with existing GSAP or CSS animation.
---

# Genesis Motion for React (previously Framer Motion)

## Before making changes
- Read `ANIMATION_SYSTEM.md` and verify whether `motion` exists in `package.json`.
- Motion for React is **not confirmed installed** by the supplied report. If absent, explain why CSS/GSAP is insufficient before suggesting `npm install motion`.
- Current Motion usage: `import { motion, useReducedMotion } from "motion/react"` in a client component.

## Workflow
1. Inspect interaction and determine whether CSS, existing GSAP, or Motion is best; prefer the smallest adequate solution.
2. Keep a single animation owner per DOM property; do not mix Motion with GSAP on the same element transform or opacity.
3. Use `"use client"` only at necessary component boundaries.
4. Respect `useReducedMotion` or `MotionConfig reducedMotion="user"`, including custom parallax disablement.
5. Prefer controlled variants, short transitions and meaningful initial states.
6. Test keyboard, focus, mount/unmount, mobile, reduced motion and hydration.
7. Run lint/typecheck/build when possible and report exact results.

## Simple component example
```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function Reveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >{children}</motion.div>
  );
}
```

## References
- https://motion.dev/docs/react
- https://motion.dev/docs/react-installation
- https://motion.dev/docs/react-use-reduced-motion
