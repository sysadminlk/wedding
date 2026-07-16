package com.weddingwire.billing;

public interface PaymentGateway {

    String createPaymentUrl(PaymentRequest request);

    boolean verifyWebhookSignature(String payload, String signature);

    PaymentResult parseWebhook(String payload);
}
