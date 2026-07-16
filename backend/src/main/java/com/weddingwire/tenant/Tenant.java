package com.weddingwire.tenant;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tenants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "wedding_date")
    private java.time.LocalDate weddingDate;

    @Column(name = "plan", nullable = false)
    private String plan = "free";

    @Column(columnDefinition = "jsonb")
    private String preferences = "{}";
}
