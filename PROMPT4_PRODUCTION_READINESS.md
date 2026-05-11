# Prompt 4 — Security and production readiness (StayHub)

This document maps **Prompt 4** from the master Hotel Booking spec to concrete status in this repository: **pass**, **partial**, or **N/A**, with evidence and follow-ups.

## 1. Security

### 1.1 Input validation (Zod) — client and server

| Area | Status | Evidence |
|------|--------|----------|
| Shared request schemas | **Pass** | `packages/shared` (`auth`, `hotel`, `booking`, `params`) |
| Auth routes | **Pass** | `apps/api/src/modules/auth/auth.routes.ts` — `registerSchema`, `loginSchema`, etc. |
| Hotels list / availability | **Pass** | `apps/api/src/modules/hotels/hotels.routes.ts` — query + `hotelSlugParamSchema` on slug |
| Bookings | **Pass** | `apps/api/src/modules/bookings/bookings.routes.ts` — body + query + **cuid** on `:id` |
| Wishlist | **Pass** | `apps/api/src/modules/wishlist/wishlist.routes.ts` — **cuid** `hotelId` |
| Notifications | **Pass** | `apps/api/src/modules/notifications/notifications.routes.ts` — **Mongo ObjectId** on `:id` |
| Reviews | **Pass** | `apps/api/src/modules/reviews/reviews.routes.ts` — create body + **cuid** `hotelId` |
| Admin | **Pass** | `apps/api/src/modules/admin/admin.routes.ts` — Zod on bodies; **adminRoomsListQuerySchema** / **adminBookingsListQuerySchema**; **cuid** / **mongoObjectId** on params |
| Web forms (critical paths) | **Pass** | RHF + Zod on login, register, book (`apps/web/app`) |

### 1.2 Secrets in repo / git history

| Item | Status | Notes |
|------|--------|--------|
| `.env.example` | **Pass** | Placeholders only; extended with web `NEXT_PUBLIC_*` and `PRISMA_LOG_QUERIES` |
| Pre-commit secret scan | **Partial** | CI does not run `gitleaks`/Trufflehog; **recommend** adding in CI for production teams |

**If a secret was ever committed:** rotate the credential immediately, purge from history with `git filter-repo` (or vendor support), and invalidate JWT signing keys if affected.

### 1.3 Rate limiting (auth + booking)

| Route group | Status | Evidence |
|---------------|--------|----------|
| Auth | **Pass** | Per-route limiters in `auth.routes.ts` (register, login, refresh, forgot/reset password, verify-email). Global duplicate limiter on `/api/v1/auth` **removed** from `app.ts` to avoid double-counting. |
| Bookings | **Pass** | `bookingLimiter` on `/api/v1/bookings` in `app.ts` (`max: 40` / 15 min) |

### 1.4 CORS, Helmet, cookies

| Item | Status | Evidence |
|------|--------|--------|
| Helmet | **Pass** | `app.ts` — `helmet()` |
| CORS | **Pass** | `cors({ origin: env.WEB_ORIGIN, credentials: true })` — see **DEPLOYMENT.md** for multi-origin strategy |
| Refresh cookie | **Pass** | `auth.routes.ts` — `httpOnly`, `secure` in production, `sameSite: 'lax'`, `path: '/'` |

### 1.5 SQL injection / XSS / CSRF

| Topic | Status | Notes |
|-------|--------|--------|
| SQL injection | **Pass** | Prisma parameterized queries |
| XSS (API) | **Pass** | JSON API; no server-rendered HTML from user input in Express responses |
| CSRF | **Partial (by design)** | Access API uses **Bearer** token (not cookie auth for API calls). Refresh cookie is **SameSite=Lax**. Documented in README / DEPLOYMENT. |

### 1.6 File uploads

| Status | **N/A** |
|--------|---------|
| Notes | No upload middleware in `apps/api` today. When adding uploads: enforce MIME allowlist, max size, streaming to object storage, and optional malware scanning policy. |

### 1.7 JWT refresh rotation

| Status | **Pass** |
|--------|----------|
| Evidence | `refreshSession` in `apps/api/src/modules/auth/auth.service.ts` deletes the old refresh row and issues a new opaque refresh token. |

**Follow-up (optional hardening):** refresh-token **reuse detection** (detect presented token after rotation → revoke all sessions) is not implemented; requires policy + possibly audit table.

### 1.8 Password reset tokens

| Status | **Pass** |
|--------|----------|
| Evidence | `resetPassword` requires valid `resetToken` + future `resetTokenExp`; clears tokens on success; `forgotPassword` sets expiry window. |

---

## 2. Performance

| Item | Status | Evidence / how to run |
|------|--------|------------------------|
| Lighthouse 90+ | **Partial** | Not enforced in CI (scores depend on machine and data). Run `npm run lh:report -w @hotel/web` with dev server on port 3000; review HTML report. |
| Prisma N+1 / query logging | **Pass (dev)** | `apps/api/src/lib/prisma.ts` — set `PRISMA_LOG_QUERIES=1` for SQL `query` logs; default dev uses `warn`+`error` only when unset |
| Next.js images | **Pass** | `next/image` + `sizes` on hotel imagery (`apps/web`) |
| Bundle analyzer | **Pass** | `npm run analyze -w @hotel/web` (`@next/bundle-analyzer` + `ANALYZE=true`) |
| API p95 &lt; 300ms | **Partial** | Not continuously measured; add APM (Datadog, OpenTelemetry) for production SLOs. |

---

## 3. Reliability

| Item | Status | Evidence |
|------|--------|----------|
| Next.js error boundaries | **Pass** | `apps/web/app/error.tsx`, `apps/web/app/admin/error.tsx` — production-safe messages |
| WCAG contrast (automated spot-check) | **Pass** | Playwright + `@axe-core/playwright` on `/`, `/hotels`, `/login`, `/register`, `/book`; destructive `Alert` uses high-contrast red palette (`apps/web/components/ui/alert.tsx`) |
| Centralized API errors | **Pass** | `apps/api/src/middleware/errorHandler.ts` — generic 500 in production |
| Booking atomicity | **Pass** | `apps/api/src/modules/bookings/bookings.service.ts` — `prisma.$transaction` + `SELECT … FOR UPDATE` |
| Booking validation tests | **Pass** | `apps/api/src/modules/bookings/booking-schema.test.ts` |
| Stripe degradation | **Pass** | Missing `STRIPE_SECRET_KEY` → `ValidationError`; Stripe API failure → `ServiceUnavailableError` + structured log |
| Email degradation | **Pass** | `apps/api/src/lib/email.ts` — `sendMail` logs failures and returns `{ delivered }` without throwing; register returns alternate copy if email not delivered |

---

## 4. Observability

| Item | Status | Evidence |
|------|--------|----------|
| Structured logging | **Pass** | `pino` logger; `app.ts` logs `requestId`, `userId`, method, url, status, `ms` on response finish |
| Request correlation | **Pass** | `apps/api/src/middleware/requestContext.ts` — honors or generates `x-request-id` |
| Health | **Pass** | `/health`, `/health/live`, `/health/ready` (DB check) in `app.ts` |
| Metrics / Prometheus | **N/A** | Documented follow-up: add OpenTelemetry or `/metrics` behind auth if required |

---

## 5. Documentation

| Deliverable | Status |
|-------------|--------|
| README overview + env table | **Pass** | `README.md` |
| Swagger / OpenAPI in dev | **Pass** | `/api/docs` when `NODE_ENV !== 'production'` |
| DEPLOYMENT.md | **Pass** | Expanded health, CORS, migrations path |
| CONTRIBUTING.md | **Pass** | New at repo root |
| This audit report | **Pass** | `PROMPT4_PRODUCTION_READINESS.md` |

---

## Verification commands (release gate)

```bash
npm run lint
npm run typecheck
npm run test
npm run build
# Optional UI smoke + overflow (from apps/web):
# npx playwright install chromium
# npm run test -w @hotel/web
```

---

## Change log (implementation summary)

- **API:** route param validation (slug, cuid, Mongo ObjectId), stricter auth rate limits, booking rate limit tuning, request ID middleware, enriched access logs, `/health/ready`, non-throwing email send with graceful register copy, Stripe `paymentIntents.create` error mapping, `ServiceUnavailableError`, Prisma query log toggle.
- **Web:** global and admin route error boundaries; bundle analyzer + Lighthouse npm scripts.
- **Shared:** `packages/shared/src/schemas/params.ts` exported from package index.
- **Docs:** `.env.example`, `README.md`, `DEPLOYMENT.md`, `CONTRIBUTING.md`, this file.
