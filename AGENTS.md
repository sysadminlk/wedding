# AGENTS.md

## Stack

| Layer    | Tech                                  | Dir        |
|----------|---------------------------------------|------------|
| Backend  | Spring Boot 3 + Maven + PostgreSQL   | `backend/` |
| Web      | Next.js                               | `web/`     |
| Mobile   | Flutter (Android + iOS, single codebase) | `mobile/` |

Each stack has its own build tool, deps, and lifecycle. Never cross boundaries.

## API

REST over JSON between backend and both web/mobile clients.

## Deployment

**Local dev:** Docker Compose — `docker-compose up` brings up backend, web, MinIO (local S3), and PostgreSQL.
**Production:** AWS (details TBD once local setup is stable).

All services (backend, web, DB, object storage) run in Docker. No Vercel.

## Branching

Single shared `dev` branch. Feature branches merge into `dev`.

## Quick Start (Local VM)

```bash
git clone <repo> && cd wedding_planing
docker-compose up -d
# Backend:  http://localhost:8080
# Web:      http://localhost:3000
# DB:       localhost:5432
# MinIO:    http://localhost:9000 (console: :9001)
```

## Commands (Outside Docker)

### Backend (Spring Boot / Maven)
- Run: `cd backend && ./mvnw spring-boot:run`
- Test: `cd backend && ./mvnw test`
- Build: `cd backend && ./mvnw clean package`

### Web (Next.js)
- Dev: `cd web && npm run dev`
- Build: `cd web && npm run build`
- Lint: `cd web && npm run lint`

### Mobile (Flutter)
- Run: `cd mobile && flutter run`
- Test: `cd mobile && flutter test`
- Build APK: `cd mobile && flutter build apk`
- Build iOS: `cd mobile && flutter build ios`

## Database

PostgreSQL. Migrations managed by the backend (likely Flyway or Liquibase — verify once scaffolded).

## File Storage

S3-compatible object storage. **Local dev:** MinIO (Docker). **Production:** AWS S3.
Used for: wedding photos, menu uploads, guest video/voice messages, any user-uploaded media.

## Architecture

- **Multi-tenant** — 5 roles × 16 planning sections × read/write/none permissions
- **Billing** — Free / Premium / Planner tiers; gateways: PayHere + others (Paystack, Flutterwave, Razorpay, Mollie, Mercado Pago, offline bank). Plan limits enforced server-side.
- **Web installer** at `/install` — 4-step wizard, no SSH
- **Admin panel** at `/admin` — branding, email, storage, OAuth, payments, languages, landing page
- **Demo mode** — read-only sandbox + daily reset cron + iframe-compatible headers

## Public Routes

| Route              | Purpose                                      |
|--------------------|----------------------------------------------|
| `/w/{slug}`        | Public wedding site (6 themes)               |
| `/share/{slug}`    | Guest page — one QR, one tabbed page         |
| `/admin/landing`   | Landing page selector (10 designs)           |
| `/install`         | Web installer wizard                         |

## Guest Page (`/share/{slug}`)

Single QR → single tabbed page:
1. Seat finder (search name → table on floor plan)
2. Photo/video gallery upload (write-only; couple sees)
3. Menu carousel (tap-to-zoom)
4. Gift registry + cash/honeymoon fund (guests pay couple directly)
5. Video/voice guestbook (MediaRecorder, browser-native)

## Feature Sections (16)

Dashboard · Checklist · Budget · Guests & RSVPs · Seating Chart · 3D Floor Plan (React Three Fiber) · Vendors · Wedding Crew · Timeline · Inspiration · Wedding Menu · Photos · Guest Memories · Public Website · RSVP Page · Email Templates · Collaborators

Each section is a permission boundary. PDF & Excel export on every list view.
Flutter mobile app covers all 16 sections with full feature parity.

## Design System — Atelier

- **Fonts:** Playfair Display (headings) + system sans-serif
- **Palettes:** dark espresso (brand surface), warm ivory+gold (auth/guest), light/dark dashboard
- **Rule:** all colors are CSS variables — re-theme by swapping tokens, never hardcode values
- Typography-led, calm > colourful

## Integrations

| Service      | Purpose                  | Notes                                      |
|--------------|--------------------------|--------------------------------------------|
| Resend/SMTP  | Email (save-the-date, invite) | Configurable, templates with live preview |
| Twilio       | SMS & WhatsApp           | Config-gated — inert without API keys      |
| PayHere + others | Billing             | PayHere primary; enable any combo; buyers pick at checkout |
| S3 / MinIO   | File storage             | Photos, menus, guest media                 |
| MediaRecorder | Guest video/voice       | Browser-native, no plugin                  |

## Conventions

- Guest page = one QR → one tabbed page — no app install, no plugins
- Gift registry & cash fund show on public site across all themes incl. premium
- Cash fund: guests pay couple directly — nothing flows through platform
- Multi-language: in-app switcher + admin string editor (no code, no redeploy)
- Mandatory email verification with resend UX (banners, styled flows)
- 3D floor plan (React Three Fiber) is web-only; mobile uses 2D seating view
