package com.weddingwire.memory;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/memories")
@RequiredArgsConstructor
public class MemoryController {

    private final MemoryService service;

    @GetMapping
    @RequiresPermission(section = "photos", permission = "read")
    public ResponseEntity<Page<GuestMemory>> findAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(TenantContext.getTenantId(), pageable));
    }
}
