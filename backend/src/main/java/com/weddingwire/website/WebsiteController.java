package com.weddingwire.website;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/website")
@RequiredArgsConstructor
public class WebsiteController {

    private final WebsiteService service;

    @GetMapping
    @RequiresPermission(section = "website", permission = "read")
    public ResponseEntity<PublicWebsite> get() {
        return ResponseEntity.ok(service.getOrCreate(TenantContext.getTenantId()));
    }

    @PutMapping
    @RequiresPermission(section = "website", permission = "write")
    public ResponseEntity<PublicWebsite> update(@RequestBody WebsiteRequest request) {
        return ResponseEntity.ok(service.update(TenantContext.getTenantId(), request));
    }
}
