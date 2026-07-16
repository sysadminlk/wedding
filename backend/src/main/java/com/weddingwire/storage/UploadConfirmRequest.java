package com.weddingwire.storage;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadConfirmRequest {

    private String s3Key;
    private String caption;
    private String title;
    private Integer orderIndex;
    private String type;
    private Integer durationSeconds;
}
