package com.weddingwire.guest;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/guests")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;

    @GetMapping
    @RequiresPermission(section = "guests", permission = "read")
    public ResponseEntity<Page<Guest>> findAll(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        UUID tenantId = TenantContext.getTenantId();
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(guestService.search(tenantId, search, pageable));
        }
        return ResponseEntity.ok(guestService.findAll(tenantId, pageable));
    }

    @GetMapping("/{id}")
    @RequiresPermission(section = "guests", permission = "read")
    public ResponseEntity<Guest> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(guestService.findById(TenantContext.getTenantId(), id));
    }

    @PostMapping
    @RequiresPermission(section = "guests", permission = "write")
    public ResponseEntity<Guest> create(@Valid @RequestBody GuestRequest request) {
        return ResponseEntity.ok(guestService.create(TenantContext.getTenantId(), request));
    }

    @PutMapping("/{id}")
    @RequiresPermission(section = "guests", permission = "write")
    public ResponseEntity<Guest> update(@PathVariable UUID id, @Valid @RequestBody GuestRequest request) {
        return ResponseEntity.ok(guestService.update(TenantContext.getTenantId(), id, request));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(section = "guests", permission = "write")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        guestService.delete(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    @RequiresPermission(section = "guests", permission = "write")
    public ResponseEntity<Map<String, Object>> importCsv(@RequestParam("file") MultipartFile file) {
        int count = guestService.importCsv(TenantContext.getTenantId(), file);
        return ResponseEntity.ok(Map.of("imported", count));
    }
}
