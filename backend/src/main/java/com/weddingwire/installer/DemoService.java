package com.weddingwire.installer;

import com.weddingwire.admin.SystemConfigRepository;
import com.weddingwire.admin.SystemConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemoService {

    private final SystemConfigRepository systemConfigRepository;

    public boolean isDemoMode() {
        return systemConfigRepository.findById("demo.mode")
                .map(c -> "true".equalsIgnoreCase(c.getValue()))
                .orElse(false);
    }

    public UUID getDemoUser() {
        return systemConfigRepository.findById("demo.userId")
                .map(c -> UUID.fromString(c.getValue()))
                .orElse(null);
    }

    @Transactional
    public void resetDemo() {
        log.info("Resetting demo data to defaults");
        // Placeholder — actual reset logic will clear demo-specific tables
        // and re-seed sample data upon implementation
    }

    public boolean getDemoReadOnly() {
        return isDemoMode();
    }
}
