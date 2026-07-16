package com.weddingwire.memory;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import com.weddingwire.storage.FileValidation;
import com.weddingwire.storage.PresignedUrlRequest;
import com.weddingwire.storage.PresignedUrlResponse;
import com.weddingwire.storage.StorageService;
import com.weddingwire.storage.UploadConfirmRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/memories")
@RequiredArgsConstructor
public class MemoryController {

    private final MemoryService service;
    private final StorageService storageService;

    @GetMapping
    @RequiresPermission(section = "photos", permission = "read")
    public ResponseEntity<Page<GuestMemory>> findAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(TenantContext.getTenantId(), pageable));
    }

    @PostMapping("/upload")
    @RequiresPermission(section = "photos", permission = "write")
    public ResponseEntity<PresignedUrlResponse> upload(@Valid @RequestBody PresignedUrlRequest request) {
        FileValidation.validateFileSize(0, request.getContentType());
        PresignedUrlResponse response = storageService.generatePresignedPutUrl(
                TenantContext.getTenantId(), request.getFileName(), request.getContentType(), "memories");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload/confirm")
    @RequiresPermission(section = "photos", permission = "write")
    public ResponseEntity<GuestMemory> confirmUpload(@Valid @RequestBody UploadConfirmRequest request) {
        return ResponseEntity.ok(service.confirmUpload(TenantContext.getTenantId(), request));
    }

    @GetMapping("/{id}/url")
    @RequiresPermission(section = "photos", permission = "read")
    public ResponseEntity<String> getUrl(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getUrl(id));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(section = "photos", permission = "write")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }
}
