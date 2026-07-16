package com.weddingwire.budget;

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
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService service;

    @GetMapping
    @RequiresPermission(section = "budget", permission = "read")
    public ResponseEntity<Page<BudgetItem>> findAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(TenantContext.getTenantId(), pageable));
    }

    @GetMapping("/{id}")
    @RequiresPermission(section = "budget", permission = "read")
    public ResponseEntity<BudgetItem> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(TenantContext.getTenantId(), id));
    }

    @PostMapping
    @RequiresPermission(section = "budget", permission = "write")
    public ResponseEntity<BudgetItem> create(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(service.create(TenantContext.getTenantId(), request));
    }

    @PutMapping("/{id}")
    @RequiresPermission(section = "budget", permission = "write")
    public ResponseEntity<BudgetItem> update(@PathVariable UUID id, @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(service.update(TenantContext.getTenantId(), id, request));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(section = "budget", permission = "write")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    @RequiresPermission(section = "budget", permission = "read")
    public ResponseEntity<BudgetSummary> summary() {
        return ResponseEntity.ok(service.summary(TenantContext.getTenantId()));
    }
}
