package com.weddingwire.gift;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface CashGiftDonationRepository extends JpaRepository<CashGiftDonation, UUID> {
    Page<CashGiftDonation> findByCashFundIdOrderByCreatedAtDesc(UUID cashFundId, Pageable pageable);
    Page<CashGiftDonation> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM CashGiftDonation d WHERE d.tenantId = :tenantId AND d.status = 'completed'")
    java.math.BigDecimal sumCompletedByTenant(@Param("tenantId") UUID tenantId);
}
