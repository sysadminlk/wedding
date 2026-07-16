package com.weddingwire.storage;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUrlResponse {

    private String uploadUrl;
    private String s3Key;
    private String presignedGetUrl;
    private LocalDateTime expiresAt;
}
