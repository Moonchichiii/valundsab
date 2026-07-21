# Contributing

## Working model

- Every change starts from exactly one assigned issue.
- One issue per branch. One issue per pull request.
- No code is written without an active issue.
- The delivery contract in `docs/DELIVERY_WORKFLOW.md` governs scope,
  allowed files, stop conditions, and evidence.
- The technical rules live in `docs/ENGINEERING_STANDARD.md`.

## Branches

Branch names carry the issue ID and a short slug:

```
chore/m0-01-repository-baseline
feat/m1-05-homepage-hero
fix/m2-11-focus-order
```

## Commits and merging

- `main` is always deployable. Direct pushes are forbidden.
- Pull requests merge with squash only. The squash commit title is the
  issue title, for example `[M0-01] Directly deployable repository
baseline`.
- A pull request closes exactly one issue with `Closes #<number>`.
- All required checks must be green before merge: `source`, `release`,
  `browser`, `accessibility`, `performance` (introduced by their owning
  issues; a check is required from the moment it exists).

## Local commands

```
bun install        install development tooling
bun run serve      serve apps/web at http://127.0.0.1:8000
bun run check      run all source checks
```

Later issues add `check:release`, `test`, and `audit`.

## Review

A pull request must contain the delivered result, the exact files
changed, validation output, and the evidence its issue requires. See the
pull request template.
