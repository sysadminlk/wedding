package com.weddingwire.vendor;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class VendorRequest {
    @NotBlank(message = "Vendor name is required")
    private String name;
    private String category;
    private BigDecimal rating = BigDecimal.ZERO;
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private String status = "researching";
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String website;
    private String notes;
}
