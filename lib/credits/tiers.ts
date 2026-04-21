/**
 * Monthly credit allocation per subscription tier.
 *
 * These ladders target ~70% gross margin at list price assuming:
 * - faceless / stock-ai-avatar render ~ $0.50 COGS
 * - HeyGen render ~ $6–7 COGS (1 HeyGen ≈ 15 faceless credits at the cost
 *   ratio encoded in ./costs.ts)
 *
 * Trial mirrors Starter's allocation so evaluators can ship a handful of
 * real videos without footing a Creator-sized bill.
 */

import type { SubscriptionTier } from "@/lib/types/user";

export const MONTHLY_CREDIT_ALLOCATION: Readonly<Record<SubscriptionTier, number>> =
  Object.freeze({
    trial: 30,
    starter: 30,
    solo: 75,
    creator: 160,
    studio: 300,
  });

/** Monthly credit pool the tier is entitled to. Does not include top-offs. */
export function getMonthlyAllocation(tier: SubscriptionTier): number {
  return MONTHLY_CREDIT_ALLOCATION[tier];
}
