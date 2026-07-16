package com.weddingwire.photo;

import com.weddingwire.common.ResourceNotFoundException;
import com.weddingwire.storage.StorageService;
import com.weddingwire.storage.UploadConfirmRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepository repo;
    private final StorageService storageService;

    public Page<Photo> findAll(UUID tenantId, Pageable pageable) {
        return repo.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
    }

    public long count(UUID tenantId) {
        return repo.countByTenantId(tenantId);
    }

    public Photo create(UUID tenantId, String s3Key, String caption) {
        Photo photo = Photo.builder()
                .tenantId(tenantId)
                .s3Key(s3Key)
                .caption(caption)
                .build();
        return repo.save(photo);
    }

    public Photo confirmUpload(UUID tenantId, UploadConfirmRequest request) {
        Photo photo = Photo.builder()
                .tenantId(tenantId)
                .s3Key(request.getS3Key())
                .caption(request.getCaption())
                .build();
        return repo.save(photo);
    }

    public String getUrl(UUID photoId) {
        Photo photo = repo.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", "id", photoId));
        return storageService.generatePresignedGetUrl(photo.getS3Key());
    }

    public String getThumbnailUrl(UUID photoId) {
        Photo photo = repo.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", "id", photoId));
        if (photo.getThumbnailKey() == null) {
            return null;
        }
        return storageService.generatePresignedGetUrl(photo.getThumbnailKey());
    }

    public void delete(UUID tenantId, UUID photoId) {
        Photo photo = repo.findByTenantIdAndId(tenantId, photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", "id", photoId));
        storageService.deleteFile(photo.getS3Key());
        if (photo.getThumbnailKey() != null) {
            storageService.deleteFile(photo.getThumbnailKey());
        }
        repo.delete(photo);
    }
}
