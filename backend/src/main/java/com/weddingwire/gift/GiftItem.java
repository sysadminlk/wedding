package com.weddingwire.gift;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gift_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiftItem extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String name;

    @Column(name = "image_s3_key")
    private String imageS3Key;

    @Column(name = "store_link")
    private String storeLink;

    private String note;

    @Column(name = "claimed_by_guest_id")
    private UUID claimedByGuestId;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;
}
