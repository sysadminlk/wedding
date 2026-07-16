package com.weddingwire.photo;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepository repo;

    public Page<Photo> findAll(UUID tenantId, Pageable pageable) {
        return repo.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
    }

    public long count(UUID tenantId) { return repo.countByTenantId(tenantId); }
}
