package com.weddingwire.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserTenantRepository extends JpaRepository<UserTenant, UUID> {

    java.util.List<UserTenant> findByUserId(UUID userId);

    java.util.List<UserTenant> findByTenantId(UUID tenantId);

    UserTenant findByUserIdAndTenantId(UUID userId, UUID tenantId);

    boolean existsByUserIdAndTenantId(UUID userId, UUID tenantId);
}
