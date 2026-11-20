---
name: genesis-production-review
description: Perform a pre-merge or pre-release review of GenesisWebsite2026 diffs, checking factual event content, Next.js build/lint/typecheck, broken assets, animation conflicts, security basics and mobile/accessibility regressions.
---

# Genesis Production Review

## Workflow
1. Read `AGENTS.md`, `docs/project/ARCHITECTURE.md`, `docs/project/QUALITY_GATES.md`, and `docs/project/PLAN.md`.
2. Determine review base and inspected diff; never infer unexamined code.
3. Inspect for factual drift in event dates, sponsors, prizes, links and registration CTA behavior.
4. Review for TypeScript/Next.js mistakes, SSR/client boundary problems, hydration errors, GSAP/Motion/CSS transform conflicts and missing effect cleanup.
5. Review keyboard, mobile layout, reduced-motion, brochure behavior, external links and assets.
6. Run available `npm run lint`, `npx tsc --noEmit`, `npm run build`; if not feasible, state why and don't mark them passed.
7. For dependencies, review confirmed advisory output instead of guessing that a version is vulnerable.
8. Provide findings ordered by severity, file references and reproducible observations; distinguish observations from suspicions.

## Constraints
Do not modify files by default. Do not deploy, merge, publish comments, change Git remotes or handle secrets without explicit authorization.

## Output
**Summary:** readiness and biggest concern.
**Findings:** severity, file/line (when available), impact, remedy.
**Verification:** commands run, output results, visual checks actually performed.
**Open decisions:** anything requiring project-owner approval.
