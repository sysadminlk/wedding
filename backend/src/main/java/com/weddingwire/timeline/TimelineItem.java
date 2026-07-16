package com.weddingwire.timeline;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "timeline_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineItem extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    private LocalTime time;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true;
}
