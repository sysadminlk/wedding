package com.weddingwire.billing;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service("payHere")
public class PayHereGateway implements PaymentGateway {

    private static final String SANDBOX_URL = "https://sandbox.payhere.lk/pay/payment";
    private static final String PRODUCTION_URL = "https://www.payhere.lk/pay/payment";
    private static final String STATUS_SUCCESS = "success";
    private static final String STATUS_FAILED = "failed";
    private static final String STATUS_PENDING = "pending";

    @Value("${app.payhere.merchant-id:}")
    private String merchantId;

    @Value("${app.payhere.secret:}")
    private String merchantSecret;

    @Value("${app.payhere.sandbox:true}")
    private boolean sandbox;

    private String checkoutUrl;

    @PostConstruct
    public void init() {
        this.checkoutUrl = sandbox ? SANDBOX_URL : PRODUCTION_URL;
        log.info("PayHere gateway initialized (sandbox={})", sandbox);
    }

    @Override
    public String createPaymentUrl(PaymentRequest request) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("merchant_id", merchantId);
        params.put("return_url", request.returnUrl());
        params.put("cancel_url", request.cancelUrl());
        params.put("notify_url", request.notifyUrl());
        params.put("order_id", request.tenantId() + "-" + System.currentTimeMillis());
        params.put("items", request.description());
        params.put("currency", request.currency());
        params.put("amount", String.valueOf(request.amount()));
        params.put("first_name", request.customerName());
        params.put("last_name", "");
        params.put("email", request.customerEmail());
        params.put("phone", "");
        params.put("address", "");
        params.put("city", "");
        params.put("country", "Sri Lanka");

        String queryString = params.entrySet().stream()
                .map(e -> encode(e.getKey()) + "=" + encode(e.getValue()))
                .collect(Collectors.joining("&"));

        log.info("Created PayHere payment URL for tenant={} plan={}", request.tenantId(), request.planTier());
        return checkoutUrl + "?" + queryString;
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacMD5");
            mac.init(new SecretKeySpec(merchantSecret.getBytes(StandardCharsets.UTF_8), "HmacMD5"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = HexFormat.of().formatHex(hash);
            boolean verified = expected.equalsIgnoreCase(signature);
            if (!verified) {
                log.warn("PayHere webhook signature mismatch: expected={} got={}", expected, signature);
            }
            return verified;
        } catch (Exception e) {
            log.error("PayHere webhook signature verification failed", e);
            return false;
        }
    }

    @Override
    public PaymentResult parseWebhook(String payload) {
        Map<String, String> formData = parseFormData(payload);

        String orderId = formData.get("order_id");
        String payherePaymentId = formData.get("payhere_payment_id");
        String statusCode = formData.get("payhere_status");
        String amountStr = formData.get("payhere_amount");

        String status;
        if ("2".equals(statusCode)) {
            status = STATUS_SUCCESS;
        } else if ("0".equals(statusCode)) {
            status = STATUS_FAILED;
        } else {
            status = STATUS_PENDING;
        }

        BigDecimal amountPaid = amountStr != null ? new BigDecimal(amountStr) : BigDecimal.ZERO;

        log.info("Parsed PayHere webhook: orderId={} status={}", orderId, status);
        return new PaymentResult(orderId, payherePaymentId, status, amountPaid, payload);
    }

    private Map<String, String> parseFormData(String payload) {
        Map<String, String> map = new LinkedHashMap<>();
        if (payload == null || payload.isBlank()) return map;
        for (String pair : payload.split("&")) {
            int eq = pair.indexOf('=');
            if (eq > 0) {
                String key = decode(pair.substring(0, eq));
                String value = decode(pair.substring(eq + 1));
                map.put(key, value);
            }
        }
        return map;
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String decode(String value) {
        try {
            return java.net.URLDecoder.decode(value, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return value;
        }
    }
}
