# StayHub — Hotel Booking Management System

Monorepo: **Next.js 14** (`apps/web`) + **Express** API (`apps/api`). The web app calls the REST API via `NEXT_PUBLIC_API_URL`. **PostgreSQL** (Prisma) for core data; **MongoDB** (Mongoose) for reviews, notifications, and audit logs.

Optional: set **`NEXT_PUBLIC_WEB_ORIGIN`** (e.g. `http://localhost:3000`) so JSON-LD on marketing pages uses absolute URLs. If omitted, the code falls back to `NEXT_PUBLIC_SITE_URL`. Route map: [ROUTES.md](ROUTES.md).

## Prerequisites

- Node.js 22+
- npm 10+
- Docker (optional, for local databases)

## Quick start

1. Copy environment files:

```bash
copy .env.example .env
```

Edit `.env` and set at least `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (each ≥32 characters). For the API, also set `DATABASE_URL` and `MONGODB_URI` (see `.env.example`).

2. Start databases:

```bash
docker compose up -d
```

3. Install dependencies (builds `packages/shared` via `postinstall`):

```bash
npm install
```

4. Apply migrations and seed:

```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npm run db:seed
```

5. Run API and web together:

```bash
npm run dev
```

- Web: [http://localhost:3000](http://localhost:3000)
- API liveness: [http://localhost:4000/health](http://localhost:4000/health) or [/health/live](http://localhost:4000/health/live)
- API readiness (DB): [http://localhost:4000/health/ready](http://localhost:4000/health/ready)
- Swagger (non-production): [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

## Seed accounts

| Email               | Password       | Role          |
|---------------------|----------------|---------------|
| customer@example.com | Password123! | CUSTOMER      |
| manager@example.com  | Password123! | HOTEL_MANAGER |
| super@example.com    | Password123! | SUPER_ADMIN   |

## Prompt 2 (phase gates)

After each implementation phase, run the verification commands documented in [PROMPT2_VERIFICATION.md](./PROMPT2_VERIFICATION.md) (npm equivalents of the master prompt’s `pnpm` commands).

## Prompt 4 (production readiness)

Security, observability, and deployment checklist for this repo is maintained in [PROMPT4_PRODUCTION_READINESS.md](./PROMPT4_PRODUCTION_READINESS.md). Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` before release.

### Key environment variables

The monorepo uses a **single root `.env`** as the source of truth. Both apps load it on startup:

- `apps/api/src/index.ts` reads it directly via `dotenv`.
- `apps/web/next.config.mjs` reads `../../.env` before Next.js inlines `NEXT_PUBLIC_*` into the client bundle. There is intentionally no `apps/web/.env.local`.

| Variable | Used by | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | API | PostgreSQL connection |
| `MONGODB_URI` | API | MongoDB (reviews, notifications, audit) |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | API + Web middleware | JWT signing/verify (each ≥32 chars) |
| `WEB_ORIGIN` | API | CORS + email links |
| `API_URL` | API | Public API URL (emails / webhooks) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | API | Payments + webhook verification |
| `SMTP_*`, `EMAIL_FROM` | API | Transactional email (optional locally) |
| `PRISMA_LOG_QUERIES` | API | Set `1` to log SQL in dev |
| `REDIS_URL` | API | Optional cache / rate-limit store |
| `CLOUDINARY_URL` | API | Image uploads (optional) |
| `NEXT_PUBLIC_API_URL` | Web | Browser → API base URL |
| `NEXT_PUBLIC_SITE_URL` | Web | Canonical URL for SEO |

#### Dual-env switching (`<KEY>_PROD`)

When `NODE_ENV=production`, the bootstrap (in both apps) promotes any `<KEY>_PROD` value into `<KEY>`. So you can keep both local and production endpoints in the same file:

```env
DATABASE_URL=postgresql://hotel:hotel@localhost:5432/hotel_booking
DATABASE_URL_PROD=postgresql://user:pass@prod-host:5432/hotel_booking
```

Supported keys: `DATABASE_URL`, `MONGODB_URI`, `REDIS_URL`, `WEB_ORIGIN`, `API_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WEB_ORIGIN`.

When deploying to Render / Railway / Vercel, you can either set the canonical names directly in the platform UI **or** keep both forms in `.env` and let the override logic pick the right one. Platform-provided env vars always win (dotenv never overrides).

## Scripts

| Script        | Description                                      |
|---------------|--------------------------------------------------|
| `npm run dev` | Run `apps/web` and `apps/api` concurrently       |
| `npm run build` | Build shared package, API, then Next.js app  |
| `npm run lint`  | Lint/typecheck API + Next lint for web         |
| `npm run typecheck` | TypeScript checks for web + API            |
| `npm run test`  | API unit tests (Vitest)                        |
| `npm run test:e2e` | Playwright tests (requires dev server)    |
| `npm run analyze -w @hotel/web` | Next.js bundle analyzer (`ANALYZE=true`) |
| `npm run lh:report -w @hotel/web` | Lighthouse HTML report (dev server must be running on :3000) |

## Project layout

See [PLAN.md](./PLAN.md) for architecture, schema, API table, and phased roadmap.

Web routes and layout groups are summarized in [ROUTES.md](./ROUTES.md).

## API + cookies

Refresh tokens are stored in an **httpOnly** cookie (`refresh_token`). The SPA stores the **access token** in `sessionStorage` and sends `Authorization: Bearer` to the API. For production, align `WEB_ORIGIN`, cookie `SameSite`, and deployment domains.

## Docker image (API)

From repo root:

```bash
docker build -f apps/api/Dockerfile -t hotel-api .
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for environment variables and hosting notes.
