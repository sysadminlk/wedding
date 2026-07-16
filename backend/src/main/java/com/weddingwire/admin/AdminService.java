package com.weddingwire.admin;

import com.weddingwire.tenant.TenantRepository;
import com.weddingwire.user.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final SystemConfigRepository systemConfigRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;

    @PostConstruct
    public void seedDefaultConfigs() {
        if (systemConfigRepository.count() > 0) {
            return;
        }
        log.info("Seeding default system configs");
        Map<String, String> defaults = new LinkedHashMap<>();
        defaults.put("branding.logo", "");
        defaults.put("branding.primaryColor", "#d4af37");
        defaults.put("branding.tagline", "Your Wedding, Your Way");
        defaults.put("email.provider", "resend");
        defaults.put("email.smtpHost", "localhost");
        defaults.put("email.smtpPort", "1025");
        defaults.put("storage.provider", "s3");
        defaults.put("storage.bucket", "weddingwire");
        defaults.put("payments.primaryGateway", "payhere");
        defaults.put("languages.enabled", "en,si,ta");
        defaults.put("languages.default", "en");

        Map<String, String> categories = new LinkedHashMap<>();
        categories.put("branding.logo", "branding");
        categories.put("branding.primaryColor", "branding");
        categories.put("branding.tagline", "branding");
        categories.put("email.provider", "email");
        categories.put("email.smtpHost", "email");
        categories.put("email.smtpPort", "email");
        categories.put("storage.provider", "storage");
        categories.put("storage.bucket", "storage");
        categories.put("payments.primaryGateway", "payments");
        categories.put("languages.enabled", "languages");
        categories.put("languages.default", "languages");

        Map<String, String> descriptions = new LinkedHashMap<>();
        descriptions.put("branding.logo", "URL to the brand logo");
        descriptions.put("branding.primaryColor", "Primary brand color (hex)");
        descriptions.put("branding.tagline", "Brand tagline");
        descriptions.put("email.provider", "Email provider (resend, smtp)");
        descriptions.put("email.smtpHost", "SMTP host");
        descriptions.put("email.smtpPort", "SMTP port");
        descriptions.put("storage.provider", "Storage provider (s3, minio)");
        descriptions.put("storage.bucket", "Default storage bucket");
        descriptions.put("payments.primaryGateway", "Primary payment gateway");
        descriptions.put("languages.enabled", "Comma-separated enabled language codes");
        descriptions.put("languages.default", "Default language code");

        defaults.forEach((key, value) -> {
            SystemConfig config = SystemConfig.builder()
                    .key(key)
                    .value(value)
                    .category(categories.getOrDefault(key, "general"))
                    .description(descriptions.getOrDefault(key, ""))
                    .build();
            systemConfigRepository.save(config);
        });
    }

    public String getConfig(String key) {
        return systemConfigRepository.findById(key)
                .map(SystemConfig::getValue)
                .orElse(null);
    }

    public List<SystemConfig> getConfigByCategory(String category) {
        return systemConfigRepository.findByCategory(category);
    }

    @Transactional
    public void setConfig(String key, String value) {
        SystemConfig config = systemConfigRepository.findById(key)
                .orElse(SystemConfig.builder()
                        .key(key)
                        .category("general")
                        .build());
        config.setValue(value);
        systemConfigRepository.save(config);
    }

    @Transactional
    public void setConfigs(Map<String, String> configs) {
        configs.forEach(this::setConfig);
    }

    public Map<String, List<SystemConfig>> getAllConfigs() {
        return systemConfigRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        SystemConfig::getCategory,
                        LinkedHashMap::new,
                        Collectors.toList()
                ));
    }

    public Map<String, String> getBrandingConfig() {
        return getConfigMapByCategory("branding");
    }

    public Map<String, String> getEmailConfig() {
        return getConfigMapByCategory("email");
    }

    public Map<String, String> getStorageConfig() {
        return getConfigMapByCategory("storage");
    }

    public Map<String, String> getPaymentConfig() {
        return getConfigMapByCategory("payments");
    }

    public List<String> getLanguages() {
        String enabled = getConfig("languages.enabled");
        if (enabled == null || enabled.isBlank()) {
            return List.of("en");
        }
        return Arrays.stream(enabled.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private Map<String, String> getConfigMapByCategory(String category) {
        return systemConfigRepository.findByCategory(category).stream()
                .collect(Collectors.toMap(SystemConfig::getKey, SystemConfig::getValue));
    }
}
