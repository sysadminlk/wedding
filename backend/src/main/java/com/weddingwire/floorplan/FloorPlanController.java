package com.weddingwire.floorplan;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/floor-plan")
@RequiredArgsConstructor
public class FloorPlanController {

    private final FloorPlanService service;

    @GetMapping
    @RequiresPermission(section = "seating", permission = "read")
    public ResponseEntity<FloorPlan> get() {
        return ResponseEntity.ok(service.getOrCreate(TenantContext.getTenantId()));
    }

    @PostMapping
    @RequiresPermission(section = "seating", permission = "write")
    public ResponseEntity<FloorPlan> update(@RequestBody FloorPlanRequest request) {
        return ResponseEntity.ok(service.update(TenantContext.getTenantId(), request));
    }

    @DeleteMapping
    @RequiresPermission(section = "seating", permission = "write")
    public ResponseEntity<Void> delete() {
        service.delete(TenantContext.getTenantId());
        return ResponseEntity.noContent().build();
    }
}
