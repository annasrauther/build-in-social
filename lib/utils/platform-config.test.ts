import { describe, it, expect } from "vitest";
import { getPlatformConfig, PLATFORM_CONFIGS } from "./platform-config";
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
      expect(config.maxDurationSeconds).toBeGreaterThan(0);
      expect(config.optimalDurationSeconds).toBeGreaterThan(0);
      expect(["9:16", "1:1", "16:9"]).toContain(config.aspectRatio);
      expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("optimal duration is always <= max duration", () => {
    for (const platform of PLATFORMS) {
      const config = PLATFORM_CONFIGS[platform];
      expect(config.optimalDurationSeconds).toBeLessThanOrEqual(config.maxDurationSeconds);
    }
  });
});

describe("getPlatformConfig", () => {
  it("returns the config for a given platform", () => {
    const config = getPlatformConfig("youtube");
    expect(config.id).toBe("youtube");
    expect(config.name).toBe("YouTube Shorts");
    expect(config.maxDurationSeconds).toBe(60);
    expect(config.aspectRatio).toBe("9:16");
  });

  it("returns the same reference as PLATFORM_CONFIGS", () => {
    expect(getPlatformConfig("instagram")).toBe(PLATFORM_CONFIGS["instagram"]);
  });
});
