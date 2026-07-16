package com.weddingwire.publicapi;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RsvpSubmitRequest {

    private String guestName;
    private String email;
    private String response;
    private Integer partySize;
    private String dietaryRestrictions;
    private String message;
}
