package com.weddingwire.photo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, UUID> {
    Page<Photo> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);
    long countByTenantId(UUID tenantId);
    Optional<Photo> findByTenantIdAndId(UUID tenantId, UUID id);
    Optional<Photo> findByTenantIdAndS3Key(UUID tenantId, String s3Key);
}
