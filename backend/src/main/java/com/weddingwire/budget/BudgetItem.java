package com.weddingwire.budget;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "budget_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetItem extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String category;

    private String description;

    @Column(name = "planned_amount", nullable = false)
    private BigDecimal plannedAmount = BigDecimal.ZERO;

    @Column(name = "actual_amount", nullable = false)
    private BigDecimal actualAmount = BigDecimal.ZERO;

    @Column(name = "vendor_id")
    private UUID vendorId;

    private String notes;
}
