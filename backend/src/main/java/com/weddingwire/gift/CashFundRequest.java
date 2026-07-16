package com.weddingwire.gift;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CashFundRequest {
    @NotBlank(message = "Label is required")
    private String label;
    private String paymentLink;
    private String icon;
    private BigDecimal goalAmount;
}
