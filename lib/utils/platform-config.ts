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

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  youtube: {
    id: "youtube",
    name: "YouTube Shorts",
    label: "YouTube",
    minDurationSeconds: 30,
    maxDurationSeconds: 60,
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
    maxDurationSeconds: 60,
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
    maxDurationSeconds: 90,
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
    maxDurationSeconds: 30,
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
