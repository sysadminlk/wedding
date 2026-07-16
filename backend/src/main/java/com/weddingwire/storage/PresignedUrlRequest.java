package com.weddingwire.storage;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUrlRequest {

    private String fileName;
    private String contentType;
    private String category;
}
