# Backend — Spring Boot 3 + Maven + PostgreSQL

## Tech Stack

| Component       | Choice                        | Notes                              |
|-----------------|-------------------------------|------------------------------------|
| Framework       | Spring Boot 3.x               | Latest stable                      |
| Build           | Maven (wrapper)               | `./mvnw` — never install Maven globally |
| Language        | Java 17+                      | LTS required for Spring Boot 3     |
| Database        | PostgreSQL                    | Primary datastore                  |
| Migrations      | Flyway                        | Versioned SQL in `src/main/resources/db/migration/` |
| Auth            | Spring Security + JWT         | Stateless tokens, no sessions      |
| File Storage    | S3-compatible (MinIO / AWS)   | Via AWS SDK v2                     |
| Email           | Resend API / SMTP             | Configurable at runtime            |
| Payments        | PayHere + Paystack etc.       | Gateway adapter pattern            |
| API docs        | SpringDoc OpenAPI             | Auto-generated Swagger UI          |
| Testing         | JUnit 5 + Testcontainers      | Integration tests with real PG     |

## Project Layout

```
backend/
├── src/main/java/com/weddingwire/
│   ├── WedflowApplication.java
│   ├── config/                  # Security, CORS, S3, email config
│   ├── auth/                    # JWT, login, register, verification
│   ├── tenant/                  # Multi-tenant context, interceptor
│   ├── user/                    # User entity, roles, collaborators
│   ├── billing/                 # Plans, subscriptions, payment gateways
│   ├── wedding/                 # Wedding (tenant) entity
│   ├── guest/                   # Guests, RSVPs, dietary, sides
│   ├── seating/                 # Tables, floor plan, 3D layout data
│   ├── checklist/               # Phased tasks, progress
│   ├── budget/                  # Categories, planned vs actual
│   ├── vendor/                  # Vendors, ratings, comparisons
│   ├── crew/                    # Wedding crew, roles, contacts
│   ├── timeline/                # Day-of schedule items
│   ├── inspiration/             # Mood board (S3 URLs)
│   ├── menu/                    # Menu pages (S3 URLs, ordering)
│   ├── photo/                   # Guest gallery (S3 URLs)
│   ├── memory/                  # Video/voice guestbook (S3 URLs)
│   ├── gift/                    # Gift registry + cash fund links
│   ├── website/                 # Public website content, theme
│   ├── rsvp/                    # RSVP page config, theme
│   ├── emailtemplate/           # Save-the-date, invitation templates
│   ├── share/                   # Guest share page (slug, QR data)
│   ├── landing/                 # Landing page selection
│   ├── language/                # i18n strings, admin editor
│   ├── demo/                    # Demo mode, daily reset cron
│   ├── notification/            # Email, SMS, WhatsApp dispatch
│   ├── export/                  # PDF & Excel generation
│   └── common/                  # Base entity, DTOs, exceptions, utils
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── db/migration/           # Flyway SQL migrations
└── pom.xml
```

## Core Entities

```sql
-- Tenancy
tenant (id, name, slug, theme, plan, status, created_at)
user   (id, email, password_hash, name, email_verified, created_at)
user_tenant (user_id, tenant_id, role)  -- role: partner|planner|family|wedding_party|vendor
collaborator_invitation (id, tenant_id, email, role, permissions_json, accepted, expires_at)

-- Core
wedding      (id, tenant_id, date, partner1, partner2, timezone, ...)
guest        (id, tenant_id, name, email, phone, side, dietary, party_size, rsvp_status, table_id)
table        (id, tenant_id, name, capacity, floor_plan_x, floor_plan_y, floor_plan_meta)
checklist    (id, tenant_id, title, phase, due_offset_days, completed, assigned_to)
budget_item  (id, tenant_id, category, description, planned_amount, actual_amount, vendor_id)
vendor       (id, tenant_id, name, category, rating, price_range, status, contact_json)
crew_member  (id, tenant_id, name, role, email, phone, is_external)
timeline_item(id, tenant_id, time, title, description, assigned_to)

-- Content (S3-backed)
menu_page      (id, tenant_id, s3_key, order_index)
photo          (id, tenant_id, uploaded_by_guest_id, s3_key, thumbnail_key, caption)
guest_memory   (id, tenant_id, guest_id, type, s3_key, duration_seconds)
inspiration    (id, tenant_id, s3_key, caption, order_index)

-- Gift Registry
gift_item      (id, tenant_id, name, image_s3_key, store_link, note, claimed_by_guest_id)
cash_fund      (id, tenant_id, label, payment_link, icon, goal_amount)

-- Public Site
public_website (id, tenant_id, slug, theme, content_json, schedule_json, story)
rsvp_page      (id, tenant_id, theme, fonts, button_shape, preview_image_s3_key)
share_page     (id, tenant_id, slug, qr_code_s3_key)

-- Email
email_template (id, tenant_id, type, subject, body_html, is_default)

-- Landing
landing_page   (id, tenant_id, design_name)

-- Language
language       (id, tenant_id, locale, strings_json)
```

## API Design

### Conventions

- Base URL: `/api/v1`
- All endpoints scoped to tenant: `/api/v1/{tenantId}/...`
- Auth endpoints: `/api/v1/auth/...`
- Public endpoints: `/api/v1/public/...` (no auth, tenant inferred from slug)
- Standard JSON responses: `{ "data": ..., "error": ..., "meta": { "page", "size", "total" } }`
- Pagination: `?page=0&size=20` (0-indexed)
- Sorting: `?sort=created_at,desc`

### Key Endpoints

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/resend-verification

GET    /api/v1/tenants                          # list user's weddings
POST   /api/v1/tenants                          # create wedding
GET    /api/v1/tenants/{id}                     # wedding details

GET    /api/v1/{tenantId}/guests                # list guests
POST   /api/v1/{tenantId}/guests                # add guest
PUT    /api/v1/{tenantId}/guests/{id}           # update guest
DELETE /api/v1/{tenantId}/guests/{id}           # remove guest
POST   /api/v1/{tenantId}/guests/import         # CSV/Excel import
GET    /api/v1/{tenantId}/guests/export         # PDF/Excel export

GET    /api/v1/{tenantId}/tables                # list tables
POST   /api/v1/{tenantId}/tables                # add table
PUT    /api/v1/{tenantId}/tables/{id}           # update table (position, capacity)
DELETE /api/v1/{tenantId}/tables/{id}           # remove table
POST   /api/v1/{tenantId}/tables/assign         # assign guest to table

# ... same CRUD pattern for checklist, budget, vendors, crew, timeline, etc.

GET    /api/v1/{tenantId}/photos                # paginated gallery
POST   /api/v1/{tenantId}/photos                # upload photo (S3 presigned URL)
GET    /api/v1/{tenantId}/memories               # paginated guestbook
POST   /api/v1/{tenantId}/memories               # upload video/voice

POST   /api/v1/{tenantId}/upload/presigned       # get S3 presigned upload URL

POST   /api/v1/{tenantId}/export/{section}       # generate PDF/Excel

# Public (no auth)
GET    /api/v1/public/w/{slug}                   # wedding site data
GET    /api/v1/public/share/{slug}               # guest page data
POST   /api/v1/public/share/{slug}/rsvp          # submit RSVP
POST   /api/v1/public/share/{slug}/upload        # guest upload (gallery/memory)
GET    /api/v1/public/share/{slug}/menu          # menu pages
GET    /api/v1/public/share/{slug}/gifts         # gift registry
GET    /api/v1/public/share/{slug}/seat/{name}   # seat finder
POST   /api/v1/public/share/{slug}/memory        # record video/voice

# Admin
GET    /api/v1/admin/config                      # app config
PUT    /api/v1/admin/config                      # update config
GET    /api/v1/admin/landing                     # landing page options
PUT    /api/v1/admin/landing                     # set landing page
GET    /api/v1/admin/languages                   # list languages
POST   /api/v1/admin/languages                   # add locale

# Billing
GET    /api/v1/{tenantId}/billing/plan           # current plan
POST   /api/v1/{tenantId}/billing/subscribe      # start subscription
POST   /api/v1/{tenantId}/billing/webhook        # payment gateway webhook
GET    /api/v1/{tenantId}/billing/invoices       # invoice history

# Demo
GET    /api/v1/admin/demo/status                 # demo mode state
POST   /api/v1/admin/demo/reset                  # reset demo data
```

## Key Implementation Details

### Multi-Tenancy

- Tenant ID extracted from JWT claims or URL path
- Every repository query scoped by tenant ID
- `@TenantScoped` annotation for automatic filtering
- Global `TenantContext` (ThreadLocal) set by interceptor

### File Uploads

1. Client requests presigned URL from `/upload/presigned`
2. Client uploads directly to S3 via presigned URL (no server proxy)
3. Client confirms upload; server saves metadata to DB
4. Thumbnails generated async for images

### PDF/Excel Export

- Use Apache POI for Excel (.xlsx)
- Use iText or OpenPDF for PDF
- Export triggered via REST endpoint, streamed to client
- Background job option for large exports (email when ready)

### Payment Gateway Adapter

```java
public interface PaymentGateway {
    PaymentResult createPayment(PaymentRequest request);
    PaymentStatus checkStatus(String transactionId);
    boolean handleWebhook(String payload, String signature);
}

// Implementations:
// PayHereGateway
// PaystackGateway
// FlutterwaveGateway
// RazorpayGateway
// etc.
```

Gateway selection based on tenant config. PayHere is default.

### Email Service

- Resend API as primary (HTTP client)
- SMTP fallback (Jakarta Mail)
- Templates stored in DB, rendered with Thymeleaf
- Async sending via `@Async` + thread pool

### Demo Mode

- Flag in tenant record: `is_demo = true`
- Read-only middleware blocks writes in demo tenants
- Daily reset cron job restores demo to default state
- iframe-compatible headers: `X-Frame-Options: ALLOWALL`

## Dependencies (pom.xml highlights)

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>spring-boot-starter-web</dependency>
    <dependency>spring-boot-starter-data-jpa</dependency>
    <dependency>spring-boot-starter-security</dependency>
    <dependency>spring-boot-starter-validation</dependency>
    <dependency>spring-boot-starter-mail</dependency>
    <dependency>spring-boot-starter-cache</dependency>
    <dependency>spring-boot-starter-actuator</dependency>

    <!-- Database -->
    <dependency>org.postgresql:postgresql</dependency>
    <dependency>org.flywaydb:flyway-core</dependency>
    <dependency>org.flywaydb:flyway-database-postgresql</dependency>

    <!-- Auth -->
    <dependency>io.jsonwebtoken:jjwt-api</dependency>

    <!-- S3 -->
    <dependency>software.amazon.awssdk:s3</dependency>

    <!-- Export -->
    <dependency>org.apache.poi:poi-ooxml</dependency>
    <dependency>com.itextpdf:itext-core</dependency>

    <!-- API Docs -->
    <dependency>org.springdoc:springdoc-openapi-starter-webmvc-ui</dependency>

    <!-- Utils -->
    <dependency>org.projectlombok:lombok</dependency>
    <dependency>org.mapstruct:mapstruct</dependency>
    <dependency>com.fasterxml.jackson.core:jackson-databind</dependency>

    <!-- Test -->
    <dependency>org.springframework.boot:spring-boot-starter-test</dependency>
    <dependency>org.testcontainers:postgresql</dependency>
    <dependency>org.testcontainers:junit-jupiter</dependency>
</dependencies>
```
