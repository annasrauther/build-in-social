/**
 * Tests for /api/generate/script.
 *
 * Covers:
 *   - Happy path: manual mode with specific answers returns { data, error: null }
 *   - Manual mode quality gate rejects short (<20 char) answers with 422
 *   - Auth reject: missing auth returns 401
 *   - Autopilot mode bypasses quality gate
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(async () => "test_user_01"),
  checkRateLimit: vi.fn(async () => null),
  generateScript: vi.fn(async () => ({
    script: { hook: "Hook", body: "Body", cta: "CTA" },
    estimatedDurationSeconds: 40,
    topicLabel: "shipped-feature",
    hookType: "question",
    sentiment: "positive",
  })),
  checkQualityGate: vi.fn(async (): Promise<{ passed: boolean; specificityScore: number; pushback?: string }> => ({
    passed: true,
    specificityScore: 8,
  })),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  getAuthUserId: mocks.requireAuth,
}));

vi.mock("@/lib/services/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
}));

vi.mock("@/lib/services/claude", () => ({
  generateScript: mocks.generateScript,
  checkQualityGate: mocks.checkQualityGate,
}));

import { POST } from "./route";

function buildReq(body: unknown): Request {
  return new Request("http://localhost/api/generate/script", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/generate/script", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue("test_user_01");
    mocks.checkRateLimit.mockResolvedValue(null);
    mocks.checkQualityGate.mockResolvedValue({
      passed: true,
      specificityScore: 8,
    });
  });

  it("happy path: manual mode with 3 specific (>=20 char) answers returns { data, error: null }", async () => {
    const answers: [string, string, string] = [
      "Shipped Stripe billing with idempotent webhooks this week for 3 paying users",
      "BullMQ retries fired 7 times when our R2 upload step timed out yesterday",
      "Other indie founders moving from Gumroad to Stripe hit the same migration",
    ];
    const res = await POST(
      buildReq({ mode: "manual", qualityGateAnswers: answers }) as never
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.error).toBeNull();
    expect(json.data).toBeDefined();
    expect(json.data.script).toEqual({ hook: "Hook", body: "Body", cta: "CTA" });
    expect(mocks.generateScript).toHaveBeenCalledTimes(1);
  });

  it("REJECTS manual mode with answers shorter than 20 characters (422)", async () => {
    const res = await POST(
      buildReq({
        mode: "manual",
        qualityGateAnswers: ["short", "also short", "still too short"],
      }) as never
    );
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error).toMatch(/20 characters/i);
    expect(mocks.checkQualityGate).not.toHaveBeenCalled();
    expect(mocks.generateScript).not.toHaveBeenCalled();
  });

  it("REJECTS when quality gate itself fails (422)", async () => {
    mocks.checkQualityGate.mockResolvedValueOnce({
      passed: false,
      specificityScore: 3,
      pushback: "Add one specific detail — make it 10× better",
    });
    const answers: [string, string, string] = [
      "A reasonably long but vague answer about stuff going on",
      "Another reasonably long but non-specific explanation here",
      "Third answer that is also long but lacks concrete specifics",
    ];
    const res = await POST(
      buildReq({ mode: "manual", qualityGateAnswers: answers }) as never
    );
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.specificityScore).toBe(3);
    expect(mocks.generateScript).not.toHaveBeenCalled();
  });

  it("returns 401 when unauthenticated", async () => {
    mocks.requireAuth.mockRejectedValueOnce(new Error("UNAUTHORIZED") as never);
    const res = await POST(
      buildReq({ mode: "autopilot" }) as never
    );
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
    expect(mocks.generateScript).not.toHaveBeenCalled();
  });

  it("autopilot mode SKIPS the quality gate", async () => {
    const res = await POST(
      buildReq({
        mode: "autopilot",
        prompt: "Weekly update",
        platforms: ["youtube"],
      }) as never
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.error).toBeNull();
    expect(json.data).toBeDefined();
    expect(mocks.checkQualityGate).not.toHaveBeenCalled();
    expect(mocks.generateScript).toHaveBeenCalledTimes(1);
  });
});
