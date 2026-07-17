package com.weddingwire.publicapi;

import com.weddingwire.gift.GiftItem;
import com.weddingwire.memory.GuestMemory;
import com.weddingwire.photo.Photo;
import com.weddingwire.storage.PresignedUrlRequest;
import com.weddingwire.storage.PresignedUrlResponse;
import com.weddingwire.storage.UploadConfirmRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicService service;

    @GetMapping("/wedding/{slug}")
    public ResponseEntity<WeddingPublicResponse> getWedding(@PathVariable String slug) {
        return ResponseEntity.ok(service.getWeddingBySlug(slug));
    }

    @GetMapping("/share/{slug}/guests")
    public ResponseEntity<List<Map<String, Object>>> getGuests(@PathVariable String slug) {
        return ResponseEntity.ok(service.searchGuests(slug, null));
    }

    @GetMapping("/share/{slug}/seat")
    public ResponseEntity<Map<String, Object>> findSeat(
            @PathVariable String slug,
            @RequestParam String name) {
        return ResponseEntity.ok(service.findSeat(slug, name));
    }

    @GetMapping("/share/{slug}/menu")
    public ResponseEntity<List<Map<String, Object>>> getMenu(@PathVariable String slug) {
        return ResponseEntity.ok(service.getMenuPages(slug));
    }

    @GetMapping("/share/{slug}/photos")
    public ResponseEntity<List<Map<String, Object>>> getPhotos(@PathVariable String slug) {
        return ResponseEntity.ok(service.getPhotoUrls(slug));
    }

    @GetMapping("/share/{slug}/gifts")
    public ResponseEntity<Map<String, Object>> getGifts(@PathVariable String slug) {
        return ResponseEntity.ok(service.getGifts(slug));
    }

    @PostMapping("/share/{slug}/rsvp")
    public ResponseEntity<Void> submitRsvp(
            @PathVariable String slug,
            @RequestBody RsvpSubmitRequest request) {
        service.submitRsvp(slug, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/share/{slug}/gallery/upload")
    public ResponseEntity<PresignedUrlResponse> galleryUpload(
            @PathVariable String slug,
            @RequestBody PresignedUrlRequest request) {
        return ResponseEntity.ok(service.generateGalleryUploadUrl(slug, request));
    }

    @PostMapping("/share/{slug}/gallery/confirm")
    public ResponseEntity<Photo> galleryConfirm(
            @PathVariable String slug,
            @RequestBody UploadConfirmRequest request) {
        return ResponseEntity.ok(service.confirmGalleryUpload(slug, request));
    }

    @PostMapping("/share/{slug}/memory/upload")
    public ResponseEntity<PresignedUrlResponse> memoryUpload(
            @PathVariable String slug,
            @RequestBody PresignedUrlRequest request) {
        return ResponseEntity.ok(service.generateMemoryUploadUrl(slug, request));
    }

    @PostMapping("/share/{slug}/memory/confirm")
    public ResponseEntity<GuestMemory> memoryConfirm(
            @PathVariable String slug,
            @RequestBody UploadConfirmRequest request) {
        return ResponseEntity.ok(service.confirmMemoryUpload(slug, request));
    }

    @PostMapping("/share/{slug}/gift/{giftId}/claim")
    public ResponseEntity<GiftItem> claimGift(
            @PathVariable String slug,
            @PathVariable UUID giftId) {
        return ResponseEntity.ok(service.claimGift(slug, giftId));
    }

    @GetMapping("/wedding/{slug}/theme")
    public ResponseEntity<Map<String, String>> getTheme(@PathVariable String slug) {
        String theme = service.getThemeBySlug(slug);
        return ResponseEntity.ok(Map.of("theme", theme));
    }
}
