package com.weddingwire.publicapi;

import com.weddingwire.collaborator.CollaboratorInvitation;
import com.weddingwire.collaborator.CollaboratorService;
import com.weddingwire.tenant.Tenant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/invite")
@RequiredArgsConstructor
public class InvitationAcceptController {

    private final CollaboratorService collaboratorService;

    @GetMapping("/{token}")
    public ResponseEntity<Map<String, Object>> getInvitationDetails(@PathVariable String token) {
        CollaboratorInvitation invitation = collaboratorService.getInvitationByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid invitation token"));

        if (invitation.isRevoked()) {
            throw new RuntimeException("Invitation has been revoked");
        }

        if (invitation.getAcceptedAt() != null) {
            throw new RuntimeException("Invitation has already been accepted");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invitation has expired");
        }

        Tenant tenant = collaboratorService.getTenantById(invitation.getTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("email", invitation.getEmail());
        response.put("role", invitation.getRole());
        response.put("tenantName", tenant.getName());
        response.put("expiresAt", invitation.getExpiresAt());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{token}/accept")
    public ResponseEntity<Map<String, String>> acceptInvitation(
            @PathVariable String token,
            @RequestBody Map<String, UUID> body) {
        UUID userId = body.get("userId");
        if (userId == null) {
            throw new RuntimeException("userId is required");
        }

        collaboratorService.acceptInvitation(token, userId);

        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "Invitation accepted successfully");

        return ResponseEntity.ok(response);
    }
}
