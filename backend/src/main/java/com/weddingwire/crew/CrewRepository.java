package com.weddingwire.crew;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CrewRepository extends JpaRepository<CrewMember, UUID> {
    Page<CrewMember> findByTenantId(UUID tenantId, Pageable pageable);
    Optional<CrewMember> findByTenantIdAndId(UUID tenantId, UUID id);
    List<CrewMember> findByTenantIdAndIsExternalFalse(UUID tenantId);
    long countByTenantId(UUID tenantId);
    void deleteByTenantIdAndId(UUID tenantId, UUID id);
}
