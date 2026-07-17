package com.weddingwire.email;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import com.weddingwire.emailtemplate.EmailTemplate;
import com.weddingwire.emailtemplate.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final EmailTemplateRenderer templateRenderer;

    @Value("${app.domain:weddingwire.lk}")
    private String appDomain;

    @PostMapping("/test")
    @RequiresPermission(section = "email-templates", permission = "write")
    public ResponseEntity<Map<String, String>> sendTestEmail(@RequestBody EmailTestRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        EmailTemplate template = emailTemplateService.getByType(tenantId, request.getTemplateType());

        Map<String, String> sampleVars = Map.of(
                "partner1", "Alice",
                "partner2", "Bob",
                "wedding_date", "2026-12-31",
                "venue", "Grand Ballroom",
                "guest_name", "Test Guest",
                "rsvp_link", "https://" + appDomain + "/share/test-slug",
                "unsubscribe_link", "#"
        );

        String renderedHtml = templateRenderer.render(template.getBodyHtml(), sampleVars);
        String renderedSubject = templateRenderer.render(template.getSubject(), sampleVars);

        emailService.sendCustomEmail(request.getTo(), renderedSubject, renderedHtml);

        return ResponseEntity.ok(Map.of("status", "sent", "to", request.getTo(), "templateType", request.getTemplateType()));
    }
}
