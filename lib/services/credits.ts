/**
 * Credits service — enforces critical path #1 (HARD cap per tier).
 *
 * Spec rule: deduct credit BEFORE submitting a render job. Refund on render
 * failure. Idempotent per (userId, videoId) so retries never double-deduct.
 *
 * Caps are HARD — never pay-per-extra, never surprise charges. When a user
 * reaches their cap, we pause (402) and ask them to upgrade.
 *
 *   - Starter: 15 videos/month
 *   - Solo:    40 videos/month
 *   - Creator: 65 videos/month
 *   - Studio:  92 videos/month
 *   - Trial:   23 videos (one full week of Studio)
 *
 * Storage:
 *   - Dev (no NOCODEBACKEND_SECRET_KEY): in-memory mock in nocodebackend.mock.
 *   - Prod: `monthly_video_renders` table via db.real. Atomicity comes from a
 *     unique index on (clerk_user_id, year_month, video_id) + INSERT-IGNORE +
 *     post-count + conditional DELETE rollback when a race pushed us over cap.
 *     See comments in db.real.ts for the full protocol.
 */

import {
  addMonthlyVideoRender,
  getMonthlyVideoUsage,
  getUserByClerkId,
  hasMonthlyVideoRender,
  removeMonthlyVideoRender,
} from "@/lib/services/db";
import type { SubscriptionTier } from "@/lib/types/user";

export const MONTHLY_VIDEO_BUDGET: Record<SubscriptionTier, number> = {
  trial: 23,
  starter: 15,
  solo: 40,
  creator: 65,
  studio: 92,
};

export type DeductionResult =
  | { ok: true; alreadyDeducted: boolean; remaining: number; budget: number }
  | { ok: false; reason: "INSUFFICIENT_CREDITS"; remaining: 0; budget: number }
  | { ok: false; reason: "USER_NOT_FOUND" };

export type RefundResult =
  | { ok: true; refunded: boolean; remaining: number }
  | { ok: false; reason: "USER_NOT_FOUND" };

function currentYearMonth(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Deduct one render credit for `videoId`. Idempotent per (userId, videoId, month).
 * MUST be awaited before submitting the render job.
 */
export async function deductCreditForRender(
  userId: string,
  videoId: string
): Promise<DeductionResult> {
  if (!userId || !videoId) {
    return { ok: false, reason: "USER_NOT_FOUND" };
  }

  const user = await getUserByClerkId(userId).catch(() => null);
  if (!user) {
    return { ok: false, reason: "USER_NOT_FOUND" };
  }

  const budget = MONTHLY_VIDEO_BUDGET[user.subscriptionTier];
  const yearMonth = currentYearMonth();

  const result = await addMonthlyVideoRender(userId, yearMonth, videoId, budget);

  if (result.atCap) {
    return {
      ok: false,
      reason: "INSUFFICIENT_CREDITS",
      remaining: 0,
      budget,
    };
  }

  return {
    ok: true,
    alreadyDeducted: !result.added,
    remaining: Math.max(0, budget - result.count),
    budget,
  };
}

/**
 * Refund one credit when a render job fails. Idempotent: a second refund for
 * the same videoId is a no-op.
 *
 * Only refunds within the SAME month the deduction happened. If a render
 * spans a month boundary and fails, the credit stays consumed in the
 * deduction month — we don't try to time-travel.
 */
export async function refundCreditForRender(
  userId: string,
  videoId: string
): Promise<RefundResult> {
  if (!userId || !videoId) {
    return { ok: false, reason: "USER_NOT_FOUND" };
  }

  const user = await getUserByClerkId(userId).catch(() => null);
  if (!user) {
    return { ok: false, reason: "USER_NOT_FOUND" };
  }

  const budget = MONTHLY_VIDEO_BUDGET[user.subscriptionTier];
  const yearMonth = currentYearMonth();

  const result = await removeMonthlyVideoRender(userId, yearMonth, videoId);

  return {
    ok: true,
    refunded: result.removed,
    remaining: Math.max(0, budget - result.count),
  };
}

/**
 * Read-only: current month usage for a user. Used by the dashboard header
 * and billing-settings usage panel. Does NOT mutate state.
 */
export async function getUsageForUser(
  clerkUserId: string
): Promise<{ used: number; cap: number; tier: SubscriptionTier; resetAt: string } | null> {
  if (!clerkUserId) return null;
  const user = await getUserByClerkId(clerkUserId).catch(() => null);
  if (!user) return null;
  const tier = user.subscriptionTier;
  const cap = MONTHLY_VIDEO_BUDGET[tier];
  const yearMonth = currentYearMonth();
  const used = await getMonthlyVideoUsage(clerkUserId, yearMonth).catch(() => 0);
  return { used, cap, tier, resetAt: nextMonthResetIso() };
}

/**
 * ISO timestamp for the first instant of next month (UTC). Used in
 * quota-exhausted responses so clients can render "wait until {resetAt}".
 */
export function nextMonthResetIso(now = new Date()): string {
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return next.toISOString();
}

/**
 * Test-only helper: clear in-memory state.
 * In prod this is a no-op — state lives in the DB and should be cleaned via
 * SQL directly. The mock exports its own _resetMonthlyVideoRenders but we
 * can't import it here without creating a prod dependency on the mock module,
 * so we go through a dynamic import guarded by NODE_ENV.
 */
export async function _resetCreditsForTests(): Promise<void> {
  // Imported lazily so production bundles don't pull in the mock.
  if (process.env.NODE_ENV === "production") return;
  // Silence ts/eslint on the dynamic import — the mock is dev/test-only.
  const m = await import("@/lib/mock/nocodebackend.mock");
  if (typeof m._resetMonthlyVideoRenders === "function") {
    m._resetMonthlyVideoRenders();
  }
  // Also silence Node's "hasMonthlyVideoRender" by accessing — no-op call not needed.
  void hasMonthlyVideoRender;
}
