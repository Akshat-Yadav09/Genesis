# Genesis quality gates and release checklist

## Required on every change
- [ ] Scope reviewed; event facts and brand assets not unintentionally altered.
- [ ] `npm run lint` passes (Next.js 16 does not automatically lint on build).
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` passes.
- [ ] No secrets, credentials, personal contact data beyond approved public info, or irrelevant files in diff.
- [ ] Keyboard and touch behavior reviewed for changed interactions.
- [ ] Animation reduced-motion behavior verified if movement changed.

## Functional smoke tests
- [ ] Home page loads with hero and every section in order.
- [ ] Mobile menu opens, closes, and links jump to correct sections.
- [ ] Register CTA behavior matches its label and current approved registration flow.
- [ ] Countdown agrees with approved event date and target timezone.
- [ ] FAQ categories and accordion controls work by keyboard.
- [ ] Sponsor links and contact information resolve correctly.
- [ ] `/brochure` serves the intended PDF with correct content type.
- [ ] No hydration errors, uncaught browser console exceptions, or broken images.

## Responsiveness and accessibility
- [ ] Test narrow phone (~360px), common phone (~390px), tablet (~768px), laptop (~1024px), desktop (~1440px).
- [ ] At 200% zoom, no essential content or actions are clipped.
- [ ] Tab order and visible focus are clear; links/buttons have accessible names.
- [ ] Images have appropriate alt text; decorative images are marked as such.
- [ ] Reduced-motion setting does not prevent information from appearing.
- [ ] Autoplay sound is absent; interactive sound uses user activation and sensible controls.

## Performance and security
- [ ] Review large images in `public/landing-pages/`; use appropriate sizes, formats and loading priorities.
- [ ] Record production Lighthouse/Web Vitals baselines and compare after major changes.
- [ ] Run `npm audit` and review actual advisories; patch verified high-impact issues.
- [ ] Validate untrusted content and route response headers as applicable.
- [ ] Verify no unsafe production access is granted to pull-request workflows.
- [ ] Check that `ClientCleanup.tsx` service-worker/cache behavior is intentional.

## Release gate
- [ ] Production build verified.
- [ ] CI checks green and reviewed.
- [ ] Event facts confirmed by an owner.
- [ ] Human reviewer approves release.
- [ ] Rollback commit/version and deployment owner are known.
- [ ] Post-deploy smoke test: homepage, CTA, FAQ, contact and brochure.

## AI in CI policy
Keep AI review advisory until it has been evaluated against actual bugs. AI must not be allowed to auto-merge, deploy, approve its own changes, or run untrusted PR code with privileged secrets. Deterministic checks remain required.
