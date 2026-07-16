package com.weddingwire.wedding;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wedding")
@RequiredArgsConstructor
public class WeddingController {

    private final WeddingService weddingService;

    @GetMapping
    @RequiresPermission(section = "dashboard", permission = "read")
    public ResponseEntity<Wedding> getWedding() {
        return ResponseEntity.ok(weddingService.getOrCreate(TenantContext.getTenantId()));
    }

    @PutMapping
    @RequiresPermission(section = "dashboard", permission = "write")
    public ResponseEntity<Wedding> updateWedding(@Valid @RequestBody WeddingRequest request) {
        return ResponseEntity.ok(weddingService.update(TenantContext.getTenantId(), request));
    }
}
