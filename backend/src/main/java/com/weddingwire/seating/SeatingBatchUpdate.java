package com.weddingwire.seating;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class SeatingBatchUpdate {
    private List<TablePosition> positions;

    @Data
    public static class TablePosition {
        private UUID tableId;
        private Double positionX;
        private Double positionY;
    }
}
