package com.weddingwire.billing;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubscribeRequest {

    @NotBlank
    private String plan;
}
