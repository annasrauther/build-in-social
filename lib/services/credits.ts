/**
 * Credits service — enforces critical path #1 (HARD cap per tier).
 *
 * Spec rule: deduct credit BEFORE submitting a render job. Refund on render
 * failure. Idempotent per (userId, videoId, month) so retries never
 * double-deduct.
 *
 * The pricing axis is a credit pool that scales by render kind:
 *   - faceless + stock-AI avatar → 1 credit per video
 *   - HeyGen (licensed or twin)  → 15 credits per video
 * See lib/credits/costs.ts for the authoritative cost table and
 * lib/credits/tiers.ts for monthly allocations.
 *
 * Caps are HARD — never pay-per-extra, never surprise charges. When a user
 * reaches their budget we return 402 and surface an upgrade CTA.
 *
 * Storage:
 *   - Dev (no NOCODEBACKEND_SECRET_KEY): in-memory mock in nocodebackend.mock.
 *   - Prod: `monthly_video_renders` table via db.real. Atomicity comes from a
 *     unique index on (clerk_user_id, year_month, video_id) + INSERT-IGNORE +
 *     SUM-post-check + conditional DELETE rollback when a race pushed us
 *     over budget. Full protocol in db.real.ts.
 */

import {
  addMonthlyVideoRender,
  getMonthlyVideoUsage,
  getUserByClerkId,
  hasMonthlyVideoRender,
  removeMonthlyVideoRender,
} from "@/lib/services/db";
import type { SubscriptionTier } from "@/lib/types/user";
import {
  getCreditCost,
  getMonthlyAllocation,
  type RenderKind,
} from "@/lib/credits";

/**
 * @deprecated Use `getMonthlyAllocation(tier)` from `@/lib/credits` instead.
 * Kept as a re-export so any call sites that still read the table continue
 * to work. The values now mean *credits per month*, not *videos per month*.
 */
export const MONTHLY_VIDEO_BUDGET: Record<SubscriptionTier, number> = {
  trial: getMonthlyAllocation("trial"),
  starter: getMonthlyAllocation("starter"),
  solo: getMonthlyAllocation("solo"),
  creator: getMonthlyAllocation("creator"),
  studio: getMonthlyAllocation("studio"),
};

export type DeductionResult =
  | {
      ok: true;
      alreadyDeducted: boolean;
      remaining: number;
      budget: number;
      /** Credits this render consumed (0 when alreadyDeducted). */
      cost: number;
    }
  | {
      ok: false;
      reason: "INSUFFICIENT_CREDITS";
      remaining: 0;
      budget: number;
      /** Cost that would have been deducted had there been budget. */
      cost: number;
    }
  | { ok: false; reason: "USER_NOT_FOUND" };

export type RefundResult =
  | { ok: true; refunded: boolean; remaining: number }
  | { ok: false; reason: "USER_NOT_FOUND" };

function currentYearMonth(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Deduct credits for a render of `kind`. Idempotent per (userId, videoId, month).
 * MUST be awaited before submitting the render job.
 *
 * @param kind Defaults to "faceless" so older callers continue to work; new
 *             code should pass the actual kind so HeyGen renders bill 15
 *             credits instead of 1.
 */
export async function deductCreditForRender(
  userId: string,
  videoId: string,
  kind: RenderKind = "faceless"
): Promise<DeductionResult> {
  if (!userId || !videoId) {
    return { ok: false, reason: "USER_NOT_FOUND" };
  }

  const user = await getUserByClerkId(userId).catch(() => null);
  if (!user) {
    return { ok: false, reason: "USER_NOT_FOUND" };
  }

  const budget = getMonthlyAllocation(user.subscriptionTier);
  const cost = getCreditCost(kind);
  const yearMonth = currentYearMonth();

  const result = await addMonthlyVideoRender(userId, yearMonth, videoId, cost, budget);

  if (result.atCap) {
    return {
      ok: false,
      reason: "INSUFFICIENT_CREDITS",
      remaining: 0,
      budget,
      cost,
    };
  }

  return {
    ok: true,
    alreadyDeducted: !result.added,
    remaining: Math.max(0, budget - result.count),
    budget,
    cost: result.added ? cost : 0,
  };
}

/**
 * Refund the credits consumed by `videoId` if a render job fails. Idempotent —
 * a second refund for the same videoId is a no-op.
 *
 * The persistence layer stores the original cost on the row, so this function
 * doesn't need to know what kind of render was being billed — deleting the
 * row restores whatever credits it had consumed.
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

  const budget = getMonthlyAllocation(user.subscriptionTier);
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
  const cap = getMonthlyAllocation(tier);
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
  if (process.env.NODE_ENV === "production") return;
  const m = await import("@/lib/mock/nocodebackend.mock");
  if (typeof m._resetMonthlyVideoRenders === "function") {
    m._resetMonthlyVideoRenders();
  }
  // Silence ts/eslint on the unused import — the guard above is all we need.
  void hasMonthlyVideoRender;
}
