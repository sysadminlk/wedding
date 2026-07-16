package com.weddingwire.photo;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Photo extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "uploaded_by_guest_id")
    private UUID uploadedByGuestId;

    @Column(name = "s3_key", nullable = false)
    private String s3Key;

    @Column(name = "thumbnail_key")
    private String thumbnailKey;

    private String caption;
}
