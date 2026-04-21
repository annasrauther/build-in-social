import { describe, it, expect } from "vitest";
import {
  MONTHLY_CREDIT_ALLOCATION,
  getMonthlyAllocation,
} from "./tiers";
import type { SubscriptionTier } from "@/lib/types/user";
import { CREDIT_COSTS } from "./costs";

const ALL_TIERS: SubscriptionTier[] = ["trial", "starter", "solo", "creator", "studio"];
const PAID_LADDER: SubscriptionTier[] = ["starter", "solo", "creator", "studio"];

describe("MONTHLY_CREDIT_ALLOCATION", () => {
  it("defines a positive allocation for every tier", () => {
    for (const tier of ALL_TIERS) {
      expect(MONTHLY_CREDIT_ALLOCATION[tier]).toBeGreaterThan(0);
    }
  });

  it("paid tiers monotonically increase up the ladder", () => {
    for (let i = 1; i < PAID_LADDER.length; i++) {
      const prev = MONTHLY_CREDIT_ALLOCATION[PAID_LADDER[i - 1]];
      const curr = MONTHLY_CREDIT_ALLOCATION[PAID_LADDER[i]];
      expect(curr).toBeGreaterThan(prev);
    }
  });

  it("every paid tier can afford at least one HeyGen render per month", () => {
    // Core viability check — if Starter can't afford any HeyGen video, the
    // "HeyGen available on all paid plans" landing-page claim is a lie.
    const heygenCost = CREDIT_COSTS["heygen-licensed"];
    for (const tier of PAID_LADDER) {
      expect(MONTHLY_CREDIT_ALLOCATION[tier]).toBeGreaterThanOrEqual(heygenCost);
    }
  });

  it("trial mirrors Starter — evaluators get the same budget as the entry paid tier", () => {
    expect(MONTHLY_CREDIT_ALLOCATION.trial).toBe(MONTHLY_CREDIT_ALLOCATION.starter);
  });
});

describe("getMonthlyAllocation", () => {
  it("returns the table value for each tier", () => {
    for (const tier of ALL_TIERS) {
      expect(getMonthlyAllocation(tier)).toBe(MONTHLY_CREDIT_ALLOCATION[tier]);
    }
  });
});
