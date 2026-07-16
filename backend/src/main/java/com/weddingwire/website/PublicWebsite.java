package com.weddingwire.website;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "public_websites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicWebsite extends BaseEntity {

    @Column(name = "tenant_id", nullable = false, unique = true)
    private UUID tenantId;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String theme = "atelier";

    private String story;

    @Column(name = "custom_css")
    private String customCss;

    @Column(name = "hero_image_key")
    private String heroImageKey;
}
