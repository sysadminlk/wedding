package com.weddingwire.menu;

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
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService service;

    @GetMapping
    @RequiresPermission(section = "menu", permission = "read")
    public ResponseEntity<Page<MenuPage>> findAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(TenantContext.getTenantId(), pageable));
    }

    @PostMapping
    @RequiresPermission(section = "menu", permission = "write")
    public ResponseEntity<MenuPage> create(@Valid @RequestBody MenuRequest request) {
        return ResponseEntity.ok(service.create(TenantContext.getTenantId(), request));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(section = "menu", permission = "write")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    @RequiresPermission(section = "menu", permission = "write")
    public ResponseEntity<Void> reorder(@RequestBody List<UUID> orderedIds) {
        service.reorder(TenantContext.getTenantId(), orderedIds);
        return ResponseEntity.ok().build();
    }
}
