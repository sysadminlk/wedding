package com.weddingwire.collaborator;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdatePermissionsRequest {

    @NotBlank
    private String permissions;
}
