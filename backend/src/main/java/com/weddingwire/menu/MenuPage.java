package com.weddingwire.menu;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "menu_pages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuPage extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "s3_key", nullable = false)
    private String s3Key;

    private String title;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;
}
