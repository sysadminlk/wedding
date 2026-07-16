package com.weddingwire.gift;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CashFundRepository extends JpaRepository<CashFund, UUID> {
    java.util.List<CashFund> findByTenantId(UUID tenantId);
    Optional<CashFund> findByTenantIdAndId(UUID tenantId, UUID id);
    void deleteByTenantIdAndId(UUID tenantId, UUID id);
}
