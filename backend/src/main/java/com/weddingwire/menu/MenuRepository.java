package com.weddingwire.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MenuRepository extends JpaRepository<MenuPage, UUID> {
    List<MenuPage> findAllByTenantIdOrderByOrderIndexAsc(UUID tenantId);
    Optional<MenuPage> findByTenantIdAndId(UUID tenantId, UUID id);
    long countByTenantId(UUID tenantId);
    void deleteByTenantIdAndId(UUID tenantId, UUID id);
}
