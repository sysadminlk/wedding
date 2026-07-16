package com.weddingwire.rsvp;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RsvpService {

    private final RsvpPageRepository repo;

    public RsvpPage getOrCreate(UUID tenantId) {
        return repo.findByTenantId(tenantId)
                .orElseGet(() -> {
                    RsvpPage page = RsvpPage.builder()
                            .tenantId(tenantId)
                            .build();
                    return repo.save(page);
                });
    }

    public RsvpPage update(UUID tenantId, RsvpRequest request) {
        RsvpPage page = repo.findByTenantId(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("RsvpPage", "tenantId", tenantId));
        if (request.getTheme() != null) page.setTheme(request.getTheme());
        if (request.getFontHeading() != null) page.setFontHeading(request.getFontHeading());
        if (request.getFontBody() != null) page.setFontBody(request.getFontBody());
        if (request.getButtonShape() != null) page.setButtonShape(request.getButtonShape());
        if (request.getButtonColor() != null) page.setButtonColor(request.getButtonColor());
        if (request.getCustomFields() != null) page.setCustomFields(request.getCustomFields());
        return repo.save(page);
    }
}
