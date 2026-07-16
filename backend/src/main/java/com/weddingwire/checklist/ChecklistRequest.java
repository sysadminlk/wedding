package com.weddingwire.checklist;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ChecklistRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private String phase;
    private Integer dueOffsetDays;
    private LocalDate dueDate;
    private UUID assignedTo;
    private Integer orderIndex = 0;
}
