package com.weddingwire.i18n;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "language_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LanguageConfig {

    @Id
    @Column(name = "language_code", nullable = false, length = 10)
    private String languageCode;

    @Column(name = "language_name", nullable = false)
    private String languageName;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault = false;
}
