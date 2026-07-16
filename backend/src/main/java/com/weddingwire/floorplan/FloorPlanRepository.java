package com.weddingwire.floorplan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FloorPlanRepository extends JpaRepository<FloorPlan, UUID> {
    Optional<FloorPlan> findByTenantId(UUID tenantId);
    void deleteByTenantId(UUID tenantId);
}
