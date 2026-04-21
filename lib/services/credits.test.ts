/**
 * Critical path #1: credit deduction before render.
 *
 * Spec rules:
 *   - deduct credit BEFORE submitting the render job
 *   - refund on render failure
 *   - never double-deduct (idempotent per (userId, videoId, month))
 *   - reject when user is over budget for their tier
 *   - cost depends on render kind (faceless = 1, heygen = 15)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  // Fresh in-memory store per test run. Mirrors the mock nocodebackend
  // contract: videos stored with their cost so SUM(cost) = creditsUsed.
  const store = new Map<string, Map<string, number>>();
  const keyOf = (u: string, m: string) => `${u}:${m}`;
  const getMap = (u: string, m: string) => {
    let s = store.get(keyOf(u, m));
    if (!s) {
      s = new Map();
      store.set(keyOf(u, m), s);
    }
    return s;
  };
  const sumCost = (m: Map<string, number>): number => {
    let total = 0;
    for (const c of m.values()) total += c;
    return total;
  };
  return {
    getUserByClerkId: vi.fn(),
    getMonthlyVideoUsage: vi.fn(async (u: string, m: string) => sumCost(getMap(u, m))),
    hasMonthlyVideoRender: vi.fn(async (u: string, m: string, v: string) =>
      getMap(u, m).has(v)
    ),
    addMonthlyVideoRender: vi.fn(
      async (u: string, m: string, v: string, cost: number, budget: number) => {
        const s = getMap(u, m);
        if (s.has(v)) return { added: false, count: sumCost(s), atCap: false };
        const current = sumCost(s);
        if (current + cost > budget) return { added: false, count: current, atCap: true };
        s.set(v, cost);
        return { added: true, count: sumCost(s), atCap: false };
      }
    ),
    removeMonthlyVideoRender: vi.fn(async (u: string, m: string, v: string) => {
      const s = getMap(u, m);
      if (!s.has(v)) return { removed: false, count: sumCost(s) };
      s.delete(v);
      return { removed: true, count: sumCost(s) };
    }),
    __reset: () => store.clear(),
  };
});

vi.mock("@/lib/services/db", () => ({
  getUserByClerkId: mocks.getUserByClerkId,
  getMonthlyVideoUsage: mocks.getMonthlyVideoUsage,
  hasMonthlyVideoRender: mocks.hasMonthlyVideoRender,
  addMonthlyVideoRender: mocks.addMonthlyVideoRender,
  removeMonthlyVideoRender: mocks.removeMonthlyVideoRender,
}));

vi.mock("@/lib/mock/nocodebackend.mock", () => ({
  _resetMonthlyVideoRenders: () => mocks.__reset(),
}));

import {
  deductCreditForRender,
  refundCreditForRender,
  MONTHLY_VIDEO_BUDGET,
  _resetCreditsForTests,
} from "./credits";
import { getMonthlyAllocation, getCreditCost } from "@/lib/credits";
import type { SubscriptionTier } from "@/lib/types/user";

function userWithTier(tier: SubscriptionTier) {
  return {
    id: "db_user_01",
    clerkUserId: "clerk_user_01",
    email: "test@example.com",
    displayName: "Test",
    brandName: "",
    tone: "casual" as const,
    platforms: [],
    onboardingComplete: true,
    subscriptionTier: tier,
    createdAt: new Date().toISOString(),
  };
}

describe("deductCreditForRender — faceless (default kind)", () => {
  beforeEach(async () => {
    await _resetCreditsForTests();
    mocks.getUserByClerkId.mockReset();
  });

  it("deducts one credit on first call — faceless costs 1", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("creator"));
    const result = await deductCreditForRender("clerk_user_01", "video_01");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.alreadyDeducted).toBe(false);
      expect(result.budget).toBe(getMonthlyAllocation("creator"));
      expect(result.cost).toBe(1);
      expect(result.remaining).toBe(getMonthlyAllocation("creator") - 1);
    }
  });

  it("is idempotent — second call for same videoId does not double-deduct", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("solo"));
    const first = await deductCreditForRender("clerk_user_01", "video_01");
    const second = await deductCreditForRender("clerk_user_01", "video_01");

    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.alreadyDeducted).toBe(true);
      expect(second.cost).toBe(0);
      expect(second.remaining).toBe(first.remaining);
    }
  });

  it("counts distinct videoIds independently", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("solo"));
    await deductCreditForRender("clerk_user_01", "video_01");
    const result = await deductCreditForRender("clerk_user_01", "video_02");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.remaining).toBe(getMonthlyAllocation("solo") - 2);
    }
  });

  it("rejects when user is at budget cap with INSUFFICIENT_CREDITS", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("trial"));
    const budget = getMonthlyAllocation("trial");
    for (let i = 0; i < budget; i++) {
      const r = await deductCreditForRender("clerk_user_01", `video_${i}`);
      expect(r.ok).toBe(true);
    }
    const overflow = await deductCreditForRender("clerk_user_01", "video_overflow");
    expect(overflow.ok).toBe(false);
    if (!overflow.ok) {
      expect(overflow.reason).toBe("INSUFFICIENT_CREDITS");
    }
  });

  it("MONTHLY_VIDEO_BUDGET is aliased to the tier credit allocation", async () => {
    expect(MONTHLY_VIDEO_BUDGET.starter).toBe(getMonthlyAllocation("starter"));
    expect(MONTHLY_VIDEO_BUDGET.studio).toBe(getMonthlyAllocation("studio"));
  });

  it("Starter can ship exactly `allocation` faceless videos then 402s on the next", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("starter"));
    const allocation = getMonthlyAllocation("starter");
    for (let i = 0; i < allocation; i++) {
      const r = await deductCreditForRender("clerk_user_01", `video_${i}`);
      expect(r.ok).toBe(true);
    }
    const overflow = await deductCreditForRender("clerk_user_01", "video_overflow");
    expect(overflow.ok).toBe(false);
    if (!overflow.ok) expect(overflow.reason).toBe("INSUFFICIENT_CREDITS");
  });

  it("returns USER_NOT_FOUND when the user lookup fails", async () => {
    mocks.getUserByClerkId.mockResolvedValue(null);
    const result = await deductCreditForRender("clerk_unknown", "video_01");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("USER_NOT_FOUND");
    }
  });

  it("rejects empty userId or videoId without consulting DB", async () => {
    const a = await deductCreditForRender("", "video_01");
    const b = await deductCreditForRender("clerk_user_01", "");
    expect(a.ok).toBe(false);
    expect(b.ok).toBe(false);
    expect(mocks.getUserByClerkId).not.toHaveBeenCalled();
  });
});

describe("deductCreditForRender — HeyGen renders charge 15 credits", () => {
  beforeEach(async () => {
    await _resetCreditsForTests();
    mocks.getUserByClerkId.mockReset();
  });

  it("charges `heygen-licensed` at its configured cost", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("creator"));
    const result = await deductCreditForRender(
      "clerk_user_01",
      "video_01",
      "heygen-licensed"
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.cost).toBe(getCreditCost("heygen-licensed"));
      expect(result.remaining).toBe(
        getMonthlyAllocation("creator") - getCreditCost("heygen-licensed")
      );
    }
  });

  it("charges `heygen-twin` at the same cost as licensed (both hit HeyGen)", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("creator"));
    const result = await deductCreditForRender(
      "clerk_user_01",
      "video_01",
      "heygen-twin"
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.cost).toBe(getCreditCost("heygen-twin"));
  });

  it("Starter cannot afford a HeyGen render if the month's faceless usage already ate most of the budget", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("starter"));
    // Burn 16 faceless credits on Starter (allocation = 30) — 14 remain.
    for (let i = 0; i < 16; i++) {
      await deductCreditForRender("clerk_user_01", `f_${i}`);
    }
    const heygen = await deductCreditForRender(
      "clerk_user_01",
      "h_1",
      "heygen-licensed"
    );
    expect(heygen.ok).toBe(false);
    if (!heygen.ok) expect(heygen.reason).toBe("INSUFFICIENT_CREDITS");
  });

  it("stock-ai-avatar shares the faceless cost — 1 credit", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("starter"));
    const result = await deductCreditForRender(
      "clerk_user_01",
      "video_01",
      "stock-ai-avatar"
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.cost).toBe(1);
  });
});

describe("refundCreditForRender", () => {
  beforeEach(async () => {
    await _resetCreditsForTests();
    mocks.getUserByClerkId.mockReset();
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("creator"));
  });

  it("refunds a previously-deducted faceless credit", async () => {
    await deductCreditForRender("clerk_user_01", "video_01");
    const refund = await refundCreditForRender("clerk_user_01", "video_01");
    expect(refund.ok).toBe(true);
    if (refund.ok) {
      expect(refund.refunded).toBe(true);
      expect(refund.remaining).toBe(getMonthlyAllocation("creator"));
    }
  });

  it("refunds a HeyGen render — returns the full 15 credits to the pool", async () => {
    await deductCreditForRender("clerk_user_01", "video_01", "heygen-licensed");
    const refund = await refundCreditForRender("clerk_user_01", "video_01");
    expect(refund.ok).toBe(true);
    if (refund.ok) {
      expect(refund.remaining).toBe(getMonthlyAllocation("creator"));
    }
  });

  it("is idempotent — refunding twice is a no-op the second time", async () => {
    await deductCreditForRender("clerk_user_01", "video_01");
    await refundCreditForRender("clerk_user_01", "video_01");
    const second = await refundCreditForRender("clerk_user_01", "video_01");
    expect(second.ok).toBe(true);
    if (second.ok) {
      expect(second.refunded).toBe(false);
    }
  });

  it("refunding an unknown video is a no-op", async () => {
    const r = await refundCreditForRender("clerk_user_01", "video_never_deducted");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.refunded).toBe(false);
    }
  });

  it("after refund, the same video can be re-deducted", async () => {
    await deductCreditForRender("clerk_user_01", "video_01");
    await refundCreditForRender("clerk_user_01", "video_01");
    const reDeduct = await deductCreditForRender("clerk_user_01", "video_01");
    expect(reDeduct.ok).toBe(true);
    if (reDeduct.ok) {
      expect(reDeduct.alreadyDeducted).toBe(false);
    }
  });
});
