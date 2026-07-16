package com.weddingwire.gift;

import com.weddingwire.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GiftService {

    private final GiftRepository giftRepo;
    private final CashFundRepository fundRepo;
    private final CashGiftDonationRepository donationRepo;

    // Gift Items
    public Page<GiftItem> findAllGifts(UUID tenantId, Pageable pageable) {
        return giftRepo.findByTenantId(tenantId, pageable);
    }

    public GiftItem createGift(UUID tenantId, GiftRequest request) {
        GiftItem item = GiftItem.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .imageS3Key(request.getImageS3Key())
                .storeLink(request.getStoreLink())
                .note(request.getNote())
                .build();
        return giftRepo.save(item);
    }

    public GiftItem updateGift(UUID tenantId, UUID id, GiftRequest request) {
        GiftItem item = giftRepo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("GiftItem", "id", id));
        item.setName(request.getName());
        item.setImageS3Key(request.getImageS3Key());
        item.setStoreLink(request.getStoreLink());
        item.setNote(request.getNote());
        return giftRepo.save(item);
    }

    public void deleteGift(UUID tenantId, UUID id) {
        giftRepo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("GiftItem", "id", id));
        giftRepo.deleteByTenantIdAndId(tenantId, id);
    }

    public GiftItem claimGift(UUID tenantId, UUID id, UUID guestId) {
        GiftItem item = giftRepo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("GiftItem", "id", id));
        item.setClaimedByGuestId(guestId);
        item.setClaimedAt(LocalDateTime.now());
        return giftRepo.save(item);
    }

    // Cash Funds
    public java.util.List<CashFund> findAllFunds(UUID tenantId) {
        return fundRepo.findByTenantId(tenantId);
    }

    public CashFund createFund(UUID tenantId, CashFundRequest request) {
        CashFund fund = CashFund.builder()
                .tenantId(tenantId)
                .label(request.getLabel())
                .paymentLink(request.getPaymentLink())
                .icon(request.getIcon())
                .goalAmount(request.getGoalAmount())
                .build();
        return fundRepo.save(fund);
    }

    public CashFund updateFund(UUID tenantId, UUID id, CashFundRequest request) {
        CashFund fund = fundRepo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("CashFund", "id", id));
        fund.setLabel(request.getLabel());
        fund.setPaymentLink(request.getPaymentLink());
        fund.setIcon(request.getIcon());
        fund.setGoalAmount(request.getGoalAmount());
        return fundRepo.save(fund);
    }

    public void deleteFund(UUID tenantId, UUID id) {
        fundRepo.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("CashFund", "id", id));
        fundRepo.deleteByTenantIdAndId(tenantId, id);
    }

    // Donations
    public CashGiftDonation donate(UUID tenantId, UUID fundId, DonateRequest request) {
        fundRepo.findByTenantIdAndId(tenantId, fundId)
                .orElseThrow(() -> new ResourceNotFoundException("CashFund", "id", fundId));

        CashGiftDonation donation = CashGiftDonation.builder()
                .tenantId(tenantId)
                .cashFundId(fundId)
                .guestId(request.getGuestId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .message(request.getMessage())
                .status("pending")
                .build();
        return donationRepo.save(donation);
    }

    public Page<CashGiftDonation> findDonations(UUID tenantId, UUID fundId, Pageable pageable) {
        return donationRepo.findByCashFundIdOrderByCreatedAtDesc(fundId, pageable);
    }
}
