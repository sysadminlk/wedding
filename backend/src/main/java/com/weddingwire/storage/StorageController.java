package com.weddingwire.storage;

import com.weddingwire.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class StorageController {

    private final StorageService storageService;

    @PostMapping("/presigned")
    public ResponseEntity<PresignedUrlResponse> createPresignedUrl(@RequestBody PresignedUrlRequest request) {
        UUID tenantId = TenantContext.getTenantId();

        String category = request.getCategory();
        if (category == null || category.isBlank()) {
            category = FileValidation.getCategory(request.getContentType());
        }

        PresignedUrlResponse response = storageService.generatePresignedPutUrl(
                tenantId, request.getFileName(), request.getContentType(), category);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/direct")
    public ResponseEntity<Map<String, String>> directUpload(@RequestParam("file") MultipartFile file)
            throws IOException {
        UUID tenantId = TenantContext.getTenantId();
        String contentType = file.getContentType();
        String category = FileValidation.getCategory(contentType);
        String fileName = file.getOriginalFilename();

        PresignedUrlResponse presigned = storageService.generatePresignedPutUrl(
                tenantId, fileName, contentType, category);

        storageService.uploadBytes(presigned.getS3Key(), file.getBytes(), contentType);

        byte[] thumbnail = storageService.generateThumbnail(file.getBytes(), fileName);
        if (thumbnail != null) {
            String thumbKey = presigned.getS3Key().replaceFirst("([^/]+)$", "thumbs/$1");
            storageService.uploadBytes(thumbKey, thumbnail, contentType);
        }

        return ResponseEntity.ok(Map.of("s3Key", presigned.getS3Key()));
    }

    @GetMapping("/presigned-get")
    public ResponseEntity<Map<String, String>> getPresignedGetUrl(@RequestParam("key") String key) {
        String url = storageService.generatePresignedGetUrl(key);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteFile(@RequestParam("key") String key) {
        storageService.deleteFile(key);
        return ResponseEntity.noContent().build();
    }
}
