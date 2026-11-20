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
| `design-taste-frontend` | Visual direction, typography, composition, visual identity | Project architecture, factual content, or final release gates |
| `ui-ux-pro-max` | Design systems, responsive layout, usability research and implementation guidance | Replacing established Genesis tokens or component contracts without review |
| `impeccable` | Design critique, accessibility, consistency, motion review and final polish | Live mode, automatic hooks, or bypassing sandbox/approval controls |

## Recommended orchestration

1. **Build a new section:** `$genesis-ui-engineering` first; add `$genesis-css-animation` if needed; finish with `$genesis-accessibility-ux` and `$genesis-production-review`.
2. **Improve hero hover and decorative movement:** `$genesis-css-animation`; check keyboard and reduced motion.
3. **Fix jerky Timeline or Memories scroll:** `$genesis-gsap-scroll`; retain existing GSAP architecture.
4. **Add dynamic menu/presence animation:** Evaluate whether CSS is sufficient; if not, `$genesis-motion-react` and approved `npm install motion`.
5. **Before a pull request:** `$genesis-production-review`, plus regular CI.
6. **Choose general design expertise deliberately:** use `$design-taste-frontend` to set visual direction, `$ui-ux-pro-max` to resolve system/layout/usability decisions, and `$impeccable` to critique and polish. Do not run all three by default.

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
Keep shared project rules in `../../AGENTS.md` and `ANIMATION_SYSTEM.md`. Keep skills short and task-focused. If two skills duplicate instructions, consolidate rather than expanding the prompt surface.

## Installed upstream skills

- `design-taste-frontend` (Taste 2.5.1, upstream `f6b7657`): local, security-hardened guidance. The upstream Stop hook and executable/browser asset bundle are intentionally excluded; use the installed references for direction only.
- `ui-ux-pro-max` (2.15.0, upstream `2de1134`): local Codex-compatible skill with bundled data, references, and standard-library Python search scripts. Run scripts from `.agents/skills/ui-ux-pro-max/scripts/` and review generated recommendations before applying them.
- `impeccable` (4.10.0, upstream `b49177d`): local skill, references, and launchers. No project hook is installed or trusted. Do not use live mode; its upstream live workflow can invoke an agent without normal sandbox/approval protections.

The Genesis skills remain the source of truth for project architecture, facts, GSAP ownership, accessibility requirements, and production validation. Restart Codex or begin a new session after skill installation so discovery refreshes.
