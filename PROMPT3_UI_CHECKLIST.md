# Prompt 3 — UI/UX quality checklist (StayHub `apps/web`)

This document maps **Prompt 3 — UI/UX quality enforcement** from the master spec to concrete acceptance checks. Use it before declaring UI work complete.

## Design tokens and motion

- [ ] Semantic colors are available in Tailwind: `primary`, `secondary`, `accent`, `muted`, `destructive`, `success`, `card`, `border`, `background`, `foreground`.
- [ ] Typography scale is used for major headings (`text-heading-1` … `text-caption` or equivalent).
- [ ] Interactive elements use short transitions (`interactive` / `duration-interaction`) without fighting `prefers-reduced-motion` (global CSS reduces motion).

## shadcn-aligned primitives

- [ ] Shared primitives exist under `components/ui`: at least `Button`, `Input`, `Card`, `Skeleton`, `Label`, `Alert`, `Separator`, `Badge`.
- [ ] New UI avoids one-off duplicate patterns where a primitive already exists.

## Per-page states (loading / error / empty / success)

| Route | Loading | Error (retry where applicable) | Empty | Success |
|-------|---------|--------------------------------|-------|---------|
| `/` (marketing) | N/A (static) | N/A | N/A | CTAs visible, focus styles |
| `/hotels` | Skeleton grid | `ErrorState` + refetch | `EmptyState` + CTA | Results grid |
| `/hotels/[slug]` | `HotelDetailSkeleton` | `ErrorState` + refetch | N/A (404-style message) | Hero + rooms |
| `/book` | Submit disabled + pending label | API + inline `Alert` | Room not selected copy | Success `Alert` + toast |
| `/login`, `/register` | Submit state | Toast / messaging | N/A | Redirect / toast |
| `/dashboard` | `BookingsListSkeleton` | Error handling | Empty bookings `EmptyState` | List of cards |
| `/admin` | `AdminKpiSkeleton` | Access / API error | N/A | KPI cards + chart |

## Semantic HTML and accessibility

- [ ] Root layout uses `<main>` for primary content; site chrome uses `<header>` / `<footer>` (and `<nav>` in header).
- [ ] Marketing and detail pages use `<section>` where content is grouped.
- [ ] Hotel images use meaningful `alt` text (hotel name + context), not empty `alt` unless purely decorative with justification.
- [ ] Form fields use `<Label>` (or `label` + `htmlFor`) and inputs expose `aria-invalid` when validation fails.
- [ ] Focus is visible on links and buttons (`focus-visible:outline` pattern).

## Touch targets and layout

- [ ] Primary tap targets meet **≥ 44px** height/width on header nav and form controls where feasible.
- [ ] Manual smoke at **375 / 768 / 1024 / 1440** px: no broken grids, readable type, no accidental horizontal scroll.

## Optimistic wishlist

- [ ] Authenticated users can toggle wishlist from hotel cards and/or hotel detail (`WishlistToggle` + TanStack Query optimistic update with rollback on error).
- [ ] Guests see a control that routes to login with clear accessible name.

## Automated smoke (optional)

- [ ] Playwright: `apps/web/e2e/overflow.spec.ts` — at **375px** width, `/` and `/hotels` have no horizontal document overflow (`scrollWidth <= clientWidth`).

## Verification commands

```bash
cd apps/web && npm run lint && npm run typecheck && npm run build
cd apps/web && npx playwright install chromium   # first-time only, if browsers are missing
cd apps/web && npm run test
```
