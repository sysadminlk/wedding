package com.weddingwire.budget;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class BudgetSummary {
    private BigDecimal totalPlanned;
    private BigDecimal totalActual;
    private BigDecimal remaining;
}
