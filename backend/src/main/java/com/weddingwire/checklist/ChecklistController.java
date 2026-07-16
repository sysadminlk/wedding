package com.weddingwire.checklist;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/checklist")
@RequiredArgsConstructor
public class ChecklistController {

    private final ChecklistService service;

    @GetMapping
    @RequiresPermission(section = "checklist", permission = "read")
    public ResponseEntity<Page<ChecklistItem>> findAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(TenantContext.getTenantId(), pageable));
    }

    @GetMapping("/{id}")
    @RequiresPermission(section = "checklist", permission = "read")
    public ResponseEntity<ChecklistItem> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(TenantContext.getTenantId(), id));
    }

    @PostMapping
    @RequiresPermission(section = "checklist", permission = "write")
    public ResponseEntity<ChecklistItem> create(@Valid @RequestBody ChecklistRequest request) {
        return ResponseEntity.ok(service.create(TenantContext.getTenantId(), request));
    }

    @PutMapping("/{id}")
    @RequiresPermission(section = "checklist", permission = "write")
    public ResponseEntity<ChecklistItem> update(@PathVariable UUID id, @Valid @RequestBody ChecklistRequest request) {
        return ResponseEntity.ok(service.update(TenantContext.getTenantId(), id, request));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(section = "checklist", permission = "write")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/complete")
    @RequiresPermission(section = "checklist", permission = "write")
    public ResponseEntity<ChecklistItem> complete(@PathVariable UUID id) {
        return ResponseEntity.ok(service.complete(TenantContext.getTenantId(), id));
    }

    @PutMapping("/{id}/uncomplete")
    @RequiresPermission(section = "checklist", permission = "write")
    public ResponseEntity<ChecklistItem> uncomplete(@PathVariable UUID id) {
        return ResponseEntity.ok(service.uncomplete(TenantContext.getTenantId(), id));
    }
}
