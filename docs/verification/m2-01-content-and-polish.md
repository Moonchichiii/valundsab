# M2-01 — Content and polish verification

Scope executed exactly as approved: production copy on all five routes,
homepage editorial sections, compact navigation alternative B, site
footer, supporting styles in `components.css` and `pages.css`, and one
owner-approved test correction. No JavaScript added. No legal routes or
links. Hero untouched.

## Correction round (owner decision)

- The test locator in `tests/security.spec.js` ("primary navigation works
  without JavaScript") was scoped to
  `getByRole("navigation", { name: "Huvudnavigation" })` after an explicit
  owner decision — the footer legitimately introduced a second link with
  the same accessible name. No other test, assertion, route, or setting
  was changed.
- CSS was consolidated semantically (shared selector groups, removal of
  redundant rules, compound `:is()` forms, merged media blocks) without
  changing the budget, `lighthouserc.cjs`, the server, tokens, HTML
  content, hero, navigation geometry, footer design, accessibility, or
  the visual result. One cascade-order regression introduced during
  consolidation (compact `.hero__portfolio` override moved before its
  base rule) was caught by the navigation suite and corrected.

## Automated gates — final results

```
bun run check            pass
bun run check:release    pass
bun run check:security   pass
bun run test             65 of 65 pass
bun run audit            pass — all assertions green

resource-summary:stylesheet:size   19 724 B   (budget 20 480, target 19 750)
largest-contentful-paint, 3 runs   1616 / 1574 / 1523 ms   (budget 1 550,
                                   asserted per lighthouserc aggregation)
```

## Manual verification

```
Widths 320 / 390 / 768 / 1440 / 1920   no horizontal overflow, all routes
Hero at 390 / 1440                     4 / 2 lines — locked fall preserved
Keyboard, full focus order at 390      complete; last focus visible above
                                       the compact navigation
aria-current, compact navigation       weight 600 + 2 px accent overline +
                                       primary text colour
Navigation without JavaScript          click-through verified
Reduced motion                         optional transition removed
Console / third-party / CSP            0 / 0 / 0
Internal links                         all resolve; no legal links exist
```

## Compact navigation — implemented decision

Alternative B as approved: mixed-case labels on the navigation scale,
current page marked with a 2 px accent overline, semibold weight and
primary text colour; hover raises colour only; `:focus-visible` renders
an inset outline clearly distinct from hover. At widths under 22.5 rem
the labels use the smaller label scale so Engineering fits the 320 px
column without transformation.
