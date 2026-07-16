# weddingWire

Wedding Planning SaaS - Plan your perfect wedding with weddingWire.

## Tech Stack

| Layer    | Tech                                  | Dir        |
|----------|---------------------------------------|------------|
| Backend  | Spring Boot 3 + Maven + PostgreSQL   | `backend/` |
| Web      | Next.js (App Router)                  | `web/`     |
| Mobile   | Flutter (Android + iOS)               | `mobile/`  |

## Quick Start (Local Dev)

```bash
# Clone and start all services
git clone <repo> && cd wedding_planing
docker-compose up -d

# Services:
# Backend:  http://localhost:8080
# Web:      http://localhost:3000
# DB:       localhost:5432
# MinIO:    http://localhost:9000 (console: :9001)
```

## Development

### Backend (Spring Boot / Maven)

```bash
cd backend
./mvnw spring-boot:run    # Run dev server
./mvnw test               # Run tests
./mvnw clean package      # Build
```

### Web (Next.js)

```bash
cd web
npm install               # Install dependencies
npm run dev               # Start dev server
npm run build             # Build for production
npm run lint              # Run linter
```

### Mobile (Flutter)

```bash
cd mobile
flutter pub get            # Install dependencies
flutter run                # Run on device/emulator
flutter test               # Run tests
flutter build apk          # Build Android APK
flutter build ios          # Build iOS
```

## Project Structure

```
wedding_planing/
├── backend/              # Spring Boot REST API
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── web/                  # Next.js App Router
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── mobile/               # Flutter (Android + iOS)
│   ├── lib/
│   ├── pubspec.yaml
│   └── android/ & ios/
├── docker-compose.yml    # Local dev orchestration
├── plan/                 # Architecture & implementation plans
├── AGENTS.md             # Agent context
└── README.md
```

## Documentation

- [Architecture Overview](plan/00-overview.md)
- [Backend Architecture](plan/01-backend.md)
- [Web Architecture](plan/02-web.md)
- [Mobile Architecture](plan/03-mobile.md)
- [Infrastructure](plan/04-infrastructure.md)
- [Authentication & Multi-Tenancy](plan/05-auth.md)
- [Billing & Payments](plan/06-billing.md)
- [Public Routes & Guest Page](plan/07-public-guest.md)
- [Design System](plan/08-design-system.md)
- [Integrations](plan/09-integrations.md)
- [Feature Sections](plan/10-feature-sections.md)
- [Sprint Plan](plan/sprint-plan.md)
