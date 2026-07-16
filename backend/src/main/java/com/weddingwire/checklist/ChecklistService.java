package com.weddingwire.checklist;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChecklistService {

    private final ChecklistRepository repo;

    public Page<ChecklistItem> findAll(UUID tenantId, Pageable pageable) {
        return repo.findByTenantIdOrderByOrderIndexAsc(tenantId, pageable);
    }

    public ChecklistItem findById(UUID tenantId, UUID id) {
        return repo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("ChecklistItem", "id", id));
    }

    public ChecklistItem create(UUID tenantId, ChecklistRequest request) {
        ChecklistItem item = ChecklistItem.builder()
                .tenantId(tenantId)
                .title(request.getTitle())
                .description(request.getDescription())
                .phase(request.getPhase())
                .dueOffsetDays(request.getDueOffsetDays())
                .dueDate(request.getDueDate())
                .assignedTo(request.getAssignedTo())
                .orderIndex(request.getOrderIndex())
                .build();
        return repo.save(item);
    }

    public ChecklistItem update(UUID tenantId, UUID id, ChecklistRequest request) {
        ChecklistItem item = findById(tenantId, id);
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setPhase(request.getPhase());
        item.setDueOffsetDays(request.getDueOffsetDays());
        item.setDueDate(request.getDueDate());
        item.setAssignedTo(request.getAssignedTo());
        item.setOrderIndex(request.getOrderIndex());
        return repo.save(item);
    }

    public void delete(UUID tenantId, UUID id) {
        findById(tenantId, id);
        repo.deleteByTenantIdAndId(tenantId, id);
    }

    public ChecklistItem complete(UUID tenantId, UUID id) {
        ChecklistItem item = findById(tenantId, id);
        item.setCompleted(true);
        item.setCompletedAt(LocalDateTime.now());
        return repo.save(item);
    }

    public ChecklistItem uncomplete(UUID tenantId, UUID id) {
        ChecklistItem item = findById(tenantId, id);
        item.setCompleted(false);
        item.setCompletedAt(null);
        return repo.save(item);
    }

    public long count(UUID tenantId) { return repo.countByTenantId(tenantId); }
    public long countCompleted(UUID tenantId) { return repo.countByTenantIdAndCompleted(tenantId, true); }
}
