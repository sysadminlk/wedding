package com.weddingwire.collaborator;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/collaborators")
@RequiredArgsConstructor
public class CollaboratorController {

    private final CollaboratorService collaboratorService;

    @GetMapping
    @RequiresPermission(section = "dashboard", permission = "read")
    public ResponseEntity<List<Map<String, Object>>> getCollaborators() {
        UUID tenantId = TenantContext.getTenantId();
        return ResponseEntity.ok(collaboratorService.getCollaborators(tenantId));
    }

    @PostMapping("/invite")
    @RequiresPermission(section = "dashboard", permission = "write")
    public ResponseEntity<CollaboratorInvitation> sendInvitation(@Valid @RequestBody InviteRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        CollaboratorInvitation invitation = collaboratorService.sendInvitation(
                tenantId, request.getEmail(), request.getRole(), request.getPermissions());
        return ResponseEntity.ok(invitation);
    }

    @GetMapping("/invitations")
    @RequiresPermission(section = "dashboard", permission = "read")
    public ResponseEntity<List<CollaboratorInvitation>> getInvitations() {
        UUID tenantId = TenantContext.getTenantId();
        return ResponseEntity.ok(collaboratorService.getInvitations(tenantId));
    }

    @PutMapping("/{userId}/permissions")
    @RequiresPermission(section = "dashboard", permission = "write")
    public ResponseEntity<Map<String, String>> updatePermissions(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdatePermissionsRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        collaboratorService.updatePermissions(tenantId, userId, request.getPermissions());
        return ResponseEntity.ok(Map.of("message", "Permissions updated"));
    }

    @DeleteMapping("/{userId}")
    @RequiresPermission(section = "dashboard", permission = "write")
    public ResponseEntity<Map<String, String>> removeCollaborator(@PathVariable UUID userId) {
        UUID tenantId = TenantContext.getTenantId();
        collaboratorService.removeCollaborator(tenantId, userId);
        return ResponseEntity.ok(Map.of("message", "Collaborator removed"));
    }

    @PostMapping("/{userId}/transfer-ownership")
    @RequiresPermission(section = "dashboard", permission = "write")
    public ResponseEntity<Map<String, String>> transferOwnership(@PathVariable UUID userId) {
        UUID tenantId = TenantContext.getTenantId();
        UUID currentOwnerId = getCurrentUserId();
        collaboratorService.transferOwnership(tenantId, currentOwnerId, userId);
        return ResponseEntity.ok(Map.of("message", "Ownership transferred"));
    }

    @PostMapping("/invitations/{invitationId}/resend")
    @RequiresPermission(section = "dashboard", permission = "write")
    public ResponseEntity<CollaboratorInvitation> resendInvitation(@PathVariable UUID invitationId) {
        CollaboratorInvitation invitation = collaboratorService.resendInvitation(invitationId);
        return ResponseEntity.ok(invitation);
    }

    @DeleteMapping("/invitations/{invitationId}")
    @RequiresPermission(section = "dashboard", permission = "write")
    public ResponseEntity<Map<String, String>> revokeInvitation(@PathVariable UUID invitationId) {
        collaboratorService.revokeInvitation(invitationId);
        return ResponseEntity.ok(Map.of("message", "Invitation revoked"));
    }

    private UUID getCurrentUserId() {
        // Placeholder — retrieve from SecurityContext / JWT filter
        return null;
    }
}
