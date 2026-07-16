package com.weddingwire.installer;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/install")
@RequiredArgsConstructor
public class InstallerController {

    private final InstallerService installerService;

    @GetMapping("/status")
    public ResponseEntity<InstallerService.InstallStatus> getStatus() {
        return ResponseEntity.ok(installerService.getInstallStatus());
    }

    @PostMapping("/check-database")
    public ResponseEntity<Map<String, Boolean>> checkDatabase() {
        boolean connected = installerService.checkDatabase();
        return ResponseEntity.ok(Map.of("connected", connected));
    }

    @PostMapping("/create-admin")
    public ResponseEntity<Map<String, Object>> createAdmin(@RequestBody InstallRequest request) {
        installerService.createAdmin(request);
        return ResponseEntity.ok(Map.of("success", true, "message", "Admin created successfully"));
    }

    @PostMapping("/complete")
    public ResponseEntity<Map<String, Object>> complete() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "installed", true,
                "message", "Installation complete"
        ));
    }
}
