# Codex skills - Genesis frontend

Each skill is a project-local folder inside `.agents/skills/<name>/SKILL.md`. It is discovered from its name/description and can be explicitly requested by name (e.g. `Use the $genesis-css-animation skill ...`).

| Skill | Invoke for | Avoid using for |
|---|---|---|
| `genesis-ui-engineering` | New/changed Next.js sections, React refactors | Pure copy edits |
| `genesis-css-animation` | CSS hover, keyframes, subtle decoration | Complex coordinated scroll effects |
| `genesis-gsap-scroll` | Timeline/Memories GSAP and scroll animation | Simple CSS hover |
| `genesis-motion-react` | Optional React state/presence/gesture transitions | Existing GSAP-controlled sequences |
| `genesis-accessibility-ux` | Keyboard, FAQ, mobile nav, contrast and reduced motion audits | Backend-only tasks |
| `genesis-production-review` | Pre-merge review, regression assessment, release readiness | Unscoped redesign |

## Recommended orchestration

1. **Build a new section:** `$genesis-ui-engineering` first; add `$genesis-css-animation` if needed; finish with `$genesis-accessibility-ux` and `$genesis-production-review`.
2. **Improve hero hover and decorative movement:** `$genesis-css-animation`; check keyboard and reduced motion.
3. **Fix jerky Timeline or Memories scroll:** `$genesis-gsap-scroll`; retain existing GSAP architecture.
4. **Add dynamic menu/presence animation:** Evaluate whether CSS is sufficient; if not, `$genesis-motion-react` and approved `npm install motion`.
5. **Before a pull request:** `$genesis-production-review`, plus regular CI.

## Copyable agent prompts

**Timeline animation:**
> Use `$genesis-gsap-scroll` to inspect `app/components/TimelineSection.tsx`. Preserve visual design; identify duplicate triggers and responsive issues; propose the smallest safe refactor. Verify reduced-motion and cleanup. Show the proposed files before editing.

**Modern interactive hero:**
> Use `$genesis-ui-engineering` with `$genesis-css-animation` to improve the homepage hero. Preserve existing artwork and brand. Make hover/press feedback intentional and keyboard accessible, and don't add dependencies without approval. Provide before/after acceptance checks.

**Motion library experiment:**
> Use `$genesis-motion-react` to propose a single React interaction where Motion adds clear value over CSS/GSAP. Do not install it until you explain why. Include reduced-motion and performance considerations.

**Review before merge:**
> Use `$genesis-production-review` to review my diff against `main`, including site facts, broken images, keyboard behavior, motion collisions, and lint/type/build status. Report severity, file paths and exact validation performed. Do not modify or merge.

## Skill design rule
Keep shared project rules in `AGENTS.md`/`ANIMATION_SYSTEM.md`. Keep skills short and task-focused. If two skills duplicate instructions, consolidate rather than expanding the prompt surface.
