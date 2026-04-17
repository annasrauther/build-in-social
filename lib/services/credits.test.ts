/**
 * Critical path #1: credit deduction before render.
 *
 * Spec rules:
 *   - deduct credit BEFORE submitting the render job
 *   - refund on render failure
 *   - never double-deduct (idempotent per (userId, videoId, month))
 *   - reject when user is over budget for their tier
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserByClerkId: vi.fn(),
}));

vi.mock("@/lib/services/db", () => ({
  getUserByClerkId: mocks.getUserByClerkId,
}));

import {
  deductCreditForRender,
  refundCreditForRender,
  MONTHLY_VIDEO_BUDGET,
  _resetCreditsForTests,
} from "./credits";
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

describe("deductCreditForRender", () => {
  beforeEach(() => {
    _resetCreditsForTests();
    mocks.getUserByClerkId.mockReset();
  });

  it("deducts one credit on first call and reports remaining = budget - 1", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("creator"));
    const result = await deductCreditForRender("clerk_user_01", "video_01");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.alreadyDeducted).toBe(false);
      expect(result.budget).toBe(MONTHLY_VIDEO_BUDGET.creator);
      expect(result.remaining).toBe(MONTHLY_VIDEO_BUDGET.creator - 1);
    }
  });

  it("is idempotent — second call for same videoId does not double-deduct", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("solo"));
    const first = await deductCreditForRender("clerk_user_01", "video_01");
    const second = await deductCreditForRender("clerk_user_01", "video_01");

    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.alreadyDeducted).toBe(true);
      expect(second.remaining).toBe(first.remaining);
    }
  });

  it("counts distinct videoIds independently", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("solo"));
    await deductCreditForRender("clerk_user_01", "video_01");
    const result = await deductCreditForRender("clerk_user_01", "video_02");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.remaining).toBe(MONTHLY_VIDEO_BUDGET.solo - 2);
    }
  });

  it("rejects when user is at budget cap with INSUFFICIENT_CREDITS", async () => {
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("trial"));
    const budget = MONTHLY_VIDEO_BUDGET.trial;
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

describe("refundCreditForRender", () => {
  beforeEach(() => {
    _resetCreditsForTests();
    mocks.getUserByClerkId.mockReset();
    mocks.getUserByClerkId.mockResolvedValue(userWithTier("creator"));
  });

  it("refunds a previously-deducted credit", async () => {
    await deductCreditForRender("clerk_user_01", "video_01");
    const refund = await refundCreditForRender("clerk_user_01", "video_01");
    expect(refund.ok).toBe(true);
    if (refund.ok) {
      expect(refund.refunded).toBe(true);
      expect(refund.remaining).toBe(MONTHLY_VIDEO_BUDGET.creator);
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
