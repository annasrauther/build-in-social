/**
 * Credits service — enforces critical path #1.
 *
 * Spec rule: deduct credit BEFORE submitting a render job. Refund on render
 * failure. Idempotent per (userId, videoId) so retries never double-deduct.
 *
 * Plan budgets come from knowledge-center.md §9:
 *   - Solo:    ~40 videos/month
 *   - Creator: ~65 videos/month
 *   - Studio:  ~92 videos/month
 *   - Trial:   23 videos (one full week)
 *
 * Storage model: a `month_video_usage` table keyed by (user_id, year_month)
 * with a JSON `videoIds` column tracking which videos have been deducted
 * this month. The set is the idempotency key.
 *
 * Implementation: thin in-memory mock now, NCB-backed implementation when
 * NOCODEBACKEND_SECRET_KEY is set. The mock is good enough for tests AND
 * for the no-key dev workflow the rest of the app uses.
 */

import { getUserByClerkId } from "@/lib/services/db";
import type { SubscriptionTier } from "@/lib/types/user";

export const MONTHLY_VIDEO_BUDGET: Record<SubscriptionTier, number> = {
  trial: 23,
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

interface UsageRecord {
  userId: string;
  yearMonth: string; // e.g. "2026-04"
  videoIds: Set<string>;
}

const usage = new Map<string, UsageRecord>();

function key(userId: string, yearMonth: string): string {
  return `${userId}:${yearMonth}`;
}

function currentYearMonth(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getOrCreate(userId: string, yearMonth: string): UsageRecord {
  const k = key(userId, yearMonth);
  let record = usage.get(k);
  if (!record) {
    record = { userId, yearMonth, videoIds: new Set() };
    usage.set(k, record);
  }
  return record;
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
  const record = getOrCreate(userId, yearMonth);

  // Idempotency: same video already deducted this month → return existing balance.
  if (record.videoIds.has(videoId)) {
    return {
      ok: true,
      alreadyDeducted: true,
      remaining: Math.max(0, budget - record.videoIds.size),
      budget,
    };
  }

  // Budget check.
  if (record.videoIds.size >= budget) {
    return {
      ok: false,
      reason: "INSUFFICIENT_CREDITS",
      remaining: 0,
      budget,
    };
  }

  record.videoIds.add(videoId);
  return {
    ok: true,
    alreadyDeducted: false,
    remaining: Math.max(0, budget - record.videoIds.size),
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
  const record = usage.get(key(userId, yearMonth));

  if (!record || !record.videoIds.has(videoId)) {
    return { ok: true, refunded: false, remaining: budget - (record?.videoIds.size ?? 0) };
  }

  record.videoIds.delete(videoId);
  return {
    ok: true,
    refunded: true,
    remaining: Math.max(0, budget - record.videoIds.size),
  };
}

/** Test-only helper: clear in-memory state. */
export function _resetCreditsForTests(): void {
  usage.clear();
}
