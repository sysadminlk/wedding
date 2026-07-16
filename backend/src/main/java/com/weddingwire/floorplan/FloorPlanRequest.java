package com.weddingwire.floorplan;

import lombok.Data;

@Data
public class FloorPlanRequest {
    private Double roomWidth = 20.0;
    private Double roomDepth = 15.0;
    private String elements = "[]";
    private String cameraPosition = "{}";
}
