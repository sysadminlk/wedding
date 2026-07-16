package com.weddingwire.emailtemplate;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email-templates")
@RequiredArgsConstructor
public class EmailTemplateController {

    private final EmailTemplateService service;

    @GetMapping("/{type}")
    @RequiresPermission(section = "email-templates", permission = "read")
    public ResponseEntity<EmailTemplate> getByType(@PathVariable String type) {
        return ResponseEntity.ok(service.getByType(TenantContext.getTenantId(), type));
    }

    @PutMapping("/{type}")
    @RequiresPermission(section = "email-templates", permission = "write")
    public ResponseEntity<EmailTemplate> update(@PathVariable String type, @RequestBody EmailTemplateRequest request) {
        return ResponseEntity.ok(service.update(TenantContext.getTenantId(), type, request));
    }
}
