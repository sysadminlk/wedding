# Infrastructure — Docker, PostgreSQL, MinIO, Deployment

## Docker Compose (Local Dev)

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/weddingwire
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=postgres
      - AWS_S3_ENDPOINT=http://minio:9000
      - AWS_S3_BUCKET=Wedflow
      - AWS_ACCESS_KEY_ID=minioadmin
      - AWS_SECRET_ACCESS_KEY=minioadmin
    depends_on:
      - db
      - minio
    volumes:
      - ./backend:/app
      - ~/.m2:/root/.m2

  web:
    build: ./web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8080
    depends_on:
      - backend

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=weddingwire
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - pgdata:/var/lib/postgresql/data

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - miniodata:/data

volumes:
  pgdata:
  miniodata:
```

## Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Web Dockerfile

```dockerfile
# web/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Database

### Connection

```
Host: localhost:5432 (Docker) or db:5432 (container-to-container)
Database: weddingwire
User: postgres
Password: postgres (dev only)
```

### Migrations (Flyway)

Location: `backend/src/main/resources/db/migration/`

Naming: `V1__init_schema.sql`, `V2__add_guest_indexes.sql`, etc.

**Never edit applied migrations.** Create a new one.

### Core Tables (summary)

```
-- Tenancy & Auth
tenants, users, user_tenants, collaborator_invitations

-- Wedding Data
weddings, guests, tables, checklist_items, budget_items
vendors, crew_members, timeline_items, inspiration_items

-- Content (S3)
menu_pages, photos, guest_memories

-- Gift Registry
gift_items, cash_funds

-- Public Site
public_websites, rsvp_pages, share_pages

-- Config
email_templates, landing_pages, languages

-- Billing
subscriptions, invoices, payment_transactions

-- Demo
demo_configs
```

### Key Indexes

```sql
-- Every query is tenant-scoped
CREATE INDEX idx_guests_tenant ON guests(tenant_id);
CREATE INDEX idx_tables_tenant ON tables(tenant_id);
-- ... same pattern for all tenant-scoped tables

-- Guest search
CREATE INDEX idx_guests_name ON guests(tenant_id, name);
CREATE INDEX idx_guests_rsvp ON guests(tenant_id, rsvp_status);

-- Share page lookup
CREATE UNIQUE INDEX idx_share_slug ON share_pages(slug);
CREATE UNIQUE INDEX idx_website_slug ON public_websites(slug);
```

## File Storage (S3 / MinIO)

### Local Dev (MinIO)

```
Endpoint: http://minio:9000 (container) / http://localhost:9000 (host)
Console: http://localhost:9001
Bucket: weddingwire
Access Key: minioadmin
Secret Key: minioadmin
```

### Production (AWS S3)

```
Bucket: weddingwire-prod (or similar)
Region: configured via env var
```

### Bucket Structure

```
weddingwire/
├── {tenant_id}/
│   ├── photos/
│   │   ├── {uuid}.jpg
│   │   └── thumbs/{uuid}_thumb.jpg
│   ├── menu/
│   │   └── {uuid}.pdf
│   ├── memories/
│   │   ├── {uuid}.webm       # video
│   │   └── {uuid}.weba       # audio
│   ├── inspiration/
│   │   └── {uuid}.jpg
│   └── share/
│       └── qr-{slug}.png
```

### Upload Flow

1. Client → `POST /api/v1/{tenantId}/upload/presigned` → receives presigned PUT URL
2. Client → `PUT {presigned_url}` → uploads directly to S3
3. Client → `POST /api/v1/{tenantId}/upload/confirm` → server saves metadata to DB

### Presigned URL Expiry

- Upload URLs: 15 minutes
- Download URLs: 1 hour (for private content)

## Environment Variables

### Backend (`application-dev.yml`)

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/weddingwire
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: validate  # Flyway manages schema
    show-sql: true

app:
  jwt:
    secret: dev-secret-change-in-production
    expiration: 86400000  # 24 hours

  s3:
    endpoint: http://localhost:9000
    bucket: weddingwire
    access-key: minioadmin
    secret-key: minioadmin
    path-style: true  # MinIO requires path-style

  email:
    provider: smtp  # or resend
    smtp:
      host: localhost
      port: 1025  # MailHog / Mailpit
      username: ""
      password: ""

  payhere:
    merchant-id: sandbox
    secret: sandbox
    sandbox: true

  demo:
    enabled: true
    reset-cron: "0 0 2 * * *"  # 2 AM daily
```

### Web

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_S3_BUCKET=Wedflow
```

## Production (AWS) — Outline

| Service        | AWS                          | Notes                        |
|----------------|------------------------------|------------------------------|
| Compute        | ECS Fargate or EC2           | Backend + web containers     |
| Database       | RDS PostgreSQL               | Managed, Multi-AZ            |
| Object Storage | S3                           | Already S3-compatible        |
| CDN            | CloudFront                   | Static assets, public site   |
| DNS            | Route 53                     |                              |
| Secrets        | Secrets Manager / SSM        | JWT secret, API keys         |
| Logs           | CloudWatch                   | Container logs               |
| SSL            | ACM                          | HTTPS certificates           |
| CI/CD          | GitHub Actions → ECR → ECS   | Deploy on push to `dev`      |

### Migration Path

1. Get Docker Compose working locally
2. Build & push images to ECR
3. Create ECS task definitions
4. Set up RDS + S3 bucket
5. Configure CloudFront for public wedding sites
6. Set up GitHub Actions pipeline

## Backup & Recovery

- **Database:** `pg_dump` scheduled daily (or RDS automated backups in production)
- **S3:** Versioning enabled, cross-region replication for production
- **Demo reset:** Cron job resets demo tenant data to seed state

## Monitoring

- Spring Boot Actuator: `/actuator/health`, `/actuator/metrics`
- Web: Next.js built-in health (or custom `/api/health`)
- Uptime: external healthcheck service (UptimeRobot, etc.)
