/**
 * Tests for /api/settings/platform-connect (Sprint 1 stub).
 *
 * Route currently returns 501 "Not implemented". These tests lock that
 * behaviour plus the auth guard.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(async () => "clerk_user_01"),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  getAuthUserId: mocks.requireAuth,
}));

import { POST } from "./route";
import { NextRequest } from "next/server";

function buildReq(): NextRequest {
  return new Request("http://localhost/api/settings/platform-connect", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ platform: "youtube" }),
  }) as unknown as NextRequest;
}

describe("POST /api/settings/platform-connect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue("clerk_user_01");
  });

  it("returns 501 with an error describing the stub state", async () => {
    const res = await POST(buildReq());
    expect(res.status).toBe(501);
    const json = await res.json();
    expect(json.error).toBeDefined();
    expect(typeof json.error).toBe("string");
    expect(json.error).toMatch(/not.*implemented/i);
  });

  it("returns 401 when unauthenticated", async () => {
    mocks.requireAuth.mockRejectedValueOnce(new Error("UNAUTHORIZED") as never);
    const res = await POST(buildReq());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });
});
