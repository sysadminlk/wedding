package com.weddingwire.billing;

import com.weddingwire.common.TenantContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/subscription")
    public ResponseEntity<Subscription> getSubscription() {
        UUID tenantId = TenantContext.getTenantId();
        return ResponseEntity.ok(billingService.getCurrentSubscription(tenantId));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, Object>> subscribe(@Valid @RequestBody SubscribeRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        PlanTier plan = PlanTier.valueOf(request.getPlan().toUpperCase());
        return ResponseEntity.ok(billingService.subscribe(tenantId, plan));
    }

    @PostMapping("/cancel")
    public ResponseEntity<Map<String, String>> cancel() {
        UUID tenantId = TenantContext.getTenantId();
        billingService.cancelSubscription(tenantId);
        return ResponseEntity.ok(Map.of("message", "Subscription cancelled"));
    }

    @PutMapping("/plan")
    public ResponseEntity<Subscription> changePlan(@Valid @RequestBody SubscribeRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        PlanTier plan = PlanTier.valueOf(request.getPlan().toUpperCase());
        return ResponseEntity.ok(billingService.changePlan(tenantId, plan));
    }

    @GetMapping("/invoices")
    public ResponseEntity<?> getInvoices() {
        UUID tenantId = TenantContext.getTenantId();
        return ResponseEntity.ok(billingService.getInvoiceHistory(tenantId));
    }

    @GetMapping("/usage")
    public ResponseEntity<Map<String, Object>> getUsage() {
        UUID tenantId = TenantContext.getTenantId();
        return ResponseEntity.ok(billingService.getUsage(tenantId));
    }
}
