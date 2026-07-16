package com.weddingwire.billing;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentRequest(
        UUID tenantId,
        PlanTier planTier,
        BigDecimal amount,
        String currency,
        String description,
        String returnUrl,
        String cancelUrl,
        String notifyUrl,
        String customerName,
        String customerEmail
) {
}
