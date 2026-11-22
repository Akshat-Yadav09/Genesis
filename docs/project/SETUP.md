# GenesisWebsite2026 project setup notes

Designed from the project report supplied on 2026-11-18. This kit is a **documentation, skills, and CI starter**; it has NOT been tested against the actual local source tree.

## Apply safely

Original project path from report: `/home/akshaty/Documents/Website/GenesisWebsite2026`.

1. Save the ZIP outside the repository, e.g. in `~/Downloads`.
2. In a terminal:
   ```bash
   cd /home/akshaty/Documents/Website/GenesisWebsite2026
   git status --short
   unzip -n ~/Downloads/GenesisWebsite2026_Codex_Toolkit.zip -d .
   git status --short
   ```
3. `-n` skips any existing paths. This archive deliberately **does not include an AGENTS.md**, so your current instructions are preserved.
4. `AGENTS.ADDITIONS.md` is retained under this directory as a historical appendix. Its project conventions are now in the root `AGENTS.md`; do not append it again.
5. Review every newly added file and adapt `docs/project/ARCHITECTURE.md` where the project report may be incomplete or outdated.
6. Run `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build`. Do not assume these commands passed until you run them.
7. Check the new workflow under `.github/workflows/ci.yml` before committing. GitHub Actions will run when the workflow is pushed to GitHub.

## Important motion decision

The report says **GSAP is installed**. It does not establish that `motion` is installed. The Motion skill is *optional*: when you decide to use it, run `npm install motion` and import from `motion/react` in client components. Do not introduce Motion solely to recreate existing GSAP interactions.

## What is included

- `docs/project/ARCHITECTURE.md`: project topology, ownership and data/asset flows.
- `docs/project/PLAN.md`: prioritized production roadmap with exit criteria.
- `docs/project/ANIMATION_SYSTEM.md`: design rules, technology selection and CSS samples.
- `docs/project/QUALITY_GATES.md`: tests, accessibility, security and release gates.
- `docs/project/DECISIONS.md`: lightweight decision log and known architectural choices.
- `docs/project/AGENTS.ADDITIONS.md`: historical appendix; conventions are already merged into root `AGENTS.md`.
- `docs/project/SKILLS.md`: skill catalog, triggers, example tasks and orchestration.
- `.agents/skills/*/SKILL.md`: 6 reusable project-local Codex skills.
- `.github/workflows/ci.yml`: non-deployment baseline CI checks. AI review is *not* enabled, so no API key or AI permission is required.

## Official references

- Codex skills: https://developers.openai.com/blog/eval-skills
- Motion React: https://motion.dev/docs/react
- Motion reduced motion: https://motion.dev/docs/react-use-reduced-motion
- GSAP matchMedia: https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
- GSAP context: https://gsap.com/docs/v3/GSAP/gsap.context()/
- Next.js production: https://nextjs.org/docs/app/guides/production-checklist

## Scope limits

These are recommendations based on a textual inventory. No access to `/home/akshaty/...` was available to verify implementations, audit dependencies, run build tests, or check actual CSS and GSAP configurations.
