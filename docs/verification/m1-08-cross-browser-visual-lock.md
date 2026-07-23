# M1-08 cross-browser visual lock

Status: In verification  
Issue: M1-08  
Branch: `test/m1-08-cross-browser-visual-lock`

## Purpose

Verify the M1 production foundation across browser engines, target widths,
200% zoom, reduced motion and keyboard operation without introducing a new
visual direction.

## Scope

Production foundation under review:

- production wordmark;
- global navigation;
- local variable typography;
- homepage hero;
- layout primitives;
- focus rendering;
- sticky and fixed navigation behavior;
- horizontal overflow;
- reduced-motion behavior.

No production correction is permitted without a documented, measurable defect.

## Automated baseline

Completed before adding the dedicated M1-08 matrix test:

| Gate                    | Result                       |
| ----------------------- | ---------------------------- |
| `bun run check`         | PASS                         |
| `bun run check:release` | PASS                         |
| `bun run test`          | PASS — 25 tests              |
| `bun run audit`         | PASS — three Lighthouse runs |
| Chromium full suite     | PASS — 25 tests              |
| Firefox full suite      | PASS — 25 tests              |
| WebKit full suite       | PASS — 25 tests              |

Initial correction count: **0**.

The unsuccessful `--project` commands were command/configuration mismatches,
not browser or production failures. The existing configuration has no named
projects, so engine-specific verification uses Playwright's `--browser` option.

## Automated route and width matrix

Dedicated test:

```text
tests/visual-lock.spec.js
```

Target routes:

- `/`
- `/portfolj/`
- `/bolaget/`
- `/engineering/`
- `/kontakt/`

Target widths:

- 320px
- 390px
- 768px
- 1440px
- 1920px

For every route, width and automated engine, verify:

- HTTP 200;
- no failed resource request;
- no console error;
- no horizontal document overflow;
- Schibsted Grotesk active for body and `h1`;
- fonts loaded;
- visible and contained wordmark;
- visible page heading;
- fixed bottom navigation below 44rem;
- sticky top header at and above 44rem;
- full-page screenshot generated as temporary evidence.

### Results

| Engine   | 320     | 390     | 768     | 1440    | 1920    | Result  |
| -------- | ------- | ------- | ------- | ------- | ------- | ------- |
| Chromium | Pending | Pending | Pending | Pending | Pending | Pending |
| Firefox  | Pending | Pending | Pending | Pending | Pending | Pending |
| WebKit   | Pending | Pending | Pending | Pending | Pending | Pending |

Screenshots are generated outside the repository and must not be committed.

## Reduced motion

Automated verification:

- [ ] `prefers-reduced-motion: reduce` removes the optional link transition.
- [ ] `prefers-reduced-motion: no-preference` retains the approved micro-transition.
- [ ] No content visibility depends on motion.

Manual notes:

```text
Pending
```

## Keyboard operation

Automated verification at 390px and 1440px:

- [ ] Every link is reached once in DOM order.
- [ ] The skip link is first.
- [ ] Focused links have a visible box.
- [ ] Focused content is not obscured by compact navigation.
- [ ] Focus remains inside the viewport.

Manual end-to-end routes:

| Browser | Desktop | Compact | Notes |
| ------- | ------- | ------- | ----- |
| Chrome  | Pending | Pending |       |
| Firefox | Pending | Pending |       |
| Edge    | Pending | Pending |       |
| Safari  | Pending | Pending |       |

## Manual browser verification

Automated WebKit does not count as real Safari verification.

| Browser | Platform and version | Method                   | Result  | Notes |
| ------- | -------------------- | ------------------------ | ------- | ----- |
| Chrome  | Pending              | Real browser             | Pending |       |
| Firefox | Pending              | Real browser             | Pending |       |
| Edge    | Pending              | Real browser             | Pending |       |
| Safari  | Pending              | Real macOS or iOS Safari | Pending |       |

Manual checks at 390px-equivalent and desktop width:

- [ ] Wordmark is sharp and contained.
- [ ] Display and body typography render acceptably.
- [ ] Hero line fall matches the locked direction.
- [ ] No horizontal scrolling.
- [ ] Sticky desktop header remains stable while scrolling.
- [ ] Compact navigation remains fixed and does not cover focused content.
- [ ] Focus indicators remain visible.
- [ ] Links remain operable with keyboard or external keyboard.
- [ ] No unexpected animation with reduced motion enabled.

## 200% zoom

Browser zoom must be checked in real Chromium, Firefox and Edge. Safari may use
page zoom or the closest available real-device accessibility equivalent, which
must be recorded explicitly.

| Browser | Route | 200% usable | Overflow | Navigation usable | Notes |
| ------- | ----- | ----------- | -------- | ----------------- | ----- |
| Chrome  | `/`   | Pending     | Pending  | Pending           |       |
| Firefox | `/`   | Pending     | Pending  | Pending           |       |
| Edge    | `/`   | Pending     | Pending  | Pending           |       |
| Safari  | `/`   | Pending     | Pending  | Pending           |       |

Acceptance at 200%:

- all text remains readable;
- no two-dimensional scrolling is required;
- primary navigation remains usable;
- focus is not obscured;
- actions remain visible;
- content order remains logical.

## Measured defects and corrections

| ID   | Browser/width | Measured defect                              | Evidence      | Correction | Regression test |
| ---- | ------------- | -------------------------------------------- | ------------- | ---------- | --------------- |
| None | —             | No defect identified in the initial baseline | Baseline runs | None       | Existing suite  |

Any newly discovered defect must be added before production code changes.

## Final gates

Run after the matrix and any justified correction:

```bash
bun run check
bun run check:release
bun run test
bun run audit
```

- [ ] `bun run check`
- [ ] `bun run check:release`
- [ ] `bun run test`
- [ ] `bun run audit`
- [ ] Chromium matrix
- [ ] Firefox matrix
- [ ] WebKit matrix
- [ ] Chrome manual
- [ ] Firefox manual
- [ ] Edge manual
- [ ] Real Safari manual
- [ ] 200% zoom
- [ ] Reduced motion
- [ ] Keyboard operation
- [ ] Screenshot evidence attached to the PR
- [ ] Every correction linked to a measured defect
- [ ] Every automatically testable correction has a regression test

## M1 exit decision

M2 may begin only when every required item above is complete and issue #11 is
closed through a green pull request.
