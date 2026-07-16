package com.weddingwire.dashboard;

import com.weddingwire.budget.BudgetRepository;
import com.weddingwire.checklist.ChecklistRepository;
import com.weddingwire.crew.CrewRepository;
import com.weddingwire.gift.CashGiftDonationRepository;
import com.weddingwire.guest.GuestRepository;
import com.weddingwire.photo.PhotoRepository;
import com.weddingwire.vendor.VendorRepository;
import com.weddingwire.wedding.Wedding;
import com.weddingwire.wedding.WeddingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WeddingRepository weddingRepo;
    private final GuestRepository guestRepo;
    private final BudgetRepository budgetRepo;
    private final ChecklistRepository checklistRepo;
    private final VendorRepository vendorRepo;
    private final CrewRepository crewRepo;
    private final PhotoRepository photoRepo;
    private final CashGiftDonationRepository donationRepo;

    public DashboardResponse getDashboard(UUID tenantId) {
        Wedding wedding = weddingRepo.findByTenantId(tenantId).orElse(null);

        LocalDate weddingDate = wedding != null ? wedding.getDate() : null;
        long daysUntil = weddingDate != null ? ChronoUnit.DAYS.between(LocalDate.now(), weddingDate) : 0;

        return DashboardResponse.builder()
                .weddingDate(weddingDate)
                .daysUntilWedding(daysUntil)
                .partner1(wedding != null ? wedding.getPartner1() : "")
                .partner2(wedding != null ? wedding.getPartner2() : "")
                .guestCount(guestRepo.countByTenantId(tenantId))
                .rsvpConfirmed(guestRepo.countByTenantIdAndRsvpStatus(tenantId, "confirmed"))
                .rsvpPending(guestRepo.countByTenantIdAndRsvpStatus(tenantId, "pending"))
                .rsvpDeclined(guestRepo.countByTenantIdAndRsvpStatus(tenantId, "declined"))
                .budgetPlanned(budgetRepo.sumPlanned(tenantId))
                .budgetActual(budgetRepo.sumActual(tenantId))
                .checklistCompleted(checklistRepo.countByTenantIdAndCompleted(tenantId, true))
                .checklistTotal(checklistRepo.countByTenantId(tenantId))
                .vendorCount(vendorRepo.countByTenantId(tenantId))
                .crewCount(crewRepo.countByTenantId(tenantId))
                .photoCount(photoRepo.countByTenantId(tenantId))
                .cashGiftTotal(donationRepo.sumCompletedByTenant(tenantId))
                .build();
    }
}
