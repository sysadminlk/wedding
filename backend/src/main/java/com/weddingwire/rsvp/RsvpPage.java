package com.weddingwire.rsvp;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "rsvp_pages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RsvpPage extends BaseEntity {

    @Column(name = "tenant_id", nullable = false, unique = true)
    private UUID tenantId;

    @Column(nullable = false)
    private String theme = "atelier";

    @Column(name = "font_heading")
    private String fontHeading = "Playfair Display";

    @Column(name = "font_body")
    private String fontBody = "system-ui";

    @Column(name = "button_shape")
    private String buttonShape = "rounded";

    @Column(name = "button_color")
    private String buttonColor = "#C4A882";

    @Column(columnDefinition = "jsonb")
    private String customFields = "[]";
}
