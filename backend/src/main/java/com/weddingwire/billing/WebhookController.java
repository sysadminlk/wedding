package com.weddingwire.billing;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/payments/webhook")
@RequiredArgsConstructor
public class WebhookController {

    private final BillingService billingService;

    @PostMapping("/payhere")
    public ResponseEntity<String> handlePayHereWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Payhere-Signature", required = false) String signature) {
        billingService.handleWebhook("payhere", payload, signature != null ? signature : "");
        return ResponseEntity.ok("OK");
    }
}
