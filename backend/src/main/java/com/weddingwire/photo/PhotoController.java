package com.weddingwire.photo;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService service;

    @GetMapping
    @RequiresPermission(section = "photos", permission = "read")
    public ResponseEntity<Page<Photo>> findAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(TenantContext.getTenantId(), pageable));
    }
}
