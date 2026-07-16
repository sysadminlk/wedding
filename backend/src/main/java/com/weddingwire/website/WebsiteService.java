package com.weddingwire.website;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WebsiteService {

    private final PublicWebsiteRepository repo;

    public PublicWebsite getOrCreate(UUID tenantId) {
        return repo.findByTenantId(tenantId)
                .orElseGet(() -> {
                    PublicWebsite website = PublicWebsite.builder()
                            .tenantId(tenantId)
                            .slug("wedding-" + System.currentTimeMillis() % 10000)
                            .build();
                    return repo.save(website);
                });
    }

    public PublicWebsite update(UUID tenantId, WebsiteRequest request) {
        PublicWebsite website = repo.findByTenantId(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Website", "tenantId", tenantId));
        if (request.getSlug() != null) website.setSlug(request.getSlug());
        if (request.getTheme() != null) website.setTheme(request.getTheme());
        if (request.getStory() != null) website.setStory(request.getStory());
        if (request.getCustomCss() != null) website.setCustomCss(request.getCustomCss());
        if (request.getHeroImageKey() != null) website.setHeroImageKey(request.getHeroImageKey());
        return repo.save(website);
    }
}
