# Billing & Payment Gateways

## Plan Tiers

### Free

| Feature                | Limit         |
|------------------------|---------------|
| Guests                 | 50            |
| Photos                 | 50            |
| Guest memories         | 10            |
| Checklist items        | 30            |
| Budget items           | 20            |
| Email sends            | 0             |
| Custom themes          | No            |
| 3D floor plan          | No            |
| Vendors                | 5             |
| Export                 | PDF only      |
| Collaborators          | 2             |
| Demo mode              | Yes           |

### Premium ($X/month or $XX/year)

| Feature                | Limit         |
|------------------------|---------------|
| Guests                 | Unlimited     |
| Photos                 | Unlimited     |
| Guest memories         | Unlimited     |
| Checklist items        | Unlimited     |
| Budget items           | Unlimited     |
| Email sends            | 500/month     |
| Custom themes          | Yes           |
| 3D floor plan          | Yes           |
| Vendors                | Unlimited     |
| Export                 | PDF + Excel   |
| Collaborators          | Unlimited     |
| Public site themes     | All 6         |
| Landing page themes    | All 10        |
| SMS/WhatsApp           | No            |

### Planner (for wedding planners managing multiple weddings)

| Feature                | Limit         |
|------------------------|---------------|
| All Premium features   | Yes           |
| Multiple weddings      | 10            |
| Email sends            | 2000/month    |
| SMS/WhatsApp           | Yes (add-on)  |
| White-label public site| Yes           |
| Client portal          | Yes           |
| Priority support       | Yes           |

## Plan Enforcement

```java
// Check plan limits before allowing actions
public class PlanEnforcement {

    public void checkGuestLimit(Tenant tenant) {
        long currentCount = guestRepository.countByTenantId(tenant.getId());
        int limit = tenant.getPlan().getGuestLimit();
        if (currentCount >= limit) {
            throw new PlanLimitExceededException("guest", limit);
        }
    }
}
```

### Limits in Practice

```java
public enum PlanLimit {
    GUESTS(50, -1, -1),           // free, premium, planner
    PHOTOS(50, -1, -1),           // -1 = unlimited
    MEMORIES(10, -1, -1),
    CHECKLIST_ITEMS(30, -1, -1),
    BUDGET_ITEMS(20, -1, -1),
    VENDORS(5, -1, -1),
    COLLABORATORS(2, -1, -1),
    EMAIL_SENDS(0, 500, 2000),
    THREE_D_FLOOR_PLAN(0, 1, 1),
    EXCEL_EXPORT(0, 1, 1);
}
```

## Payment Gateways

### Gateway Adapter Pattern

```java
public interface PaymentGateway {
    /** Create a payment/subscription */
    PaymentResult createPayment(PaymentRequest request);

    /** Check transaction status */
    PaymentStatus checkStatus(String transactionId);

    /** Handle webhook callback from gateway */
    boolean handleWebhook(String payload, String signature);

    /** Human-readable name */
    String getName();
}

@Component
public class PayHereGateway implements PaymentGateway { ... }

@Component
public class PaystackGateway implements PaymentGateway { ... }

@Component
public class FlutterwaveGateway implements PaymentGateway { ... }

@Component
public class RazorpayGateway implements PaymentGateway { ... }

@Component
public class MercadoPagoGateway implements PaymentGateway { ... }

@Component
public class OfflineBankGateway implements PaymentGateway { ... }
```

### Gateway Selection

```java
@Service
public class PaymentService {
    private final Map<String, PaymentGateway> gateways;

    // Injected: payhereGateway, paystackGateway, etc.

    public PaymentGateway getGateway(String name) {
        return gateways.get(name);
    }

    public List<PaymentGateway> getAvailableGateways(Tenant tenant) {
        // Return gateways enabled in admin config
        return adminConfig.getEnabledGateways();
    }
}
```

### PayHere Integration (Primary)

PayHere is a Sri Lankan payment gateway supporting:
- Credit/Debit cards
- Bank transfers
- Mobile wallets
- Local payment methods

#### Sandbox Config

```yaml
app:
  payhere:
    merchant-id: sandbox
    secret: sandbox
    sandbox: true
    notify-url: https://yourdomain.com/api/v1/{tenantId}/billing/webhook/payhere
```

#### PayHere Flow

```
1. Tenant selects Premium/Planner plan
2. Backend creates subscription record (status: PENDING)
3. Backend generates PayHere payment URL
4. Frontend redirects to PayHere checkout
5. User completes payment on PayHere
6. PayHere sends webhook to notify-url
7. Backend verifies webhook signature
8. Backend updates subscription status (ACTIVE)
9. Frontend polls for status update / receives SSE notification
```

#### PayHere Webhook Handler

```java
@PostMapping("/billing/webhook/payhere")
public ResponseEntity<Void> handlePayHereWebhook(
        @RequestBody String payload,
        @RequestHeader("X-PayHere-Signature") String signature) {
    PaymentGateway gateway = paymentService.getGateway("payhere");
    if (gateway.handleWebhook(payload, signature)) {
        // Process payment confirmation
        // Update subscription, send confirmation email
    }
    return ResponseEntity.ok().build();
}
```

## Subscription Management

### Subscription States

```
TRIAL → ACTIVE → PAST_DUE → CANCELED
                  ↓
              EXPIRED (grace period ended)
```

### Grace Period

- 7 days after failed payment
- Tenant retains access during grace period
- After grace period: downgrade to Free plan
- Data preserved (no deletion)

### Cancellation

- User can cancel anytime
- Access continues until end of current billing period
- No refund (configurable per gateway)
- Tenant downgraded to Free

### Plan Changes (Upgrade/Downgrade)

- **Upgrade:** Immediate, prorated charge
- **Downgrade:** Takes effect at end of current billing period

## Billing Database Schema

```sql
subscription (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    plan VARCHAR(20),          -- free, premium, planner
    status VARCHAR(20),        -- trial, active, past_due, canceled, expired
    gateway VARCHAR(30),       -- payhere, paystack, etc.
    gateway_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_ends_at TIMESTAMP,
    canceled_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

invoice (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    subscription_id UUID REFERENCES subscriptions(id),
    amount DECIMAL(10,2),
    currency VARCHAR(3),
    status VARCHAR(20),        -- pending, paid, failed
    gateway_transaction_id VARCHAR(255),
    invoice_url VARCHAR(500),
    created_at TIMESTAMP
);

plan_config (
    id UUID PRIMARY KEY,
    plan VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    limits JSONB,              -- {"guests": 50, "photos": 50, ...}
    features JSONB             -- {"three_d_floor_plan": false, ...}
);
```

## Web Frontend

### Billing Page (`/billing`)

- Current plan display with usage bars
- Plan comparison table
- Upgrade/downgrade buttons
- Payment method selection (gateway dropdown)
- Invoice history table
- Cancel subscription (with confirmation modal)

### Plan Limits UI

```tsx
// Usage bar component
<UsageBar label="Guests" current={42} limit={50} />
// Shows: ████████████████████░░░░ 42/50

// Unlimited display
<UsageBar label="Photos" current={120} limit={-1} />
// Shows: ████████████████████ 120 (Unlimited)
```

## Mobile App

- Same billing page, simplified for mobile
- Plan comparison as cards
- Payment handled via in-app browser (WebView) to gateway checkout
- Subscription status synced from backend

## Admin Config

Admin panel allows:
- Enabling/disabling payment gateways
- Setting gateway credentials (merchant IDs, secrets)
- Viewing all subscriptions across tenants
- Manually adjusting a tenant's plan (comp, support)
- Generating invoice reports
