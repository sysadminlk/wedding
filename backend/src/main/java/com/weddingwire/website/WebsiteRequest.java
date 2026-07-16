package com.weddingwire.website;

import lombok.Data;

@Data
public class WebsiteRequest {
    private String slug;
    private String theme = "atelier";
    private String story;
    private String customCss;
    private String heroImageKey;
}
