import type { Platform } from "./user";
import type { IngestSourceType, IngestTopicCandidate } from "./ingest";

export type OnboardingTone = "straight-shooter" | "friendly-expert" | "technical-deep-dive" | "casual-builder";
export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ContentMode = "manual" | "autopilot";
export type PricingTier = "solo" | "creator" | "studio";

export interface PlanPreviewVideo {
  title: string;
  hook: string;
  body: string;
  cta: string;
  platform: Platform;
  dayOfWeek: string;
  contentType: string;
  durationSeconds: number;
  expanded?: boolean;
}

export interface GeneratedPlanPreview {
  videos: PlanPreviewVideo[];
  generatedAt: string;
}

export interface OnboardingData {
  sessionId: string;
  currentStep: OnboardingStep;
  startedAt: string;

  // Step 2 — Product
  productInput: string;
  productDescription: string;
  productDomain?: string;
  productName?: string;
  productOgImage?: string;
  productFaviconUrl?: string;
  productMetaSource?: "domain" | "manual";

  // Step 3 — Niche
  niche: string;
  nicheAudiences?: string[];
  nicheCustomEntries?: string[];

  // Optional source material (Notion / transcript / RSS) — seeds plan topics
  sourceTopics?: IngestTopicCandidate[];
  sourceType?: IngestSourceType;

  // Step 4 — Tone
  tone: OnboardingTone | "";

  // Step 5 — Platforms
  platforms: Platform[];

  // Step 6 — Voice
  voiceChoice: "clone" | "library" | "";
  voiceCloneJobId?: string;
  libraryVoiceId?: string;
  voiceConsentAt?: string; // ISO timestamp when user consented to voice synthesis

  // Step 7 — Plan preview
  generatedPlan?: GeneratedPlanPreview;

  // Step 8 — Email
  recoveryEmail?: string;

  // Mode choice (set on plan-preview step)
  contentMode?: ContentMode;

  // Step 9 — Pricing
  selectedTier?: PricingTier;
  stripeSessionId?: string;

  // Step 10 — Activation
  paymentComplete: boolean;
  clerkUserId?: string;
}
