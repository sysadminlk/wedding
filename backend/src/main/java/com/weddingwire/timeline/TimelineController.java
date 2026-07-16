package com.weddingwire.timeline;

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
@RequestMapping("/api/timeline")
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService service;

    @GetMapping
    @RequiresPermission(section = "timeline", permission = "read")
    public ResponseEntity<Page<TimelineItem>> findAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(TenantContext.getTenantId(), pageable));
    }

    @GetMapping("/{id}")
    @RequiresPermission(section = "timeline", permission = "read")
    public ResponseEntity<TimelineItem> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(TenantContext.getTenantId(), id));
    }

    @PostMapping
    @RequiresPermission(section = "timeline", permission = "write")
    public ResponseEntity<TimelineItem> create(@Valid @RequestBody TimelineRequest request) {
        return ResponseEntity.ok(service.create(TenantContext.getTenantId(), request));
    }

    @PutMapping("/{id}")
    @RequiresPermission(section = "timeline", permission = "write")
    public ResponseEntity<TimelineItem> update(@PathVariable UUID id, @Valid @RequestBody TimelineRequest request) {
        return ResponseEntity.ok(service.update(TenantContext.getTenantId(), id, request));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(section = "timeline", permission = "write")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    @RequiresPermission(section = "timeline", permission = "write")
    public ResponseEntity<Void> reorder(@RequestBody List<UUID> orderedIds) {
        service.reorder(TenantContext.getTenantId(), orderedIds);
        return ResponseEntity.ok().build();
    }
}
