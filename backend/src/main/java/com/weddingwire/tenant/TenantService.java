package com.weddingwire.tenant;

import com.weddingwire.qr.QrCodeService;
import com.weddingwire.user.UserTenant;
import com.weddingwire.user.UserTenantRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserTenantRepository userTenantRepository;
    private final QrCodeService qrCodeService;

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${app.domain:weddingwire.lk}")
    private String appDomain;

    @Transactional
    public Tenant createTenant(UUID userId, TenantRequest request) {
        String slug = generateSlug(request.getName());

        Tenant tenant = Tenant.builder()
                .name(request.getName())
                .slug(slug)
                .weddingDate(request.getWeddingDate())
                .build();

        tenantRepository.save(tenant);

        // Assign owner role to the creating user
        UserTenant userTenant = UserTenant.builder()
                .userId(userId)
                .tenantId(tenant.getId())
                .role("owner")
                .permissions("{\"dashboard\":{\"read\":\"all\",\"write\":\"all\"}}")
                .build();

        userTenantRepository.save(userTenant);

        String qrUrl = "https://" + appDomain + "/share/" + tenant.getSlug();
        qrCodeService.generateAndUploadQrCode(tenant.getId(), qrUrl);

        return tenant;
    }

    public List<Tenant> getUserTenants(UUID userId) {
        return userTenantRepository.findByUserId(userId)
                .stream()
                .map(ut -> tenantRepository.findById(ut.getTenantId()).orElse(null))
                .filter(t -> t != null)
                .collect(Collectors.toList());
    }

    public Tenant getTenant(UUID tenantId) {
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
    }

    public void setCurrentTenant(UUID tenantId) {
        com.weddingwire.common.TenantContext.setTenantId(tenantId);
        // Also set the schema if needed
        entityManager.createNativeQuery("SET app.tenant_id = :tenantId")
                .setParameter("tenantId", tenantId.toString())
                .executeUpdate();
    }

    private String generateSlug(String name) {
        String slug = name.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");

        if (tenantRepository.findBySlug(slug).isPresent()) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }

        return slug;
    }

    @Transactional
    public Tenant updateSlug(UUID tenantId, String newSlug) {
        String slug = newSlug.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");

        if (tenantRepository.existsBySlug(slug)) {
            Tenant existing = tenantRepository.findBySlug(slug).orElse(null);
            if (existing != null && !existing.getId().equals(tenantId)) {
                throw new RuntimeException("Slug already in use");
            }
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        tenant.setSlug(slug);
        tenantRepository.save(tenant);

        String qrUrl = "https://" + appDomain + "/share/" + slug;
        qrCodeService.generateAndUploadQrCode(tenantId, qrUrl);

        return tenant;
    }
}
