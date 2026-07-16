package com.weddingwire.rsvp;

import lombok.Data;

@Data
public class RsvpRequest {
    private String theme;
    private String fontHeading;
    private String fontBody;
    private String buttonShape;
    private String buttonColor;
    private String customFields;
}
