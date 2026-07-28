# M2-03 – Visual polish and deploy readiness

## Scope

- Centred hero and page-intro composition on laptop and desktop while retaining left-aligned mobile reading flow.
- Centred narrow content blocks on text-led sections without centring long body copy.
- Added lightweight first-party SVG product views for Valunds ServiceBok and SkogsKvitto.
- Added the bilingual engineering principle as a high-impact editorial section.
- Reduced excessive desktop section spacing and reduced the cookie settings panel footprint.
- Added same-origin route prefetch after sustained hover or keyboard focus intent.
- Skipped video entirely to preserve the static delivery model and performance budget.

## Privacy and GDPR handling

- Product views contain only fictional, anonymised demonstration data.
- No names, email addresses, customer documents, VINs or real registration numbers are included.
- Images are first-party SVG assets and make no third-party requests.
- Intent prefetch creates no cookie, localStorage or sessionStorage value.
- Prefetch is disabled for Save-Data and 2G connections.
- The privacy and cookie routes document the media and prefetch behaviour truthfully.

## Performance contract

- Product views are below the fold, `loading="lazy"`, `decoding="async"` and `fetchpriority="low"`.
- Explicit intrinsic dimensions prevent layout shift.
- No video, embed, image CDN or third-party media dependency is introduced.
- Initial-page and Lighthouse budgets remain unchanged.

## Required validation

```text
bun run check
bun run check:release
bun run check:security
bun run test
bun run test:security
bun run audit
git diff --check
```
