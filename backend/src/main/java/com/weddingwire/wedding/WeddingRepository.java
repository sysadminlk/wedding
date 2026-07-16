package com.weddingwire.wedding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeddingRepository extends JpaRepository<Wedding, UUID> {
    Optional<Wedding> findByTenantId(UUID tenantId);
    boolean existsByTenantId(UUID tenantId);
}
