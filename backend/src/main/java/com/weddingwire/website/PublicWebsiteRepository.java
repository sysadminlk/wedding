package com.weddingwire.website;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PublicWebsiteRepository extends JpaRepository<PublicWebsite, UUID> {
    Optional<PublicWebsite> findByTenantId(UUID tenantId);
    Optional<PublicWebsite> findBySlug(String slug);
}
