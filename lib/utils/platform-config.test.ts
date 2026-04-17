import { describe, it, expect } from "vitest";
import {
  getPlatformConfig,
  PLATFORM_CONFIGS,
  clampDurationForPlatform,
} from "./platform-config";
import type { Platform } from "@/lib/types/user";

const PLATFORMS: Platform[] = ["youtube", "instagram", "linkedin", "x"];

describe("PLATFORM_CONFIGS", () => {
  it("has an entry for every platform", () => {
    for (const platform of PLATFORMS) {
      expect(PLATFORM_CONFIGS[platform]).toBeDefined();
    }
  });

  it("each config has required fields", () => {
    for (const platform of PLATFORMS) {
      const config = PLATFORM_CONFIGS[platform];
      expect(config.id).toBe(platform);
      expect(config.name).toBeTruthy();
      expect(config.minDurationSeconds).toBeGreaterThan(0);
      expect(config.maxDurationSeconds).toBeGreaterThan(0);
      expect(config.optimalDurationSeconds).toBeGreaterThan(0);
      expect(["9:16", "1:1", "16:9"]).toContain(config.aspectRatio);
      expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("optimal duration sits within [min, max] for every platform", () => {
    for (const platform of PLATFORMS) {
      const config = PLATFORM_CONFIGS[platform];
      expect(config.optimalDurationSeconds).toBeGreaterThanOrEqual(config.minDurationSeconds);
      expect(config.optimalDurationSeconds).toBeLessThanOrEqual(config.maxDurationSeconds);
    }
  });

  // Critical path #4: spec-mandated duration ranges.
  // YT 30-45, IG 20-30, LinkedIn 45-60, X 15-20.
  it.each([
    ["youtube", 30, 45, 5],
    ["instagram", 20, 30, 4],
    ["linkedin", 45, 60, 4],
    ["x", 15, 20, 10],
  ] as const)(
    "%s matches knowledge-center spec: %d-%ds, %d videos/week",
    (platform, min, max, perWeek) => {
      const cfg = PLATFORM_CONFIGS[platform];
      expect(cfg.minDurationSeconds).toBe(min);
      expect(cfg.maxDurationSeconds).toBe(max);
      expect(cfg.videosPerWeek).toBe(perWeek);
    }
  );

  it("total weekly videos across all 4 platforms equals 23", () => {
    const total = PLATFORMS.reduce(
      (sum, p) => sum + PLATFORM_CONFIGS[p].videosPerWeek,
      0
    );
    expect(total).toBe(23);
  });
});

describe("getPlatformConfig", () => {
  it("returns the config for a given platform", () => {
    const config = getPlatformConfig("youtube");
    expect(config.id).toBe("youtube");
    expect(config.name).toBe("YouTube Shorts");
    expect(config.maxDurationSeconds).toBe(45);
    expect(config.aspectRatio).toBe("9:16");
  });

  it("returns the same reference as PLATFORM_CONFIGS", () => {
    expect(getPlatformConfig("instagram")).toBe(PLATFORM_CONFIGS["instagram"]);
  });
});

describe("clampDurationForPlatform", () => {
  it("returns the value unchanged when within range", () => {
    expect(clampDurationForPlatform("youtube", 35)).toBe(35);
    expect(clampDurationForPlatform("instagram", 25)).toBe(25);
    expect(clampDurationForPlatform("linkedin", 50)).toBe(50);
    expect(clampDurationForPlatform("x", 18)).toBe(18);
  });

  it("clamps over-max durations down to platform max", () => {
    expect(clampDurationForPlatform("youtube", 90)).toBe(45);
    expect(clampDurationForPlatform("instagram", 60)).toBe(30);
    expect(clampDurationForPlatform("linkedin", 120)).toBe(60);
    expect(clampDurationForPlatform("x", 30)).toBe(20);
  });

  it("clamps under-min durations up to platform min", () => {
    expect(clampDurationForPlatform("youtube", 10)).toBe(30);
    expect(clampDurationForPlatform("instagram", 5)).toBe(20);
    expect(clampDurationForPlatform("linkedin", 20)).toBe(45);
    expect(clampDurationForPlatform("x", 5)).toBe(15);
  });

  it("falls back to optimal for missing or non-finite input", () => {
    expect(clampDurationForPlatform("youtube", undefined)).toBe(38);
    expect(clampDurationForPlatform("youtube", NaN)).toBe(38);
    expect(clampDurationForPlatform("youtube", Infinity)).toBe(38);
  });

  it("rounds fractional input before clamping", () => {
    expect(clampDurationForPlatform("youtube", 35.7)).toBe(36);
    expect(clampDurationForPlatform("x", 17.4)).toBe(17);
  });
});
