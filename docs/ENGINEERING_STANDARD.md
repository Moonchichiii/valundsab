# Engineering standard

The single authoritative source for how this codebase is written. Pull
requests are reviewed against this document.

## Principles

HTML carries meaning. CSS carries presentation and state. JavaScript
carries only necessary behavior. Comments carry only hidden constraints.
Everything else is removed.

## No-build principle

The deployable directory `apps/web` is the source of truth. The deployed
file contents must match the committed contents of `apps/web`. Transport
compression, TLS termination, and platform-applied HTTP headers are
permitted and are not considered source transformation. Minification,
bundling, HTML rewriting, asset hashing, and framework builds are
forbidden.

## HTML

- Semantic elements are used for their meaning, never as styling hooks.
- `<section>` requires a heading. `<article>` is reserved for
  self-contained content. A `<div>` with a click handler is never a
  button.
- Every page has a skip link, one `<main>`, exactly one `h1`, and no
  skipped heading levels. Heading level is chosen by structure, never by
  desired font size.
- Forms use native elements, labels, semantic input types, autocomplete
  attributes, and constraint validation before any script validation.
- No inline `style` attributes. No `javascript:` URLs.

## ARIA

No ARIA is better than wrong ARIA. Implicit semantics are never
duplicated (`<nav role="navigation">` is wrong). `aria-label` names
things; it does not repair bad structure.

## CSS

Files under `apps/web/assets/css/`, layered in this order:

```
@layer reset, tokens, base, layout, components, pages, enhancements;
```

`app.css` contains only the layer declaration and imports. Each file owns
its responsibility: `foundation.css` (fonts, reset, tokens, base
typography), `layout.css` (grid and primitives), `components.css`,
`pages.css`, `motion.css`.

### Feature adoption

- **Tier A — production base.** Baseline Widely Available features only.
  The core experience never depends on anything newer.
- **Tier B — progressive enhancement.** Newer features are allowed when
  the base works without them, content stays accessible, no polyfill is
  needed, they sit behind `@supports` where required, and the pull
  request documents their current status.
- **Tier C — lab.** Single-engine, flagged, or syntactically unstable
  features require an approved decision record, a verified fallback, and
  may never carry a core function.

### Specificity and naming

- No ID selectors. No `!important`. Maximum nesting depth 2. No styling
  by accidental DOM position.
- Class selectors match:

  ```
  ^[a-z]+(?:-[a-z]+)*(?:(?:__|--)[a-z]+(?:-[a-z]+)*)?$
  ```

  The pattern enforces a predictable lexical structure. Semantic naming —
  roles rather than appearance or position — is enforced by this standard
  and pull-request review. State and variants use data attributes or a
  `--modifier`, never utility soup.

## JavaScript

Native HTML and CSS are used before JavaScript. JavaScript exists only
for behavior that requires events, persistence, network effects, or
platform capabilities the declarative layer lacks. No frameworks, no
framework patterns, no abstractions without a demonstrated second use
case. `console.log` never ships.

## Comments

Self-explanatory code carries no comments. A comment is permitted only
for: a real browser bug, a non-obvious accessibility constraint, a
security requirement, a deliberate standard exception, a workaround that
cannot be expressed more clearly in code, or a necessary fallback — and
it is short and references an issue. `TODO`, `FIXME`, `HACK`, and `TEMP`
require an issue reference. Dead code is removed, never commented out.

## Browser support

The production target is Baseline Widely Available, verified in Chrome,
Firefox, Safari, and Edge. Playwright WebKit is not treated as
equivalent to real Safari.

## Accessibility baseline

WCAG 2.1 AA. Keyboard operation, visible focus, logical order, correct
landmarks, sufficient contrast, 44×44px minimum touch targets, and
respected `prefers-reduced-motion` are release requirements, not
enhancements.

## Dependencies

The frontend has zero runtime dependencies. Development tooling is added
only when an issue explicitly permits it, with the version pinned. The
Bun version in `package.json` is the single pinned toolchain version,
reused by CI.

## Provenance

No tool or vendor provenance appears anywhere: source, comments,
documentation, filenames, commits, commit trailers, pull requests, issue
texts, image metadata, package metadata, or published artifacts. Assets
carry neutral names and stripped metadata. Required OpenType naming,
variation and licensing tables in font files are preserved; their
presence is required asset metadata, not tool provenance.
