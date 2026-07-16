package com.weddingwire.guest;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GuestRequest {
    @NotBlank(message = "Guest name is required")
    private String name;

    private String email;
    private String phone;
    private String side = "mutual";
    private Integer partySize = 1;
    private String rsvpStatus = "pending";
    private String dietary;
    private String notes;
}
