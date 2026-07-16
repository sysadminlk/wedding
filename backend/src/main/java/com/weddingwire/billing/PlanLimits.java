package com.weddingwire.billing;

public record PlanLimits(
        int maxGuests,
        int maxPhotos,
        int maxMemories,
        int maxMenuItems,
        int maxCrew,
        int priceMonthlyLkr
) {
    public long priceMonthlyCents() {
        return (long) priceMonthlyLkr * 100;
    }
}
