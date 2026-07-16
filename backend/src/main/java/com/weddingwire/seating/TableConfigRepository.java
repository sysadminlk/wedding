package com.weddingwire.seating;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TableConfigRepository extends JpaRepository<TableConfig, UUID> {
    List<TableConfig> findByTenantId(UUID tenantId);
    Optional<TableConfig> findByTenantIdAndId(UUID tenantId, UUID id);
    long countByTenantId(UUID tenantId);
    void deleteByTenantIdAndId(UUID tenantId, UUID id);
}
