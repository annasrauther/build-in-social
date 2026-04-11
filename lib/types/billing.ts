import type { SubscriptionTier } from "./user";

export interface Package {
  id: SubscriptionTier;
  name: string;
  price: number;
  priceAnnual?: number;
  platforms: number;
  videosPerWeek: number;
  videosPerMonth: number;
  features: string[];
  popular?: boolean;
}

export const PACKAGES: Record<Exclude<SubscriptionTier, "trial">, Package> = {
  solo: {
    id: "solo",
    name: "Solo",
    price: 39,
    priceAnnual: 31,
    platforms: 2,
    videosPerWeek: 9,
    videosPerMonth: 40,
    features: [
      "2 platforms",
      "~40 videos/month",
      "Weekly content plan",
      "Quality gate",
      "Faceless Mode",
      "pSEO pages",
    ],
  },
  creator: {
    id: "creator",
    name: "Creator",
    price: 79,
    priceAnnual: 63,
    platforms: 3,
    videosPerWeek: 15,
    videosPerMonth: 65,
    features: [
      "3 platforms",
      "~65 videos/month",
      "Everything in Solo",
      "Intelligence panel",
      "Hook variant testing",
    ],
    popular: true,
  },
  studio: {
    id: "studio",
    name: "Studio",
    price: 149,
    priceAnnual: 119,
    platforms: 4,
    videosPerWeek: 23,
    videosPerMonth: 92,
    features: [
      "All 4 platforms",
      "~92 videos/month",
      "Everything in Creator",
      "Priority rendering",
      "Dedicated support",
    ],
  },
};

export const TRIAL_DAYS = 14;
