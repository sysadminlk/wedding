package com.weddingwire.inspiration;

import com.weddingwire.common.ResourceNotFoundException;
import com.weddingwire.storage.StorageService;
import com.weddingwire.storage.UploadConfirmRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InspirationService {

    private final InspirationRepository repo;
    private final StorageService storageService;

    public List<InspirationItem> findAll(UUID tenantId) {
        return repo.findAllByTenantIdOrderByOrderIndexAsc(tenantId);
    }

    public InspirationItem create(UUID tenantId, String s3Key, String caption, Integer orderIndex) {
        InspirationItem item = InspirationItem.builder()
                .tenantId(tenantId)
                .s3Key(s3Key)
                .caption(caption)
                .orderIndex(orderIndex)
                .build();
        return repo.save(item);
    }

    public InspirationItem confirmUpload(UUID tenantId, UploadConfirmRequest request) {
        InspirationItem item = InspirationItem.builder()
                .tenantId(tenantId)
                .s3Key(request.getS3Key())
                .caption(request.getCaption())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .build();
        return repo.save(item);
    }

    public void reorder(UUID tenantId, List<UUID> orderedIds) {
        int index = 0;
        for (UUID id : orderedIds) {
            InspirationItem item = repo.findByTenantIdAndId(tenantId, id).orElse(null);
            if (item != null) {
                item.setOrderIndex(index++);
                repo.save(item);
            }
        }
    }

    public String getUrl(UUID itemId) {
        InspirationItem item = repo.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("InspirationItem", "id", itemId));
        return storageService.generatePresignedGetUrl(item.getS3Key());
    }

    public void delete(UUID tenantId, UUID itemId) {
        InspirationItem item = repo.findByTenantIdAndId(tenantId, itemId)
                .orElseThrow(() -> new ResourceNotFoundException("InspirationItem", "id", itemId));
        storageService.deleteFile(item.getS3Key());
        repo.delete(item);
    }
}
