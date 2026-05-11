# Phase 3 — Customer frontend (Prompt 2 re-audit)

## Scope (PLAN.md §7 Phase 3)

Landing + search, hotel listing + filters, hotel detail + booking entry, customer dashboard, wishlist + reviews UI hooks.

## Verification gate (2026-05-07)

- `npm run lint` — pass (`next lint` + API `tsc --noEmit`)
- `npm run typecheck` — pass
- `npm run test` — pass
- `npm run build` — pass (`next build`)

## Audit notes

- **Routes:** [apps/web/app](./apps/web/app) — `/`, `/hotels`, `/hotels/[slug]`, `/book`, `/dashboard`, `/login`, `/register`.
- **State:** TanStack Query on hotels/bookings; Zustand `useBookingStore` for booking draft ([apps/web/stores/booking-store.ts](./apps/web/stores/booking-store.ts)).
- **Gaps vs master prompt (non-blocking for Prompt 2 gate):**
  - Master prompt asks for full shadcn suite + wishlist/reviews **UI** beyond hooks; current UI is minimal (no dedicated wishlist/reviews pages). Treat as follow-up under Prompt 3 polish if you want strict UI parity.

## How to verify locally

1. `npm run dev`
2. Open `http://localhost:3000` → search → hotels list → hotel detail → book (requires login + prior room selection from detail page).

## Checkbox status

Phase 3 items remain `[x]` for the implemented scope; expand UI if you require strict feature parity with the long master prompt.
