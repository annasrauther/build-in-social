/**
 * Critical path #7: voice clone consent recorded BEFORE ElevenLabs call.
 *
 * Spec: ElevenLabs ToS + biometric law require provable consent. The
 * /api/onboard/voice route is the SINGLE place consent is captured for the
 * onboarding-time clone flow. Library mode does NOT require consent.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(async () => "clerk_user_01"),
  recordVoiceConsent: vi.fn(async (params) => params),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  getAuthUserId: mocks.requireAuth,
}));

vi.mock("@/lib/services/db", () => ({
  recordVoiceConsent: mocks.recordVoiceConsent,
}));

import { POST } from "./route";

function postReq(body: unknown): Request {
  return new Request("http://localhost/api/onboard/voice", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "vitest/1.0" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/onboard/voice — critical path #7 (voice consent)", () => {
  beforeEach(() => {
    mocks.recordVoiceConsent.mockClear();
  });

  it("REJECTS clone mode without consent: true", async () => {
    const res = await POST(postReq({ mode: "clone", fileName: "voice.mp3" }) as never);
    expect(res.status).toBe(400);
    expect(mocks.recordVoiceConsent).not.toHaveBeenCalled();
  });

  it("REJECTS clone mode with consent: false", async () => {
    const res = await POST(
      postReq({ mode: "clone", fileName: "voice.mp3", consent: false }) as never
    );
    expect(res.status).toBe(400);
    expect(mocks.recordVoiceConsent).not.toHaveBeenCalled();
  });

  it("ACCEPTS clone mode with consent: true and persists consent BEFORE returning", async () => {
    const res = await POST(
      postReq({ mode: "clone", fileName: "voice.mp3", consent: true }) as never
    );
    expect(res.status).toBe(200);
    expect(mocks.recordVoiceConsent).toHaveBeenCalledTimes(1);
    const call = mocks.recordVoiceConsent.mock.calls[0][0] as {
      userId: string;
      consentedAt: string;
    };
    expect(call.userId).toBe("clerk_user_01");
    expect(call.consentedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
  });

  it("DOES NOT require consent for library mode", async () => {
    const res = await POST(
      postReq({ mode: "library", voiceId: "voice_01" }) as never
    );
    expect(res.status).toBe(200);
    expect(mocks.recordVoiceConsent).not.toHaveBeenCalled();
  });

  it("returns 401 when unauthenticated", async () => {
    mocks.requireAuth.mockRejectedValueOnce(new Error("UNAUTHORIZED") as never);
    const res = await POST(
      postReq({ mode: "clone", fileName: "voice.mp3", consent: true }) as never
    );
    expect(res.status).toBe(401);
    expect(mocks.recordVoiceConsent).not.toHaveBeenCalled();
  });
});
