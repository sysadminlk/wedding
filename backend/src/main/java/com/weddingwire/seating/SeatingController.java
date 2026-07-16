package com.weddingwire.seating;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import com.weddingwire.guest.Guest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class SeatingController {

    private final SeatingService service;

    @GetMapping
    @RequiresPermission(section = "seating", permission = "read")
    public ResponseEntity<List<TableConfig>> findAll() {
        return ResponseEntity.ok(service.findAll(TenantContext.getTenantId()));
    }

    @GetMapping("/{id}")
    @RequiresPermission(section = "seating", permission = "read")
    public ResponseEntity<TableConfig> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(TenantContext.getTenantId(), id));
    }

    @PostMapping
    @RequiresPermission(section = "seating", permission = "write")
    public ResponseEntity<TableConfig> create(@Valid @RequestBody TableConfigRequest request) {
        return ResponseEntity.ok(service.create(TenantContext.getTenantId(), request));
    }

    @PutMapping("/{id}")
    @RequiresPermission(section = "seating", permission = "write")
    public ResponseEntity<TableConfig> update(@PathVariable UUID id, @Valid @RequestBody TableConfigRequest request) {
        return ResponseEntity.ok(service.update(TenantContext.getTenantId(), id, request));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(section = "seating", permission = "write")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{guestId}/assign")
    @RequiresPermission(section = "seating", permission = "write")
    public ResponseEntity<Guest> assignGuest(@PathVariable UUID guestId, @RequestBody Map<String, UUID> body) {
        return ResponseEntity.ok(service.assignGuest(TenantContext.getTenantId(), body.get("tableId"), guestId));
    }

    @PutMapping("/{guestId}/unassign")
    @RequiresPermission(section = "seating", permission = "write")
    public ResponseEntity<Guest> unassignGuest(@PathVariable UUID guestId) {
        return ResponseEntity.ok(service.unassignGuest(TenantContext.getTenantId(), guestId));
    }

    @PutMapping("/batch")
    @RequiresPermission(section = "seating", permission = "write")
    public ResponseEntity<Void> batchUpdate(@RequestBody SeatingBatchUpdate batch) {
        service.batchUpdate(TenantContext.getTenantId(), batch);
        return ResponseEntity.ok().build();
    }
}
