# Phase 1 — Foundation (Prompt 2 re-audit)

## Scope (PLAN.md §7 Phase 1)

Monorepo, Docker services, Prisma + migrations + seed, Mongoose models + routes touching Mongo, JWT auth flows, security baseline (Helmet, CORS, rate limits, errors, logging).

## Verification gate (2026-05-07)

From repo root:

- `npm run lint` — pass
- `npm run typecheck` — pass
- `npm run test` — pass (Vitest: `apps/api/src/utils/dates.test.ts`)
- `npm run build` — pass

## Audit notes

- **Workspaces:** npm workspaces (`@hotel/web`, `@hotel/api`, `@hotel/shared`); Prompt 2’s `pnpm` commands are mapped in [PROMPT2_VERIFICATION.md](./PROMPT2_VERIFICATION.md).
- **Docker:** [docker-compose.yml](./docker-compose.yml) runs Postgres, Mongo, Redis (no API container in compose; API runs via `npm run dev`).
- **Auth:** Access JWT + httpOnly refresh cookie pattern in [apps/api/src/modules/auth](./apps/api/src/modules/auth).
- **Mongo:** Review/notification models used by API modules; connect on API startup ([apps/api/src/index.ts](./apps/api/src/index.ts)).

## How to verify locally

1. `docker compose up -d`
2. Copy `.env.example` → `.env` and set secrets + `DATABASE_URL` / `MONGODB_URI`
3. `npx prisma migrate deploy --schema apps/api/prisma/schema.prisma`
4. `npm run db:seed`
5. `npm run dev` → `http://localhost:4000/health`, register/login flows against `http://localhost:3000`

## Deviations

- Master prompt listed optional **Husky/lint-staged**; this repo does not include Husky (removed earlier). Pre-commit hooks can be added later if desired.

## Checkbox status

All Phase 1 items in `PLAN.md` remain `[x]` after re-audit; no regression found.
