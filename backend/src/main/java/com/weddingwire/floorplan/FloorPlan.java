package com.weddingwire.floorplan;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "floor_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloorPlan extends BaseEntity {

    @Column(name = "tenant_id", nullable = false, unique = true)
    private UUID tenantId;

    @Column(name = "room_width")
    private Double roomWidth = 20.0;

    @Column(name = "room_depth")
    private Double roomDepth = 15.0;

    @Column(columnDefinition = "jsonb")
    private String elements = "[]";

    @Column(name = "camera_position", columnDefinition = "jsonb")
    private String cameraPosition = "{}";
}
