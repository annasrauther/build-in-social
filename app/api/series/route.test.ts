/**
 * Tests for /api/series — create + list.
 *
 * Exercises auth gating, Zod validation, owner-scoping on list, and the
 * mode/HeyGen-source cross-field constraint. Runs against the in-memory mock
 * DB (NOCODEBACKEND_SECRET_KEY unset in the test env).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Auth + rate limit stubs — shape matches lib/auth + lib/services/rate-limit.
const currentUserId = { value: "test_user_01" };

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(async () => currentUserId.value),
  getAuthUserId: vi.fn(async () => currentUserId.value),
}));
vi.mock("@/lib/services/rate-limit", () => ({
  checkRateLimit: vi.fn(async () => null),
}));

import { GET, POST } from "./route";
import { _resetSeries } from "@/lib/mock/nocodebackend.mock";

beforeEach(() => {
  _resetSeries();
  currentUserId.value = "test_user_01";
});

function buildCreateReq(body: unknown): Request {
  return new Request("http://localhost/api/series", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_FACELESS = {
  name: "Weekly React tips",
  topic: "React performance optimization",
  contentType: "tutorial",
  facelessStyle: "slide",
  frequency: "3x-week",
  platforms: ["youtube", "linkedin"],
  mode: "faceless",
};

describe("POST /api/series", () => {
  it("creates a faceless series with the authenticated user as owner", async () => {
    const res = await POST(buildCreateReq(VALID_FACELESS));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.error).toBeNull();
    expect(json.data.id).toMatch(/^srs_/);
    expect(json.data.userId).toBe("test_user_01");
    expect(json.data.mode).toBe("faceless");
    expect(json.data.status).toBe("active");
    expect(json.data.platforms).toEqual(["youtube", "linkedin"]);
    expect(json.data.videos).toEqual([]);
    expect(json.data.creditsConsumed).toBe(0);
  });

  it("accepts a heygen-avatar series with a source", async () => {
    const res = await POST(
      buildCreateReq({
        ...VALID_FACELESS,
        mode: "heygen-avatar",
        heygenAvatarSource: "licensed",
        heygenLicensedAvatarId: "hg_licensed_01",
      })
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.mode).toBe("heygen-avatar");
    expect(json.data.heygenAvatarSource).toBe("licensed");
  });

  it("rejects heygen-avatar mode without a source — cross-field guard", async () => {
    const res = await POST(
      buildCreateReq({ ...VALID_FACELESS, mode: "heygen-avatar" })
    );
    expect(res.status).toBe(400);
  });

  it("rejects faceless mode carrying a stray HeyGen source", async () => {
    const res = await POST(
      buildCreateReq({
        ...VALID_FACELESS,
        mode: "faceless",
        heygenAvatarSource: "twin",
      })
    );
    expect(res.status).toBe(400);
  });

  it("rejects unknown mode", async () => {
    const res = await POST(
      buildCreateReq({ ...VALID_FACELESS, mode: "not-a-mode" })
    );
    expect(res.status).toBe(400);
  });

  it("rejects empty platforms array", async () => {
    const res = await POST(
      buildCreateReq({ ...VALID_FACELESS, platforms: [] })
    );
    expect(res.status).toBe(400);
  });

  it("rejects unauthenticated requests", async () => {
    const { getAuthUserId } = await import("@/lib/auth");
    (getAuthUserId as unknown as { mockImplementationOnce: (fn: () => Promise<string>) => void }).mockImplementationOnce(
      async () => {
        throw new Error("UNAUTHORIZED");
      }
    );
    const res = await POST(buildCreateReq(VALID_FACELESS));
    expect(res.status).toBe(401);
  });

  it("rejects malformed JSON body", async () => {
    const req = new Request("http://localhost/api/series", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/series", () => {
  it("returns empty array when the user has no series", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
  });

  it("returns only the current user's series — isolation guard", async () => {
    // User A creates two
    await POST(buildCreateReq({ ...VALID_FACELESS, name: "A's first" }));
    await POST(buildCreateReq({ ...VALID_FACELESS, name: "A's second" }));
    // Switch to user B, create one
    currentUserId.value = "test_user_02";
    await POST(buildCreateReq({ ...VALID_FACELESS, name: "B's only" }));

    const resB = await GET();
    const jsonB = await resB.json();
    expect(jsonB.data).toHaveLength(1);
    expect(jsonB.data[0].name).toBe("B's only");

    currentUserId.value = "test_user_01";
    const resA = await GET();
    const jsonA = await resA.json();
    expect(jsonA.data).toHaveLength(2);
    expect(jsonA.data.map((s: { name: string }) => s.name).sort()).toEqual(
      ["A's first", "A's second"]
    );
  });

  it("rejects unauthenticated requests", async () => {
    const { getAuthUserId } = await import("@/lib/auth");
    (getAuthUserId as unknown as { mockImplementationOnce: (fn: () => Promise<string>) => void }).mockImplementationOnce(
      async () => {
        throw new Error("UNAUTHORIZED");
      }
    );
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
