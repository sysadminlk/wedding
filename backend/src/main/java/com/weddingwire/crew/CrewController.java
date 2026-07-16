package com.weddingwire.crew;

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
@RequestMapping("/api/crew")
@RequiredArgsConstructor
public class CrewController {

    private final CrewService service;

    @GetMapping
    @RequiresPermission(section = "crew", permission = "read")
    public ResponseEntity<Page<CrewMember>> findAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(TenantContext.getTenantId(), pageable));
    }

    @GetMapping("/{id}")
    @RequiresPermission(section = "crew", permission = "read")
    public ResponseEntity<CrewMember> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(TenantContext.getTenantId(), id));
    }

    @PostMapping
    @RequiresPermission(section = "crew", permission = "write")
    public ResponseEntity<CrewMember> create(@Valid @RequestBody CrewRequest request) {
        return ResponseEntity.ok(service.create(TenantContext.getTenantId(), request));
    }

    @PutMapping("/{id}")
    @RequiresPermission(section = "crew", permission = "write")
    public ResponseEntity<CrewMember> update(@PathVariable UUID id, @Valid @RequestBody CrewRequest request) {
        return ResponseEntity.ok(service.update(TenantContext.getTenantId(), id, request));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(section = "crew", permission = "write")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/day-of-contacts")
    @RequiresPermission(section = "crew", permission = "read")
    public ResponseEntity<List<CrewMember>> dayOfContacts() {
        return ResponseEntity.ok(service.dayOfContacts(TenantContext.getTenantId()));
    }
}
