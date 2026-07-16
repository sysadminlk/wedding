package com.weddingwire.memory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemoryRepository extends JpaRepository<GuestMemory, UUID> {
    Page<GuestMemory> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);
    long countByTenantId(UUID tenantId);
    Optional<GuestMemory> findByTenantIdAndId(UUID tenantId, UUID id);
}
