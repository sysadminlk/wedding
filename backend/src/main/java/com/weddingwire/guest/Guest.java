package com.weddingwire.guest;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "guests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guest extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String name;

    private String email;

    private String phone;

    @Column(nullable = false)
    private String side = "mutual";

    @Column(name = "party_size", nullable = false)
    private Integer partySize = 1;

    @Column(name = "rsvp_status", nullable = false)
    private String rsvpStatus = "pending";

    private String dietary;

    @Column(name = "table_id")
    private UUID tableId;

    @Column(name = "save_the_date_sent", nullable = false)
    private Boolean saveTheDateSent = false;

    @Column(name = "invite_sent", nullable = false)
    private Boolean inviteSent = false;

    private String notes;
}
