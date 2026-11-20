---
name: genesis-ui-engineering
description: Implement or refactor Next.js App Router and React/TypeScript frontend sections in GenesisWebsite2026 while preserving existing artwork, event facts, Tailwind CSS 4 conventions, and responsive behavior.
---

# Genesis UI Engineering

## When to use
New homepage sections, component refactors, mobile navigation, shared frontend primitives, client/server component boundaries and performance fixes.

## Workflow
1. Read `AGENTS.md`, `ARCHITECTURE.md`, and the owning components. Consult installed Next.js docs as required by repository AGENTS instructions.
2. Locate the single source of truth for copy and event facts. Never invent dates, prizes, links, sponsors or organizer claims.
3. Plan a small diff. Keep orchestration in `app/page.tsx`, section behavior in `app/components/`, and section styles near their component where appropriate.
4. Prefer semantic HTML, strict TypeScript, appropriate Server/Client boundaries, image optimization and accessible navigation.
5. Avoid introducing a new state library, animation library or asset pipeline without a demonstrated requirement.
6. Run lint, typecheck and build when feasible. Validate mobile and desktop interactions; report what was and was not run.

## Definition of done
Describe intended UI behavior, files changed, key interactions, responsive findings and remaining risks. Preserve the existing design language; no unrelated redesign.
