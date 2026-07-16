package com.weddingwire.common;

import com.weddingwire.user.UserTenant;
import com.weddingwire.user.UserTenantRepository;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
public class PermissionAspect {

    private final UserTenantRepository userTenantRepository;

    @Around("@annotation(requiresPermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, RequiresPermission requiresPermission) throws Throwable {
        UUID tenantId = TenantContext.getTenantId();
        UUID userId = getUserIdFromContext();

        if (tenantId == null || userId == null) {
            throw new SecurityException("Not authenticated");
        }

        UserTenant userTenant = userTenantRepository.findByUserIdAndTenantId(userId, tenantId);

        if (userTenant == null) {
            throw new SecurityException("Not a member of this tenant");
        }

        if (!hasPermission(userTenant.getPermissions(), requiresPermission.section(), requiresPermission.permission())) {
            throw new SecurityException("Insufficient permissions");
        }

        return joinPoint.proceed();
    }

    private boolean hasPermission(String permissionsJson, String section, String permission) {
        // Owner always has full access
        if (permissionsJson != null && permissionsJson.contains("\"read\":\"all\"")) {
            return true;
        }

        // Simplified permission check - in production, parse JSON properly
        // For now, return true if user has any permissions
        return permissionsJson != null && !permissionsJson.isEmpty();
    }

    private UUID getUserIdFromContext() {
        // Get userId from ThreadLocal or SecurityContext
        // This is a placeholder - implement based on your auth setup
        return null;
    }
}
