package com.weddingwire.inspiration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InspirationRepository extends JpaRepository<InspirationItem, UUID> {
    List<InspirationItem> findAllByTenantIdOrderByOrderIndexAsc(UUID tenantId);
    Optional<InspirationItem> findByTenantIdAndId(UUID tenantId, UUID id);
    long countByTenantId(UUID tenantId);
    void deleteByTenantIdAndId(UUID tenantId, UUID id);
}
