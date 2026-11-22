# GenesisWebsite2026 - Architecture

> **Status:** Based on a project report dated 2026-11-18, not verified against the repository. Update this document after inspecting source.

## Mission and boundaries
A single-page public Genesis event website with interactive hero and sections, plus an inline brochure PDF route. Main goals: present accurate event information, make navigation and registration discoverable, showcase artwork/sponsors/memories, and perform well on desktop and mobile.

## Technology baseline (reported)
- Next.js App Router **16.4.2**; React **19.3.0**; TypeScript; Tailwind CSS 4; GSAP; npm.
- These are reported installed versions, **not** a security or compatibility certification. Check `package.json`, lockfile, npm audit and official advisories before dependency changes.
- Content is source-controlled; media is largely stored in `public/`.

## Route map
| Path | Owner | Behavior |
|---|---|---|
| `/` | `app/page.tsx` | Composes sections, navigation, hero effects, scroll coordination and mobile menu. |
| `/brochure` | `app/brochure/route.ts` | Streams/returns a bundled PDF for inline viewing; verify error handling and headers. |

## Component boundaries
| Location | Role | Guideline |
|---|---|---|
| `app/layout.tsx` | Metadata, fonts, document shell, global styles and `ClientCleanup` | Avoid unrelated global client JavaScript. |
| `app/globals.css` | Tailwind setup, responsive rules, shared animation tokens/keyframes | Use for reusable motion primitives only; keep section-specific effects local. |
| `app/components/CountdownSection.tsx` | Countdown and power meter | Verify dates, timezone, SSR hydration and client intervals. |
| `app/components/AboutSection.tsx` | Event introduction | Preserve accessible document structure. |
| `app/components/TimelineSection.tsx` | Milestones, stages and reveals | Prefer existing GSAP orchestration; no duplicate scroll controllers. |
| `app/components/PrizePoolSection.tsx` | Prize/placement displays | Never alter prize figures without approved information. |
| `app/components/MemoriesSection.tsx`, `CurveMemoriesGallery.tsx`, `memoriesData.ts`, `memories.css` | Accessible Memories shell plus faithful React/Next.js port of `gaspoorf/curve-gallery` | Scoped Three.js canvas, 500 planes along 5 original Catmull-Rom paths, GSAP Observer on `<main>`, and accessible static grid fallback. |
| `app/components/SponsorsSection.tsx` | Sponsor logos/cards | Provide names, alt text, and explicit link destination review. |
| `app/components/FAQSection.tsx`, `FAQAccordionItem.tsx`, `app/data/faqData.ts` | FAQ UI and typed source content | Preserve button semantics and aria-expanded/aria-controls. |
| `app/components/ContactSection.tsx`, `contact-section.css` | Venue, embedded map, contact/social links | Verify external links, map loading behavior, privacy and accessibility. |
| `app/components/sound.ts` | Generated interaction audio | User gesture required; provide mute/volume affordances if used broadly. |
| `app/components/ClientCleanup.tsx` | Service-worker and cache cleanup | Review before change: can have performance/offline implications. |
| `app/components/useSectionEntrances.ts` | Reveal-on-scroll entrance hook for below-the-fold sections | GSAP ScrollTrigger scroller-bound reveal animation with clearProps and prefers-reduced-motion safety. |
| `app/components/useSectionTransitions.ts`, `section-transitions.css` | Sticky-stack card transition hook and visual elevation styles | GSAP ScrollTrigger seam scrubbing, dynamic sticky geometry calculation, isolation stacking, and card-lip shadows. |

## Asset ownership
- `public/landing-pages/`: primary section visuals (report says 118 files).
- `public/documents/GENESIS_6_BROCHURE_.pdf`: brochure payload.
- Other `public/about*/`, `public/assets/`, `public/memories/`, `public/prize-pool/`, `public/sponsors/`, and `public/timeline/`: variants and public artwork.
- `photos/`: original high-resolution Genesis event photography from the organizer.
- Root `components/` and `reference-assets/`: design exports, not the application's React component directory.
- Never delete apparently unused artwork without finding references and checking whether it is an approved design source.

## Request and rendering flow
1. Browser requests `/`; Next.js loads the App Router layout and homepage.
2. Homepage renders section components, which consume local data and public assets.
3. Client-only effects handle user input, sound, countdown and animations.
4. Browser requests `/brochure`; the route returns the bundled PDF inline.

### Memories rendering flow
1. `MemoriesSection` renders the heading and eight-photo semantic fallback immediately in SSR and initial HTML.
2. Visitors without reduced motion load `CurveMemoriesGallery` dynamically with `ssr: false`.
3. The gallery loads the 5 original path JSON files (`path1.json` through `path5.json`) at runtime from `public/landing-pages/memories/curve-gallery/paths/`, creating 500 planes with 29 texture slots from authentic Genesis photos.
4. Camera motion and focus enlargement are handled via Three.js CatmullRomCurve3 and `gsap.quickTo`. GSAP Observer (`wheel,touch,pointer`) is scoped to the homepage's internal `<main>` scroller without `preventDefault` and enabled only when Memories intersects the viewport.
5. Path buttons and Scroll/Auto controls allow real-time path redistribution and automated 10-second camera cycles.
6. WebGL failure, context loss, or `prefers-reduced-motion: reduce` unmounts the canvas and leaves the accessible static DOM photo grid in normal document flow.

## Change ownership: where to edit
- Page order / top-level section navigation: `app/page.tsx`.
- Title, descriptions, fonts, shared shell: `app/layout.tsx`.
- Global visual tokens: `app/globals.css` (prefer CSS custom properties).
- Section feature: owning section component and its local stylesheet.
- FAQ text: `app/data/faqData.ts`.
- Brochure: `public/documents/` and route handler, if needed.
- Event facts: locate exact source, confirm with organizer and update all relevant representations consistently.

## Architecture constraints
- Use Server Components by default for static content; only add `"use client"` at genuine interactive boundaries, after confirming how the current files are structured.
- Favor semantic HTML and `next/image` where sensible; assess existing artwork requirements and sizing first.
- Separate visual behavior from event content. Avoid introducing a CMS, database, or state library without a documented need.
- Do not allow CSS, GSAP and Motion to animate the same CSS property of the same DOM node concurrently.
- Test interaction under `prefers-reduced-motion: reduce`.

## Known uncertainties requiring verification
- Whether the live event is presented as a Genesis game jam, a Brawl Stars tournament, or both; the supplied report uses conflicting labels.
- Whether external registration currently exists; report says **Register** plays sound and scrolls to About.
- Whether test scripts and Playwright exist (reported scripts include lint/build, not test).
- Whether Motion (`motion`) is installed (not reported).
- Whether `ClientCleanup.tsx` behavior is intentional for every visit.
- Whether current `Next.js 16.4.2` is fully patched, or whether any upgrade procedure was completed (report says incomplete).
