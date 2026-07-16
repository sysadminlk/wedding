package com.weddingwire.wedding;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WeddingService {

    private final WeddingRepository weddingRepository;

    public Wedding getOrCreate(UUID tenantId) {
        return weddingRepository.findByTenantId(tenantId)
                .orElseGet(() -> {
                    Wedding wedding = Wedding.builder()
                            .tenantId(tenantId)
                            .partner1("Partner 1")
                            .partner2("Partner 2")
                            .build();
                    return weddingRepository.save(wedding);
                });
    }

    public Wedding update(UUID tenantId, WeddingRequest request) {
        Wedding wedding = weddingRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding", "tenantId", tenantId));

        wedding.setPartner1(request.getPartner1());
        wedding.setPartner2(request.getPartner2());
        wedding.setDate(request.getDate());
        wedding.setVenue(request.getVenue());
        wedding.setTimezone(request.getTimezone());

        return weddingRepository.save(wedding);
    }
}
