# Authentication & Multi-Tenancy

## Auth Flow

### Registration

```
1. User submits: name, email, password
2. Backend: hash password (BCrypt), create user record
3. Backend: send verification email (6-digit code, expires 15 min)
4. User receives email, enters code
5. Backend: mark email_verified = true
6. User can now create/join a wedding (tenant)
```

### Login

```
1. User submits: email, password
2. Backend: verify credentials, check email_verified
3. Backend: generate JWT (access token, 24h expiry)
4. Backend: set JWT in httpOnly cookie (SameSite=Lax)
5. Redirect to dashboard
```

### JWT Payload

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "tenants": ["tenant-uuid-1", "tenant-uuid-2"],
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Session Management

- JWT stored in httpOnly, Secure, SameSite=Lax cookie
- No refresh tokens (24h expiry is sufficient for a wedding planner)
- Logout: clear cookie + optional server-side blacklist
- Mobile app: stores JWT in Flutter Secure Storage, sends via Authorization header

## Multi-Tenancy

### Tenant = Wedding

Each wedding is a tenant. A user can belong to multiple weddings.

### Tenant Context Flow

```
Request → Auth Filter → Extract tenant from JWT/path → Set TenantContext → Controller → Repository
```

### Tenant Resolution

1. **Authenticated requests:** Tenant ID from JWT `tenants[]` array, validated against URL path
2. **Public requests:** Tenant ID resolved from slug (e.g., `/share/{slug}` → look up tenant)
3. **Admin requests:** Admin role verified separately

### Tenant Context (ThreadLocal)

```java
// Set by TenantInterceptor (Spring interceptor)
public class TenantContext {
    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    public static void setTenant(String tenantId) { CURRENT_TENANT.set(tenantId); }
    public static String getTenant() { return CURRENT_TENANT.get(); }
    public static void clear() { CURRENT_TENANT.remove(); }
}

// Cleaned up after each request by TenantInterceptor afterCompletion()
```

### Repository-Level Scoping

```java
// All queries automatically scoped by current tenant
public interface GuestRepository extends JpaRepository<Guest, UUID> {
    List<Guest> findByTenantId(String tenantId);
    // Or use @FilterDef + @Filter for Hibernate auto-filtering
}
```

## Roles & Permissions

### 5 Roles

| Role            | Description                              |
|-----------------|------------------------------------------|
| `partner`       | Couple — full access                     |
| `planner`       | Wedding planner — full access            |
| `family`        | Family member — limited sections         |
| `wedding_party` | Bridesmaids/groomsmen — limited sections |
| `vendor`        | Vendor (DJ, florist, etc.) — their section only |

### Permission Matrix

Each role × each section × one of: `read`, `write`, `none`

```json
{
  "partner": {
    "dashboard": "write",
    "guests": "write",
    "budget": "write",
    "seating": "write",
    "vendors": "write",
    "crew": "write",
    "timeline": "write",
    "photos": "read",
    "memories": "read",
    "website": "write",
    "rsvp": "write",
    "email_templates": "write",
    "collaborators": "write",
    "billing": "write"
  },
  "vendor": {
    "dashboard": "none",
    "guests": "none",
    "vendors": "read",  // can see their own listing
    "timeline": "read",
    "crew": "none"
    // ...
  }
}
```

### Default Permissions (per role)

Defined in `PermissionDefaults.java` — loaded on tenant creation.

### Custom Permissions

Partners/planners can override defaults per collaborator via the Collaborators section.

### Permission Check (Backend)

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresPermission {
    Section section();
    PermissionLevel level();
}

// Usage
@RequiresPermission(section = Section.GUESTS, level = PermissionLevel.WRITE)
@GetMapping("/guests")
public List<GuestDto> listGuests() { ... }
```

### Permission Check (Web - Middleware)

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = getSession(request);
  const section = getSectionFromPath(request.nextUrl.pathname);
  const permission = session.permissions[section];

  if (permission === 'none') {
    return redirect('/unauthorized');
  }
  // WRITE required for POST/PUT/DELETE
  if (['POST', 'PUT', 'DELETE'].includes(request.method) && permission !== 'write') {
    return redirect('/unauthorized');
  }
}
```

## Email Verification

### Flow

```
1. Register → send 6-digit code (expires 15 min)
2. Resend → generate new code (rate limit: 3 per 15 min)
3. Verify → check code, mark email_verified = true
4. Login blocked until email_verified
```

### UX (Web)

- Verification banner at top of all pages until verified
- Styled verification page at `/verify-email`
- Resend button with countdown timer
- Toast notifications for success/failure

## Password Reset

```
1. User requests reset → send 6-digit code
2. User enters code + new password
3. Backend: verify code, update password_hash
4. All existing sessions invalidated
```

## Collaborator Invitations

```
1. Partner/planner sends invite: email + role + section permissions
2. Backend: create invitation record (expires 7 days)
3. Invitee receives email with link
4. If invitee has account: add to tenant with assigned role/permissions
5. If invitee has no account: redirect to register, then auto-join
```

## Mobile Auth

- Same JWT-based auth as web
- JWT stored in Flutter SecureStorage
- Token sent via `Authorization: Bearer {token}` header
- Same endpoints as web (`/api/v1/auth/login`, etc.)
- No httpOnly cookie — mobile uses header-based auth
