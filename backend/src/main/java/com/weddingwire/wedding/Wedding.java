package com.weddingwire.wedding;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "weddings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wedding extends BaseEntity {

    @Column(name = "tenant_id", nullable = false, unique = true)
    private UUID tenantId;

    @Column(nullable = false)
    private String partner1;

    @Column(nullable = false)
    private String partner2;

    private LocalDate date;

    private String venue;

    @Column(nullable = false)
    private String timezone = "UTC";
}
