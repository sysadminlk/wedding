package com.weddingwire.emailtemplate;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailTemplateService {

    private final EmailTemplateRepository repo;

    public EmailTemplate getByType(UUID tenantId, String type) {
        return repo.findByTenantIdAndType(tenantId, type)
                .orElseThrow(() -> new ResourceNotFoundException("EmailTemplate", "type", type));
    }

    public EmailTemplate update(UUID tenantId, String type, EmailTemplateRequest request) {
        EmailTemplate template = repo.findByTenantIdAndType(tenantId, type)
                .orElseThrow(() -> new ResourceNotFoundException("EmailTemplate", "type", type));
        template.setSubject(request.getSubject());
        template.setBodyHtml(request.getBodyHtml());
        template.setIsDefault(false);
        return repo.save(template);
    }
}
