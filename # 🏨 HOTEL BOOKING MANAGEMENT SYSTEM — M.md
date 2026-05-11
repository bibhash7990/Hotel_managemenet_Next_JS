# 🏨 HOTEL BOOKING MANAGEMENT SYSTEM — MASTER CURSOR PROMPT

> Use this as a **single master prompt** for Cursor (or paste sections individually as needed). It is structured so Cursor first creates a complete plan, then executes it phase-by-phase with production-grade quality.

---

## 📋 PROMPT 1 — INITIAL PLANNING & ARCHITECTURE (Paste this FIRST in Cursor)

```
You are a senior full-stack architect and engineer. I want you to build a 
PRODUCTION-GRADE Hotel Booking Management System. Before writing ANY code, 
your FIRST task is to:

1. Read this entire specification carefully.
2. Ask me clarifying questions if anything is ambiguous.
3. Produce a complete PROJECT PLAN document (PLAN.md) in the repo root that includes:
   - Folder/file structure (full tree)
   - Database schema (all tables/collections, fields, types, relationships, indexes)
   - API endpoint list (method, path, auth required, request/response shape)
   - Component hierarchy (frontend pages + reusable components)
   - State management approach
   - Authentication & authorization flow
   - Phase-by-phase implementation roadmap with checkboxes
   - Risks and edge cases

Only after I approve PLAN.md, begin implementation phase by phase. After each 
phase, stop, summarize what was done, and wait for me to review.

═══════════════════════════════════════════════════════════════════
PROJECT: Hotel Booking Management System (Full-Stack Web Application)
═══════════════════════════════════════════════════════════════════

# 1. PROJECT OVERVIEW
A modern, fully responsive hotel booking platform where:
- Customers can browse hotels, view room details, check availability, 
  compare pricing, make secure reservations, and manage their bookings.
- Hotel admins can manage hotels, rooms, bookings, customers, and view 
  analytics through a dedicated admin dashboard.
- The architecture must support future scalability and feature growth.

# 2. TECHNOLOGY STACK (NON-NEGOTIABLE)
Frontend:
- Next.js 14+ (App Router, Server Components where applicable)
- TypeScript (strict mode enabled)
- Tailwind CSS + shadcn/ui components
- React Hook Form + Zod for form validation
- TanStack Query (React Query) for server state
- Zustand for client state (where needed)
- Framer Motion for subtle animations

Backend:
- Node.js + Express.js (or Next.js API routes — choose and justify in PLAN.md)
- TypeScript (strict mode)
- PostgreSQL (relational data: users, hotels, rooms, bookings, payments)
- MongoDB (dynamic content: reviews, notifications, logs, search-heavy content)
- Prisma ORM for PostgreSQL
- Mongoose for MongoDB
- JWT authentication (access + refresh token pattern)
- bcrypt for password hashing
- Zod for request validation
- Winston or Pino for structured logging

Integrations & Infra:
- Stripe for payments (test mode initially)
- Nodemailer + SMTP (or Resend) for transactional emails
- Cloudinary or AWS S3 for image uploads
- Redis (optional, for caching + rate limiting)
- REST APIs (document with OpenAPI/Swagger)
- GitHub for version control (conventional commits)
- Deploy: Vercel (frontend) + Railway/Render/AWS (backend + DBs)

# 3. CORE FEATURES — DETAILED REQUIREMENTS

## 3.1 Public / Customer-Facing
- Modern, fully responsive landing page (mobile-first, looks great on all devices)
- Hero section with search bar (location, check-in, check-out, guests, rooms)
- Hotel listing page with:
  * Advanced filters: price range, star rating, amenities, room type, 
    distance, guest rating
  * Sort by: price (low/high), rating, popularity, newest
  * Pagination or infinite scroll
  * Map view (optional, using Leaflet or Mapbox)
- Hotel detail page:
  * Image gallery / carousel
  * Description, amenities, location with map
  * List of available rooms with real-time availability
  * Reviews & ratings section
  * Sticky booking widget
- Room detail with availability calendar
- Booking flow (multi-step):
  1. Select dates & guests
  2. Guest details
  3. Payment (Stripe)
  4. Confirmation page + email
- User authentication: register, login, logout, forgot password, reset 
  password, email verification
- Customer dashboard:
  * Profile management (avatar upload, personal info, change password)
  * Booking history (upcoming, past, cancelled)
  * Booking detail view + cancel/modify
  * Saved/favorite hotels (wishlist)
  * Review submission for completed stays
- Notifications & confirmation emails (booking confirmed, cancelled, reminder)
- SEO optimization: meta tags, OG tags, sitemap.xml, robots.txt, 
  structured data (JSON-LD), fast loading (Lighthouse 90+)

## 3.2 Admin Panel
- Separate admin login with role-based access (Super Admin, Hotel Manager)
- Dashboard with KPIs: total bookings, revenue, occupancy rate, top hotels
- Charts: revenue over time, bookings by status, popular hotels (use Recharts)
- Hotel management: CRUD hotels (with image uploads, amenities, location)
- Room management: CRUD rooms per hotel, set pricing, availability
- Booking management: view all bookings, filter, change status, refund
- Customer management: view users, deactivate, view their bookings
- Review moderation: approve/reject reviews
- Reports: exportable CSV/PDF reports
- Settings: site config, payment keys (env), email templates

## 3.3 Cross-Cutting Features
- Real-time reservation tracking (prevent double-booking using DB transactions 
  + row-level locking on PostgreSQL)
- Search with debouncing + server-side filtering
- Image optimization (Next.js Image component, lazy loading)
- Caching strategy: React Query on client, Redis on server (optional), 
  Next.js ISR for hotel pages
- Rate limiting on auth and booking endpoints
- CSRF protection, CORS properly configured
- Input sanitization everywhere

# 4. DATABASE SCHEMA REQUIREMENTS
Design proper schemas with:
- Users (id, email, hashed_password, role, name, phone, avatar, 
  email_verified, created_at, updated_at)
- Hotels (id, name, slug, description, address, city, country, lat, lng, 
  star_rating, amenities[], images[], owner_id, status, created_at)
- Rooms (id, hotel_id, name, type, description, price_per_night, capacity, 
  beds, amenities[], images[], total_quantity, status)
- Bookings (id, user_id, hotel_id, room_id, check_in, check_out, guests, 
  total_price, status [pending/confirmed/cancelled/completed], 
  payment_id, special_requests, created_at)
- Payments (id, booking_id, stripe_payment_intent_id, amount, currency, 
  status, refund_id)
- Reviews [MongoDB] (booking_id, user_id, hotel_id, rating, title, comment, 
  images, helpful_count, created_at)
- Notifications [MongoDB] (user_id, type, title, message, read, link, created_at)
- Wishlist (user_id, hotel_id)
- Sessions / RefreshTokens
- AuditLogs [MongoDB]

Add all necessary indexes for query performance.

# 5. SECURITY REQUIREMENTS (MANDATORY)
- All passwords hashed with bcrypt (cost factor 12)
- JWT access token (15 min) + refresh token (7 days, httpOnly cookie)
- Validate ALL inputs with Zod on both client and server
- Parameterized queries (Prisma handles this) — no raw SQL concatenation
- CORS whitelist for frontend domain only
- Helmet.js for security headers
- Rate limiting: express-rate-limit on /auth/* and /booking/*
- Prevent SQL injection, XSS, CSRF
- Secure cookie flags (httpOnly, secure, sameSite)
- Environment variables in .env (never committed); provide .env.example
- Sanitize file uploads (type, size, virus-safe storage)
- Don't expose stack traces in production
- Log security events (failed logins, suspicious activity)

# 6. PERFORMANCE REQUIREMENTS
- Lighthouse score: Performance 90+, Accessibility 95+, SEO 95+
- LCP < 2.5s, FID < 100ms, CLS < 0.1
- Image optimization: WebP, responsive sizes, lazy loading
- Code splitting per route
- Database query optimization (no N+1, proper indexes, select only needed fields)
- API response caching where appropriate
- Pagination on all list endpoints (default 20, max 100)
- Compression (gzip/brotli)

# 7. UI / UX REQUIREMENTS
- Design language: Modern, clean, premium — inspired by Booking.com, 
  Airbnb, and Hotels.com but with its own distinct identity
- Color palette: professional (suggest deep blue/teal primary + warm accent)
- Consistent design system using shadcn/ui
- Dark mode support
- Skeleton loaders for all async content
- Empty states with helpful messaging
- Error boundaries with friendly fallback UIs
- Toast notifications (sonner) for user feedback
- Smooth page transitions and micro-interactions
- Fully accessible (WCAG 2.1 AA): semantic HTML, ARIA labels, keyboard 
  navigation, focus management, color contrast
- Mobile-first, responsive at: 320px, 768px, 1024px, 1440px breakpoints

# 8. CODE QUALITY REQUIREMENTS (PRODUCTION-GRADE)
- TypeScript strict mode — no `any` types unless absolutely justified
- ESLint + Prettier configured and enforced
- Husky + lint-staged for pre-commit checks
- Conventional commits
- Folder structure: feature-based, not type-based
- Separation of concerns: controllers → services → repositories
- DTOs for all API requests/responses
- Custom error classes + centralized error handler
- Environment-specific configs
- Comprehensive README.md with setup instructions
- API documentation (Swagger/OpenAPI)
- Inline JSDoc comments on complex functions
- No dead code, no console.logs in production

# 9. TESTING REQUIREMENTS
- Unit tests (Vitest or Jest) for utilities and services — critical paths covered
- Integration tests for API endpoints (auth, booking flow)
- E2E test for the complete booking flow (Playwright)
- Test coverage target: 70%+ on backend services

# 10. DEPLOYMENT & DEVOPS
- Dockerfile for backend
- docker-compose.yml for local development (Postgres + Mongo + Redis + backend)
- GitHub Actions CI: lint → typecheck → test → build on every PR
- Environment management: development, staging, production
- Database migrations with Prisma
- Seed script with realistic dummy data (10 hotels, 50 rooms, sample bookings)
- Production deployment guide in DEPLOYMENT.md

# 11. DELIVERABLES (PHASE-WISE)
Phase 1 — Foundation:
  - Repo setup, folder structure, configs, linting, env, Docker
  - Database schemas, migrations, seed data
  - Auth system (register, login, JWT, password reset, email verification)

Phase 2 — Core Backend:
  - Hotels CRUD + search/filter
  - Rooms CRUD + availability logic
  - Bookings CRUD + atomic booking transaction
  - Payments integration (Stripe)
  - Email notifications

Phase 3 — Customer Frontend:
  - Landing page + search
  - Hotel listing with filters
  - Hotel detail + booking flow
  - Customer dashboard
  - Reviews & wishlist

Phase 4 — Admin Panel:
  - Admin auth + dashboard with charts
  - Hotel/Room/Booking/User management
  - Reports & exports

Phase 5 — Polish & Production:
  - SEO, performance, accessibility audits
  - Tests
  - Deployment
  - Documentation (README, API docs, deployment guide)

# 12. RULES OF ENGAGEMENT
- Do NOT skip steps. Do NOT take shortcuts.
- Do NOT use placeholder code (no "// TODO: implement later" in delivered code).
- Every file must be complete and runnable.
- After each phase, run the linter, typecheck, and any tests, and fix issues 
  before declaring the phase complete.
- If a library has a known security advisory, choose an alternative.
- Prefer official, well-maintained libraries.
- When in doubt, ASK ME before guessing.

═══════════════════════════════════════════════════════════════════
NOW BEGIN. Step 1: Ask me any clarifying questions you have. 
Step 2: Produce PLAN.md. Then wait for my approval before coding.
═══════════════════════════════════════════════════════════════════
```

---

## 📋 PROMPT 2 — PHASE EXECUTION (Use AFTER plan is approved)

```
The PLAN.md is approved. Begin Phase 1: Foundation.

Rules:
1. Implement EVERY item in Phase 1 fully — no stubs, no TODOs.
2. After completing the phase:
   - Run `pnpm lint`, `pnpm typecheck`, `pnpm test`
   - Fix all errors and warnings
   - Update PLAN.md checkboxes
   - Provide a summary of: files created, decisions made, any deviations 
     from the plan (with justification), and how to verify the phase works
3. Then STOP and wait for my "proceed" before starting Phase 2.

Quality bar: Pretend this code will be reviewed by a principal engineer at 
Stripe. No sloppiness. No magic numbers. Proper error handling everywhere. 
Meaningful variable names. Clean abstractions.
```

Repeat the same prompt for Phase 2, 3, 4, 5 — just change the phase number.

---

## 📋 PROMPT 3 — UI/UX QUALITY ENFORCEMENT (Paste when working on frontend)

```
For all frontend work, follow these UI rules strictly:

VISUAL QUALITY:
- Use shadcn/ui as the base — extend, never reinvent
- Spacing: use a consistent 4px scale (Tailwind defaults)
- Typography: clear hierarchy — display, h1, h2, h3, body, caption
- Use a single font family (Inter or similar) with 2-3 weights
- Color palette defined in tailwind.config.ts as semantic tokens 
  (primary, secondary, accent, muted, destructive, success)
- Every page must have: proper loading state, error state, empty state, 
  and success state
- Buttons: primary, secondary, ghost, destructive variants — never use 
  default browser styles
- Forms: inline validation, helpful error messages, loading state on submit, 
  disabled state during submission

INTERACTION:
- Hover, focus, active, disabled states on every interactive element
- Smooth transitions (200-300ms) — never instant or janky
- Skeleton loaders matching the final layout
- Optimistic UI where it makes sense (likes, wishlist toggles)

RESPONSIVE:
- Mobile-first. Build for 375px, then scale up.
- Test at: 375px, 768px, 1024px, 1440px
- No horizontal scroll on mobile, ever
- Touch targets minimum 44x44px

ACCESSIBILITY:
- Semantic HTML (header, nav, main, section, article, footer)
- ARIA labels where needed
- Keyboard navigable (tab order makes sense, focus visible)
- Color contrast 4.5:1 minimum for text
- Alt text on all images
- Form labels properly associated

Before declaring any UI component "done", review it against this list.
```

---

## 📋 PROMPT 4 — SECURITY & PRODUCTION READINESS AUDIT (Final phase)

```
Run a complete production-readiness audit on the codebase. Check and fix:

1. SECURITY:
   - All inputs validated with Zod (client + server)
   - No secrets in code or git history
   - Rate limiting on auth + booking endpoints
   - CORS, Helmet, secure cookies configured
   - SQL injection / XSS / CSRF protection verified
   - File uploads sanitized (type, size, scanned)
   - JWT refresh token rotation working
   - Password reset tokens single-use and expiring

2. PERFORMANCE:
   - Run Lighthouse on all key pages — must score 90+
   - Check for N+1 queries (use Prisma logging in dev)
   - Verify image optimization (WebP, lazy load, sizes)
   - Bundle analyzer — no oversized dependencies
   - API response times < 300ms p95 for critical endpoints

3. RELIABILITY:
   - Error boundaries on every route
   - Centralized error handler logs but doesn't leak details
   - Database transactions for booking flow (atomic, no double-booking)
   - Graceful degradation if email/payment service is down

4. OBSERVABILITY:
   - Structured logging (request id, user id, route, latency)
   - Health check endpoint
   - Basic metrics (or hooks for adding them)

5. DOCUMENTATION:
   - README.md: project overview, setup, env vars, running locally, scripts
   - API docs (Swagger/OpenAPI) accessible at /api/docs in dev
   - DEPLOYMENT.md: step-by-step production deployment
   - CONTRIBUTING.md: code style, branching, commit conventions

For every issue found, fix it and report what was fixed.
```

---

## 📌 APPENDIX A — How hotel management works in this system (read before Phase 4)

This section documents **ownership**, **roles**, and **seed data** so the manager panel matches real-world expectations (production-grade mental model).

### A.1 Typical real-world split

| Actor | Responsibility |
|--------|----------------|
| **Super admin / chain HQ** | Full catalog, cross-property reporting, user directory, global settings, moderation across all hotels. |
| **Hotel manager / property operator** | **Only** the hotels they **own or are assigned** to: property profile, room inventory, rates, availability, **their** guest bookings, **their** review queue, **their** exports. |

Industry tools (Opera Cloud, Mews, Cloudbeds, etc.) separate **chain** vs **property** scopes. This codebase models that with **`Hotel.ownerId` → `User.id`**: a manager’s API and UI lists are always filtered to rows where that user is the hotel owner.

### A.2 What the backend already enforces

- **`HOTEL_MANAGER`**: `GET /admin/hotels`, rooms, bookings, reviews, reports are scoped to `ownerId = current user`. Cannot hit customers or site-wide settings (super admin only).
- **`SUPER_ADMIN`**: Sees the whole platform on the same endpoints (no owner filter).
- **Create hotel** (`POST /admin/hotels`): New hotels are created with `ownerId =` the authenticated user (managers naturally only create **their** hotels).

So if the **UI** ever looked like “every city in Europe,” the cause was almost certainly **seed data** (all demo hotels assigned to one manager), not missing RBAC.

### A.3 Seed data convention (demo)

After alignment, the seed script should:

- Assign **most** catalog hotels to the **super admin** (platform / demo inventory still browsable by customers on the public site).
- Assign **one or a few** hotels to the **`manager@example.com`** account so the **Hotel manager** panel clearly shows a **small portfolio**.

Re-run after changes: from `apps/api`, `npx prisma db seed` (or your repo’s documented seed command).

### A.4 UI routes (StayHub)

| Role | Panel URL | Purpose |
|------|-----------|---------|
| `SUPER_ADMIN` | `/admin` | Full nav including customers + settings. |
| `HOTEL_MANAGER` | `/manager` | Same operational APIs, **different** shell: no global customers/settings; copy explains “your properties.” |

### A.5 Production roadmap (manager experience) — checklist for Cursor / PLAN.md

Use this as a **gap list** when you extend beyond read-only tables:

1. **Hotels**: In-panel “Add property” form (POST), edit hotel, image upload — all already allowed by API; wire UI + validation.
2. **Rooms**: Create/edit room with **hotel picker limited to manager’s hotels** (API already blocks other owners).
3. **Bookings**: Filters by date/status/hotel; status transitions with confirmation; refund only when policy allows (align with Stripe rules).
4. **Reviews**: Moderation queue already scoped; add empty states and batch actions if needed.
5. **Optional multi-staff**: Later, replace sole `ownerId` with a **`HotelStaff` / role assignment** table if one property has multiple logins (not required for MVP).
6. **Audit**: All destructive actions already log in API patterns — surface read-only audit tail in manager panel if product requires it.

---

## 🎯 HOW TO USE THIS

1. **Open Cursor** in an empty folder.
2. **Paste Prompt 1** in the chat. Answer Cursor's clarifying questions, then approve `PLAN.md`.
3. **Paste Prompt 2** (Phase 1). When done, review, then say "proceed to Phase 2". Repeat for each phase.
4. **Paste Prompt 3** at the start of any frontend phase to enforce UI quality.
5. **Paste Prompt 4** at the very end as a final audit before deployment.

## 💡 PRO TIPS

- Keep `PLAN.md` open in Cursor's context (pin it) so the model never loses track.
- After every phase, commit to git with a clear message — gives you rollback points.
- If Cursor starts cutting corners, paste: *"Quality check: review the last 5 files you wrote. Are they production-grade by the standards in the master prompt? Fix anything that isn't."*
- For your $3,000 / 1-month budget, you can realistically deliver Phases 1–4 fully and Phase 5 partially. Be honest about scope.

---

**Tech-stack notes from your spec:** I kept everything you listed (Next.js, TypeScript, Tailwind, Node, PostgreSQL, MongoDB, JWT, REST, Vercel/AWS/Railway, GitHub) and added the supporting tools (Prisma, Zod, Stripe, shadcn/ui, etc.) that are required to actually deliver "production-grade." If you want to drop MongoDB and use only PostgreSQL (simpler), tell Cursor in Prompt 1 — it'll adjust the plan.
