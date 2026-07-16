package com.weddingwire.seating;

import com.weddingwire.common.ResourceNotFoundException;
import com.weddingwire.guest.Guest;
import com.weddingwire.guest.GuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeatingService {

    private final TableConfigRepository tableRepo;
    private final GuestRepository guestRepo;

    public List<TableConfig> findAll(UUID tenantId) {
        return tableRepo.findByTenantId(tenantId);
    }

    public TableConfig findById(UUID tenantId, UUID id) {
        return tableRepo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Table", "id", id));
    }

    public TableConfig create(UUID tenantId, TableConfigRequest request) {
        TableConfig table = TableConfig.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .capacity(request.getCapacity())
                .tableType(request.getTableType())
                .positionX(request.getPositionX())
                .positionY(request.getPositionY())
                .build();
        return tableRepo.save(table);
    }

    public TableConfig update(UUID tenantId, UUID id, TableConfigRequest request) {
        TableConfig table = findById(tenantId, id);
        table.setName(request.getName());
        table.setCapacity(request.getCapacity());
        table.setTableType(request.getTableType());
        table.setPositionX(request.getPositionX());
        table.setPositionY(request.getPositionY());
        return tableRepo.save(table);
    }

    public void delete(UUID tenantId, UUID id) {
        findById(tenantId, id);
        tableRepo.deleteByTenantIdAndId(tenantId, id);
    }

    public Guest assignGuest(UUID tenantId, UUID tableId, UUID guestId) {
        TableConfig table = findById(tenantId, tableId);
        Guest guest = guestRepo.findByTenantIdAndId(tenantId, guestId)
                .orElseThrow(() -> new ResourceNotFoundException("Guest", "id", guestId));
        guest.setTableId(table.getId());
        return guestRepo.save(guest);
    }

    public Guest unassignGuest(UUID tenantId, UUID guestId) {
        Guest guest = guestRepo.findByTenantIdAndId(tenantId, guestId)
                .orElseThrow(() -> new ResourceNotFoundException("Guest", "id", guestId));
        guest.setTableId(null);
        return guestRepo.save(guest);
    }

    public void batchUpdate(UUID tenantId, SeatingBatchUpdate batchUpdate) {
        for (SeatingBatchUpdate.TablePosition pos : batchUpdate.getPositions()) {
            TableConfig table = tableRepo.findByTenantIdAndId(tenantId, pos.getTableId()).orElse(null);
            if (table != null) {
                table.setPositionX(pos.getPositionX());
                table.setPositionY(pos.getPositionY());
                tableRepo.save(table);
            }
        }
    }

    public long count(UUID tenantId) { return tableRepo.countByTenantId(tenantId); }
}
