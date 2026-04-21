import type { SubscriptionTier } from "./user";

export type AvatarGenderLabel = "male" | "female" | "neutral";
export type AvatarVibe =
  | "founder"
  | "host"
  | "teacher"
  | "reporter"
  | "creator"
  | "expert"
  | "builder"
  | "seller";

/**
 * A pre-curated stock avatar the user can pick without any training step.
 * Available to every paid tier; a subset is available on free/trial.
 */
export interface StockAvatar {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  gender: AvatarGenderLabel;
  vibe: AvatarVibe;
  description: string;
  /** Minimum subscription tier that unlocks this avatar. `null` = free/trial. */
  minTier: SubscriptionTier | null;
}

/**
 * The user's trained HeyGen digital twin. Stored once per user profile.
 * Null when the user hasn't activated a twin yet (they're either on stock
 * avatars or haven't chosen an avatar mode at all).
 */
export interface TwinAvatarProfile {
  heygenAvatarId: string;
  trainedAt: string;
  status: "training" | "ready" | "failed";
  previewImageUrl?: string;
  /** Source upload path in R2, for retraining. */
  sourceClipUrl?: string;
}

export type AvatarMode = "stock" | "twin";

/** The currently-selected avatar, either a stock pick or the user's twin. */
export interface AvatarSelection {
  mode: AvatarMode;
  stockAvatarId?: string;
  twin?: TwinAvatarProfile;
}
