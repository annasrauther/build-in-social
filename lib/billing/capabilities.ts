/**
 * Tier-based feature gating.
 *
 * Single source of truth for which features each tier can use. Call
 * `canUseFeature(tier, "pseo")` at the API layer — not just in the UI — so
 * the enforcement is real and can't be bypassed by hitting the endpoint
 * directly.
 *
 * New Starter ($19) tier blocks pSEO, voice cloning, and HeyGen (Avatar)
 * entirely. Autopilot scheduling is Studio-only.
 */

import type { SubscriptionTier } from "@/lib/types/user";

export type Feature =
  | "pseo" // Google-indexed search article per video
  | "voice_clone" // ElevenLabs voice clone (custom voice)
  | "voice_clone_preview" // Short preview rendered from the user's clone
  | "heygen" // Avatar Mode / HeyGen — Phase 1 waitlist, always false here
  | "autopilot_scheduling" // Full autopilot posting schedule
  | "intelligence_panel" // Performance insights UI
  | "priority_rendering" // Studio-only faster render lane
  | "publish_wordpress"; // Publish pSEO articles to the user's own WordPress site

// NOTE: "trial" mirrors the highest tier so users can exercise every feature
// during the 14-day evaluation window. Cap enforcement still applies.
const CAPABILITIES: Record<SubscriptionTier, Set<Feature>> = {
  trial: new Set<Feature>([
    "pseo",
    "voice_clone",
    "voice_clone_preview",
    "autopilot_scheduling",
    "intelligence_panel",
    "priority_rendering",
    "publish_wordpress",
  ]),
  starter: new Set<Feature>([
    // Library voice only. No pSEO. No voice clone. No HeyGen. No autopilot
    // scheduling. Intelligence panel still unlocks after 5 published videos
    // (no tier gate) but scheduling + clone remain off.
    // WordPress publishing is Creator+ only.
  ]),
  solo: new Set<Feature>([
    "pseo",
    "intelligence_panel",
    // No WordPress publishing on Solo — pSEO still publishes on the
    // buildinsocial.com subdomain.
  ]),
  creator: new Set<Feature>([
    "pseo",
    "voice_clone",
    "voice_clone_preview",
    "intelligence_panel",
    "publish_wordpress",
  ]),
  studio: new Set<Feature>([
    "pseo",
    "voice_clone",
    "voice_clone_preview",
    "autopilot_scheduling",
    "intelligence_panel",
    "priority_rendering",
    "publish_wordpress",
  ]),
};

/**
 * Returns true if `tier` can use `feature`.
 * HeyGen (Avatar Mode) is Phase-1-disabled globally — always false.
 */
export function canUseFeature(tier: SubscriptionTier, feature: Feature): boolean {
  if (feature === "heygen") return false;
  return CAPABILITIES[tier]?.has(feature) ?? false;
}

/** Returns the set of features a tier can use. */
export function featuresForTier(tier: SubscriptionTier): ReadonlySet<Feature> {
  return CAPABILITIES[tier] ?? new Set<Feature>();
}
