package com.weddingwire.emailtemplate;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "email_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailTemplate extends BaseEntity {

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(nullable = false)
    private String type;

    private String subject;

    @Column(name = "body_html")
    private String bodyHtml;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;
}
