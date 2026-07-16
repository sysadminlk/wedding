package com.weddingwire.billing;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanTier plan;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_plan")
    private PlanTier previousPlan;

    @Column(name = "subscribed_at", nullable = false)
    private LocalDateTime subscribedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "payhere_order_id")
    private String payHereOrderId;

    @Column(name = "payhere_payment_id")
    private String payHerePaymentId;

    @Column(name = "amount_paid", precision = 12, scale = 2)
    private BigDecimal amountPaid;
}
