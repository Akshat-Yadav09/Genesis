# GenesisWebsite2026 - Production plan

> Living plan. Check boxes when validated with evidence; no claim of completion is implied here. Prioritize user-facing correctness over visual novelty.

## P0 - Verify baseline and stop release blockers
- [ ] Run `git status`, confirm protected/main branch workflow and keep uncommitted user changes intact.
- [ ] Verify package versions in `package.json` and `package-lock.json`; review outstanding Next.js upgrade and `npm audit` results, then prioritize verified critical/high vulnerabilities.
- [ ] Run `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build`. Record actual results and failures.
- [ ] Confirm the event identity, countdown target/timezone, prize details, sponsor names, and links with an authoritative source.
- [ ] Confirm what **Register** should actually do; if it only scrolls to About, clarify CTA label or provide correct registration flow.
- [ ] Validate `/brochure` from a production build (MIME, response, filename and accessible link).
- [ ] Review `ClientCleanup.tsx` for unintended clearing of legitimate caches/service workers.

**Exit criterion:** build and lint pass; critical public facts and primary CTA are verified; no unresolved critical findings.

## P1 - UX and accessibility
- [ ] Keyboard-only walk-through: skip link, menu, CTA, FAQ, gallery, contact, brochure.
- [ ] Visible focus, semantic headings, meaningful alt text and screen-reader labels.
- [ ] Verify sounds never autoplay unexpectedly and have suitable user control.
- [ ] Test widths around 360, 390, 768, 1024, 1440 px and at 200% zoom.
- [ ] Verify `prefers-reduced-motion` disables distracting movement and does not hide content.

**Exit criterion:** all navigation and actions usable by keyboard, with no blocking accessibility issue.

## P2 - Animation and performance
- [ ] Audit GSAP sequences in Timeline and Memories for cleanup and double initialization.
- [ ] Define CSS motion tokens and reusable hover/focus patterns using `ANIMATION_SYSTEM.md`.
- [ ] Keep Motion for React optional until a component needs layout/gesture presence animations.
- [ ] Replace gratuitous full-page effects with purposeful interactions; avoid scrolling interference.
- [ ] Audit `public/landing-pages/` asset sizes and usage; optimize largest on-page images first.
- [ ] Measure on a production build: mobile Lighthouse, LCP, CLS, INP, JS bundle and console errors. Record baseline and changed results.

**Exit criterion:** stable page and scroll interactions at mobile sizes; measured improvements without regressions.

## P3 - Automated gates and release readiness
- [ ] Add `.github/workflows/ci.yml` (included in this kit) after code review.
- [ ] Require PR review, successful CI and controlled merges to main.
- [ ] Add small Playwright smoke tests when framework is chosen: homepage, navigation, FAQ, brochure and mobile menu.
- [ ] Set up monitoring/analytics only with project-owner approval and compliant privacy disclosures.
- [ ] Review SEO metadata, Open Graph image, sitemap/robots where applicable, dead links and contact data.
- [ ] Define a release checklist and rollback owner in `QUALITY_GATES.md`.
- [ ] Optionally add **advisory** AI review after deterministic CI works; do not expose secrets to fork PR code.

**Exit criterion:** repeatable release; CI catches build/lint/type problems; approved deploy and rollback path.

## Change template
For each significant item, record:
- **Goal:** What observable outcome should change?
- **Files:** Which existing files own this change?
- **Acceptance criteria:** Functional, mobile, keyboard, reduced-motion, performance.
- **Validation:** Commands, browser paths, screenshots/recordings or test evidence.
- **Risk / rollback:** What could break and how will we revert?

## First proposed sprint
1. Review existing `AGENTS.md`; project conventions are already integrated there.
2. Confirm baseline CI commands and resolve build/lint/type failures.
3. Audit hero + menu + CTA and Timeline/Memories animation cleanup.
4. Pick one animation improvement; compare mobile and reduced-motion before and after.
5. Add browser smoke tests and enable protected-branch CI.
