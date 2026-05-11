# Phase 4 — Admin panel (Prompt 2 re-audit)

## Scope (PLAN.md §7 Phase 4)

Admin layout + KPIs; admin hotels/rooms/bookings/reviews routes (API + minimal UI).

## Verification gate (2026-05-07)

- `npm run lint` — pass
- `npm run typecheck` — pass
- `npm run test` — pass
- `npm run build` — pass

## Audit notes

- **Web admin:** [apps/web/app/admin/page.tsx](./apps/web/app/admin/page.tsx) uses `GET /api/v1/admin/dashboard/kpis` and Recharts.
- **API admin:** [apps/api/src/modules/admin/admin.routes.ts](./apps/api/src/modules/admin/admin.routes.ts) includes KPIs (`/dashboard` + `/dashboard/kpis`), hotel/room CRUD + list/delete, booking list/patch, review moderation, CSV export.

## How to verify locally

1. Log in as `manager@example.com` or `super@example.com` (from seed).
2. Open `http://localhost:3000/admin`.
3. Optionally hit `GET /api/v1/admin/reviews` and `GET /api/v1/admin/reports/export` with Bearer token.

## Deviations

- **RBAC UX:** Site header may show “Admin” for any logged-in user; server still enforces roles on admin API. Tightening the nav is a small follow-up.

## Checkbox status

Phase 4 items remain `[x]` after re-audit.
