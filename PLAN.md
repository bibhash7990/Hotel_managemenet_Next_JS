# Hotel Booking Management System — Project Plan

**Data store decision:** PostgreSQL (Prisma) for transactional data; MongoDB (Mongoose) for reviews, notifications, and audit logs.

**Backend:** Standalone Express API (`apps/api`); Next.js App Router (`apps/web`) consumes the REST API.

---

## 1. Repository layout (full tree)

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── apps/
│   ├── api/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── index.ts
│   │       ├── app.ts
│   │       ├── config/
│   │       ├── lib/
│   │       │   ├── prisma.ts
│   │       │   ├── mongo.ts
│   │       │   ├── logger.ts
│   │       │   └── email.ts
│   │       ├── middleware/
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   ├── hotels/
│   │       │   ├── rooms/
│   │       │   ├── bookings/
│   │       │   ├── reviews/
│   │       │   ├── notifications/
│   │       │   ├── wishlist/
│   │       │   └── admin/
│   │       └── swagger.ts
│   └── web/
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── ...
├── packages/
│   └── shared/
│       ├── package.json
│       └── src/
│           ├── schemas/        # Zod DTOs
│           └── types/
├── docker-compose.yml
├── package.json
├── PLAN.md
├── README.md
├── DEPLOYMENT.md
└── .env.example
```

---

## 2. Database schema

### 2.1 PostgreSQL (Prisma)

| Model | Fields | Notes |
|-------|--------|-------|
| **User** | id (cuid), email (unique), passwordHash, role (CUSTOMER, HOTEL_MANAGER, SUPER_ADMIN), name, phone?, avatarUrl?, emailVerified (bool), verifyToken?, verifyTokenExp?, resetToken?, resetTokenExp?, createdAt, updatedAt | bcrypt cost 12 |
| **RefreshToken** | id, tokenHash (unique), userId (FK), expiresAt, createdAt | httpOnly refresh rotation |
| **Hotel** | id, ownerId (FK User), name, slug (unique), description, address, city, country, lat?, lng?, starRating (Int), amenities (Json), images (Json), status (DRAFT, ACTIVE, SUSPENDED), createdAt, updatedAt | Index: city+country+status, slug |
| **Room** | id, hotelId (FK), name, type, description?, pricePerNight (Decimal), capacity, beds (Int), amenities (Json), images (Json), totalQuantity (Int), status (ACTIVE, INACTIVE), createdAt, updatedAt | Index: hotelId |
| **Booking** | id, userId, hotelId, roomId, checkIn, checkOut, guests, totalPrice (Decimal), status (PENDING, CONFIRMED, CANCELLED, COMPLETED), stripePaymentIntentId?, specialRequests?, createdAt, updatedAt | Indexes: roomId+dates, userId+status |
| **Payment** | id, bookingId (unique FK), stripePaymentIntentId (unique), amount, currency, status, refundId?, createdAt, updatedAt | |
| **Wishlist** | id, userId, hotelId, createdAt | @@unique([userId, hotelId]) |

### 2.2 MongoDB (Mongoose)

| Collection | Key fields | Indexes |
|------------|------------|---------|
| **reviews** | bookingId (unique), userId, hotelId, rating, title, comment, images[], helpfulCount, moderationStatus (PENDING, APPROVED, REJECTED), createdAt | hotelId, userId, moderationStatus |
| **notifications** | userId, type, title, message, read, link?, createdAt | userId + read + createdAt |
| **auditlogs** | actorId?, action, resource, metadata (Mixed), ip?, createdAt | createdAt (TTL optional) |

---

## 3. API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Liveness |
| GET | /api/docs | No | Swagger UI (non-prod or gated) |
| POST | /api/v1/auth/register | No | Register + send verify email |
| POST | /api/v1/auth/login | No | Access JWT + Set-Cookie refresh |
| POST | /api/v1/auth/logout | Refresh cookie | Revoke refresh |
| POST | /api/v1/auth/refresh | Refresh cookie | Rotate refresh |
| GET | /api/v1/auth/me | Bearer | Current user |
| POST | /api/v1/auth/forgot-password | No | Rate limited |
| POST | /api/v1/auth/reset-password | No | Single-use token |
| GET | /api/v1/auth/verify-email | No | ?token= |
| GET | /api/v1/hotels | No | Query: filters, sort, page, limit (max 100) |
| GET | /api/v1/hotels/:slug | No | Detail + rooms |
| GET | /api/v1/hotels/:slug/availability | No | checkIn, checkOut, guests |
| POST | /api/v1/bookings | Bearer | Create PENDING (transaction + lock) |
| POST | /api/v1/bookings/:id/pay | Bearer | Stripe PaymentIntent (canonical) |
| POST | /api/v1/bookings/:id/payment-intent | Bearer | Alias for PaymentIntent |
| GET | /api/v1/bookings/me | Bearer | Paginated |
| PATCH | /api/v1/bookings/:id | Bearer | Cancel / limited modify |
| GET | /api/v1/wishlist | Bearer | List |
| POST | /api/v1/wishlist/:hotelId | Bearer | Toggle |
| GET | /api/v1/notifications | Bearer | Mongo |
| PATCH | /api/v1/notifications/:id/read | Bearer | Mark read |
| POST | /api/v1/reviews | Bearer | Completed booking only |
| POST | /api/v1/webhooks/stripe | Stripe sig | Webhook raw body |
| GET | /api/v1/admin/dashboard/kpis | Bearer | HOTEL_MANAGER+ (canonical KPIs) |
| GET | /api/v1/admin/dashboard | Bearer | Alias KPIs |
| GET | /api/v1/admin/reports/export | Bearer | CSV export (scoped) |
| GET | /api/v1/admin/bookings | Bearer | Filters |
| PATCH | /api/v1/admin/bookings/:id | Bearer | Status |
| CRUD | /api/v1/admin/hotels/* | Bearer | Scoped by owner unless SUPER_ADMIN |
| CRUD | /api/v1/admin/rooms/* | Bearer | Scoped |
| GET | /api/v1/admin/reviews | Bearer | Moderation queue |
| PATCH | /api/v1/admin/reviews/:id | Bearer | Approve/reject |

Request/response bodies validated with Zod; shared DTOs in `packages/shared`.

---

## 4. Frontend component hierarchy

- **Layouts:** `app/layout.tsx` (providers, theme), `app/(marketing)/layout`, `app/(auth)/layout`, `app/(dashboard)/layout`, `app/admin/layout`
- **Pages:** `/`, `/hotels`, `/hotels/[slug]`, `/book`, `/dashboard`, `/login`, `/register`, `/admin/...`
- **Components:** `components/ui/*` (shadcn), `HotelCard`, `SearchHero`, `FilterSidebar`, `BookingSteps`, `ReviewList`, `AdminSidebar`, `DataTable`
- **Providers:** TanStack Query, Theme (next-themes), Toaster (sonner)

---

## 5. State management

- **TanStack Query:** hotels, bookings, user, notifications
- **Zustand:** `useBookingStore` (dates, guests, roomId, hotelSlug)
- **React Hook Form + Zod:** forms

---

## 6. Authentication flow

1. Login → API validates password → issues JWT (15m) + sets httpOnly refresh (7d, hashed in DB).
2. Client stores access token in memory or sessionStorage (configurable); attaches `Authorization: Bearer`.
3. Refresh → POST `/auth/refresh` with cookie → new access + rotated refresh.
4. Roles: CUSTOMER (default), HOTEL_MANAGER (owns hotels), SUPER_ADMIN (full admin).

Production: align API and web on parent domain or use BFF for same-site cookies.

---

## 7. Phase roadmap

### Phase 1 — Foundation
- [x] Monorepo (npm workspaces), TypeScript strict, ESLint, Prettier
- [x] docker-compose: Postgres, Mongo, Redis (optional), API service definition
- [x] Prisma schema, migrations, seed (10 hotels, 50+ rooms)
- [x] Mongoose models + API wiring
- [x] Auth: register, login, refresh, logout, forgot/reset, verify email
- [x] Helmet, CORS, rate limit, centralized errors, logging

### Phase 2 — Core backend
- [x] Hotels list/detail/search/filter/sort/pagination
- [x] Rooms CRUD (admin) + availability
- [x] Bookings create with transaction (`$executeRaw` row lock on Room)
- [x] Stripe PaymentIntent + webhook skeleton
- [x] Email helper (SMTP / log in dev)

### Phase 3 — Customer frontend
- [x] Landing + search hero
- [x] Hotel listing + filters
- [x] Hotel detail + booking entry
- [x] Customer dashboard shell + bookings list
- [x] Wishlist + reviews UI hooks

### Phase 4 — Admin panel
- [x] Admin layout + KPIs stub
- [x] Admin hotels/rooms/bookings/reviews routes (API + minimal UI)

### Phase 5 — Polish
- [x] SEO: metadata, sitemap, robots
- [x] GitHub Actions CI
- [x] API Dockerfile + DEPLOYMENT.md
- [x] Vitest sample + Playwright placeholder script

### Prompt 2 verification (re-audit)

Run from repo root per [PROMPT2_VERIFICATION.md](./PROMPT2_VERIFICATION.md):

- **2026-05-07:** `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` — all passed.

---

## 8. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Double booking | Prisma transaction + `SELECT FOR UPDATE` on `"Room"` |
| Stripe duplicate events | Idempotent updates by `stripePaymentIntentId` |
| Cross-origin refresh | Document cookie domain; dev uses localhost ports with credentials |
| IDOR on admin | Service checks `hotel.ownerId === user.id` or SUPER_ADMIN |
| Mongo/PG drift | Reviews only after PG booking COMPLETED; unique bookingId on review |

---

## 9. Scripts (root)

- `npm run dev` — concurrent web + api (via `concurrently`)
- `npm run build` — build all
- `npm run lint` / `typecheck` / `test`
