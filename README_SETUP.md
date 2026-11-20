# GenesisWebsite2026 - Codex project kit

Designed from the project report supplied on 2026-11-18. This kit is a **documentation, skills, and CI starter**; it has NOT been tested against the actual local source tree.

## Apply safely

Project path from report: `/home/akshaty/Documents/Website/GenesisWebsite2026`.

1. Save the ZIP outside the repository, e.g. in `~/Downloads`.
2. In a terminal:
   ```bash
   cd /home/akshaty/Documents/Website/GenesisWebsite2026
   git status --short
   unzip -n ~/Downloads/GenesisWebsite2026_Codex_Toolkit.zip -d .
   git status --short
   ```
3. `-n` skips any existing paths. This archive deliberately **does not include an AGENTS.md**, so your current instructions are preserved.
4. Open `AGENTS.ADDITIONS.md`; add its contents to your existing `AGENTS.md` after reviewing them. Do **not** replace or duplicate your current instructions.
5. Review every newly added file and adapt `ARCHITECTURE.md` where the project report may be incomplete or outdated.
6. Run `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build`. Do not assume these commands passed until you run them.
7. Check the new workflow under `.github/workflows/ci.yml` before committing. GitHub Actions will run when the workflow is pushed to GitHub.

## Important motion decision

The report says **GSAP is installed**. It does not establish that `motion` is installed. The Motion skill is *optional*: when you decide to use it, run `npm install motion` and import from `motion/react` in client components. Do not introduce Motion solely to recreate existing GSAP interactions.

## What is included

- `ARCHITECTURE.md`: reported project topology, ownership and data/asset flows.
- `PLAN.md`: prioritized production roadmap with exit criteria.
- `ANIMATION_SYSTEM.md`: design rules, technology selection and CSS samples.
- `QUALITY_GATES.md`: tests, accessibility, security and release gates.
- `DECISIONS.md`: lightweight decision log and known architectural choices.
- `AGENTS.ADDITIONS.md`: a small appendix to merge into existing `AGENTS.md`.
- `SKILLS_GUIDE.md`: skill catalog, triggers, example tasks and orchestration.
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
