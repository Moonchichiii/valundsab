# 0005 — Hosting platform

## Context

The site is a directly deployable static directory (`apps/web`) with no
build step. The deployment model must serve the committed files
unchanged, provide an isolated preview per pull request, deploy
production automatically from protected `main`, and offer instant
rollback — without adding a repository deployment workflow on top of a
platform that already provides all of this.

The domain `valundsab.se` is registered at one.com, which also carries
any email. Nameservers move to Cloudflare at launch; DNS at one.com is
untouched until then.

## Decision

Cloudflare Pages via Git integration.

```
Framework preset     None
Production branch    main
Root directory       apps/web
Build command        (blank)
Output directory     .
```

- Every non-`main` branch and pull request receives an isolated preview
  deployment.
- Production deploys automatically from `main` to the assigned
  `pages.dev` address during M0–M4; the custom domain is connected in
  M5.
- Rollback is an instant restore of a previous successful production
  deployment from the Pages deployment history.
- No `.github/workflows/deploy.yml`, no Wrangler, no deployment
  dependencies, no configuration file in the repository. Provider-level
  settings are documented in `docs/DEPLOYMENT.md`.
- Local serving stays on `scripts/serve.mjs`; the platform's dev tooling
  is not used.

## Consequences

- The deployed file contents match the committed contents of `apps/web`.
  Transport compression, TLS termination, and platform-applied HTTP
  headers are permitted and are not source transformation.
- The site is delivered from Cloudflare's global network with built-in
  static caching and Early Hints; no custom aggressive cache rules are
  added on top of Pages defaults.
- Deployment credentials never enter the repository; the integration is
  authorised at provider level.
- The one.com → Cloudflare DNS migration is executed in M5 following the
  order in `docs/DEPLOYMENT.md`.
