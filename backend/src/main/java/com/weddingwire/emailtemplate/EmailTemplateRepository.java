package com.weddingwire.emailtemplate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, UUID> {
    Optional<EmailTemplate> findByTenantIdAndType(UUID tenantId, String type);
    java.util.List<EmailTemplate> findByTenantIdOrTenantIdIsNull(UUID tenantId);
}
