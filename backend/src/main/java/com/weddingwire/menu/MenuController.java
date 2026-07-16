package com.weddingwire.menu;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import com.weddingwire.storage.FileValidation;
import com.weddingwire.storage.PresignedUrlRequest;
import com.weddingwire.storage.PresignedUrlResponse;
import com.weddingwire.storage.StorageService;
import com.weddingwire.storage.UploadConfirmRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService service;
    private final StorageService storageService;

    @GetMapping
    @RequiresPermission(section = "menu", permission = "read")
    public ResponseEntity<List<MenuPage>> findAll() {
        return ResponseEntity.ok(service.findAll(TenantContext.getTenantId()));
    }

    @PostMapping("/upload")
    @RequiresPermission(section = "menu", permission = "write")
    public ResponseEntity<PresignedUrlResponse> upload(@Valid @RequestBody PresignedUrlRequest request) {
        FileValidation.validateFileSize(0, request.getContentType());
        PresignedUrlResponse response = storageService.generatePresignedPutUrl(
                TenantContext.getTenantId(), request.getFileName(), request.getContentType(), "menu");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload/confirm")
    @RequiresPermission(section = "menu", permission = "write")
    public ResponseEntity<MenuPage> confirmUpload(@Valid @RequestBody UploadConfirmRequest request) {
        return ResponseEntity.ok(service.confirmUpload(TenantContext.getTenantId(), request));
    }

    @PutMapping("/reorder")
    @RequiresPermission(section = "menu", permission = "write")
    public ResponseEntity<Void> reorder(@RequestBody List<UUID> orderedIds) {
        service.reorder(TenantContext.getTenantId(), orderedIds);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/url")
    @RequiresPermission(section = "menu", permission = "read")
    public ResponseEntity<String> getUrl(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getUrl(id));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(section = "menu", permission = "write")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }
}
