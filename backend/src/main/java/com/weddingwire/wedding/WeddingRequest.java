package com.weddingwire.wedding;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class WeddingRequest {
    @NotBlank(message = "Partner 1 name is required")
    private String partner1;

    @NotBlank(message = "Partner 2 name is required")
    private String partner2;

    private LocalDate date;
    private String venue;
    private String timezone = "UTC";
}
