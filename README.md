# Valunds Digitala Tjänster

Corporate and product website for Valunds Digitala Tjänster, built as a
progressively enhanced Cloudflare application using semantic HTML, modern
CSS and minimal native JavaScript. No frontend framework.

| Path         | Role                                                      |
| ------------ | --------------------------------------------------------- |
| `apps/web/`  | editable web source                                       |
| `functions/` | Cloudflare Pages Functions under `/api/*`                 |
| `dist/`      | deployable output, produced by the build and never edited |

`bun run build` resolves the layered CSS imports and writes a single
minified stylesheet into `dist/`. Nothing else is transformed: no HTML
minification, no JavaScript bundling, no asset hashing. Cloudflare Pages
publishes `dist/`. See decision record 0006.

## Requirements

- [Bun](https://bun.sh) 1.3.14

## Local development

```bash
bun install
bun run build      # write dist/
bun run serve      # serve dist/ at http://127.0.0.1:8000
bun run dev        # build and serve dist/ through the Cloudflare runtime
```

Tests and the performance audit build `dist/` themselves and run against it.
`bun run dev` uses the pinned Wrangler version and is the runtime for Pages
Functions work.

## Quality and workflow

- [Contribution rules](CONTRIBUTING.md)
- [Engineering standard](docs/ENGINEERING_STANDARD.md)
- [Delivery workflow](docs/DELIVERY_WORKFLOW.md)
- [Deployment model](docs/DEPLOYMENT.md)

Quality gates run on every pull request; `main` is always deployable.
Every pull request receives an isolated preview deployment; production
deploys automatically from `main`.
