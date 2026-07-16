# Sprint Plan — weddingWire

## Sprint Cadence

- **Duration:** 2 weeks per sprint
- **Total:** 12 sprints (24 weeks / ~6 months)
- **Team:** Backend + Web + Mobile (parallel tracks where possible)

## Dependency Map

```
Sprint 0 (Foundation)
  └─→ Sprint 1 (Auth)
        ├─→ Sprint 2 (Backend CRUD)
        │     ├─→ Sprint 3 (Web Shell + Auth Pages)
        │     │     └─→ Sprint 4 (Core Web Features)
        │     ├─→ Sprint 5 (Content Backend)
        │     │     └─→ Sprint 6 (Public Routes + Guest Page)
        │     │           └─→ Sprint 7 (Web Content Features)
        │     │                 └─→ Sprint 8 (Themes + RSVP + Email Templates)
        │     ├─→ Sprint 9 (Collaborators + Permissions)
        │     │     └─→ Sprint 10 (Billing + Payments)
        │     └─→ Sprint 11 (Mobile App)
        └─→ Sprint 12 (Admin + Polish)
```

---

## Sprint 0 — Project Setup (Weeks 1-2)

### Goal
Working local dev environment. All three stacks scaffolded and running.

### Deliverables

| Task | Stack | Details |
|------|-------|---------|
| Docker Compose | Infra | `docker-compose.yml` with backend, web, db, minio |
| Backend scaffold | Spring Boot | Maven project, `pom.xml`, `application.yml`, `application-dev.yml` |
| Web scaffold | Next.js | `npx create-next-app`, Tailwind, App Router |
| Mobile scaffold | Flutter | `flutter create`, project structure |
| Database setup | PostgreSQL | Flyway configured, `V1__init_schema.sql` (all tables) |
| MinIO setup | S3 | Bucket created, env vars configured |
| Dockerfiles | All | Backend Dockerfile (multi-stage), Web Dockerfile |
| Git structure | All | Monorepo: `backend/`, `web/`, `mobile/`, `plan/`, `AGENTS.md` |

### Database Schema (V1)

All core tables in one migration:
- `tenants`, `users`, `user_tenants`
- `weddings`, `guests`, `tables`, `checklist_items`, `budget_items`
- `vendors`, `crew_members`, `timeline_items`, `inspiration_items`
- `menu_pages`, `photos`, `guest_memories`
- `gift_items`, `cash_funds`
- `public_websites`, `rsvp_pages`, `share_pages`
- `email_templates`, `landing_pages`, `languages`
- `subscriptions`, `invoices`, `payment_transactions`
- `collaborators`, `collaborator_invitations`
- `demo_configs`

### Done When
- `docker-compose up` starts all 4 services
- Backend responds at `localhost:8080`
- Web responds at `localhost:3000`
- DB connects, Flyway runs migrations
- MinIO console accessible at `localhost:9001`

---

## Sprint 1 — Auth & Multi-Tenancy (Weeks 3-4)

### Goal
Users can register, log in, verify email, create weddings. Multi-tenant isolation working.

### Deliverables

| Task | Stack | Details |
|------|-------|---------|
| User registration | Backend | BCrypt password hash, create user record |
| Email verification | Backend | 6-digit code, 15-min expiry, resend (3/15 min) |
| Login | Backend | JWT generation, httpOnly cookie (web), header (mobile) |
| Password reset | Backend | Code-based, session invalidation |
| Tenant creation | Backend | Create wedding, assign partner role |
| Tenant context | Backend | `TenantContext` (ThreadLocal), `TenantInterceptor` |
| Permission middleware | Backend | `@RequiresPermission` annotation, section-level checks |
| Default permissions | Backend | `PermissionDefaults` per role, loaded on tenant creation |
| Auth API | Backend | `POST /auth/register`, `/auth/login`, `/auth/verify-email`, etc. |
| Tenant API | Backend | `GET /tenants`, `POST /tenants`, `GET /tenants/{id}` |

### Done When
- User can register → receive verification email → verify → login
- JWT issued on login, validated on protected endpoints
- Tenant created, user assigned as partner
- Multi-tenant queries scoped correctly
- Permission checks enforced on API endpoints

---

## Sprint 2 — Backend CRUD (Weeks 5-6)

### Goal
All core feature sections have working CRUD API endpoints with tenant scoping.

### Deliverables

| Task | Section | Endpoints |
|------|---------|-----------|
| Guest CRUD | Guests | `GET/POST/PUT/DELETE /guests`, `/guests/import`, `/guests/export` |
| Checklist CRUD | Checklist | `GET/POST/PUT/DELETE /checklist`, `/complete`, `/uncomplete` |
| Budget CRUD | Budget | `GET/POST/PUT/DELETE /budget`, `/budget/summary` |
| Table CRUD | Seating | `GET/POST/PUT/DELETE /tables`, `/assign`, `/unassign`, `/batch-update` |
| Vendor CRUD | Vendors | `GET/POST/PUT/DELETE /vendors`, `/vendors/compare` |
| Crew CRUD | Crew | `GET/POST/PUT/DELETE /crew`, `/day-of-contacts` |
| Timeline CRUD | Timeline | `GET/POST/PUT/DELETE /timeline`, `/reorder` |
| Inspiration CRUD | Inspiration | `GET/POST/PUT/DELETE /inspiration`, `/reorder` |
| Menu CRUD | Menu | `GET/POST/PUT/DELETE /menu`, `/reorder` |
| Photo API | Photos | `GET /photos` (paginated) |
| Memory API | Memories | `GET /memories` (paginated) |
| Gift CRUD | Gift Registry | `GET/POST/PUT/DELETE /gifts`, `/funds` |
| Website CRUD | Public Site | `GET/PUT /website` |
| RSVP CRUD | RSVP Page | `GET/PUT /rsvp` |
| Email Template CRUD | Email Templates | `GET/PUT /email-templates/{type}` |
| Dashboard API | Dashboard | `GET /dashboard` (aggregated stats) |

### Done When
- All endpoints return correct data scoped by tenant
- Pagination working (`?page=0&size=20`)
- Sorting working (`?sort=created_at,desc`)
- CSV/Excel import for guests working
- PDF/Excel export working for all list views
- Swagger UI shows all endpoints at `/swagger-ui.html`

---

## Sprint 3 — Web Shell & Auth Pages (Weeks 7-8)

### Goal
Next.js app shell with Atelier design system, auth pages, and dashboard.

### Deliverables

| Task | Details |
|------|---------|
| App shell | Layout with sidebar, topbar, theme provider |
| Atelier design system | CSS tokens, Tailwind config, Playfair Display font |
| Theme provider | Light/dark toggle, CSS variable switching |
| Login page | `/login` — email/password form |
| Register page | `/register` — name/email/password form |
| Verify email page | `/verify-email` — 6-digit code input, resend button |
| Password reset page | `/forgot-password`, `/reset-password` |
| Dashboard page | `/` — countdown, budget, guest counts, section tiles |
| API client | Typed fetch wrapper (`src/lib/api.ts`) |
| Auth middleware | JWT cookie handling, protected routes |
| Permission middleware | Section-level access checks |

### Done When
- User can register/login/verify via web UI
- Dashboard shows correct stats
- Sidebar navigation works
- Light/dark theme toggle works
- Atelier design system applied (warm ivory, espresso, gold)

---

## Sprint 4 — Core Web Features (Weeks 9-10)

### Goal
Guest list, checklist, budget, seating chart, vendors — fully functional in web UI.

### Deliverables

| Task | Section | UI Features |
|------|---------|-------------|
| Guest list | Guests | Table with search, filter, sort, CRUD, import/export buttons |
| Guest form | Guests | Add/edit modal with name, email, phone, side, dietary, party size |
| Guest import | Guests | CSV/Excel upload with column mapping |
| Checklist | Checklist | Phased task list, add/edit/delete, progress bars, bulk actions |
| Budget | Budget | Category table, donut chart (Chart.js/Recharts), planned vs actual |
| Seating chart | Seating | Drag-and-drop canvas, table creation, capacity indicator |
| Vendors | Vendors | Comparison table, star ratings, status tracking |
| DataTable component | Shared | Reusable sortable/filterable/paginated table |
| Form component | Shared | Reusable form fields with validation (React Hook Form + Zod) |
| Export buttons | Shared | PDF/Excel download triggers |

### Done When
- Guest list: add/edit/delete/search/filter/import/export all working
- Checklist: tasks organized by phase, progress tracked
- Budget: categories, donut chart, totals
- Seating: drag guests between tables, capacity shown
- Vendors: add, rate, compare side-by-side
- All list views have PDF/Excel export

---

## Sprint 5 — Content Backend (Weeks 11-12)

### Goal
File upload system, content management APIs, and S3 integration.

### Deliverables

| Task | Details |
|------|---------|
| S3 presigned URLs | `POST /upload/presigned` → `PUT` to S3 → `POST /upload/confirm` |
| Photo upload | S3 upload, thumbnail generation (async), metadata storage |
| Memory upload | Video/audio upload to S3, metadata storage |
| Inspiration upload | Image upload, reorder, captions |
| Menu page upload | Image/PDF upload, reorder, titles |
| QR code generation | ZXing library, generate on tenant creation, store in S3 |
| Email service | Resend API / SMTP provider, template rendering (Thymeleaf) |
| SMS service | Twilio client, config-gated (inert without keys) |
| Bulk email | Async sending with rate limiting |
| File size limits | Enforced per content type |

### Done When
- Photo upload flow works end-to-end (web → presigned URL → S3 → DB)
- Thumbnails generated automatically
- Memory upload works (video/audio)
- QR code generated on tenant creation
- Email sending works (verification, invitations)
- SMS module compiles but is inert (no Twilio keys)

---

## Sprint 6 — Public Routes & Guest Page (Weeks 13-14)

### Goal
Public wedding site and guest page with all 5 tabs working.

### Deliverables

| Task | Route | Details |
|------|-------|---------|
| Public wedding site | `/w/[slug]` | Hero, story, schedule, registry, RSVP link |
| Guest page shell | `/share/[slug]` | Tabbed layout with 5 tabs |
| Seat finder | Guest tab 1 | Search name → table + floor plan highlight |
| Gallery upload | Guest tab 2 | Photo/video upload (write-only, S3 presigned) |
| Menu carousel | Guest tab 3 | Swipeable carousel, tap-to-zoom |
| Gift registry | Guest tab 4 | Gift cards + cash fund links, "I'll get this" |
| Memory recorder | Guest tab 5 | MediaRecorder (video/audio), 60s limit |
| Public API endpoints | Backend | All `/public/...` endpoints |
| RSVP submission | Backend | `POST /public/share/{slug}/rsvp` |
| Guest search | Backend | `GET /public/share/{slug}/guests`, `/seat/{name}` |
| SEO meta tags | Web | OpenGraph, description for public wedding site |

### Done When
- `/w/{slug}` shows wedding site with correct theme
- `/share/{slug}` shows all5 tabs
- Seat finder returns correct table
- Gallery upload works (guest can upload, couple sees)
- Menu carousel displays uploaded pages
- Gift registry shows items, guest can claim
- Memory recorder captures video/audio, uploads to S3
- RSVP submission saves guest response

---

## Sprint 7 — Web Content Features (Weeks 15-16)

### Goal
Photos, memories, inspiration, menu, timeline, crew — all viewable/editable in web.

### Deliverables

| Task | Section | UI |
|------|---------|-----|
| Photos | Photos | Paginated grid, lightbox, delete |
| Memories | Memories | Video/audio player, download, delete |
| Inspiration | Inspiration | Masonry grid, upload, reorder, captions |
| Menu manager | Menu | Drag-to-reorder, upload, preview |
| Timeline editor | Timeline | Time-based list, drag to reorder, assign crew |
| Crew roster | Crew | List with roles, contact info, external flag |
| Gift items | Gift Registry | Add/edit gift cards, cash fund links |
| 3D floor plan | Floor Plan | React Three Fiber room editor (tables, dance floor, bar) |

### Done When
- Photos: paginated gallery with lightbox
- Memories: video/audio playback works
- Inspiration: drag-to-reorder mood board
- Menu: carousel manager with preview
- Timeline: schedule editor with drag reorder
- Crew: roster with day-of contacts view
- Gift registry: add/edit gifts and cash funds
- 3D floor plan: room editor with table placement (web-only)

---

## Sprint 8 — Themes & Customization (Weeks 17-18)

### Goal
Public site themes, RSVP customizer, email template editor.

### Deliverables

| Task | Details |
|------|---------|
| 6 public site themes | Atelier, Rose, Garden, Minimal, Luxe, Coastal |
| Theme CSS files | `themes/public/{theme}.css` — complete token sets |
| RSVP page customizer | `/rsvp` — theme, fonts, button shape, live preview |
| Email template editor | `/email-templates` — subject + body editor, live preview |
| Email template variables | `{{partner1}}`, `{{partner2}}`, `{{date}}`, `{{venue}}`, `{{rsvp_link}}` |
| Send test email | Backend + UI for testing templates |
| Public site editor | `/website` — story (rich text), schedule, registry display |
| Slug customization | Edit share page slug, regenerate QR |

### Done When
- Public site renders with each of the6 themes
- RSVP page customizer shows live preview
- Email template editor with side-by-side preview
- Test email sends successfully
- Public site editor saves story/schedule
- Slug change updates QR code

---

## Sprint 9 — Collaborators & Permissions (Weeks 19-20)

### Goal
Invite collaborators, set per-section permissions, enforce access control.

### Deliverables

| Task | Stack | Details |
|------|-------|---------|
| Invitation flow | Backend | Send invite by email, role + permissions, 7-day expiry |
| Accept invitation | Backend | If account exists → join; else → register then join |
| Collaborator list | Web | View active collaborators, roles, permissions |
| Permission editor | Web | Per-section read/write/none toggle per collaborator |
| Permission enforcement | Backend | `@RequiresPermission` on all write endpoints |
| Permission enforcement | Web | Middleware checks section access, redirects if unauthorized |
| Remove collaborator | Backend + Web | Remove from tenant |
| Resend invitation | Backend + Web | Generate new token, resend email |
| Transfer ownership | Backend | Transfer partner role to another user |

### Done When
- Partner can invite by email
- Invitee receives email, clicks link, joins tenant
- Permissions visible in collaborator list
- Section access enforced (read-only users can't edit)
- Collaborator can be removed
- Ownership transfer works

---

## Sprint 10 — Billing & Payments (Weeks 21-22)

### Goal
Plan tiers, PayHere integration, subscription management.

### Deliverables

| Task | Stack | Details |
|------|-------|---------|
| Plan config | Backend | Free/Premium/Planner tiers, limits, features |
| Plan enforcement | Backend | Limit checks on guests, photos, memories, etc. |
| PayHere gateway | Backend | `PayHereGateway` implementation, sandbox config |
| Gateway adapter | Backend | `PaymentGateway` interface, gateway selection |
| Subscription API | Backend | Subscribe, cancel, status, invoices |
| Webhook handler | Backend | PayHere webhook, signature verification |
| Billing page | Web | Plan display, usage bars, upgrade/downgrade |
| Invoice history | Web | Table of past invoices |
| Plan limits UI | Web | Usage bars (guests, photos, etc.) |
| Cancel flow | Web | Confirmation modal, downgrade to Free |

### Done When
- Free plan limits enforced (50 guests, 50 photos, etc.)
- PayHere sandbox payment flow works
- Subscription created/activated on successful payment
- Webhook processes payment confirmation
- Billing page shows current plan + usage
- Upgrade/downgrade works
- Invoice history displayed

---

## Sprint 11 — Mobile App (Weeks 23-24)

### Goal
Flutter app with all16 sections, full feature parity (except 3D floor plan).

### Deliverables

| Task | Feature |
|------|---------|
| App shell | Theme (Atelier), GoRouter, auth interceptor |
| Auth screens | Login, register, email verification |
| Dashboard | Countdown, budget, guest counts |
| Guest list | Searchable list, RSVP status, CRUD |
| Seating chart | 2D table layout, drag-and-drop |
| Checklist | Phased task list, progress |
| Budget | Categories, donut chart |
| Vendors | List, ratings, comparison |
| Crew | Team roster |
| Timeline | Day-of schedule |
| Inspiration | Mood board grid |
| Menu | Page carousel |
| Photos | Gallery (view only) |
| Memories | Video/voice player (view only) |
| Website editor | Content editor |
| RSVP editor | Theme/font customizer |
| Email templates | Template editor with preview |
| Collaborators | Invite, permissions |
| Billing | Plan display, payment (WebView) |
| Settings | Wedding config |
| QR codes | Generate/share |

### Done When
- App builds for Android + iOS
- All16 sections accessible and functional
- Auth flow works (register, verify, login)
- 2D seating chart works (drag-and-drop)
- API integration working with backend
- Theme matches web (Atelier design system)

---

## Sprint 12 — Admin & Polish (Weeks 25-26)

### Goal
Admin panel, web installer, demo mode, i18n, testing, bug fixes.

### Deliverables

| Task | Details |
|------|---------|
| Admin panel | `/admin` — branding, email, storage, OAuth, payments, languages |
| Landing page selector | `/admin/landing` — 10 designs, preview, one-click switch |
| 10 landing pages | Atelier, Ivory, Cinema, Split, Editorial, Minimal, Gilded, Folio, Portrait, Deco |
| Web installer | `/install` — 4-step wizard (DB, admin user, wedding, done) |
| Demo mode | Read-only sandbox, daily reset cron, iframe headers |
| i18n | In-app language switcher, admin string editor (no code, no redeploy) |
| PDF export polish | Branded headers, all sections, print-ready |
| Excel export polish | Formatted workbooks, all sections |
| Email verification UX | Banners, styled flows, countdown timer |
| Testing | Unit tests for backend, widget tests for mobile |
| Bug fixes | From sprint 4-11 testing |
| Performance | Lazy loading, image optimization, ISR for public site |

### Done When
- Admin panel functional (branding, config, languages)
- Landing page selector works with all10 designs
- Web installer completes all4 steps
- Demo mode: read-only, daily reset, iframe-compatible
- i18n: language switcher works, strings editable
- All exports working and styled
- Critical bugs fixed
- Basic test coverage

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 3D floor plan complexity | High | Start with 2D, upgrade to R3F if time permits |
| PayHere sandbox issues | Medium | Have adapter pattern ready, can swap gateways |
| Mobile 3D parity | Low | Mobile uses 2D seating (by design) |
| S3 upload reliability | Medium | Retry logic, presigned URL expiry handling |
| Email deliverability | Medium | Use Resend (better than raw SMTP), test early |
| Scope creep | High | Stick to plan files, defer "nice to haves" to post-launch |

## Post-Launch (Not in Current Plan)

- Google Calendar sync
- Weather API for outdoor weddings
- Translation API for auto-translation
- Analytics (Plausible, Umami)
- Mobile push notifications
- Vendor marketplace
- White-label for planners
