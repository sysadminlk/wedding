package com.weddingwire.tenant;

import com.weddingwire.common.JwtUtil;
import com.weddingwire.common.RequiresPermission;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<Tenant> createTenant(
            @Valid @RequestBody TenantRequest request,
            HttpServletRequest httpRequest) {

        UUID userId = getUserIdFromRequest(httpRequest);
        Tenant tenant = tenantService.createTenant(userId, request);

        return ResponseEntity.ok(tenant);
    }

    @GetMapping
    public ResponseEntity<List<Tenant>> getUserTenants(HttpServletRequest httpRequest) {
        UUID userId = getUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(tenantService.getUserTenants(userId));
    }

    @GetMapping("/{tenantId}")
    @RequiresPermission(section = "dashboard", permission = "read")
    public ResponseEntity<Tenant> getTenant(@PathVariable UUID tenantId) {
        return ResponseEntity.ok(tenantService.getTenant(tenantId));
    }

    private UUID getUserIdFromRequest(HttpServletRequest request) {
        String token = extractTokenFromCookie(request);
        if (token == null) {
            throw new RuntimeException("Not authenticated");
        }
        return jwtUtil.getUserId(token);
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        for (var cookie : request.getCookies()) {
            if ("access_token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
