# Deployment notes

## Web (Vercel)

1. Create a Vercel project pointing at `apps/web` (or the monorepo root with **Root Directory** = `apps/web`).
2. Set **Environment variables**:
   - `NEXT_PUBLIC_API_URL` — public URL of your API (e.g. `https://api.example.com`).
   - `NEXT_PUBLIC_SITE_URL` — canonical site URL for SEO (`metadataBase`, sitemap).

### CORS and multiple web origins

The API uses a **single** `WEB_ORIGIN` value (see [apps/api/src/app.ts](apps/api/src/app.ts)). For production you typically set it to your primary marketing URL (e.g. `https://app.example.com`).

- **Preview deployments:** either point previews at a staging API with `WEB_ORIGIN` matching that preview host, or add a small allowlist middleware (replace the single `origin` string with a function) so trusted Vercel preview URLs are accepted. Do not use `origin: true` in production without an explicit allowlist.

## API (Railway / Render / Fly)

1. Provision **PostgreSQL** and **MongoDB**; set `DATABASE_URL` and `MONGODB_URI`.
2. Set `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (≥32 chars), `WEB_ORIGIN`, `NODE_ENV=production`.
3. Set Stripe keys for payments: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
4. Run migrations on deploy (from repo root or CI):

```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

5. Optional: seed non-production environments only:

```bash
npm run db:seed
```

6. Start the API with `node apps/api/dist/index.js` after `npm run build` (or use the multi-stage Dockerfile from the repo root).

## Health checks (orchestrators / load balancers)

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Lightweight liveness (always 200 if process is up). |
| `GET /health/live` | Same as liveness (explicit probe name). |
| `GET /health/ready` | Readiness: runs `SELECT 1` against PostgreSQL; returns **503** if DB is unreachable (2s timeout). |

Point Kubernetes **liveness** at `/health/live` and **readiness** at `/health/ready`.

## Stripe webhooks

Register `POST /api/v1/webhooks/stripe` in the Stripe dashboard. Use the **signing secret** as `STRIPE_WEBHOOK_SECRET`. The route expects the **raw** JSON body (do not parse JSON at a reverse proxy before Stripe verification).

## Cookies across domains

If the web app and API are on different sites, `httpOnly` refresh cookies may require:

- A shared parent domain and `Domain=.example.com`, or
- A small **BFF** / Next.js route that proxies auth to the API on the same origin.

The API sets refresh cookies with `httpOnly: true`, `sameSite: 'lax'`, and `secure: true` when `NODE_ENV=production`. Align cookie `Domain` / `Path` with your chosen auth architecture.

Document the chosen approach for your team in `PLAN.md` when domains are fixed.

## API documentation (Swagger)

OpenAPI UI is served at `/api/docs` only when `NODE_ENV !== 'production'` ([apps/api/src/app.ts](apps/api/src/app.ts)). For production, prefer exporting the OpenAPI JSON from CI artifacts or serving docs behind authentication if you enable them in prod.
