/**
 * Mock brand kit service — in-memory store with sensible defaults.
 * Auto-used when NOCODEBACKEND_SECRET_KEY is not set.
 */

import type { BrandKit } from "@/lib/types/brand";

const MOCK_DELAY_MS = 150;
const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms));

const defaultBrandKit: Omit<BrandKit, "id" | "userId" | "updatedAt"> = {
  primaryColor: "#D97757",
  accentColor: "#6A9BCC",
  logoUrl: null,
  watermarkPosition: "bottom-right",
  fontStyle: "modern",
};

// In-memory store: userId → BrandKit
const store = new Map<string, BrandKit>();

export async function getBrandKit(userId: string): Promise<BrandKit> {
  await delay();
  const existing = store.get(userId);
  if (existing) return existing;

  // Lazy-create default
  const kit: BrandKit = {
    id: `brand_${userId}`,
    userId,
    ...defaultBrandKit,
    updatedAt: new Date().toISOString(),
  };
  store.set(userId, kit);
  return kit;
}

export async function updateBrandKit(
  userId: string,
  partial: Partial<BrandKit>
): Promise<BrandKit> {
  await delay();
  const existing = await getBrandKit(userId);
  const updated: BrandKit = {
    ...existing,
    ...partial,
    id: existing.id,
    userId: existing.userId,
    updatedAt: new Date().toISOString(),
  };
  store.set(userId, updated);
  return updated;
}
