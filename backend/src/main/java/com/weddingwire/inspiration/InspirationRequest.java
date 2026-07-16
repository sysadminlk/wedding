package com.weddingwire.inspiration;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InspirationRequest {
    @NotBlank(message = "S3 key is required")
    private String s3Key;
    private String caption;
    private Integer orderIndex = 0;
}
