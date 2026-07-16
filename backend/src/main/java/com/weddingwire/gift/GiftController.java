package com.weddingwire.gift;

import com.weddingwire.common.RequiresPermission;
import com.weddingwire.common.TenantContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GiftController {

    private final GiftService service;

    @GetMapping("/gifts")
    @RequiresPermission(section = "gifts", permission = "read")
    public ResponseEntity<Page<GiftItem>> findAllGifts(Pageable pageable) {
        return ResponseEntity.ok(service.findAllGifts(TenantContext.getTenantId(), pageable));
    }

    @PostMapping("/gifts")
    @RequiresPermission(section = "gifts", permission = "write")
    public ResponseEntity<GiftItem> createGift(@Valid @RequestBody GiftRequest request) {
        return ResponseEntity.ok(service.createGift(TenantContext.getTenantId(), request));
    }

    @PutMapping("/gifts/{id}")
    @RequiresPermission(section = "gifts", permission = "write")
    public ResponseEntity<GiftItem> updateGift(@PathVariable UUID id, @Valid @RequestBody GiftRequest request) {
        return ResponseEntity.ok(service.updateGift(TenantContext.getTenantId(), id, request));
    }

    @DeleteMapping("/gifts/{id}")
    @RequiresPermission(section = "gifts", permission = "write")
    public ResponseEntity<Void> deleteGift(@PathVariable UUID id) {
        service.deleteGift(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/gifts/{id}/claim")
    @RequiresPermission(section = "gifts", permission = "write")
    public ResponseEntity<GiftItem> claimGift(@PathVariable UUID id, @RequestBody java.util.Map<String, UUID> body) {
        return ResponseEntity.ok(service.claimGift(TenantContext.getTenantId(), id, body.get("guestId")));
    }

    @GetMapping("/funds")
    @RequiresPermission(section = "gifts", permission = "read")
    public ResponseEntity<List<CashFund>> findAllFunds() {
        return ResponseEntity.ok(service.findAllFunds(TenantContext.getTenantId()));
    }

    @PostMapping("/funds")
    @RequiresPermission(section = "gifts", permission = "write")
    public ResponseEntity<CashFund> createFund(@Valid @RequestBody CashFundRequest request) {
        return ResponseEntity.ok(service.createFund(TenantContext.getTenantId(), request));
    }

    @PutMapping("/funds/{id}")
    @RequiresPermission(section = "gifts", permission = "write")
    public ResponseEntity<CashFund> updateFund(@PathVariable UUID id, @Valid @RequestBody CashFundRequest request) {
        return ResponseEntity.ok(service.updateFund(TenantContext.getTenantId(), id, request));
    }

    @DeleteMapping("/funds/{id}")
    @RequiresPermission(section = "gifts", permission = "write")
    public ResponseEntity<Void> deleteFund(@PathVariable UUID id) {
        service.deleteFund(TenantContext.getTenantId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/funds/{id}/donate")
    public ResponseEntity<CashGiftDonation> donate(@PathVariable UUID id, @Valid @RequestBody DonateRequest request) {
        return ResponseEntity.ok(service.donate(TenantContext.getTenantId(), id, request));
    }

    @GetMapping("/funds/{id}/donations")
    @RequiresPermission(section = "gifts", permission = "read")
    public ResponseEntity<Page<CashGiftDonation>> findDonations(@PathVariable UUID id, Pageable pageable) {
        return ResponseEntity.ok(service.findDonations(TenantContext.getTenantId(), id, pageable));
    }
}
