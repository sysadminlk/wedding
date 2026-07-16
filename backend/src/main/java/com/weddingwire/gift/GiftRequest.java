package com.weddingwire.gift;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GiftRequest {
    @NotBlank(message = "Gift name is required")
    private String name;
    private String imageS3Key;
    private String storeLink;
    private String note;
}
