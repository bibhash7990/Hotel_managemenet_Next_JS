# Phase 2 — Core backend (Prompt 2 re-audit)

## Scope (PLAN.md §7 Phase 2)

Hotels list/detail/search/filter/sort/pagination, rooms admin CRUD + availability, atomic booking + row lock, Stripe PaymentIntent + webhook, email helper.

## Verification gate (2026-05-07)

- `npm run lint` — pass
- `npm run typecheck` — pass
- `npm run test` — pass
- `npm run build` — pass

## Audit notes

- **Hotels:** [apps/api/src/modules/hotels](./apps/api/src/modules/hotels) — list, slug detail, availability query.
- **Bookings:** [apps/api/src/modules/bookings](./apps/api/src/modules/bookings) — create with Prisma transaction + `SELECT FOR UPDATE` on `Room`; payment intent; cancel via `PATCH /:id` and alias `/:id/cancel`.
- **Stripe:** Webhook mounted before JSON parser in [apps/api/src/app.ts](./apps/api/src/app.ts); raw body route in [apps/api/src/modules/webhooks/stripe.webhook.ts](./apps/api/src/modules/webhooks/stripe.webhook.ts).
- **Admin backend extensions:** Hotels/rooms CRUD, reviews moderation queue, CSV export — [apps/api/src/modules/admin/admin.routes.ts](./apps/api/src/modules/admin/admin.routes.ts) (documented in [PLAN_APPENDIX.md](./PLAN_APPENDIX.md)).

## How to verify locally

- With DB + seed: `GET /api/v1/hotels`, `GET /api/v1/hotels/{slug}`, `GET /api/v1/hotels/{slug}/availability?...`
- Authenticated: `POST /api/v1/bookings` then `POST /api/v1/bookings/{id}/pay` (requires `STRIPE_SECRET_KEY`).

## Deviations

- `PLAN.md` API table now lists both **`POST .../pay`** (canonical) and **`payment-intent`** (alias) to match implementation.

## Checkbox status

Phase 2 items remain `[x]`; no regression found in static audit + build gate.
