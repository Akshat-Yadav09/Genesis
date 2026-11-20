<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Genesis agent delegation

Use the project roles in `.codex/agents/` for changes that benefit from delegation. Keep the main agent responsible for scope, file ownership, integration, and final validation.

1. Ask `architecture_explorer` to trace the affected routes, components, assets, and interactions. Use its findings to define acceptance criteria and assign an explicit, exclusive file list to each implementation agent.
2. Give `frontend_engineer` ownership of UI structure, layout, semantics, and UI state. Give `motion_engineer` ownership of animation timing, scroll behavior, and lifecycle. Run them in parallel only when their file lists are disjoint. Assign shared files such as `app/page.tsx` or `app/globals.css` to one agent, or hand them off sequentially. Close completed agent threads to free slots.
3. Integrate the implementation and start the local app. Give `browser_qa` the URL, acceptance criteria, and any visual baseline. Give `production_reviewer` the final diff, its comparison base, and the QA evidence. Recheck affected behavior after fixes.
4. The main agent runs `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, and `npm run build`. Report actual outcomes and coverage gaps. Record material architecture decisions in `DECISIONS.md`.

Subagents inherit the parent session's sandbox. Run exploration, browser QA, and review in a parent launched with `codex -s read-only -a never`. Run implementation and integration in a separate parent launched with `codex -s workspace-write -a never`. Carry forward the task, owned paths, diff base, and QA findings between sessions. Start runtime tools and generate build artifacts from the writable session.

Preserve Genesis branding, assets, and approved event facts. Keep changes scoped, avoid unnecessary dependencies, and keep secrets out of files and reports. Push, merge, and deploy only with explicit approval.
