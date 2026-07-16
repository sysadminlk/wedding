package com.weddingwire.billing;

import java.math.BigDecimal;

public record PaymentResult(
        String externalOrderId,
        String externalPaymentId,
        String status,
        BigDecimal amountPaid,
        String rawPayload
) {
}
