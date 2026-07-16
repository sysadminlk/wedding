package com.weddingwire.menu;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MenuRequest {
    @NotBlank(message = "S3 key is required")
    private String s3Key;
    private String title;
    private Integer orderIndex = 0;
}
