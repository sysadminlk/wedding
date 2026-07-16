package com.weddingwire.billing;

import java.util.EnumMap;
import java.util.Map;

public class PlanConfig {

    private static final Map<PlanTier, PlanLimits> LIMITS = new EnumMap<>(PlanTier.class);

    static {
        LIMITS.put(PlanTier.FREE, new PlanLimits(50, 50, 10, 20, 10, 0));
        LIMITS.put(PlanTier.PREMIUM, new PlanLimits(500, 500, 100, 100, 50, 2900));
        LIMITS.put(PlanTier.PLANNER, new PlanLimits(9999, 9999, 9999, 9999, 9999, 9900));
    }

    public static PlanLimits limits(PlanTier tier) {
        return LIMITS.get(tier);
    }
}
