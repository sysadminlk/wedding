package com.weddingwire.dashboard;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class DashboardResponse {
    private LocalDate weddingDate;
    private Long daysUntilWedding;
    private String partner1;
    private String partner2;
    private Long guestCount;
    private Long rsvpConfirmed;
    private Long rsvpPending;
    private Long rsvpDeclined;
    private BigDecimal budgetPlanned;
    private BigDecimal budgetActual;
    private Long checklistCompleted;
    private Long checklistTotal;
    private Long vendorCount;
    private Long crewCount;
    private Long photoCount;
    private BigDecimal cashGiftTotal;
}
