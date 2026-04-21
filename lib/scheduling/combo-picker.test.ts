import { describe, it, expect } from "vitest";
import {
  pickRenderKindForComboVideo,
  renderKindForMode,
} from "./combo-picker";
import { getCreditCost } from "@/lib/credits";
import type { Series } from "@/lib/types/series";

const HEYGEN_COST = getCreditCost("heygen-licensed");

function makeSeries(overrides: Partial<Series> = {}): Series {
  return {
    id: "srs_combo",
    userId: "u_1",
    name: "Combo series",
    topic: "topic",
    contentType: "tutorial",
    facelessStyle: "slide",
    frequency: "3x-week",
    platforms: ["youtube", "linkedin"],
    mode: "combo",
    heygenAvatarSource: "licensed",
    status: "active",
    startDate: new Date().toISOString(),
    videos: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("renderKindForMode", () => {
  it("maps direct modes to their render kind", () => {
    expect(renderKindForMode("faceless")).toBe("faceless");
    expect(renderKindForMode("stock-ai-avatar")).toBe("stock-ai-avatar");
    expect(renderKindForMode("heygen-avatar", "licensed")).toBe("heygen-licensed");
    expect(renderKindForMode("heygen-avatar", "twin")).toBe("heygen-twin");
  });

  it("defaults HeyGen mode with no source to licensed — never accidentally bills for a twin", () => {
    expect(renderKindForMode("heygen-avatar")).toBe("heygen-licensed");
  });

  it("fails safe to faceless for combo — callers should use pickRenderKindForComboVideo", () => {
    expect(renderKindForMode("combo")).toBe("faceless");
  });
});

describe("pickRenderKindForComboVideo", () => {
  it("short-circuits non-combo series — returns the direct render kind", () => {
    const series = makeSeries({ mode: "heygen-avatar", heygenAvatarSource: "twin" });
    const result = pickRenderKindForComboVideo({
      series,
      platform: "youtube",
      contentType: "founder-story",
      remainingCredits: 500,
      heygenRenderCost: HEYGEN_COST,
    });
    expect(result.kind).toBe("heygen-twin");
    expect(result.reason).toBe("non_combo_series");
  });

  it("forces faceless when the user can't afford a HeyGen render", () => {
    const result = pickRenderKindForComboVideo({
      series: makeSeries(),
      platform: "linkedin",
      contentType: "founder-story", // would otherwise pick avatar
      remainingCredits: HEYGEN_COST - 1,
      heygenRenderCost: HEYGEN_COST,
    });
    expect(result.kind).toBe("faceless");
    expect(result.reason).toBe("insufficient_budget");
  });

  it("picks HeyGen-licensed for hero content on LinkedIn — both signals agree", () => {
    const result = pickRenderKindForComboVideo({
      series: makeSeries({ heygenAvatarSource: "licensed" }),
      platform: "linkedin",
      contentType: "founder-story",
      remainingCredits: 500,
      heygenRenderCost: HEYGEN_COST,
    });
    expect(result.kind).toBe("heygen-licensed");
    expect(result.reason).toBe("hero_content_on_avatar_platform");
  });

  it("picks HeyGen-twin when the series source is set to twin", () => {
    const result = pickRenderKindForComboVideo({
      series: makeSeries({ heygenAvatarSource: "twin" }),
      platform: "linkedin",
      contentType: "founder-story",
      remainingCredits: 500,
      heygenRenderCost: HEYGEN_COST,
    });
    expect(result.kind).toBe("heygen-twin");
  });

  it("picks faceless for list-style content on X — both signals agree", () => {
    const result = pickRenderKindForComboVideo({
      series: makeSeries(),
      platform: "x",
      contentType: "domain-tip",
      remainingCredits: 500,
      heygenRenderCost: HEYGEN_COST,
    });
    expect(result.kind).toBe("faceless");
    expect(result.reason).toBe("platform_faceless_bias");
  });

  it("picks faceless for hero content on X — platform override wins (score = 0 → faceless)", () => {
    const result = pickRenderKindForComboVideo({
      series: makeSeries(),
      platform: "x",
      contentType: "founder-story",
      remainingCredits: 500,
      heygenRenderCost: HEYGEN_COST,
    });
    expect(result.kind).toBe("faceless");
  });

  it("picks faceless for list content on neutral platforms — not every video burns HeyGen credits", () => {
    const result = pickRenderKindForComboVideo({
      series: makeSeries(),
      platform: "youtube",
      contentType: "domain-tip",
      remainingCredits: 500,
      heygenRenderCost: HEYGEN_COST,
    });
    expect(result.kind).toBe("faceless");
    expect(result.reason).toBe("list_content");
  });

  it("picks HeyGen for hero content on neutral platforms — content signal alone is enough", () => {
    const result = pickRenderKindForComboVideo({
      series: makeSeries(),
      platform: "youtube",
      contentType: "founder-story",
      remainingCredits: 500,
      heygenRenderCost: HEYGEN_COST,
    });
    expect(result.kind).toBe("heygen-licensed");
  });
});
