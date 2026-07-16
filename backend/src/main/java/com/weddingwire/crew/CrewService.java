package com.weddingwire.crew;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CrewService {

    private final CrewRepository repo;

    public Page<CrewMember> findAll(UUID tenantId, Pageable pageable) {
        return repo.findByTenantId(tenantId, pageable);
    }

    public CrewMember findById(UUID tenantId, UUID id) {
        return repo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("CrewMember", "id", id));
    }

    public CrewMember create(UUID tenantId, CrewRequest request) {
        CrewMember member = CrewMember.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .role(request.getRole())
                .email(request.getEmail())
                .phone(request.getPhone())
                .isExternal(request.getIsExternal())
                .notes(request.getNotes())
                .build();
        return repo.save(member);
    }

    public CrewMember update(UUID tenantId, UUID id, CrewRequest request) {
        CrewMember member = findById(tenantId, id);
        member.setName(request.getName());
        member.setRole(request.getRole());
        member.setEmail(request.getEmail());
        member.setPhone(request.getPhone());
        member.setIsExternal(request.getIsExternal());
        member.setNotes(request.getNotes());
        return repo.save(member);
    }

    public void delete(UUID tenantId, UUID id) {
        findById(tenantId, id);
        repo.deleteByTenantIdAndId(tenantId, id);
    }

    public List<CrewMember> dayOfContacts(UUID tenantId) {
        return repo.findByTenantIdAndIsExternalFalse(tenantId);
    }

    public long count(UUID tenantId) { return repo.countByTenantId(tenantId); }
}
