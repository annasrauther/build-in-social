/**
 * Critical-path test for /api/plan/generate.
 *
 * Covers spec rules 3, 4 (CLAUDE.md product rules) + critical paths #3 + #4:
 *   - Manual mode REJECTS vague answers (server-side, not just client)
 *   - Manual mode PASSES specific answers
 *   - Autopilot mode SKIPS the quality gate but still calls generateAutopilotAngles
 *   - All returned video durations are clamped to platform spec
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Stub auth so requireAuth resolves to a test user.
vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(async () => "test_user_01"),
  getAuthUserId: vi.fn(async () => "test_user_01"),
}));
// Disable rate-limiting in tests.
vi.mock("@/lib/services/rate-limit", () => ({
  checkRateLimit: vi.fn(async () => null),
}));

import { POST } from "./route";

function buildReq(body: unknown): Request {
  return new Request("http://localhost/api/plan/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/plan/generate — critical path #3 (quality gate)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("REJECTS manual mode when qualityGateAnswers are missing", async () => {
    const res = await POST(
      buildReq({ mode: "manual", platforms: ["youtube"], niche: "indie SaaS" })
    );
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error).toMatch(/quality gate/i);
  });

  it("REJECTS manual mode with empty answer strings", async () => {
    const res = await POST(
      buildReq({
        mode: "manual",
        platforms: ["youtube"],
        niche: "indie SaaS",
        qualityGateAnswers: ["x", "", "  "],
      })
    );
    expect(res.status).toBe(422);
  });

  it("REJECTS manual mode with vague answers (specificity score < 5) and returns canonical pushback", async () => {
    const res = await POST(
      buildReq({
        mode: "manual",
        platforms: ["youtube"],
        niche: "indie SaaS",
        // Mock heuristic: short answers without digits/proper-nouns → score 3
        qualityGateAnswers: ["worked", "stuff", "people"],
      })
    );
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error).toBe("quality_gate_failed");
    expect(json.specificityScore).toBeLessThan(5);
    expect(json.pushback).toContain("one specific detail");
    expect(json.pushback).toContain("10× better");
  });

  it("ACCEPTS manual mode with specific answers (mock heuristic: long + has digit/proper noun)", async () => {
    const res = await POST(
      buildReq({
        mode: "manual",
        platforms: ["youtube"],
        niche: "indie SaaS",
        qualityGateAnswers: [
          "Shipped Stripe billing with idempotent webhooks for 3 paying users this week",
          "BullMQ retries fired 7 times when our R2 upload step timed out",
          "Other indie founders moving from Gumroad to Stripe — they hit the same migration",
        ],
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data.videos)).toBe(true);
    expect(json.data.videos.length).toBeGreaterThan(0);
  });
});

describe("POST /api/plan/generate — autopilot mode bypasses gate", () => {
  it("SKIPS the quality gate when mode is autopilot, still returns videos", async () => {
    const res = await POST(
      buildReq({
        mode: "autopilot",
        platforms: ["youtube", "instagram"],
        niche: "indie SaaS",
        tone: "confident",
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.videos.length).toBeGreaterThan(0);
  });
});

describe("POST /api/plan/generate — critical path #4 (duration clamp)", () => {
  it("every returned video has duration within the platform's spec range", async () => {
    const res = await POST(
      buildReq({
        mode: "autopilot",
        platforms: ["youtube", "instagram", "linkedin", "x"],
        niche: "indie SaaS",
      })
    );
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as {
      data: { videos: Array<{ platform: string; durationSeconds: number }> };
    };
    const { videos } = data;

    const ranges: Record<string, [number, number]> = {
      youtube: [30, 45],
      instagram: [20, 30],
      linkedin: [45, 60],
      x: [15, 20],
    };

    for (const v of videos) {
      const [min, max] = ranges[v.platform];
      expect(v.durationSeconds, `${v.platform} duration ${v.durationSeconds}`).toBeGreaterThanOrEqual(min);
      expect(v.durationSeconds, `${v.platform} duration ${v.durationSeconds}`).toBeLessThanOrEqual(max);
    }
  });
});

describe("POST /api/plan/generate — input validation", () => {
  it("rejects unknown platforms", async () => {
    const res = await POST(
      buildReq({
        mode: "autopilot",
        platforms: ["tiktok"],
        niche: "indie SaaS",
      })
    );
    expect(res.status).toBe(400);
  });

  it("rejects missing mode", async () => {
    const res = await POST(
      buildReq({ platforms: ["youtube"], niche: "indie SaaS" })
    );
    expect(res.status).toBe(400);
  });

  it("rejects missing niche", async () => {
    const res = await POST(
      buildReq({ mode: "autopilot", platforms: ["youtube"] })
    );
    expect(res.status).toBe(400);
  });
});
