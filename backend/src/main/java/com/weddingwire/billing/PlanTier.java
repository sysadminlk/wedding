package com.weddingwire.billing;

public enum PlanTier {
    FREE,
    PREMIUM,
    PLANNER;

    public static PlanLimits limits(PlanTier tier) {
        return switch (tier) {
            case FREE -> new PlanLimits(50, 50, 10, 20, 10, 0);
            case PREMIUM -> new PlanLimits(500, 500, 100, 100, 50, 2900);
            case PLANNER -> new PlanLimits(9999, 9999, 9999, 9999, 9999, 9900);
        };
    }
}
