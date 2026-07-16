package com.weddingwire.billing;

import com.weddingwire.common.BusinessException;
import com.weddingwire.common.TenantContext;
import com.weddingwire.guest.GuestRepository;
import com.weddingwire.photo.PhotoRepository;
import com.weddingwire.memory.MemoryRepository;
import com.weddingwire.menu.MenuRepository;
import com.weddingwire.crew.CrewRepository;
import com.weddingwire.tenant.Tenant;
import com.weddingwire.tenant.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingService {

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentInvoiceRepository paymentInvoiceRepository;
    private final TenantRepository tenantRepository;
    private final GuestRepository guestRepository;
    private final PhotoRepository photoRepository;
    private final MemoryRepository memoryRepository;
    private final MenuRepository menuRepository;
    private final CrewRepository crewRepository;

    @Qualifier("payHere")
    private final PaymentGateway paymentGateway;

    @Value("${payment.notify-url-base:}")
    private String notifyUrlBase;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Transactional(readOnly = true)
    public Subscription getCurrentSubscription(UUID tenantId) {
        return subscriptionRepository.findByTenantIdAndActiveTrue(tenantId)
                .orElseGet(() -> createFreeSubscription(tenantId));
    }

    @Transactional
    public Map<String, Object> subscribe(UUID tenantId, PlanTier plan) {
        if (plan == PlanTier.FREE) {
            throw new BusinessException("Cannot subscribe to FREE plan via payment");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new com.weddingwire.common.ResourceNotFoundException("Tenant", "id", tenantId));

        Subscription current = subscriptionRepository.findByTenantIdAndActiveTrue(tenantId).orElse(null);
        if (current != null && current.getPlan() == plan && current.getExpiresAt() == null) {
            throw new BusinessException("Already subscribed to " + plan);
        }

        deactivateCurrentSubscription(tenantId);

        PlanLimits limits = PlanTier.limits(plan);
        Subscription subscription = Subscription.builder()
                .tenantId(tenantId)
                .plan(plan)
                .previousPlan(current != null ? current.getPlan() : PlanTier.FREE)
                .subscribedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(30))
                .active(true)
                .build();
        subscription = subscriptionRepository.save(subscription);

        tenant.setPlan(plan.name().toLowerCase());
        tenantRepository.save(tenant);

        String returnUrl = frontendUrl + "/billing?status=success";
        String cancelUrl = frontendUrl + "/billing?status=cancelled";
        String notifyUrl = notifyUrlBase + "/payhere";

        PaymentRequest request = new PaymentRequest(
                tenantId,
                plan,
                BigDecimal.valueOf(limits.priceMonthlyCents()),
                "LKR",
                plan.name() + " Wedding Plan - Monthly",
                returnUrl,
                cancelUrl,
                notifyUrl,
                tenant.getName(),
                ""
        );

        String paymentUrl = paymentGateway.createPaymentUrl(request);
        subscription.setPayHereOrderId(extractOrderId(paymentUrl));
        subscriptionRepository.save(subscription);

        log.info("Created subscription {} for tenant={} plan={}", subscription.getId(), tenantId, plan);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("subscriptionId", subscription.getId());
        result.put("paymentUrl", paymentUrl);
        result.put("plan", plan);
        result.put("amount", limits.priceMonthlyLkr());
        result.put("currency", "LKR");
        return result;
    }

    @Transactional
    public void cancelSubscription(UUID tenantId) {
        Subscription current = subscriptionRepository.findByTenantIdAndActiveTrue(tenantId)
                .orElseThrow(() -> new BusinessException("No active subscription"));

        if (current.getPlan() == PlanTier.FREE) {
            throw new BusinessException("Cannot cancel FREE plan");
        }

        current.setActive(false);
        current.setExpiresAt(LocalDateTime.now());
        subscriptionRepository.save(current);

        downgradeToFree(tenantId);
        log.info("Cancelled subscription {} for tenant={}", current.getId(), tenantId);
    }

    @Transactional
    public Subscription changePlan(UUID tenantId, PlanTier newPlan) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new com.weddingwire.common.ResourceNotFoundException("Tenant", "id", tenantId));

        Subscription current = subscriptionRepository.findByTenantIdAndActiveTrue(tenantId).orElse(null);

        if (current != null && current.getPlan() == newPlan) {
            throw new BusinessException("Already on " + newPlan + " plan");
        }

        deactivateCurrentSubscription(tenantId);

        Subscription subscription = Subscription.builder()
                .tenantId(tenantId)
                .plan(newPlan)
                .previousPlan(current != null ? current.getPlan() : PlanTier.FREE)
                .subscribedAt(LocalDateTime.now())
                .expiresAt(newPlan == PlanTier.FREE ? null : LocalDateTime.now().plusDays(30))
                .active(true)
                .build();
        subscription = subscriptionRepository.save(subscription);

        tenant.setPlan(newPlan.name().toLowerCase());
        tenantRepository.save(tenant);

        log.info("Changed plan for tenant={} to {}", tenantId, newPlan);
        return subscription;
    }

    @Transactional
    public void handleWebhook(String gatewayName, String payload, String signature) {
        log.info("Received webhook from gateway={}", gatewayName);

        if (!paymentGateway.verifyWebhookSignature(payload, signature)) {
            log.warn("Webhook signature verification failed for gateway={}", gatewayName);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid webhook signature");
        }

        PaymentResult result = paymentGateway.parseWebhook(payload);

        Subscription subscription = subscriptionRepository.findByTenantIdAndActiveTrue(
                        extractTenantIdFromOrderId(result.externalOrderId()))
                .orElse(null);

        if (subscription == null) {
            log.warn("No active subscription found for orderId={}", result.externalOrderId());
            return;
        }

        subscription.setPayHerePaymentId(result.externalPaymentId());
        subscription.setAmountPaid(result.amountPaid());
        subscriptionRepository.save(subscription);

        PaymentInvoice invoice = PaymentInvoice.builder()
                .tenantId(subscription.getTenantId())
                .subscriptionId(subscription.getId())
                .plan(subscription.getPlan())
                .amount(result.amountPaid())
                .currency("LKR")
                .gateway(gatewayName)
                .externalOrderId(result.externalOrderId())
                .status(result.status())
                .paidAt("success".equals(result.status()) ? LocalDateTime.now() : null)
                .build();
        paymentInvoiceRepository.save(invoice);

        if ("success".equals(result.status())) {
            log.info("Payment confirmed for subscription={} tenant={}", subscription.getId(), subscription.getTenantId());
        } else {
            log.warn("Payment {} for subscription={}", result.status(), subscription.getId());
        }
    }

    @Transactional(readOnly = true)
    public List<PaymentInvoice> getInvoiceHistory(UUID tenantId) {
        return paymentInvoiceRepository.findByTenantIdOrderByPaidAtDesc(tenantId);
    }

    @Transactional(readOnly = true)
    public void checkLimits(UUID tenantId, String resource) {
        Subscription subscription = getCurrentSubscription(tenantId);
        PlanLimits limits = PlanTier.limits(subscription.getPlan());

        long currentCount = getCurrentCount(tenantId, resource);
        int maxLimit = getMaxLimit(limits, resource);

        if (currentCount >= maxLimit) {
            log.warn("Limit exceeded for tenant={} resource={} count={} max={}", tenantId, resource, currentCount, maxLimit);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Plan limit exceeded for " + resource + ". Upgrade your plan to add more.");
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUsage(UUID tenantId) {
        Subscription subscription = getCurrentSubscription(tenantId);
        PlanLimits limits = PlanTier.limits(subscription.getPlan());

        Map<String, Object> usage = new LinkedHashMap<>();
        usage.put("plan", subscription.getPlan());
        usage.put("guests", Map.of("count", guestRepository.countByTenantId(tenantId), "limit", limits.maxGuests()));
        usage.put("photos", Map.of("count", photoRepository.countByTenantId(tenantId), "limit", limits.maxPhotos()));
        usage.put("memories", Map.of("count", memoryRepository.countByTenantId(tenantId), "limit", limits.maxMemories()));
        usage.put("menuItems", Map.of("count", menuRepository.countByTenantId(tenantId), "limit", limits.maxMenuItems()));
        usage.put("crew", Map.of("count", crewRepository.countByTenantId(tenantId), "limit", limits.maxCrew()));
        return usage;
    }

    private Subscription createFreeSubscription(UUID tenantId) {
        Subscription existing = subscriptionRepository.findByTenantIdAndActiveTrue(tenantId).orElse(null);
        if (existing != null) return existing;

        Subscription free = Subscription.builder()
                .tenantId(tenantId)
                .plan(PlanTier.FREE)
                .subscribedAt(LocalDateTime.now())
                .active(true)
                .build();
        return subscriptionRepository.save(free);
    }

    private void deactivateCurrentSubscription(UUID tenantId) {
        subscriptionRepository.findByTenantIdAndActiveTrue(tenantId).ifPresent(sub -> {
            sub.setActive(false);
            subscriptionRepository.save(sub);
        });
    }

    private void downgradeToFree(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId).orElse(null);
        if (tenant != null) {
            tenant.setPlan("free");
            tenantRepository.save(tenant);
        }
    }

    private long getCurrentCount(UUID tenantId, String resource) {
        return switch (resource) {
            case "guests" -> guestRepository.countByTenantId(tenantId);
            case "photos" -> photoRepository.countByTenantId(tenantId);
            case "memories" -> memoryRepository.countByTenantId(tenantId);
            case "menuItems" -> menuRepository.countByTenantId(tenantId);
            case "crew" -> crewRepository.countByTenantId(tenantId);
            default -> 0;
        };
    }

    private int getMaxLimit(PlanLimits limits, String resource) {
        return switch (resource) {
            case "guests" -> limits.maxGuests();
            case "photos" -> limits.maxPhotos();
            case "memories" -> limits.maxMemories();
            case "menuItems" -> limits.maxMenuItems();
            case "crew" -> limits.maxCrew();
            default -> Integer.MAX_VALUE;
        };
    }

    private String extractOrderId(String paymentUrl) {
        int idx = paymentUrl.indexOf("order_id=");
        if (idx < 0) return null;
        String rest = paymentUrl.substring(idx + 9);
        int end = rest.indexOf('&');
        return end > 0 ? rest.substring(0, end) : rest;
    }

    private UUID extractTenantIdFromOrderId(String orderId) {
        if (orderId == null) return null;
        int dash = orderId.indexOf('-');
        if (dash > 0) {
            try {
                return UUID.fromString(orderId.substring(0, dash));
            } catch (IllegalArgumentException e) {
                log.warn("Could not extract tenantId from orderId={}", orderId);
            }
        }
        return null;
    }
}
