---
name: genesis-accessibility-ux
description: Audit and improve GenesisWebsite2026 keyboard navigation, screen-reader semantics, responsive layouts, mobile menu, FAQ accordion, audio interactions, focus states and reduced-motion accessibility.
---

# Genesis Accessibility and UX

## Workflow
1. Read `ARCHITECTURE.md`, `ANIMATION_SYSTEM.md`, `QUALITY_GATES.md` and inspect the relevant section source.
2. Identify the actual interaction contract (element type, state, keyboard actions and focus destination).
3. Test by keyboard: skip links, menu open/close, FAQ, contact/social links, CTA and brochure.
4. Confirm heading order, alt text, labels, `aria-expanded` where relevant, clear focus-visible and contrast.
5. Check 360px, 390px, 768px, 1024px, 1440px; prevent horizontal overflow and 200% zoom clipping.
6. Test reduced-motion, touch input and audio gesture requirements. Don't leave decorative animation as the only way to reveal essential copy.
7. Recommend targeted, minimal changes; do not redesign the entire site unless requested.

## Report format
- **Blocker:** prevents task completion or access to essential content.
- **Major:** important accessibility or responsive regression.
- **Minor:** polish / clarity.
List file, interaction, reproduction, proposed smallest fix, and verification status.
