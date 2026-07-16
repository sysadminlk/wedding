package com.weddingwire.installer;

import com.weddingwire.admin.SystemConfig;
import com.weddingwire.admin.SystemConfigRepository;
import com.weddingwire.tenant.Tenant;
import com.weddingwire.tenant.TenantRepository;
import com.weddingwire.user.User;
import com.weddingwire.user.UserRepository;
import com.weddingwire.user.UserTenant;
import com.weddingwire.user.UserTenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;

@Service
@RequiredArgsConstructor
@Slf4j
public class InstallerService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final UserTenantRepository userTenantRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataSource dataSource;

    public boolean isInstalled() {
        return userRepository.count() > 0;
    }

    public boolean checkDatabase() {
        try {
            JdbcTemplate jdbc = new JdbcTemplate(dataSource);
            jdbc.queryForObject("SELECT 1", Integer.class);
            return true;
        } catch (Exception e) {
            log.error("Database connection check failed", e);
            return false;
        }
    }

    @Transactional
    public void createAdmin(InstallRequest request) {
        if (isInstalled()) {
            throw new IllegalStateException("System is already installed");
        }

        User admin = User.builder()
                .email(request.getAdminEmail())
                .passwordHash(passwordEncoder.encode(request.getAdminPassword()))
                .name(request.getAdminName())
                .emailVerified(true)
                .build();
        admin = userRepository.save(admin);

        String slug = request.getWeddingName().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");

        Tenant tenant = Tenant.builder()
                .name(request.getWeddingName())
                .slug(slug)
                .weddingDate(request.getWeddingDate())
                .plan("free")
                .build();
        tenant = tenantRepository.save(tenant);

        UserTenant userTenant = UserTenant.builder()
                .userId(admin.getId())
                .tenantId(tenant.getId())
                .role("admin")
                .build();
        userTenantRepository.save(userTenant);

        systemConfigRepository.save(SystemConfig.builder()
                .key("partner1Name")
                .value(request.getPartner1Name())
                .category("general")
                .build());
        systemConfigRepository.save(SystemConfig.builder()
                .key("partner2Name")
                .value(request.getPartner2Name())
                .category("general")
                .build());

        log.info("Installation complete: admin={}, tenant={}", admin.getEmail(), tenant.getSlug());
    }

    public InstallStatus getInstallStatus() {
        boolean installed = isInstalled();
        return InstallStatus.builder()
                .installed(installed)
                .steps(List.of(
                        StepStatus.builder().name("database").done(checkDatabase()).build(),
                        StepStatus.builder().name("admin").done(installed).build(),
                        StepStatus.builder().name("tenant").done(installed).build()
                ))
                .build();
    }

    @lombok.Getter
    @lombok.Setter
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class InstallStatus {
        private boolean installed;
        private List<StepStatus> steps;
    }

    @lombok.Getter
    @lombok.Setter
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class StepStatus {
        private String name;
        private boolean done;
    }
}
