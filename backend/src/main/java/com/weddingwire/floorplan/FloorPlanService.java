package com.weddingwire.floorplan;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FloorPlanService {

    private final FloorPlanRepository repo;

    public FloorPlan getOrCreate(UUID tenantId) {
        return repo.findByTenantId(tenantId)
                .orElseGet(() -> {
                    FloorPlan plan = FloorPlan.builder()
                            .tenantId(tenantId)
                            .build();
                    return repo.save(plan);
                });
    }

    public FloorPlan update(UUID tenantId, FloorPlanRequest request) {
        FloorPlan plan = repo.findByTenantId(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("FloorPlan", "tenantId", tenantId));
        plan.setRoomWidth(request.getRoomWidth());
        plan.setRoomDepth(request.getRoomDepth());
        plan.setElements(request.getElements());
        plan.setCameraPosition(request.getCameraPosition());
        return repo.save(plan);
    }

    public void delete(UUID tenantId) {
        repo.deleteByTenantId(tenantId);
    }
}
