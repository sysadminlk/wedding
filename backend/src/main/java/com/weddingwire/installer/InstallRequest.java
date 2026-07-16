package com.weddingwire.installer;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstallRequest {

    private String adminName;
    private String adminEmail;
    private String adminPassword;
    private String weddingName;
    private String partner1Name;
    private String partner2Name;
    private LocalDate weddingDate;
}
