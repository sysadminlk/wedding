package com.weddingwire.inspiration;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InspirationRepository extends JpaRepository<InspirationItem, UUID> {
    Page<InspirationItem> findByTenantIdOrderByOrderIndexAsc(UUID tenantId, Pageable pageable);
    Optional<InspirationItem> findByTenantIdAndId(UUID tenantId, UUID id);
    long countByTenantId(UUID tenantId);
    void deleteByTenantIdAndId(UUID tenantId, UUID id);
}
