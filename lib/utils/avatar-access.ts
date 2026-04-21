import type { SubscriptionTier } from "@/lib/types/user";

/**
 * Access rules for the two-tier avatar system.
 *
 * Stock avatars: available on every paid tier (trial included). Some higher-
 * quality stock avatars require higher tiers; see `content/avatars.ts`.
 * Twin avatars: Creator ($79+) or Studio — matches HeyGen cost structure.
 */

export const TWIN_MIN_SUBSCRIPTION_TIER: SubscriptionTier = "creator";

const SUBSCRIPTION_TIER_ORDER: Record<SubscriptionTier, number> = {
  trial: 0,
  starter: 1,
  solo: 2,
  creator: 3,
  studio: 4,
};

export function canCreateTwin(tier: SubscriptionTier): boolean {
  return SUBSCRIPTION_TIER_ORDER[tier] >= SUBSCRIPTION_TIER_ORDER[TWIN_MIN_SUBSCRIPTION_TIER];
}

export function canUseStockAvatar(
  tier: SubscriptionTier,
  requiredTier: SubscriptionTier | null,
): boolean {
  if (requiredTier === null) return true;
  return SUBSCRIPTION_TIER_ORDER[tier] >= SUBSCRIPTION_TIER_ORDER[requiredTier];
}
