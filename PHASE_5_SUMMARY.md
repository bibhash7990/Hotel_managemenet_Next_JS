# Phase 5 — Polish (Prompt 2 re-audit)

## Scope (PLAN.md §7 Phase 5)

SEO (metadata, sitemap, robots), GitHub Actions CI, API Dockerfile + deployment docs, Vitest sample + Playwright script.

## Verification gate (2026-05-07)

- `npm run lint` — pass
- `npm run typecheck` — pass
- `npm run test` — pass
- `npm run build` — pass

## Audit notes

- **SEO:** [apps/web/app/sitemap.ts](./apps/web/app/sitemap.ts), [apps/web/app/robots.ts](./apps/web/app/robots.ts), metadata in [apps/web/app/layout.tsx](./apps/web/app/layout.tsx).
- **CI:** [.github/workflows/ci.yml](./.github/workflows/ci.yml).
- **Deploy:** [DEPLOYMENT.md](./DEPLOYMENT.md), [apps/api/Dockerfile](./apps/api/Dockerfile).
- **Tests:** Vitest in API; Playwright wired as `npm run test:e2e` (not part of default `npm run test`).

## Gaps vs master prompt (documentary)

- Master prompt targets **70%+ backend service coverage** and broader integration/E2E; current automated tests are minimal. Expanding tests is the main “polish” follow-up if you need strict compliance numbers.

## Checkbox status

Phase 5 items remain `[x]`; verification commands all green on 2026-05-07.
