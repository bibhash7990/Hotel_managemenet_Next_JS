# Master prompt compliance matrix

Cross-reference: [Hotel_Booking_System_Cursor_Prompt.md](file:///c:/Users/DELL/Downloads/Hotel_Booking_System_Cursor_Prompt.md) (Prompts 1–4). Status: **done** | **partial** | **missing** (relative to this repo).

| Requirement | Status | Notes / locations |
|-------------|--------|-------------------|
| Next.js 14+ App Router, TS strict, Tailwind, shadcn-style UI | done | `apps/web` |
| RHF + Zod, TanStack Query, Zustand | done | Customer flows |
| Framer Motion micro-interactions | partial | Dependency present; used in select components |
| Express API, Postgres + Prisma, Mongo + Mongoose | done | `apps/api` |
| JWT access + refresh (httpOnly cookie) | done | `auth.routes.ts` |
| bcrypt cost 12 | done | `apps/api/src/lib/password.ts` |
| Pino logging | done | Spec allows Winston or Pino |
| Stripe payments + webhooks | done | `stripe.webhook.ts`, checkout |
| Stripe admin refund | done | `POST /api/v1/admin/bookings/:id/refund` |
| Nodemailer SMTP | done | `lib/email.ts`; lifecycle hooks in booking flow |
| Cloudinary/S3 uploads | partial | Optional Cloudinary signed upload when env set |
| Redis cache | partial | Optional `REDIS_URL`; hotel list cache when configured |
| OpenAPI `/api/docs` (non-prod) | done | `app.ts` |
| Hero search: location, dates, guests, **rooms** | done | `search-hero.tsx`, `hotelListQuerySchema.rooms` |
| Hotel list filters: price, stars, sort, pagination | done | `hotels/ui.tsx` |
| Filters: amenities, room type, distance, guest rating | partial | API: amenities, roomType, geo, minReviewAvg; UI wired where applicable |
| Map view (Leaflet) | done | `components/hotels-map.tsx` on listing |
| Hotel detail: gallery, reviews, sticky book, availability | done | `[slug]/page.tsx` |
| Room detail URL + calendar | done | `hotels/[slug]/rooms/[roomId]/page.tsx` |
| Booking: dates → guest details → pay → confirm | done | `book/page.tsx` + Prisma guest fields |
| Auth: register, login, forgot/reset, verify | done | Auth routes + pages |
| Dashboard: profile, bookings, wishlist, **post-stay review** | done | `dashboard/reviews/write` |
| Notifications + emails (confirm/cancel) | partial | Confirm/cancel emails; reminders not scheduled (cron) |
| Admin RBAC + middleware gate | done | `middleware.ts` + `hotel_access` cookie; shared login documented below |
| Admin KPIs, CRUD, reports CSV/PDF, settings | done | `admin/*` |
| Review moderation | done | Admin reviews API |
| AuditLogs (Mongo) | done | `lib/audit-log.ts` wired on auth/admin/booking/payment paths |
| Rate limit auth + bookings | done | `express-rate-limit` |
| Helmet, CORS whitelist | done | `app.ts` |
| CSRF | partial | JWT in `Authorization` + refresh httpOnly cookie; document same-site strategy in README |
| API gzip compression | done | `compression` middleware when installed |
| Error boundaries | partial | Root + `admin/error.tsx`; segment `error.tsx` where added |
| Husky + lint-staged | done | Root `package.json` |
| Vitest unit + integration (auth/booking smoke) | done | `apps/api/src/integration/app.test.ts` |
| Coverage threshold 70% services | partial | Script `test:coverage`; raise over time |
| Lighthouse 90+ | partial | Script `lh:report` in web; run in CI/staging |
| docker-compose + API Dockerfile | partial | Compose: DBs + Redis; API run via `npm run dev` / Dockerfile separately |
| DEPLOYMENT.md, CONTRIBUTING.md | done | Repo root |

## Admin login model

The product uses **one login** (`/login`) issuing role-bearing JWTs. **Next.js middleware** enforces that only `SUPER_ADMIN` and `HOTEL_MANAGER` can open `/admin` by verifying the mirrored httpOnly `hotel_access` cookie (set after login). Customers receive 302 to `/dashboard` if they hit `/admin` without an admin role.

## Verification commands

```bash
npm run lint && npm run typecheck && npm run test && npm run build
npm run test:e2e -w @hotel/web   # when UI changes
npm run test:coverage -w @hotel/api
```

After moving routes: `npm run clean -w @hotel/web` then typecheck/build.
