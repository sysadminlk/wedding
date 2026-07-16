package com.weddingwire.gift;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GiftRepository extends JpaRepository<GiftItem, UUID> {
    Page<GiftItem> findByTenantId(UUID tenantId, Pageable pageable);
    Optional<GiftItem> findByTenantIdAndId(UUID tenantId, UUID id);
    long countByTenantId(UUID tenantId);
    void deleteByTenantIdAndId(UUID tenantId, UUID id);
}
