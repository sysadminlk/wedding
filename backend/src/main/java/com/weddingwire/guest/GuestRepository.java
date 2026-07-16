package com.weddingwire.guest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuestRepository extends JpaRepository<Guest, UUID> {
    Page<Guest> findByTenantId(UUID tenantId, Pageable pageable);
    Optional<Guest> findByTenantIdAndId(UUID tenantId, UUID id);
    long countByTenantId(UUID tenantId);
    long countByTenantIdAndRsvpStatus(UUID tenantId, String rsvpStatus);
    void deleteByTenantIdAndId(UUID tenantId, UUID id);

    @Query("SELECT g FROM Guest g WHERE g.tenantId = :tenantId AND LOWER(g.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Guest> searchByName(@Param("tenantId") UUID tenantId, @Param("query") String query, Pageable pageable);
}
