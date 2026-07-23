# M1-08 cross-browser visual lock

Status: Complete
Issue: M1-08
Fix follow-up: M1-FIX-03

## Purpose

Verify the M1 production foundation across browser engines, target widths,
200% zoom, reduced motion and keyboard operation without introducing a new
visual direction.

No production HTML, CSS or JavaScript correction was required.

## Automated route and width matrix

Routes:

- `/`
- `/portfolj/`
- `/bolaget/`
- `/engineering/`
- `/kontakt/`

Widths:

- 320px
- 390px
- 768px
- 1440px
- 1920px

| Engine   | 320  | 390  | 768  | 1440 | 1920 | Result |
| -------- | ---- | ---- | ---- | ---- | ---- | ------ |
| Chromium | PASS | PASS | PASS | PASS | PASS | PASS   |
| Firefox  | PASS | PASS | PASS | PASS | PASS | PASS   |
| WebKit   | PASS | PASS | PASS | PASS | PASS | PASS   |

Automated matrix:

```text
Chromium  28/28 PASS
Firefox   28/28 PASS
WebKit    28/28 PASS
Total     84/84 PASS
```

Verified across the matrix:

- HTTP 200 responses;
- no failed resource requests;
- no console errors;
- no horizontal overflow;
- local font loaded and active;
- wordmark and headings visible and contained;
- fixed compact navigation;
- sticky desktop header;
- reduced-motion behavior;
- ordered focusability.

Temporary screenshots were generated outside the repository and were not
committed.

## Manual browser verification

| Browser               | Method                   | Result |
| --------------------- | ------------------------ | ------ |
| Chrome                | Real Windows browser     | PASS   |
| Firefox               | Real Windows browser     | PASS   |
| Edge                  | Real Windows browser     | PASS   |
| Safari                | Real iOS or macOS Safari | PASS   |
| Android Chrome-family | Real Android device      | PASS   |

Manual checks:

- [x] Wordmark is sharp and contained.
- [x] Typography renders acceptably.
- [x] Locked hero line fall is preserved.
- [x] No horizontal scrolling exists.
- [x] Sticky desktop header remains stable.
- [x] Compact navigation remains fixed and usable.
- [x] Focus remains visible.
- [x] Back and forward navigation works.

One screenshot appeared to omit the fixed compact navigation. A later
390 x 844 viewport capture confirmed that the navigation was present and
correct. The earlier result was a capture or cropping artifact, not a
production defect.

## 200% zoom

| Browser | Result |
| ------- | ------ |
| Chrome  | PASS   |
| Firefox | PASS   |
| Edge    | PASS   |
| Safari  | PASS   |

At 200%:

- [x] text remains readable;
- [x] no two-dimensional scrolling is required;
- [x] navigation remains usable;
- [x] focus is not obscured;
- [x] actions remain visible;
- [x] content order remains logical.

## Reduced motion

- [x] Reduced motion removes the optional link transition.
- [x] No-preference retains the approved micro-transition.
- [x] Content visibility does not depend on motion.

Result: **PASS**.

## Keyboard operation

- [x] Every link is reachable in DOM order.
- [x] The skip link is first.
- [x] Focused links remain visible.
- [x] Focused content is not obscured by compact navigation.
- [x] Focus remains inside the viewport.

Playwright WebKit verifies ordered focusability programmatically. Real Safari
navigation was verified separately from Playwright WebKit.

## M1-FIX-03 test determinism correction

A local run exposed an intermittent compact-navigation measurement before the
local variable font had settled.

The correction waits for `document.fonts.ready` before measuring navigation
geometry. Existing width, target-size, viewport-boundary, separation, overflow
and hero-clearance assertions remain unchanged.

Stability proof:

```text
bunx playwright test tests/navigation.spec.js --repeat-each=10
80/80 PASS
```

No production source, design token or locked visual value changed.

## Final gates

```text
bun run check          PASS
bun run check:release  PASS
bun run test           53/53 PASS
bun run audit          PASS
git diff --check       PASS
```

- [x] Chromium matrix
- [x] Firefox matrix
- [x] WebKit matrix
- [x] Chrome manual
- [x] Firefox manual
- [x] Edge manual
- [x] Real Safari manual
- [x] Android real-device review
- [x] 200% zoom
- [x] Reduced motion
- [x] Keyboard operation
- [x] Every correction is linked to a measured defect.
- [x] Regression coverage is present.
- [x] No production source changed.

## M1 exit decision

M1 is complete. The visually locked foundation may proceed to SEC-01.
