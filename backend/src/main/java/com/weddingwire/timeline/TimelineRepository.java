package com.weddingwire.timeline;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimelineRepository extends JpaRepository<TimelineItem, UUID> {
    Page<TimelineItem> findByTenantIdOrderByOrderIndexAsc(UUID tenantId, Pageable pageable);
    Optional<TimelineItem> findByTenantIdAndId(UUID tenantId, UUID id);
    long countByTenantId(UUID tenantId);
    void deleteByTenantIdAndId(UUID tenantId, UUID id);
}
