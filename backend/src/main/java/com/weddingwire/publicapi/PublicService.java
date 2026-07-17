package com.weddingwire.publicapi;

import com.weddingwire.common.ResourceNotFoundException;
import com.weddingwire.gift.CashFund;
import com.weddingwire.gift.CashFundRepository;
import com.weddingwire.gift.GiftItem;
import com.weddingwire.gift.GiftRepository;
import com.weddingwire.guest.Guest;
import com.weddingwire.guest.GuestRepository;
import com.weddingwire.memory.GuestMemory;
import com.weddingwire.memory.MemoryRepository;
import com.weddingwire.menu.MenuPage;
import com.weddingwire.menu.MenuRepository;
import com.weddingwire.photo.Photo;
import com.weddingwire.photo.PhotoRepository;
import com.weddingwire.seating.TableConfigRepository;
import com.weddingwire.storage.PresignedUrlRequest;
import com.weddingwire.storage.PresignedUrlResponse;
import com.weddingwire.storage.StorageService;
import com.weddingwire.storage.UploadConfirmRequest;
import com.weddingwire.tenant.Tenant;
import com.weddingwire.tenant.TenantRepository;
import com.weddingwire.wedding.Wedding;
import com.weddingwire.wedding.WeddingRepository;
import com.weddingwire.website.PublicWebsite;
import com.weddingwire.website.PublicWebsiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicService {

    private final TenantRepository tenantRepo;
    private final PublicWebsiteRepository websiteRepo;
    private final WeddingRepository weddingRepo;
    private final GuestRepository guestRepo;
    private final TableConfigRepository tableRepo;
    private final MenuRepository menuRepo;
    private final PhotoRepository photoRepo;
    private final StorageService storageService;
    private final GiftRepository giftRepo;
    private final CashFundRepository cashFundRepo;
    private final MemoryRepository memoryRepo;

    private UUID resolveTenantId(String slug) {
        return tenantRepo.findBySlug(slug)
                .map(Tenant::getId)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding", "slug", slug));
    }

    public WeddingPublicResponse getWeddingBySlug(String slug) {
        UUID tenantId = resolveTenantId(slug);

        Wedding wedding = weddingRepo.findByTenantId(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding", "tenantId", tenantId));

        PublicWebsite website = websiteRepo.findByTenantId(tenantId).orElse(null);

        return WeddingPublicResponse.builder()
                .coupleName(wedding.getPartner1() + " & " + wedding.getPartner2())
                .partner1(wedding.getPartner1())
                .partner2(wedding.getPartner2())
                .weddingDate(wedding.getDate())
                .theme(website != null ? website.getTheme() : null)
                .story(website != null ? website.getStory() : null)
                .venue(wedding.getVenue())
                .shareSlug(website != null ? website.getSlug() : null)
                .build();
    }

    public List<Map<String, Object>> searchGuests(String slug, String name) {
        UUID tenantId = resolveTenantId(slug);

        List<Guest> guests;
        if (name != null && !name.isBlank()) {
            guests = guestRepo.searchByName(tenantId, name, Pageable.unpaged()).getContent();
        } else {
            guests = guestRepo.findByTenantId(tenantId, Pageable.unpaged()).getContent();
        }

        return guests.stream().map(guest -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("name", guest.getName());
            if (guest.getTableId() != null) {
                tableRepo.findByTenantIdAndId(tenantId, guest.getTableId())
                        .ifPresent(table -> map.put("tableName", table.getName()));
            }
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> findSeat(String slug, String name) {
        UUID tenantId = resolveTenantId(slug);

        List<Guest> guests = guestRepo.searchByName(tenantId, name, Pageable.unpaged()).getContent();

        Map<String, Object> result = new LinkedHashMap<>();

        if (guests.isEmpty()) {
            return result;
        }

        Guest guest = guests.get(0);
        result.put("guestName", guest.getName());

        if (guest.getTableId() != null) {
            tableRepo.findByTenantIdAndId(tenantId, guest.getTableId())
                    .ifPresent(table -> result.put("tableName", table.getName()));
        }

        return result;
    }

    public List<Map<String, Object>> getMenuPages(String slug) {
        UUID tenantId = resolveTenantId(slug);

        return menuRepo.findAllByTenantIdOrderByOrderIndexAsc(tenantId).stream()
                .map(page -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("title", page.getTitle());
                    map.put("s3Key", page.getS3Key());
                    map.put("url", storageService.generatePresignedGetUrl(page.getS3Key()));
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getPhotoUrls(String slug) {
        UUID tenantId = resolveTenantId(slug);

        return photoRepo.findByTenantIdOrderByCreatedAtDesc(tenantId, Pageable.unpaged())
                .getContent().stream()
                .map(photo -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("s3Key", photo.getS3Key());
                    map.put("caption", photo.getCaption());
                    map.put("url", storageService.generatePresignedGetUrl(photo.getS3Key()));
                    return map;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getGifts(String slug) {
        UUID tenantId = resolveTenantId(slug);

        Map<String, Object> result = new LinkedHashMap<>();

        List<Map<String, Object>> giftItems = giftRepo.findByTenantId(tenantId, Pageable.unpaged())
                .getContent().stream()
                .map(gift -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", gift.getId());
                    map.put("name", gift.getName());
                    map.put("imageS3Key", gift.getImageS3Key());
                    map.put("storeLink", gift.getStoreLink());
                    map.put("note", gift.getNote());
                    map.put("claimed", gift.getClaimedByGuestId() != null);
                    return map;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> funds = cashFundRepo.findByTenantId(tenantId).stream()
                .map(fund -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", fund.getId());
                    map.put("label", fund.getLabel());
                    map.put("paymentLink", fund.getPaymentLink());
                    map.put("icon", fund.getIcon());
                    map.put("goalAmount", fund.getGoalAmount());
                    return map;
                })
                .collect(Collectors.toList());

        result.put("giftItems", giftItems);
        result.put("cashFunds", funds);

        return result;
    }

    public void submitRsvp(String slug, RsvpSubmitRequest request) {
        UUID tenantId = resolveTenantId(slug);

        List<Guest> guests = guestRepo.searchByName(tenantId, request.getGuestName(), Pageable.unpaged())
                .getContent();

        if (guests.isEmpty()) {
            return;
        }

        Guest guest = guests.get(0);
        guest.setRsvpStatus(request.getResponse());
        if (request.getPartySize() != null) {
            guest.setPartySize(request.getPartySize());
        }
        if (request.getDietaryRestrictions() != null) {
            guest.setDietary(request.getDietaryRestrictions());
        }
        if (request.getEmail() != null) {
            guest.setEmail(request.getEmail());
        }
        guestRepo.save(guest);
    }

    public PresignedUrlResponse generateGalleryUploadUrl(String slug, PresignedUrlRequest request) {
        UUID tenantId = resolveTenantId(slug);
        return storageService.generatePresignedPutUrl(
                tenantId, request.getFileName(), request.getContentType(), "gallery");
    }

    public Photo confirmGalleryUpload(String slug, UploadConfirmRequest request) {
        UUID tenantId = resolveTenantId(slug);
        Photo photo = Photo.builder()
                .tenantId(tenantId)
                .s3Key(request.getS3Key())
                .caption(request.getCaption())
                .build();
        return photoRepo.save(photo);
    }

    public PresignedUrlResponse generateMemoryUploadUrl(String slug, PresignedUrlRequest request) {
        UUID tenantId = resolveTenantId(slug);
        return storageService.generatePresignedPutUrl(
                tenantId, request.getFileName(), request.getContentType(), "memory");
    }

    public GuestMemory confirmMemoryUpload(String slug, UploadConfirmRequest request) {
        UUID tenantId = resolveTenantId(slug);
        GuestMemory memory = GuestMemory.builder()
                .tenantId(tenantId)
                .type(request.getType())
                .s3Key(request.getS3Key())
                .durationSeconds(request.getDurationSeconds())
                .build();
        return memoryRepo.save(memory);
    }

    public GiftItem claimGift(String slug, UUID giftId) {
        UUID tenantId = resolveTenantId(slug);
        GiftItem gift = giftRepo.findByTenantIdAndId(tenantId, giftId)
                .orElseThrow(() -> new ResourceNotFoundException("GiftItem", "id", giftId));
        gift.setClaimedAt(LocalDateTime.now());
        return giftRepo.save(gift);
    }

    public String getThemeBySlug(String slug) {
        UUID tenantId = resolveTenantId(slug);
        PublicWebsite website = websiteRepo.findByTenantId(tenantId).orElse(null);
        return website != null ? website.getTheme() : "classic";
    }
}
