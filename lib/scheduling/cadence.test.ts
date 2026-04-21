import { describe, it, expect } from "vitest";
import { computeNextVideoAt, isDue, pickDueSeries } from "./cadence";
import type { Series } from "@/lib/types/series";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function makeSeries(overrides: Partial<Series> = {}): Series {
  return {
    id: "srs_test",
    userId: "u_1",
    name: "Test",
    topic: "topic",
    contentType: "tutorial",
    facelessStyle: "slide",
    frequency: "daily",
    platforms: ["youtube"],
    mode: "faceless",
    status: "active",
    startDate: new Date().toISOString(),
    videos: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("computeNextVideoAt", () => {
  it("advances by ~24h for daily cadence", () => {
    const start = new Date("2026-04-21T00:00:00Z");
    const next = computeNextVideoAt("daily", start);
    expect(new Date(next).getTime() - start.getTime()).toBe(DAY);
  });

  it("advances by ~56h for 3x-week cadence", () => {
    const start = new Date("2026-04-21T00:00:00Z");
    const next = computeNextVideoAt("3x-week", start);
    const deltaHours = (new Date(next).getTime() - start.getTime()) / HOUR;
    expect(deltaHours).toBeGreaterThanOrEqual(55);
    expect(deltaHours).toBeLessThanOrEqual(57);
  });

  it("advances by ~33.6h for 5x-week cadence", () => {
    const start = new Date("2026-04-21T00:00:00Z");
    const next = computeNextVideoAt("5x-week", start);
    const deltaHours = (new Date(next).getTime() - start.getTime()) / HOUR;
    expect(deltaHours).toBeGreaterThan(33);
    expect(deltaHours).toBeLessThan(34);
  });

  it("falls back to daily for custom cadence", () => {
    const start = new Date("2026-04-21T00:00:00Z");
    const next = computeNextVideoAt("custom", start);
    expect(new Date(next).getTime() - start.getTime()).toBe(DAY);
  });

  it("accepts a string input and returns ISO 8601", () => {
    const next = computeNextVideoAt("daily", "2026-04-21T00:00:00Z");
    expect(next).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe("isDue", () => {
  const now = new Date("2026-04-21T12:00:00Z");

  it("is due immediately when nextVideoAt is not set (first run)", () => {
    expect(isDue(makeSeries({ nextVideoAt: undefined }), now)).toBe(true);
  });

  it("is due when nextVideoAt is in the past", () => {
    const past = new Date(now.getTime() - HOUR).toISOString();
    expect(isDue(makeSeries({ nextVideoAt: past }), now)).toBe(true);
  });

  it("is due exactly at nextVideoAt (inclusive boundary)", () => {
    expect(isDue(makeSeries({ nextVideoAt: now.toISOString() }), now)).toBe(true);
  });

  it("is NOT due when nextVideoAt is in the future", () => {
    const future = new Date(now.getTime() + HOUR).toISOString();
    expect(isDue(makeSeries({ nextVideoAt: future }), now)).toBe(false);
  });

  it("is never due for paused series — even if nextVideoAt is past", () => {
    const past = new Date(now.getTime() - DAY).toISOString();
    expect(
      isDue(makeSeries({ status: "paused", nextVideoAt: past }), now)
    ).toBe(false);
  });

  it("is never due for completed series", () => {
    expect(
      isDue(
        makeSeries({ status: "completed", nextVideoAt: undefined }),
        now
      )
    ).toBe(false);
  });
});

describe("pickDueSeries", () => {
  const now = new Date("2026-04-21T12:00:00Z");

  it("returns only the subset that are due, preserving order", () => {
    const past = new Date(now.getTime() - HOUR).toISOString();
    const future = new Date(now.getTime() + HOUR).toISOString();
    const list = [
      makeSeries({ id: "a", nextVideoAt: past }),
      makeSeries({ id: "b", status: "paused", nextVideoAt: past }),
      makeSeries({ id: "c", nextVideoAt: future }),
      makeSeries({ id: "d", nextVideoAt: undefined }), // brand-new, always due
    ];
    const due = pickDueSeries(list, now);
    expect(due.map((s) => s.id)).toEqual(["a", "d"]);
  });

  it("returns [] for an empty list", () => {
    expect(pickDueSeries([], now)).toEqual([]);
  });
});
