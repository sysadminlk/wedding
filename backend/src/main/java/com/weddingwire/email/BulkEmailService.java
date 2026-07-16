package com.weddingwire.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.Semaphore;

@Slf4j
@Service
@RequiredArgsConstructor
public class BulkEmailService {

    private final EmailService emailService;
    private final EmailTemplateRenderer templateRenderer;
    private final Semaphore semaphore = new Semaphore(10);

    public void sendBulk(List<String> recipients, String subject, String bodyHtml) {
        for (String recipient : recipients) {
            sendSingleAsync(recipient, subject, bodyHtml);
        }
    }

    public void sendBulkWithTemplate(List<String> recipients, String subject, String bodyHtmlTemplate, Map<String, String> variables) {
        for (String recipient : recipients) {
            Map<String, String> recipientVars = Map.of(
                    "email", recipient
            );
            Map<String, String> allVars = new java.util.HashMap<>(variables);
            allVars.putAll(recipientVars);
            String renderedHtml = templateRenderer.render(bodyHtmlTemplate, allVars);
            sendSingleAsync(recipient, subject, renderedHtml);
        }
    }

    @Async
    public void sendSingleAsync(String to, String subject, String bodyHtml) {
        try {
            semaphore.acquire();
            try {
                emailService.sendCustomEmail(to, subject, bodyHtml);
            } finally {
                semaphore.release();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Interrupted while sending email to {}", to);
        }
    }
}
