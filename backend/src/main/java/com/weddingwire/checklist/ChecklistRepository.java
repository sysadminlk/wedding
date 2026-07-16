package com.weddingwire.checklist;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChecklistRepository extends JpaRepository<ChecklistItem, UUID> {
    Page<ChecklistItem> findByTenantIdOrderByOrderIndexAsc(UUID tenantId, Pageable pageable);
    Optional<ChecklistItem> findByTenantIdAndId(UUID tenantId, UUID id);
    long countByTenantId(UUID tenantId);
    long countByTenantIdAndCompleted(UUID tenantId, Boolean completed);
    void deleteByTenantIdAndId(UUID tenantId, UUID id);
}
