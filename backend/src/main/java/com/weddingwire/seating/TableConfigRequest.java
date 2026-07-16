package com.weddingwire.seating;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TableConfigRequest {
    @NotBlank(message = "Table name is required")
    private String name;

    @Positive(message = "Capacity must be positive")
    private Integer capacity = 8;

    private String tableType = "round";
    private Double positionX = 0.0;
    private Double positionY = 0.0;
}
