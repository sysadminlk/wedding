package com.weddingwire.inspiration;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InspirationService {

    private final InspirationRepository repo;

    public Page<InspirationItem> findAll(UUID tenantId, Pageable pageable) {
        return repo.findByTenantIdOrderByOrderIndexAsc(tenantId, pageable);
    }

    public InspirationItem create(UUID tenantId, InspirationRequest request) {
        InspirationItem item = InspirationItem.builder()
                .tenantId(tenantId)
                .s3Key(request.getS3Key())
                .caption(request.getCaption())
                .orderIndex(request.getOrderIndex())
                .build();
        return repo.save(item);
    }

    public void delete(UUID tenantId, UUID id) {
        repo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("InspirationItem", "id", id));
        repo.deleteByTenantIdAndId(tenantId, id);
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

    public long count(UUID tenantId) { return repo.countByTenantId(tenantId); }
}
