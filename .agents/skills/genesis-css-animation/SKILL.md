---
name: genesis-css-animation
description: Add small production-quality CSS animations, hover/focus feedback, decorative loops and Tailwind-compatible transitions to GenesisWebsite2026 without unnecessary JavaScript libraries.
---

# Genesis CSS Animation

## Scope
Use for buttons, navigation links, badges, glow, decorative floating art and simple entrances. For long scroll choreography use `genesis-gsap-scroll`; for React presence/gesture decisions use `genesis-motion-react`.

## Workflow
1. Read `docs/project/ANIMATION_SYSTEM.md`, existing CSS and the relevant JSX markup.
2. Identify the animation's purpose, target property and accessible equivalent.
3. Check whether GSAP already changes the same transform/opacity. If so, do not animate that same property on the same element.
4. Prefer custom properties for shared durations/easing; limit keyframes and large-area paints.
5. Implement `:focus-visible` states, hover only where hover is available, and `@media (prefers-reduced-motion: reduce)` fallbacks.
6. Check touch, keyboard, 360px viewport, 200% zoom and user motion preferences.
7. Report exact tests. Do not claim FPS gains without measurement.

## Example: safe micro-interaction
```css
.genesis-cta {
  transition: transform 160ms cubic-bezier(.22,1,.36,1), opacity 160ms ease;
}
@media (hover: hover) and (pointer: fine) {
  .genesis-cta:hover { transform: translateY(-2px); }
}
.genesis-cta:focus-visible { outline: 3px solid currentColor; outline-offset: 4px; }
@media (prefers-reduced-motion: reduce) {
  .genesis-cta { transition: none; }
}
```

## Avoid
`transition: all`, scroll-jacking, animating layout measurements every frame, infinite flashes, hiding content without JS, and unnecessary CSS overrides that fight Tailwind or GSAP.
