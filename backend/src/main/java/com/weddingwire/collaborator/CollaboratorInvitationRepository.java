package com.weddingwire.collaborator;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollaboratorInvitationRepository extends JpaRepository<CollaboratorInvitation, UUID> {

    Optional<CollaboratorInvitation> findByTenantIdAndEmail(UUID tenantId, String email);

    Optional<CollaboratorInvitation> findByToken(String token);

    List<CollaboratorInvitation> findByTenantId(UUID tenantId);

    void deleteByExpiresAtBefore(LocalDateTime date);
}
