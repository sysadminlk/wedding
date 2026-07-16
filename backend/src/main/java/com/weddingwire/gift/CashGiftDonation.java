package com.weddingwire.gift;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "cash_gift_donations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashGiftDonation extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "cash_fund_id", nullable = false)
    private UUID cashFundId;

    private UUID guestId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency = "USD";

    @Column(nullable = false)
    private String status = "pending";

    private String gateway;

    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;

    private String message;
}
