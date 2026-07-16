package com.weddingwire.menu;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository repo;

    public Page<MenuPage> findAll(UUID tenantId, Pageable pageable) {
        return repo.findByTenantIdOrderByOrderIndexAsc(tenantId, pageable);
    }

    public MenuPage create(UUID tenantId, MenuRequest request) {
        MenuPage page = MenuPage.builder()
                .tenantId(tenantId)
                .s3Key(request.getS3Key())
                .title(request.getTitle())
                .orderIndex(request.getOrderIndex())
                .build();
        return repo.save(page);
    }

    public void delete(UUID tenantId, UUID id) {
        repo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuPage", "id", id));
        repo.deleteByTenantIdAndId(tenantId, id);
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

    public long count(UUID tenantId) { return repo.countByTenantId(tenantId); }
}
