package com.weddingwire.rsvp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RsvpPageRepository extends JpaRepository<RsvpPage, UUID> {
    Optional<RsvpPage> findByTenantId(UUID tenantId);
}
