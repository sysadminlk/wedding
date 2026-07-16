package com.weddingwire.rsvp;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rsvp")
@RequiredArgsConstructor
public class RsvpController {

    private final RsvpService service;

    @GetMapping
    @RequiresPermission(section = "rsvp", permission = "read")
    public ResponseEntity<RsvpPage> get() {
        return ResponseEntity.ok(service.getOrCreate(TenantContext.getTenantId()));
    }

    @PutMapping
    @RequiresPermission(section = "rsvp", permission = "write")
    public ResponseEntity<RsvpPage> update(@RequestBody RsvpRequest request) {
        return ResponseEntity.ok(service.update(TenantContext.getTenantId(), request));
    }
}
