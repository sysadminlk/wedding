package com.weddingwire.publicapi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeddingPublicResponse {

    private String coupleName;
    private String partner1;
    private String partner2;
    private LocalDate weddingDate;
    private String theme;
    private String story;
    private String venue;
    private String shareSlug;
}
