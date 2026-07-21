# Valunds Digitala Tjänster

Corporate and product website for Valunds Digitala Tjänster, built as a
directly deployable static system using semantic HTML, modern CSS and
minimal native JavaScript.

The deployable directory is `apps/web`. It is served and published exactly
as committed: no frontend framework, no build tool, no source
transformation.

## Requirements

- [Bun](https://bun.sh) 1.3.14

## Local development

```bash
bun install
bun run serve
```

The site is served at `http://127.0.0.1:8000`.

## Quality and workflow

- [Contribution rules](CONTRIBUTING.md)
- [Engineering standard](docs/ENGINEERING_STANDARD.md)
- [Delivery workflow](docs/DELIVERY_WORKFLOW.md)
- [Deployment model](docs/DEPLOYMENT.md)

Quality gates run on every pull request; `main` is always deployable.
Every pull request receives an isolated preview deployment; production
deploys automatically from `main`.
