package com.weddingwire.timeline;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class TimelineRequest {
    private LocalTime time;
    private LocalTime endTime;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private UUID assignedTo;
    private Integer orderIndex = 0;
    private Boolean isPublic = true;
}
