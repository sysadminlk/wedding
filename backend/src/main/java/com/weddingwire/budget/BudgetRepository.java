package com.weddingwire.budget;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<BudgetItem, UUID> {
    Page<BudgetItem> findByTenantId(UUID tenantId, Pageable pageable);
    Optional<BudgetItem> findByTenantIdAndId(UUID tenantId, UUID id);
    long countByTenantId(UUID tenantId);
    void deleteByTenantIdAndId(UUID tenantId, UUID id);

    @Query("SELECT COALESCE(SUM(b.plannedAmount), 0) FROM BudgetItem b WHERE b.tenantId = :tenantId")
    java.math.BigDecimal sumPlanned(@Param("tenantId") UUID tenantId);

    @Query("SELECT COALESCE(SUM(b.actualAmount), 0) FROM BudgetItem b WHERE b.tenantId = :tenantId")
    java.math.BigDecimal sumActual(@Param("tenantId") UUID tenantId);
}
