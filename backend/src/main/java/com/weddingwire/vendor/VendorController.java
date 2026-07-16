package com.weddingwire.vendor;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService service;

    @GetMapping
    @RequiresPermission(section = "vendors", permission = "read")
    public ResponseEntity<Page<Vendor>> findAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(TenantContext.getTenantId(), pageable));
    }

    @GetMapping("/{id}")
    @RequiresPermission(section = "vendors", permission = "read")
    public ResponseEntity<Vendor> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(TenantContext.getTenantId(), id));
    }

    @PostMapping
    @RequiresPermission(section = "vendors", permission = "write")
    public ResponseEntity<Vendor> create(@Valid @RequestBody VendorRequest request) {
        return ResponseEntity.ok(service.create(TenantContext.getTenantId(), request));
    }

    @PutMapping("/{id}")
    @RequiresPermission(section = "vendors", permission = "write")
    public ResponseEntity<Vendor> update(@PathVariable UUID id, @Valid @RequestBody VendorRequest request) {
        return ResponseEntity.ok(service.update(TenantContext.getTenantId(), id, request));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(section = "vendors", permission = "write")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/compare")
    @RequiresPermission(section = "vendors", permission = "read")
    public ResponseEntity<List<Vendor>> compare(@RequestParam List<UUID> ids) {
        return ResponseEntity.ok(service.compare(TenantContext.getTenantId(), ids));
    }
}
