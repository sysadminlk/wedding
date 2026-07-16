package com.weddingwire.crew;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrewRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String role;
    private String email;
    private String phone;
    private Boolean isExternal = false;
    private String notes;
}
