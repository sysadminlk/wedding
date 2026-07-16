package com.weddingwire.memory;

import com.weddingwire.common.ResourceNotFoundException;
import com.weddingwire.storage.StorageService;
import com.weddingwire.storage.UploadConfirmRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemoryService {

    private final MemoryRepository repo;
    private final StorageService storageService;

    public Page<GuestMemory> findAll(UUID tenantId, Pageable pageable) {
        return repo.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
    }

    public long count(UUID tenantId) {
        return repo.countByTenantId(tenantId);
    }

    public GuestMemory create(UUID tenantId, String s3Key, String type, Integer durationSeconds) {
        GuestMemory memory = GuestMemory.builder()
                .tenantId(tenantId)
                .s3Key(s3Key)
                .type(type)
                .durationSeconds(durationSeconds)
                .build();
        return repo.save(memory);
    }

    public GuestMemory confirmUpload(UUID tenantId, UploadConfirmRequest request) {
        GuestMemory memory = GuestMemory.builder()
                .tenantId(tenantId)
                .s3Key(request.getS3Key())
                .type(request.getType())
                .durationSeconds(request.getDurationSeconds())
                .build();
        return repo.save(memory);
    }

    public String getUrl(UUID memoryId) {
        GuestMemory memory = repo.findById(memoryId)
                .orElseThrow(() -> new ResourceNotFoundException("GuestMemory", "id", memoryId));
        return storageService.generatePresignedGetUrl(memory.getS3Key());
    }

    public void delete(UUID tenantId, UUID memoryId) {
        GuestMemory memory = repo.findByTenantIdAndId(tenantId, memoryId)
                .orElseThrow(() -> new ResourceNotFoundException("GuestMemory", "id", memoryId));
        storageService.deleteFile(memory.getS3Key());
        repo.delete(memory);
    }
}
