package com.weddingwire.tenant;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TenantRequest {

    @NotBlank(message = "Wedding name is required")
    private String name;

    private LocalDate weddingDate;
}
