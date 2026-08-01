# 0006 — Progressively enhanced Cloudflare application

## Status

Accepted (2026-07-29). Supersedes the no-build parts of ADR 0005 and the
corresponding sections of the engineering standard.

## Context

The site was built as strictly static files served byte for byte from
`apps/web`. That model made two required outcomes impossible: a contact form
that actually delivers a message, and a modular CSS source structure that
still ships as a single production request. Working around either constraint
inside the static model produced worse architecture — a hand-merged
stylesheet with two sources of truth, and a form with no receiver.

## Decision

Valunds is a progressively enhanced Cloudflare application, not a pure static
site.

- **Frontend** stays semantic HTML, modular CSS and small progressive
  JavaScript. Real documents and URLs; no single-page-application router and
  no partial-DOM router without a new decision record.
- **Server code** is allowed only behind an explicit `/api/*` interface,
  implemented as Cloudflare Pages Functions in `functions/` at the repository
  root.
- **CSS** keeps modular sources under `apps/web/assets/css/` in the locked
  layer order. `app.css` is a small entry point that imports the layers.
  The build writes the production file to `dist/assets/css/app.css`
  and is never edited by hand. Runtime CSS imports and inline critical CSS are
  prohibited.
- **Build** resolves CSS imports, bundles and minifies CSS. It does not
  minify HTML, bundle JavaScript, hash assets, fingerprint filenames, or run a
  framework build.
- **Output** is `dist/`, generated from a clean state, ignored by version
  control, never edited manually, and the single input for the local runtime,
  Playwright, Lighthouse and Cloudflare Pages.
- **Runtime.** Every consumer reads the same built output. `bun run serve`
  and, through it, Playwright and the Lighthouse audit run the project server
  against `dist/`, which is deterministic on every operating system.
  `bun run dev` runs the pinned Wrangler version against `dist/` and is the
  runtime for Pages Functions work. The Wrangler dev server proved unstable as
  the test runtime on Windows, terminating mid-suite; the quality gates must
  not depend on it.
- **Routing** is controlled by an explicit generated `dist/_routes.json` that
  includes only `/api/*`, so every document, stylesheet, font and image is
  served by the static layer.
- **Secrets, email and storage** exist only on the server side. Functions must
  set their own security headers, because `_headers` does not apply to
  Function responses.
- **New data flows** require a privacy inventory and verification before
  release.

Pinned tooling: `lightningcss@1.33.0`, `wrangler@4.114.0`.

## Consequences

- The M0 rule that the deployed bytes must equal the committed bytes of
  `apps/web` no longer holds. It is replaced by a determinism requirement: the
  build must produce the same output from the same source, and the output is
  never edited.
- CSS minification, previously forbidden, is now part of the build. HTML
  minification, JavaScript bundling and asset hashing remain forbidden.
- The project server survives, serving `dist/` instead of `apps/web`. There is
  one output, read by every runtime.
- Budgets are measured against the real transfer size of the generated files
  as delivered by the Cloudflare runtime.
- A `404.html` document is required. Without it the Pages static layer answers
  unknown paths with the home page and a 200 status.
