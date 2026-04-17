import type { Platform } from "@/lib/types/user";

export interface PlatformConfig {
  id: Platform;
  name: string;
  label: string;
  minDurationSeconds: number;
  maxDurationSeconds: number;
  optimalDurationSeconds: number;
  videosPerWeek: number;
  aspectRatio: "9:16" | "1:1" | "16:9";
  color: string;
}

/**
 * Per-platform spec from knowledge-center.md §4.
 * Duration ranges are HARD limits — clamp every video to these on creation.
 */
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  youtube: {
    id: "youtube",
    name: "YouTube Shorts",
    label: "YouTube",
    minDurationSeconds: 30,
    maxDurationSeconds: 45,
    optimalDurationSeconds: 38,
    videosPerWeek: 5,
    aspectRatio: "9:16",
    color: "#FF0000",
  },
  instagram: {
    id: "instagram",
    name: "Instagram Reels",
    label: "Instagram",
    minDurationSeconds: 20,
    maxDurationSeconds: 30,
    optimalDurationSeconds: 25,
    videosPerWeek: 4,
    aspectRatio: "9:16",
    color: "#E1306C",
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    label: "LinkedIn",
    minDurationSeconds: 45,
    maxDurationSeconds: 60,
    optimalDurationSeconds: 52,
    videosPerWeek: 4,
    aspectRatio: "9:16",
    color: "#0A66C2",
  },
  x: {
    id: "x",
    name: "X",
    label: "X",
    minDurationSeconds: 15,
    maxDurationSeconds: 20,
    optimalDurationSeconds: 18,
    videosPerWeek: 10,
    aspectRatio: "9:16",
    color: "#000000",
  },
};

export const ALL_PLATFORMS: Platform[] = ["youtube", "instagram", "linkedin", "x"];

export function getPlatformConfig(platform: Platform): PlatformConfig {
  return PLATFORM_CONFIGS[platform];
}

export function getDurationForPlatform(platform: Platform): number {
  return PLATFORM_CONFIGS[platform].optimalDurationSeconds;
}

/**
 * Clamp a duration to the platform's spec-mandated [min, max] range.
 * Use at every video-creation boundary — never trust an LLM-returned duration.
 * Returns the optimal duration if input is missing or non-finite.
 */
export function clampDurationForPlatform(
  platform: Platform,
  durationSeconds: number | undefined
): number {
  const cfg = PLATFORM_CONFIGS[platform];
  if (durationSeconds == null || !Number.isFinite(durationSeconds)) {
    return cfg.optimalDurationSeconds;
  }
  return Math.min(
    cfg.maxDurationSeconds,
    Math.max(cfg.minDurationSeconds, Math.round(durationSeconds))
  );
}
