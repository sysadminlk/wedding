package com.weddingwire.vendor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, UUID> {
    Page<Vendor> findByTenantId(UUID tenantId, Pageable pageable);
    Optional<Vendor> findByTenantIdAndId(UUID tenantId, UUID id);
    java.util.List<Vendor> findByTenantIdAndIdIn(UUID tenantId, java.util.List<UUID> ids);
    long countByTenantId(UUID tenantId);
    void deleteByTenantIdAndId(UUID tenantId, UUID id);
}
