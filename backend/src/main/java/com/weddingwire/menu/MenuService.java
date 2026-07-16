package com.weddingwire.menu;

import com.weddingwire.common.ResourceNotFoundException;
import com.weddingwire.storage.StorageService;
import com.weddingwire.storage.UploadConfirmRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository repo;
    private final StorageService storageService;

    public List<MenuPage> findAll(UUID tenantId) {
        return repo.findAllByTenantIdOrderByOrderIndexAsc(tenantId);
    }

    public MenuPage create(UUID tenantId, String s3Key, String title, Integer orderIndex) {
        MenuPage page = MenuPage.builder()
                .tenantId(tenantId)
                .s3Key(s3Key)
                .title(title)
                .orderIndex(orderIndex)
                .build();
        return repo.save(page);
    }

    public MenuPage confirmUpload(UUID tenantId, UploadConfirmRequest request) {
        MenuPage page = MenuPage.builder()
                .tenantId(tenantId)
                .s3Key(request.getS3Key())
                .title(request.getTitle())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .build();
        return repo.save(page);
    }

    public void reorder(UUID tenantId, List<UUID> orderedIds) {
        int index = 0;
        for (UUID id : orderedIds) {
            MenuPage page = repo.findByTenantIdAndId(tenantId, id).orElse(null);
            if (page != null) {
                page.setOrderIndex(index++);
                repo.save(page);
            }
        }
    }

    public String getUrl(UUID pageId) {
        MenuPage page = repo.findById(pageId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuPage", "id", pageId));
        return storageService.generatePresignedGetUrl(page.getS3Key());
    }

    public void delete(UUID tenantId, UUID pageId) {
        MenuPage page = repo.findByTenantIdAndId(tenantId, pageId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuPage", "id", pageId));
        storageService.deleteFile(page.getS3Key());
        repo.delete(page);
    }
}
