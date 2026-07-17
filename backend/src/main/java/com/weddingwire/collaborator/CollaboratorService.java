package com.weddingwire.collaborator;

import com.weddingwire.email.EmailService;
import com.weddingwire.qr.QrCodeService;
import com.weddingwire.tenant.Tenant;
import com.weddingwire.tenant.TenantRepository;
import com.weddingwire.user.User;
import com.weddingwire.user.UserRepository;
import com.weddingwire.user.UserTenant;
import com.weddingwire.user.UserTenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CollaboratorService {

    private final CollaboratorInvitationRepository invitationRepository;
    private final UserTenantRepository userTenantRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final EmailService emailService;
    private final QrCodeService qrCodeService;

    @Value("${app.domain:weddingwire.lk}")
    private String appDomain;

    @Transactional
    public CollaboratorInvitation sendInvitation(UUID tenantId, String email, String role, String permissions) {
        Optional<CollaboratorInvitation> existing = invitationRepository.findByTenantIdAndEmail(tenantId, email);
        if (existing.isPresent() && existing.get().getAcceptedAt() == null && !existing.get().isRevoked()) {
            throw new RuntimeException("Invitation already pending for this email");
        }

        boolean alreadyMember = userTenantRepository.findByTenantId(tenantId)
                .stream()
                .anyMatch(ut -> {
                    User user = userRepository.findById(ut.getUserId()).orElse(null);
                    return user != null && user.getEmail().equals(email);
                });
        if (alreadyMember) {
            throw new RuntimeException("User is already a collaborator");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        String token = UUID.randomUUID().toString();

        CollaboratorInvitation invitation = CollaboratorInvitation.builder()
                .tenantId(tenantId)
                .email(email)
                .role(role)
                .permissions(permissions != null ? permissions : "{}")
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        invitation = invitationRepository.save(invitation);

        String inviteLink = "https://" + appDomain + "/invite/" + token;
        emailService.sendCustomEmail(email,
                "You've been invited to collaborate on " + tenant.getName(),
                "<p>You've been invited to join <strong>" + tenant.getName() + "</strong> as a <strong>" + role + "</strong>.</p>"
                        + "<p><a href=\"" + inviteLink + "\">Accept Invitation</a></p>"
                        + "<p>This invitation expires on " + invitation.getExpiresAt() + ".</p>");

        return invitation;
    }

    @Transactional
    public void acceptInvitation(String token, UUID userId) {
        CollaboratorInvitation invitation = invitationRepository.findByToken(token)
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

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equalsIgnoreCase(invitation.getEmail())) {
            throw new RuntimeException("Email does not match invitation");
        }

        if (userTenantRepository.existsByUserIdAndTenantId(userId, invitation.getTenantId())) {
            throw new RuntimeException("User is already a member of this tenant");
        }

        UserTenant userTenant = UserTenant.builder()
                .userId(userId)
                .tenantId(invitation.getTenantId())
                .role(invitation.getRole())
                .permissions(invitation.getPermissions())
                .build();

        userTenantRepository.save(userTenant);

        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    @Transactional
    public CollaboratorInvitation resendInvitation(UUID invitationId) {
        CollaboratorInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (invitation.isRevoked()) {
            throw new RuntimeException("Invitation has been revoked");
        }

        if (invitation.getAcceptedAt() != null) {
            throw new RuntimeException("Invitation has already been accepted");
        }

        Tenant tenant = tenantRepository.findById(invitation.getTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        String newToken = UUID.randomUUID().toString();
        invitation.setToken(newToken);
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7));

        invitation = invitationRepository.save(invitation);

        String inviteLink = "https://" + appDomain + "/invite/" + newToken;
        emailService.sendCustomEmail(invitation.getEmail(),
                "You've been invited to collaborate on " + tenant.getName(),
                "<p>You've been invited to join <strong>" + tenant.getName() + "</strong> as a <strong>" + invitation.getRole() + "</strong>.</p>"
                        + "<p><a href=\"" + inviteLink + "\">Accept Invitation</a></p>"
                        + "<p>This invitation expires on " + invitation.getExpiresAt() + ".</p>");

        return invitation;
    }

    @Transactional
    public void removeCollaborator(UUID tenantId, UUID userId) {
        UserTenant userTenant = userTenantRepository.findByUserIdAndTenantId(userId, tenantId);
        if (userTenant == null) {
            throw new RuntimeException("Collaborator not found");
        }

        if ("owner".equals(userTenant.getRole())) {
            throw new RuntimeException("Cannot remove the owner");
        }

        userTenantRepository.delete(userTenant);
    }

    public List<Map<String, Object>> getCollaborators(UUID tenantId) {
        List<UserTenant> userTenants = userTenantRepository.findByTenantId(tenantId);
        List<Map<String, Object>> collaborators = new ArrayList<>();

        for (UserTenant ut : userTenants) {
            User user = userRepository.findById(ut.getUserId()).orElse(null);
            if (user != null) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("userId", user.getId());
                entry.put("name", user.getName());
                entry.put("email", user.getEmail());
                entry.put("role", ut.getRole());
                entry.put("permissions", ut.getPermissions());
                entry.put("joinedAt", ut.getCreatedAt());
                collaborators.add(entry);
            }
        }

        return collaborators;
    }

    @Transactional
    public void updatePermissions(UUID tenantId, UUID userId, String permissions) {
        UserTenant userTenant = userTenantRepository.findByUserIdAndTenantId(userId, tenantId);
        if (userTenant == null) {
            throw new RuntimeException("Collaborator not found");
        }

        if ("owner".equals(userTenant.getRole())) {
            throw new RuntimeException("Cannot modify owner permissions");
        }

        userTenant.setPermissions(permissions);
        userTenantRepository.save(userTenant);
    }

    @Transactional
    public void transferOwnership(UUID tenantId, UUID currentOwnerId, UUID newOwnerId) {
        UserTenant currentOwner = userTenantRepository.findByUserIdAndTenantId(currentOwnerId, tenantId);
        if (currentOwner == null || !"owner".equals(currentOwner.getRole())) {
            throw new RuntimeException("Current user is not the owner");
        }

        UserTenant newOwner = userTenantRepository.findByUserIdAndTenantId(newOwnerId, tenantId);
        if (newOwner == null) {
            throw new RuntimeException("New owner is not a collaborator in this tenant");
        }

        currentOwner.setRole("planner");
        currentOwner.setPermissions("{\"dashboard\":{\"read\":\"all\",\"write\":\"all\"}}");
        userTenantRepository.save(currentOwner);

        newOwner.setRole("owner");
        newOwner.setPermissions("{\"dashboard\":{\"read\":\"all\",\"write\":\"all\"},\"budget\":{\"read\":\"all\",\"write\":\"all\"},\"guests\":{\"read\":\"all\",\"write\":\"all\"},\"vendors\":{\"read\":\"all\",\"write\":\"all\"},\"timeline\":{\"read\":\"all\",\"write\":\"all\"},\"photos\":{\"read\":\"all\",\"write\":\"all\"},\"checklist\":{\"read\":\"all\",\"write\":\"all\"},\"seating\":{\"read\":\"all\",\"write\":\"all\"},\"menu\":{\"read\":\"all\",\"write\":\"all\"},\"rsvp\":{\"read\":\"all\",\"write\":\"all\"},\"crew\":{\"read\":\"all\",\"write\":\"all\"},\"inspiration\":{\"read\":\"all\",\"write\":\"all\"},\"floorplan\":{\"read\":\"all\",\"write\":\"all\"},\"memories\":{\"read\":\"all\",\"write\":\"all\"},\"website\":{\"read\":\"all\",\"write\":\"all\"},\"emailtemplate\":{\"read\":\"all\",\"write\":\"all\"}}");
        userTenantRepository.save(newOwner);
    }

    @Transactional
    public void revokeInvitation(UUID invitationId) {
        CollaboratorInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (invitation.getAcceptedAt() != null) {
            throw new RuntimeException("Invitation has already been accepted");
        }

        invitation.setRevoked(true);
        invitationRepository.save(invitation);
    }

    public List<CollaboratorInvitation> getInvitations(UUID tenantId) {
        return invitationRepository.findByTenantId(tenantId);
    }

    public Optional<CollaboratorInvitation> getInvitationByToken(String token) {
        return invitationRepository.findByToken(token);
    }

    public Optional<Tenant> getTenantById(UUID tenantId) {
        return tenantRepository.findById(tenantId);
    }
}
