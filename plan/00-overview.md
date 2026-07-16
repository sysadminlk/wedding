# Project Overview — weddingWire

## What We're Building

A multi-tenant wedding planning SaaS with three client surfaces:
- **Backend API** — Spring Boot 3 + Maven + PostgreSQL
- **Web App** — Next.js (App Router)
- **Mobile App** — Flutter (single codebase, Android + iOS)

## Repository Structure

```
wedding_planing/
├── backend/              # Spring Boot 3 REST API
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── web/                  # Next.js App Router
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── mobile/               # Flutter
│   ├── lib/
│   ├── pubspec.yaml
│   └── android/ & ios/
├── docker-compose.yml    # Local dev orchestration
├── plan/                 # Architecture & implementation plans
├── AGENTS.md             # Agent context
└── README.md
```

## Local Development (Docker Compose)

```bash
docker-compose up -d
# Backend:  http://localhost:8080
# Web:      http://localhost:3000
# DB:       localhost:5432
# MinIO:    http://localhost:9000 (console: :9001)
```

## Production

AWS deployment (details TBD). All services containerized.

## Core Domain Model

```
Tenant (wedding)
├── Users (partners, planners, family, wedding party, vendors)
├── Guests & RSVPs
├── Seating (tables, floor plan, 3D editor)
├── Budget (categories, planned vs actual)
├── Checklist (phased tasks)
├── Vendors (ratings, comparisons, booked tracking)
├── Wedding Crew (roles, helpers, contacts)
├── Timeline (day-of schedule)
├── Inspiration (mood board)
├── Wedding Menu (uploaded pages)
├── Photos (guest gallery)
├── Guest Memories (video/voice guestbook)
├── Gift Registry + Cash Fund
├── Public Website (6 themes)
├── RSVP Page (customizable)
├── Email Templates (save-the-date, invite)
└── Collaborators (roles × permissions)
```

## Key Architectural Decisions

1. **Multi-tenant** — Every data row belongs to a tenant (wedding). No shared tables without tenant scope.
2. **REST API** — JSON over REST between backend and both clients. No GraphQL.
3. **S3-compatible storage** — MinIO locally, AWS S3 in production. All user uploads go here.
4. **Guest page** — One QR → one tabbed page. No app install, no plugins.
5. **Cash fund** — Guests pay couple directly. Nothing flows through the platform.
6. **PDF/Excel export** — Every list view supports export.
7. **3D floor plan** — Web-only (React Three Fiber). Mobile gets 2D seating view.
8. **PayHere** — Primary payment gateway. Others (Paystack, Flutterwave, etc.) optional.
9. **Design system** — CSS variable–driven. Re-theme by swapping tokens.

## Implementation Order

1. Infrastructure (Docker Compose, DB, MinIO)
2. Backend scaffold (Spring Boot, migrations, auth)
3. Auth & multi-tenancy (JWT, roles, permissions)
4. Core features (guests, seating, checklist, budget)
5. Web frontend (Next.js, Atelier design system)
6. Mobile scaffold (Flutter, shared API layer)
7. Public routes (wedding site, guest page)
8. Integrations (email, SMS, payments, file storage)
9. Billing & subscription tiers
10. Admin panel & installer
11. Advanced features (3D floor plan, vendor marketplace)
12. Demo mode & polish
