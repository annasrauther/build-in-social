/**
 * Critical path #7: cloneVoice REFUSES to call ElevenLabs without DB consent.
 * Belt-and-braces: even if a future code path forgets to pre-check consent at
 * the route layer, the service-level guard still blocks the API call.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  hasVoiceConsent: vi.fn(),
}));

vi.mock("@/lib/services/db", () => ({
  hasVoiceConsent: mocks.hasVoiceConsent,
}));

import { cloneVoice as mockClone } from "@/lib/mock/elevenlabs.mock";

describe("mock cloneVoice consent guard (critical path #7)", () => {
  beforeEach(() => {
    mocks.hasVoiceConsent.mockReset();
  });

  it("REFUSES with no consent record", async () => {
    mocks.hasVoiceConsent.mockResolvedValue(false);
    await expect(
      mockClone({ audioUrl: "https://example.com/a.mp3", userId: "u1" })
    ).rejects.toThrow(/no voice consent/i);
  });

  it("PROCEEDS when consent is recorded", async () => {
    mocks.hasVoiceConsent.mockResolvedValue(true);
    const result = await mockClone({
      audioUrl: "https://example.com/a.mp3",
      userId: "u1",
    });
    expect(result.voiceId).toMatch(/^voice_clone_/);
  });
});
