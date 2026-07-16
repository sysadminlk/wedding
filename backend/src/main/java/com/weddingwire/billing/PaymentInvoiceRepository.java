package com.weddingwire.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentInvoiceRepository extends JpaRepository<PaymentInvoice, UUID> {

    List<PaymentInvoice> findByTenantIdOrderByPaidAtDesc(UUID tenantId);
}
