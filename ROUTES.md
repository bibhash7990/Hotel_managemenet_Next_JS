# StayHub web routes (`apps/web`)

This document matches the App Router layout after the **pages and routes** refactor ([PLAN.md](PLAN.md) section 4) and the **full gap closure** work. **Option A** is in use: the root [app/layout.tsx](apps/web/app/layout.tsx) keeps global `SiteHeader`, `<main>`, and footer; route groups add segment-specific wrappers and metadata.

## Layout hierarchy

| Segment   | Path on disk                 | URLs owned                                                                                                           | Purpose                          |
| --------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Root      | `app/layout.tsx`             | (all)                                                                                                                | Fonts, providers, site chrome    |
| Marketing | `app/(marketing)/layout.tsx` | `/`, `/hotels`, `/hotels/[slug]`                                                                                     | Full-width marketing + discovery |
| Auth      | `app/(auth)/layout.tsx`      | `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`                                        | Centered auth flows; **noindex** |
| Dashboard | `app/(dashboard)/layout.tsx` | `/book`, `/dashboard`, `/booking/confirmation`, `/dashboard/bookings/...`, `/profile`, `/wishlist`, `/notifications` | Signed-in customer flows         |
| Admin     | `app/admin/layout.tsx`       | `/admin`, `/admin/hotels`, `/admin/rooms`, …                                                                         | Admin tables + KPI               |

Route groups `(marketing)`, `(auth)`, `(dashboard)` **do not** appear in the URL.

## Public URL map

| URL                               | Source                                                |
| --------------------------------- | ----------------------------------------------------- |
| `/`                               | `(marketing)/page.tsx`                                |
| `/hotels`                         | `(marketing)/hotels/page.tsx`                         |
| `/hotels/[slug]`                  | `(marketing)/hotels/[slug]/page.tsx`                  |
| `/login`                          | `(auth)/login/page.tsx`                               |
| `/register`                       | `(auth)/register/page.tsx`                            |
| `/verify-email`                   | `(auth)/verify-email/page.tsx`                        |
| `/forgot-password`                | `(auth)/forgot-password/page.tsx`                     |
| `/reset-password`                 | `(auth)/reset-password/page.tsx`                      |
| `/book`                           | `(dashboard)/book/page.tsx`                           |
| `/booking/confirmation`           | `(dashboard)/booking/confirmation/page.tsx`           |
| `/dashboard`                      | `(dashboard)/dashboard/page.tsx`                      |
| `/dashboard/bookings/[id]`        | `(dashboard)/dashboard/bookings/[id]/page.tsx`        |
| `/dashboard/bookings/[id]/modify` | `(dashboard)/dashboard/bookings/[id]/modify/page.tsx` |
| `/profile`                        | `(dashboard)/profile/page.tsx`                        |
| `/wishlist`                       | `(dashboard)/wishlist/page.tsx`                       |
| `/notifications`                  | `(dashboard)/notifications/page.tsx`                  |
| `/admin`                          | `admin/page.tsx`                                      |
| `/admin/hotels`                   | `admin/hotels/page.tsx`                               |
| `/admin/rooms`                    | `admin/rooms/page.tsx`                                |
| `/admin/bookings`                 | `admin/bookings/page.tsx`                             |
| `/admin/customers`                | `admin/customers/page.tsx`                            |
| `/admin/reviews`                  | `admin/reviews/page.tsx`                              |
| `/admin/reports`                  | `admin/reports/page.tsx`                              |
| `/admin/settings`                 | `admin/settings/page.tsx`                             |

## SEO / robots

- **Sitemap** ([app/sitemap.ts](apps/web/app/sitemap.ts)): indexable marketing URLs (`/`, `/hotels`). Auth and transactional pages omitted.
- **Auth segment**: `robots: { index: false, follow: true }` on `(auth)/layout.tsx`.
- **JSON-LD**: Home uses `WebSite` schema in `(marketing)/page.tsx`. Hotel detail injects `Hotel` schema server-side in `hotels/[slug]/page.tsx` (optional `NEXT_PUBLIC_WEB_ORIGIN` for absolute URLs).

## Payments (Stripe Checkout)

- Customer creates booking then `POST /api/v1/bookings/:id/checkout` → redirect to Stripe Checkout.
- Success URL: `/booking/confirmation?session_id={CHECKOUT_SESSION_ID}` (requires auth).
- Webhook: `checkout.session.completed` and `payment_intent.succeeded` confirm booking; `payment_intent.payment_failed` marks payment failed.

## Push notifications (FCM)

- `/firebase-messaging-sw.js` is rewritten to `app/api/firebase-sw-js/route.ts` so the service worker receives your `NEXT_PUBLIC_FIREBASE_*` config at runtime.

## API alignment (email links)

- `WEB_ORIGIN/verify-email?token=...`
- `WEB_ORIGIN/reset-password?token=...`

Implemented under `(auth)`.
