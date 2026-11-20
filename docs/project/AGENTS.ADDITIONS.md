## GenesisWebsite2026 project conventions (historical appendix)

These conventions have been merged into the root `AGENTS.md`. Keep this copy as the original project-kit appendix for reference; do not append it a second time.

Before changes, read `ARCHITECTURE.md`, `ANIMATION_SYSTEM.md`, and any relevant section component. For major work, read and update `PLAN.md`; record consequential tradeoffs in `DECISIONS.md`. Keep the existing AGENTS.md directive to consult installed Next.js guides under `node_modules/next/dist/docs/`.

### Scope and safety
- This is a Next.js App Router / React / TypeScript / Tailwind 4 event website, with GSAP already used for scroll sequences. Verify current package versions in `package.json`; do not rely on outdated onboarding docs.
- Keep sections in `app/components/` and their order/orchestration in `app/page.tsx`. Do not treat root `components/` image exports as React components.
- Never modify event dates, prize amounts, sponsors, contact information, or registration destinations without an approved factual source.
- Keep animation code scoped to its owning component; choose CSS for simple effects, existing GSAP for long scroll sequences, and Motion for React only when it adds value and is explicitly approved as a dependency.
- Preserve `prefers-reduced-motion`, keyboard navigation, and focus visibility.
- Do not edit generated `next-env.d.ts`, archived assets, ZIP exports, or PDF copies unless the task explicitly requires it. Do not bulk delete assets without usage verification.
- Do not remove service-worker/cache cleanup behavior without investigating why it exists; document risks before changing it.
- Do not push, merge, deploy, alter remote settings, or access production secrets without explicit approval.

### Definition of done
- Explain the intended change and the files you will touch.
- Keep diffs focused; check responsive layouts at narrow, medium, and desktop widths.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` when feasible; report the exact outcomes rather than claiming success without running them.
- Test keyboard interactions and reduced-motion preference for animation changes.
- In the final summary list changes, validation, residual risks, and any untested behavior.

### Skills
Use project-local skills when appropriate. See `SKILLS.md` for the current catalog.
