package com.weddingwire.gift;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "cash_funds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashFund extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String label;

    @Column(name = "payment_link")
    private String paymentLink;

    private String icon;

    @Column(name = "goal_amount")
    private BigDecimal goalAmount;
}
