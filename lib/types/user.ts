export type ContentTone = "casual" | "professional" | "nerdy-warm" | "fun-energetic";
export type ContentLanguage = "english" | "spanish" | "bilingual";
export type Platform = "youtube" | "instagram" | "linkedin" | "x";
export type FacelessStyle = "dev-log" | "documentary" | "minimal-text" | "slide";
export type SubscriptionTier = "trial" | "starter" | "solo" | "creator" | "studio";

export interface VoiceProfile {
  id: string;
  userId: string;
  elevenLabsVoiceId: string;
  name: string;
  isClone: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  displayName: string;
  brandName: string;
  niche?: string;
  tone: ContentTone;
  contentLanguage?: ContentLanguage;
  platforms: Platform[];
  onboardingComplete: boolean;
  subscriptionTier: SubscriptionTier;
  currentPeriodEnd?: number | null;
  trialStartedAt?: string;
  trialEndsAt?: string;
  voiceProfileId?: string;
  /** Avatar selection — "stock" uses stockAvatarId, "twin" uses twinAvatarId. */
  avatarMode?: "stock" | "twin";
  /** Currently selected stock avatar id (see content/avatars.ts). */
  stockAvatarId?: string;
  /** HeyGen avatar_id once a custom twin is trained. */
  twinAvatarId?: string;
  /** Twin training status. */
  twinStatus?: "training" | "ready" | "failed";
  createdAt: string;
}

export interface OnboardingState {
  step: 1 | 2 | 3 | 4;
  context?: {
    niche: string;
    answers: [string, string, string];
  };
  platforms?: Platform[];
  voice?: {
    voiceId: string;
    isClone: boolean;
  };
}
