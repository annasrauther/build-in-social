export type ContentTone = "casual" | "professional" | "nerdy-warm" | "fun-energetic";
export type Platform = "youtube" | "instagram" | "linkedin" | "x";
export type FacelessStyle = "dev-log" | "documentary" | "minimal-text" | "slide";
export type SubscriptionTier = "trial" | "solo" | "creator" | "studio";

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
  platforms: Platform[];
  onboardingComplete: boolean;
  subscriptionTier: SubscriptionTier;
  trialStartedAt?: string;
  trialEndsAt?: string;
  voiceProfileId?: string;
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
