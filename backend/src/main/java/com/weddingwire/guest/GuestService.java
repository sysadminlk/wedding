package com.weddingwire.guest;

import com.opencsv.CSVReader;
import com.weddingwire.common.BusinessException;
import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GuestService {

    private final GuestRepository guestRepository;

    public Page<Guest> findAll(UUID tenantId, Pageable pageable) {
        return guestRepository.findByTenantId(tenantId, pageable);
    }

    public Page<Guest> search(UUID tenantId, String query, Pageable pageable) {
        return guestRepository.searchByName(tenantId, query, pageable);
    }

    public Guest findById(UUID tenantId, UUID id) {
        return guestRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Guest", "id", id));
    }

    public Guest create(UUID tenantId, GuestRequest request) {
        Guest guest = Guest.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .side(request.getSide())
                .partySize(request.getPartySize())
                .rsvpStatus(request.getRsvpStatus())
                .dietary(request.getDietary())
                .notes(request.getNotes())
                .build();
        return guestRepository.save(guest);
    }

    public Guest update(UUID tenantId, UUID id, GuestRequest request) {
        Guest guest = findById(tenantId, id);
        guest.setName(request.getName());
        guest.setEmail(request.getEmail());
        guest.setPhone(request.getPhone());
        guest.setSide(request.getSide());
        guest.setPartySize(request.getPartySize());
        guest.setRsvpStatus(request.getRsvpStatus());
        guest.setDietary(request.getDietary());
        guest.setNotes(request.getNotes());
        return guestRepository.save(guest);
    }

    public void delete(UUID tenantId, UUID id) {
        findById(tenantId, id);
        guestRepository.deleteByTenantIdAndId(tenantId, id);
    }

    public int importCsv(UUID tenantId, MultipartFile file) {
        List<Guest> guests = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] header = reader.readNext();
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (line.length < 1 || line[0].isBlank()) continue;
                Guest guest = Guest.builder()
                        .tenantId(tenantId)
                        .name(line[0])
                        .email(line.length > 1 ? line[1] : null)
                        .phone(line.length > 2 ? line[2] : null)
                        .side(line.length > 3 ? line[3] : "mutual")
                        .partySize(line.length > 4 && !line[4].isBlank() ? Integer.parseInt(line[4]) : 1)
                        .dietary(line.length > 5 ? line[5] : null)
                        .notes(line.length > 6 ? line[6] : null)
                        .build();
                guests.add(guest);
            }
        } catch (Exception e) {
            throw new BusinessException("Failed to parse CSV: " + e.getMessage());
        }
        guestRepository.saveAll(guests);
        return guests.size();
    }

    public long count(UUID tenantId) {
        return guestRepository.countByTenantId(tenantId);
    }

    public long countByRsvpStatus(UUID tenantId, String status) {
        return guestRepository.countByTenantIdAndRsvpStatus(tenantId, status);
    }
}
