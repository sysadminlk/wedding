package com.weddingwire.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/config")
    public ResponseEntity<Map<String, List<SystemConfig>>> getAllConfigs() {
        return ResponseEntity.ok(adminService.getAllConfigs());
    }

    @GetMapping("/config/{category}")
    public ResponseEntity<List<SystemConfig>> getConfigByCategory(@PathVariable String category) {
        return ResponseEntity.ok(adminService.getConfigByCategory(category));
    }

    @PutMapping("/config")
    public ResponseEntity<Void> updateConfigs(@RequestBody Map<String, String> configs) {
        adminService.setConfigs(configs);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/config/{key}")
    public ResponseEntity<Void> updateConfig(@PathVariable String key, @RequestBody Map<String, String> body) {
        adminService.setConfig(key, body.get("value"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/config/branding")
    public ResponseEntity<Map<String, String>> getBrandingConfig() {
        return ResponseEntity.ok(adminService.getBrandingConfig());
    }

    @GetMapping("/config/email")
    public ResponseEntity<Map<String, String>> getEmailConfig() {
        return ResponseEntity.ok(adminService.getEmailConfig());
    }

    @GetMapping("/config/storage")
    public ResponseEntity<Map<String, String>> getStorageConfig() {
        return ResponseEntity.ok(adminService.getStorageConfig());
    }

    @GetMapping("/config/payments")
    public ResponseEntity<Map<String, String>> getPaymentConfig() {
        return ResponseEntity.ok(adminService.getPaymentConfig());
    }

    @GetMapping("/languages")
    public ResponseEntity<List<String>> getLanguages() {
        return ResponseEntity.ok(adminService.getLanguages());
    }
}
