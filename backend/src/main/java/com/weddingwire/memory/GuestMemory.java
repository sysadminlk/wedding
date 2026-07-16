package com.weddingwire.memory;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "guest_memories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestMemory extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    private UUID guestId;

    @Column(nullable = false)
    private String type;

    @Column(name = "s3_key", nullable = false)
    private String s3Key;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;
}
