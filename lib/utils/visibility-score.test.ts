import { describe, it, expect } from "vitest";
import { computeVisibilityScore, formatVisibilityScore } from "./visibility-score";

describe("computeVisibilityScore", () => {
  it("returns null when required fields are missing", () => {
    expect(computeVisibilityScore({})).toBeNull();
    expect(computeVisibilityScore({ watchTimeAvg: 30 })).toBeNull();
    expect(computeVisibilityScore({ watchTimeAvg: 30, durationSeconds: 60 })).toBeNull();
  });

  it("returns null when engagementRate is undefined (not zero)", () => {
    expect(
      computeVisibilityScore({ watchTimeAvg: 30, durationSeconds: 60, viewCount: 100 })
    ).toBeNull();
  });

  it("computes a score between 0 and 1 for valid inputs", () => {
    const score = computeVisibilityScore({
      watchTimeAvg: 30,
      durationSeconds: 60,
      viewCount: 1000,
      engagementRate: 0.08,
    });
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThanOrEqual(0);
    expect(score!).toBeLessThanOrEqual(1);
  });

  it("weights watch time and engagement at 40% each, traffic at 20%", () => {
    // Perfect watch time and engagement, zero traffic
    const score = computeVisibilityScore({
      watchTimeAvg: 60,
      durationSeconds: 60,
      viewCount: 1000,
      engagementRate: 1,
      trafficFromPseo: 0,
    });
    // 0.4*1 + 0.4*1 + 0.2*0 = 0.80
    expect(score).toBe(0.8);
  });

  it("caps watch time and engagement scores at 1", () => {
    const score = computeVisibilityScore({
      watchTimeAvg: 120, // over full duration
      durationSeconds: 60,
      viewCount: 1000,
      engagementRate: 2, // over 100%
      trafficFromPseo: 200, // over 100
    });
    // 0.4*1 + 0.4*1 + 0.2*1 = 1.0
    expect(score).toBe(1);
  });

  it("includes pSEO traffic in the score", () => {
    const withTraffic = computeVisibilityScore({
      watchTimeAvg: 30,
      durationSeconds: 60,
      viewCount: 1000,
      engagementRate: 0,
      trafficFromPseo: 100,
    });
    const withoutTraffic = computeVisibilityScore({
      watchTimeAvg: 30,
      durationSeconds: 60,
      viewCount: 1000,
      engagementRate: 0,
      trafficFromPseo: 0,
    });
    expect(withTraffic!).toBeGreaterThan(withoutTraffic!);
  });
});

describe("formatVisibilityScore", () => {
  it("returns — for null", () => {
    expect(formatVisibilityScore(null)).toBe("—");
  });

  it("returns — for undefined", () => {
    expect(formatVisibilityScore(undefined)).toBe("—");
  });

  it("formats score as 0-100 integer string", () => {
    expect(formatVisibilityScore(0.74)).toBe("74");
    expect(formatVisibilityScore(1)).toBe("100");
    expect(formatVisibilityScore(0)).toBe("0");
    expect(formatVisibilityScore(0.555)).toBe("56"); // rounds up
  });
});
