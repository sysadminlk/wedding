package com.weddingwire.gift;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DonateRequest {
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    private String currency = "USD";
    private UUID guestId;
    private String message;
}
