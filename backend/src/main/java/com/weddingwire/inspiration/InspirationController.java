package com.weddingwire.inspiration;

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
@RequestMapping("/api/inspiration")
@RequiredArgsConstructor
public class InspirationController {

    private final InspirationService service;
    private final StorageService storageService;

    @GetMapping
    @RequiresPermission(section = "inspiration", permission = "read")
    public ResponseEntity<List<InspirationItem>> findAll() {
        return ResponseEntity.ok(service.findAll(TenantContext.getTenantId()));
    }

    @PostMapping("/upload")
    @RequiresPermission(section = "inspiration", permission = "write")
    public ResponseEntity<PresignedUrlResponse> upload(@Valid @RequestBody PresignedUrlRequest request) {
        FileValidation.validateFileSize(0, request.getContentType());
        PresignedUrlResponse response = storageService.generatePresignedPutUrl(
                TenantContext.getTenantId(), request.getFileName(), request.getContentType(), "inspiration");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload/confirm")
    @RequiresPermission(section = "inspiration", permission = "write")
    public ResponseEntity<InspirationItem> confirmUpload(@Valid @RequestBody UploadConfirmRequest request) {
        return ResponseEntity.ok(service.confirmUpload(TenantContext.getTenantId(), request));
    }

    @PutMapping("/reorder")
    @RequiresPermission(section = "inspiration", permission = "write")
    public ResponseEntity<Void> reorder(@RequestBody List<UUID> orderedIds) {
        service.reorder(TenantContext.getTenantId(), orderedIds);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/url")
    @RequiresPermission(section = "inspiration", permission = "read")
    public ResponseEntity<String> getUrl(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getUrl(id));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(section = "inspiration", permission = "write")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }
}
