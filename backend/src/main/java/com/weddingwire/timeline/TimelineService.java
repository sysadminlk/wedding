package com.weddingwire.timeline;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TimelineService {

    private final TimelineRepository repo;

    public Page<TimelineItem> findAll(UUID tenantId, Pageable pageable) {
        return repo.findByTenantIdOrderByOrderIndexAsc(tenantId, pageable);
    }

    public TimelineItem findById(UUID tenantId, UUID id) {
        return repo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("TimelineItem", "id", id));
    }

    public TimelineItem create(UUID tenantId, TimelineRequest request) {
        TimelineItem item = TimelineItem.builder()
                .tenantId(tenantId)
                .time(request.getTime())
                .endTime(request.getEndTime())
                .title(request.getTitle())
                .description(request.getDescription())
                .assignedTo(request.getAssignedTo())
                .orderIndex(request.getOrderIndex())
                .isPublic(request.getIsPublic())
                .build();
        return repo.save(item);
    }

    public TimelineItem update(UUID tenantId, UUID id, TimelineRequest request) {
        TimelineItem item = findById(tenantId, id);
        item.setTime(request.getTime());
        item.setEndTime(request.getEndTime());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setAssignedTo(request.getAssignedTo());
        item.setOrderIndex(request.getOrderIndex());
        item.setIsPublic(request.getIsPublic());
        return repo.save(item);
    }

    public void delete(UUID tenantId, UUID id) {
        findById(tenantId, id);
        repo.deleteByTenantIdAndId(tenantId, id);
    }

    public void reorder(UUID tenantId, java.util.List<UUID> orderedIds) {
        int index = 0;
        for (UUID id : orderedIds) {
            TimelineItem item = repo.findByTenantIdAndId(tenantId, id).orElse(null);
            if (item != null) {
                item.setOrderIndex(index++);
                repo.save(item);
            }
        }
    }

    public long count(UUID tenantId) { return repo.countByTenantId(tenantId); }
}
