package com.weddingwire.budget;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository repo;

    public Page<BudgetItem> findAll(UUID tenantId, Pageable pageable) {
        return repo.findByTenantId(tenantId, pageable);
    }

    public BudgetItem findById(UUID tenantId, UUID id) {
        return repo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("BudgetItem", "id", id));
    }

    public BudgetItem create(UUID tenantId, BudgetRequest request) {
        BudgetItem item = BudgetItem.builder()
                .tenantId(tenantId)
                .category(request.getCategory())
                .description(request.getDescription())
                .plannedAmount(request.getPlannedAmount())
                .actualAmount(request.getActualAmount())
                .vendorId(request.getVendorId())
                .notes(request.getNotes())
                .build();
        return repo.save(item);
    }

    public BudgetItem update(UUID tenantId, UUID id, BudgetRequest request) {
        BudgetItem item = findById(tenantId, id);
        item.setCategory(request.getCategory());
        item.setDescription(request.getDescription());
        item.setPlannedAmount(request.getPlannedAmount());
        item.setActualAmount(request.getActualAmount());
        item.setVendorId(request.getVendorId());
        item.setNotes(request.getNotes());
        return repo.save(item);
    }

    public void delete(UUID tenantId, UUID id) {
        findById(tenantId, id);
        repo.deleteByTenantIdAndId(tenantId, id);
    }

    public BudgetSummary summary(UUID tenantId) {
        BigDecimal planned = repo.sumPlanned(tenantId);
        BigDecimal actual = repo.sumActual(tenantId);
        return BudgetSummary.builder()
                .totalPlanned(planned)
                .totalActual(actual)
                .remaining(planned.subtract(actual))
                .build();
    }

    public long count(UUID tenantId) { return repo.countByTenantId(tenantId); }
}
