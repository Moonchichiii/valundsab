# SEC-01 strict static security baseline

Status: Awaiting deploy-preview verification
Issue: SEC-01

## Outcome

The static site enforces the policy defined in apps/web/_headers.
The same policy is parsed and applied by the local static server.
No content, layout or visual source changed.

## Security contract

- Strict CSP with default-src none
- No unsafe-inline or unsafe-eval
- No inline scripts, styles or event handlers
- No third-party resource origins
- Supporting security headers delivered
- Every current route verified
- Navigation works without JavaScript
- The _headers control file is not publicly served

## Local evidence

- bun run check:security: PASS
- bun run test:security: 12/12 PASS
- bun run check: PASS
- bun run check:release: PASS
- bun run test: 65/65 PASS
- bun run audit: PASS
- git diff --check: PASS

## CI

A dedicated ci/security job runs static and browser security checks.

## Remaining before merge

- Pull-request checks must pass
- Real Cloudflare preview response headers must be verified
- Preview must show zero CSP violations and zero third-party requests

## Exit decision

SEC-01 may merge only after CI and deploy-preview verification pass.
