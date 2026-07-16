package com.weddingwire.sms;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsService {

    private final RestTemplate restTemplate;

    @Value("${app.sms.enabled:false}")
    private boolean enabled;

    @Value("${app.sms.twilio.account-sid:}")
    private String accountSid;

    @Value("${app.sms.twilio.auth-token:}")
    private String authToken;

    @Value("${app.sms.twilio.from-number:}")
    private String fromNumber;

    public void sendSms(String to, String message) {
        if (!enabled || accountSid == null || accountSid.isBlank()
                || authToken == null || authToken.isBlank()
                || fromNumber == null || fromNumber.isBlank()) {
            log.info("SMS service inert — no Twilio keys configured");
            return;
        }

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

            HttpHeaders headers = new HttpHeaders();
            String credentials = Base64.getEncoder()
                    .encodeToString((accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + credentials);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("To", to);
            body.add("From", fromNumber);
            body.add("Body", message);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, request, String.class);
            log.info("SMS sent to {}", to);
        } catch (NoClassDefFoundError e) {
            log.warn("Twilio dependency not found — SMS not sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", to, e.getMessage());
        }
    }
}
