package com.weddingwire.vendor;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository repo;

    public Page<Vendor> findAll(UUID tenantId, Pageable pageable) {
        return repo.findByTenantId(tenantId, pageable);
    }

    public Vendor findById(UUID tenantId, UUID id) {
        return repo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "id", id));
    }

    public Vendor create(UUID tenantId, VendorRequest request) {
        Vendor vendor = Vendor.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .category(request.getCategory())
                .rating(request.getRating())
                .priceMin(request.getPriceMin())
                .priceMax(request.getPriceMax())
                .status(request.getStatus())
                .contactName(request.getContactName())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .website(request.getWebsite())
                .notes(request.getNotes())
                .build();
        return repo.save(vendor);
    }

    public Vendor update(UUID tenantId, UUID id, VendorRequest request) {
        Vendor vendor = findById(tenantId, id);
        vendor.setName(request.getName());
        vendor.setCategory(request.getCategory());
        vendor.setRating(request.getRating());
        vendor.setPriceMin(request.getPriceMin());
        vendor.setPriceMax(request.getPriceMax());
        vendor.setStatus(request.getStatus());
        vendor.setContactName(request.getContactName());
        vendor.setContactEmail(request.getContactEmail());
        vendor.setContactPhone(request.getContactPhone());
        vendor.setWebsite(request.getWebsite());
        vendor.setNotes(request.getNotes());
        return repo.save(vendor);
    }

    public void delete(UUID tenantId, UUID id) {
        findById(tenantId, id);
        repo.deleteByTenantIdAndId(tenantId, id);
    }

    public List<Vendor> compare(UUID tenantId, List<UUID> ids) {
        return repo.findByTenantIdAndIdIn(tenantId, ids);
    }

    public long count(UUID tenantId) { return repo.countByTenantId(tenantId); }
}
