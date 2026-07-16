package com.weddingwire.budget;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class BudgetRequest {
    @NotBlank(message = "Category is required")
    private String category;
    private String description;
    private BigDecimal plannedAmount = BigDecimal.ZERO;
    private BigDecimal actualAmount = BigDecimal.ZERO;
    private UUID vendorId;
    private String notes;
}
