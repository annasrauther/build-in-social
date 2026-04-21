/**
 * Pure credit-balance math. No DB, no side effects — persistence is wired at
 * the API-route layer in a later slice. These helpers let the render
 * endpoints, the cron scheduler, and the UI share one model of what a user
 * has available this period.
 *
 * Top-off credits never expire (autoshorts parity — see plan §2.5). Monthly
 * allocation resets each billing period; consumed resets with it.
 */

import type { SubscriptionTier } from "@/lib/types/user";
import { getMonthlyAllocation } from "./tiers";
import { getCreditCost, type RenderKind } from "./costs";

export interface CreditBalance {
  tier: SubscriptionTier;
  /** Monthly allocation for the tier at the start of this period. */
  monthlyAllocation: number;
  /** Credits consumed so far this billing period. */
  consumed: number;
  /** Purchased top-off credits. Never expire; survive period resets. */
  topoffs: number;
}

export interface CreditDeductionResult {
  ok: boolean;
  balance: CreditBalance;
  /** Reason present iff `ok === false`. */
  reason?: "insufficient_credits";
  /** Credits taken from each pool, in order. Present iff `ok === true`. */
  drawn?: { fromMonthly: number; fromTopoffs: number };
}

/** Construct a fresh balance for a tier at the start of a billing period. */
export function newBalance(tier: SubscriptionTier, topoffs = 0): CreditBalance {
  return {
    tier,
    monthlyAllocation: getMonthlyAllocation(tier),
    consumed: 0,
    topoffs,
  };
}

/** Credits remaining this period (monthly pool + top-offs). */
export function remainingCredits(b: CreditBalance): number {
  return Math.max(0, b.monthlyAllocation - b.consumed) + b.topoffs;
}

/** True if the balance can cover `cost` credits right now. */
export function canAfford(b: CreditBalance, cost: number): boolean {
  if (cost < 0) return false;
  return remainingCredits(b) >= cost;
}

/** True if the balance can cover a render of `kind`. */
export function canAffordRender(b: CreditBalance, kind: RenderKind): boolean {
  return canAfford(b, getCreditCost(kind));
}

/**
 * Deduct `cost` credits from a balance. Monthly pool is drawn first; the
 * remainder comes from top-offs. Returns a new balance (pure) plus a split
 * showing which pool was hit — useful for accounting / usage charts.
 *
 * On insufficient credits, returns `{ ok: false }` with the balance
 * unchanged. No partial deductions.
 */
export function deduct(b: CreditBalance, cost: number): CreditDeductionResult {
  if (cost < 0) {
    return { ok: false, balance: b, reason: "insufficient_credits" };
  }
  if (!canAfford(b, cost)) {
    return { ok: false, balance: b, reason: "insufficient_credits" };
  }

  const monthlyAvailable = Math.max(0, b.monthlyAllocation - b.consumed);
  const fromMonthly = Math.min(cost, monthlyAvailable);
  const fromTopoffs = cost - fromMonthly;

  return {
    ok: true,
    drawn: { fromMonthly, fromTopoffs },
    balance: {
      ...b,
      consumed: b.consumed + fromMonthly,
      topoffs: b.topoffs - fromTopoffs,
    },
  };
}

/**
 * Refund `cost` credits to a balance — inverse of {@link deduct}. Used when a
 * render job fails after credits were already reserved. Credits return to
 * the pool they were drawn from; if that split is unknown, caller passes
 * `fromMonthly` / `fromTopoffs` = `undefined` and the full amount goes back
 * into the monthly pool (conservative — never over-refunds top-offs).
 */
export function refund(
  b: CreditBalance,
  cost: number,
  drawn?: { fromMonthly: number; fromTopoffs: number },
): CreditBalance {
  if (cost <= 0) return b;
  const split = drawn ?? { fromMonthly: cost, fromTopoffs: 0 };
  const consumed = Math.max(0, b.consumed - split.fromMonthly);
  const topoffs = b.topoffs + split.fromTopoffs;
  return { ...b, consumed, topoffs };
}
