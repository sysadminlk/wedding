package com.weddingwire.user;

import com.weddingwire.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String name;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "verification_code")
    private String verificationCode;

    @Column(name = "verification_expires_at")
    private java.time.LocalDateTime verificationExpiresAt;

    @Column(name = "reset_code")
    private String resetCode;

    @Column(name = "reset_expires_at")
    private java.time.LocalDateTime resetExpiresAt;
}
