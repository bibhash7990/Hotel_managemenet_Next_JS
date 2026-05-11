# PLAN_APPENDIX.md (Prompt 1 spec detail, without editing `PLAN.md`)

This document exists because `PLAN.md` is missing some Prompt 1 items (notably API request/response shapes, and a more precise mapping of “planned” vs “currently implemented” routes).

It also records one process mismatch: Prompt 1 said to *stop and wait for your approval before starting implementation*, but implementation was already begun in the repo.

---

## A. API request/response shapes (as currently implemented)

### Auth (`/api/v1/auth`)

#### `POST /register`
- Request (Zod): `packages/shared/src/schemas/auth.ts` → `registerSchema`
  - `{ email: string, password: string, name: string }`
- Response:
  - `201` `{ message: string }`
- Notes:
  - Sends verification email via `sendMail()`.

#### `POST /login`
- Request (Zod): `loginSchema`
  - `{ email: string, password: string }`
- Response:
  - `200` `{ accessToken: string, expiresIn: number, user: { id, email, name, role, emailVerified } }`
- Side effects:
  - Sets `httpOnly` cookie `refresh_token`.

#### `POST /refresh`
- Request:
  - No body; reads `refresh_token` cookie.
- Response:
  - `200` `{ accessToken: string, expiresIn: number }`

#### `POST /logout`
- Request:
  - No body; reads `refresh_token` cookie.
- Response:
  - `200` `{ message: string }`

#### `GET /verify-email?token=...`
- Request:
  - Query: `{ token: string }`
- Response:
  - `200` `{ message: string }`

#### `POST /forgot-password`
- Request (Zod): `forgotPasswordSchema`
  - `{ email: string }`
- Response:
  - `200` `{ message: string }`

#### `POST /reset-password`
- Request (Zod): `resetPasswordSchema`
  - `{ token: string, password: string }`
- Response:
  - `200` `{ message: string }`

#### `GET /me`
- Request:
  - `Authorization: Bearer <accessToken>`
- Response:
  - `200` user object from `auth.service.getMe()`

### Hotels (`/api/v1/hotels`)

#### `GET /`
- Request (Zod): `hotelListQuerySchema`
  - `page, limit, city?, country?, minPrice?, maxPrice?, minStars?, sort?`
- Response:
  - `200` `{ items, page, limit, total, totalPages }`
  - `items[]` shape (from `hotels.service.listHotels()`):
    - `{ id, slug, name, city, country, starRating, images, minPrice }`

#### `GET /:slug`
- Response:
  - `200` Prisma `Hotel` record with included:
    - `rooms[]` (only `status: ACTIVE`)
    - `owner: { id, name }`

#### `GET /:slug/availability`
- Request (Zod): `availabilityQuerySchema`
  - `checkIn, checkOut, guests`
- Response:
  - `200` `{ hotelSlug, checkIn, checkOut, guests, rooms }`
  - `rooms[]`:
    - `{ id, name, type, pricePerNight: string, capacity, availableUnits: number, canBook: boolean }`

### Bookings (`/api/v1/bookings`)

#### `POST /`
- Auth: `Authorization: Bearer ...`
- Request (Zod): `createBookingSchema`
  - `{ roomId, checkIn, checkOut, guests, specialRequests? }`
- Response:
  - `201` Prisma `Booking` record

#### `GET /me`
- Auth: `Authorization: Bearer ...`
- Request (Zod): `bookingListQuerySchema`
  - `page, limit, status?`
- Response:
  - `200` `{ items, page, limit, total, totalPages }`
  - `items[]` includes:
    - `hotel: { id, name, slug, city, images }`
    - `room: { id, name, type }`

#### `POST /:id/pay`
- Auth: `Authorization: Bearer ...`
- Request: no body
- Response:
  - `200` `{ clientSecret: string, paymentIntentId: string }`

Alias:
- `POST /:id/payment-intent` (earlier internal name)

#### `PATCH /:id`
- Auth: `Authorization: Bearer ...`
- Request: no body
- Response:
  - `200` updated `Booking` record with `status: CANCELLED`

Alias:
- `PATCH /:id/cancel`

### Wishlist (`/api/v1/wishlist`)

#### `GET /`
- Auth required
- Response:
  - `200` `{ items: WishlistWithHotel[] }`

#### `POST /:hotelId`
- Auth required
- Response:
  - `200` `{ saved: boolean }` where `saved=false` means “removed from wishlist”

### Notifications (`/api/v1/notifications`)

#### `GET /`
- Auth required
- Response:
  - `200` `{ items }` (Mongo docs, lean)

#### `PATCH /:id/read`
- Auth required
- Response:
  - `200` `{ ok: true }`

### Reviews (`/api/v1/reviews`)

#### `POST /`
- Auth required
- Request (Zod): `createReviewSchema`
  - `{ bookingId, rating, title, comment, images[] }`
- Response:
  - `201` Mongo review doc
- Business rule:
  - booking must be `COMPLETED`, and `booking.userId` must match caller

#### `GET /hotel/:hotelId`
- Response:
  - `200` `{ items }` (APPROVED only)

Admin moderation is handled under `GET/PATCH /api/v1/admin/reviews`.

### Stripe webhook

#### `POST /api/v1/webhooks/stripe`
- Stripe signature required (verified using raw body)
- Response:
  - `200` `{ received: true }`

### Admin (`/api/v1/admin`)

Implemented routes (current code under `apps/api/src/modules/admin/admin.routes.ts`):
- `GET /dashboard`
- `GET /dashboard/kpis`
- `GET /hotels`
- `POST /hotels`
- `PATCH /hotels/:id`
- `DELETE /hotels/:id`
- `POST /rooms`
- `PATCH /rooms/:id`
- `DELETE /rooms/:id`
- `GET /rooms`
- `GET /bookings`
- `PATCH /bookings/:id`

- `GET /reviews` (moderation queue; PENDING only)
- `PATCH /reviews/:id` (approve/reject)
- `GET /reports/export` (CSV export)

#### `GET /dashboard/kpis`
- Auth: `Authorization: Bearer ...` (HOTEL_MANAGER+)
- Request: none
- Response:
  - `200` `{ totalBookings: number, revenue: string, hotelCount: number }`

#### `GET /hotels`
- Auth: `Authorization: Bearer ...` (HOTEL_MANAGER+)
- Request: none (manager scope applied server-side)
- Response:
  - `200` `{ items: Hotel[] }`

#### `POST /hotels`
- Auth: `Authorization: Bearer ...` (HOTEL_MANAGER+)
- Request (Zod): `createHotelSchema`
  - `{ name, description, address, city, country, lat?, lng?, starRating, amenities: string[], images: string[] }`
- Response:
  - `201` created hotel record

#### `PATCH /hotels/:id`
- Auth: `Authorization: Bearer ...` (owner-scoped unless SUPER_ADMIN)
- Request (Zod): `updateHotelSchema` (partial)
- Response:
  - `200` updated hotel record

#### `DELETE /hotels/:id`
- Auth: `Authorization: Bearer ...` (owner-scoped unless SUPER_ADMIN)
- Response:
  - `200` `{ deleted: true }`

#### `GET /rooms`
- Auth: `Authorization: Bearer ...` (HOTEL_MANAGER+)
- Request (query):
  - `page?: number`, `limit?: number`, `hotelId?: string` (optional)
- Response:
  - `200` `{ items: Room[]; page; limit; total; totalPages }`

#### `POST /rooms`
- Auth: `Authorization: Bearer ...`
- Request (Zod): `createRoomSchema`
  - `{ hotelId, name, type, description?, pricePerNight, capacity, beds, amenities: string[], images: string[], totalQuantity }`
- Response:
  - `201` created room record

#### `PATCH /rooms/:id`
- Auth: `Authorization: Bearer ...`
- Request (Zod): `updateRoomSchema` (partial)
- Response:
  - `200` updated room record

#### `DELETE /rooms/:id`
- Auth: `Authorization: Bearer ...`
- Response:
  - `200` `{ deleted: true }`

#### `GET /bookings`
- Auth: `Authorization: Bearer ...` (HOTEL_MANAGER+)
- Request (query):
  - `page?: number`, `limit?: number`
- Response:
  - `200` `{ items: Booking[]; page; limit; total; totalPages }`

#### `PATCH /bookings/:id`
- Auth: `Authorization: Bearer ...`
- Request (Zod): `{ status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' }`
- Response:
  - `200` updated booking record

#### `GET /reviews`
- Auth: `Authorization: Bearer ...` (HOTEL_MANAGER+)
- Request: none
- Response:
  - `200` `{ items }` (Mongo Review docs with `moderationStatus: 'PENDING'`)
- Scoping:
  - SUPER_ADMIN: all pending reviews
  - HOTEL_MANAGER: pending reviews only for hotels owned by the manager

#### `PATCH /reviews/:id`
- Auth: `Authorization: Bearer ...` (SUPER_ADMIN or HOTEL_MANAGER for the review’s hotel)
- Request (Zod): `moderateReviewSchema`
  - `{ moderationStatus: 'APPROVED' | 'REJECTED' }`
- Response:
  - `200` updated Review doc

#### `GET /reports/export`
- Auth: `Authorization: Bearer ...`
- Request: none
- Response:
  - `200` `text/csv` attachment (`stayhub-reports.csv`)

---

## B. Exact auth/authorization rules (current implementation)

- Roles come from Prisma `User.role`:
  - `CUSTOMER`, `HOTEL_MANAGER`, `SUPER_ADMIN`
- `requireAuth()` validates access JWT and sets `req.user = { id, role, email }`.
- `requireRoles()` only checks role membership for routes that use it.
- “Hotel manager scoping” is enforced ad-hoc per route:
  - Example: when patching a booking, room, or review, hotel managers are allowed only if the referenced record’s `hotel.ownerId === req.user.id`.

---

## C. Component hierarchy (current web app implementation)

Top-level layout:
- `apps/web/app/layout.tsx`: providers + `SiteHeader`
- `apps/web/app/providers.tsx`: TanStack Query + Theme + Sonner toaster
- `apps/web/components/site-header.tsx`: header + conditional nav for logged-in users

Pages:
- Marketing: `apps/web/app/page.tsx` + `apps/web/components/search-hero.tsx`
- Browse:
  - `apps/web/app/hotels/page.tsx`
  - `apps/web/app/hotels/ui.tsx` (client data fetching + listing)
- Hotel detail:
  - `apps/web/app/hotels/[slug]/page.tsx`
  - `apps/web/app/hotels/[slug]/ui.tsx` (client rendering + “Book” button populates Zustand store)
- Booking:
  - `apps/web/app/book/page.tsx` (creates booking via `/api/v1/bookings`)
- Account:
  - `apps/web/app/dashboard/page.tsx` (lists bookings via `/api/v1/bookings/me`)
- Admin:
  - `apps/web/app/admin/page.tsx` (KPIs via `/api/v1/admin/dashboard/kpis`, chart via Recharts)

State:
- `apps/web/stores/booking-store.ts` (Zustand draft: `hotelSlug`, `roomId`, `checkIn`, `checkOut`, `guests`)

---

## D. Next step recommendation

If you want strict adherence to Prompt 1’s *process*, we should treat `PLAN.md` as the approved “contract” and continue by implementing the remaining missing parts from the phases, but using this appendix as the missing detail layer for request/response shapes and current route mapping.

