/**
 * Tests for /api/render/faceless.
 *
 * Critical-path #1: credits deducted BEFORE queue submission, and refunded if
 * the queue submission fails.
 *
 * Covers:
 *   - Happy path: deducts, enqueues, returns { data: {...} }
 *   - Order: deductCreditForRender called BEFORE enqueueRenderJob
 *   - Queue failure → refundCreditForRender invoked
 *   - Auth reject: 401
 *   - Rate limit: 429
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(async () => "clerk_user_01"),
  checkRateLimit: vi.fn(async () => null),
  getVideo: vi.fn(async () => ({
    id: "vid_1",
    userId: "clerk_user_01",
    weekId: "week_1",
    title: "Test",
    scriptJson: { hook: "h", body: "b", cta: "c" },
    platform: "youtube",
    dayOfWeek: "mon",
    facelessStyle: "dev-log",
    durationSeconds: 30,
    contentType: "founder-story",
    status: "approved",
    createdAt: new Date().toISOString(),
  })),
  updateVideo: vi.fn(async () => ({})),
  createRenderJob: vi.fn(async () => ({
    id: "dbjob_1",
    userId: "clerk_user_01",
    videoId: "vid_1",
    status: "queued",
    createdAt: new Date().toISOString(),
  })),
  enqueueRenderJob: vi.fn(async () => ({ id: "qjob_1", status: "queued" })),
  deductCreditForRender: vi.fn(async () => ({
    ok: true as const,
    remaining: 9,
    budget: 10,
  })),
  refundCreditForRender: vi.fn(async () => ({ ok: true })),
  callOrder: [] as string[],
}));

vi.mock("@/lib/env", () => ({
  INTERNAL_SECRET: "test-secret",
  APP_URL: "http://localhost:3000",
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: mocks.requireAuth,
  getAuthUserId: mocks.requireAuth,
}));

vi.mock("@/lib/services/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
}));

vi.mock("@/lib/services/db", () => ({
  getVideo: mocks.getVideo,
  updateVideo: mocks.updateVideo,
  createRenderJob: mocks.createRenderJob,
}));

vi.mock("@/lib/services/queue", () => ({
  enqueueRenderJob: mocks.enqueueRenderJob,
}));

vi.mock("@/lib/services/credits", () => ({
  deductCreditForRender: mocks.deductCreditForRender,
  refundCreditForRender: mocks.refundCreditForRender,
}));

import { POST } from "./route";
import { NextRequest } from "next/server";

function buildReq(body: unknown): NextRequest {
  return new Request("http://localhost/api/render/faceless", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/render/faceless — critical path #1 (credit + queue)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.callOrder.length = 0;
    mocks.requireAuth.mockResolvedValue("clerk_user_01");
    mocks.checkRateLimit.mockResolvedValue(null);
    mocks.getVideo.mockResolvedValue({
      id: "vid_1",
      userId: "clerk_user_01",
      weekId: "week_1",
      title: "Test",
      scriptJson: { hook: "h", body: "b", cta: "c" },
      platform: "youtube",
      dayOfWeek: "mon",
      facelessStyle: "dev-log",
      durationSeconds: 30,
      contentType: "founder-story",
      status: "approved",
      createdAt: new Date().toISOString(),
    });
    mocks.deductCreditForRender.mockImplementation(async () => {
      mocks.callOrder.push("deduct");
      return { ok: true as const, remaining: 9, budget: 10 };
    });
    mocks.enqueueRenderJob.mockImplementation(async () => {
      mocks.callOrder.push("enqueue");
      return { id: "qjob_1", status: "queued" };
    });
    mocks.createRenderJob.mockResolvedValue({
      id: "dbjob_1",
      userId: "clerk_user_01",
      videoId: "vid_1",
      status: "queued",
      createdAt: new Date().toISOString(),
    });
    mocks.updateVideo.mockResolvedValue({});
    mocks.refundCreditForRender.mockResolvedValue({ ok: true });
  });

  it("happy path: deducts, enqueues, returns { data: {...} }", async () => {
    const res = await POST(buildReq({ videoId: "vid_1" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.jobId).toBe("qjob_1");
    expect(json.data.credits).toEqual({ remaining: 9, budget: 10 });
  });

  it("deducts credit BEFORE submitting to queue", async () => {
    await POST(buildReq({ videoId: "vid_1" }));
    expect(mocks.callOrder).toEqual(["deduct", "enqueue"]);
  });

  it("refunds credit if queue submission throws", async () => {
    mocks.enqueueRenderJob.mockRejectedValueOnce(new Error("queue down") as never);
    const res = await POST(buildReq({ videoId: "vid_1" }));
    expect(res.status).toBe(500);
    expect(mocks.refundCreditForRender).toHaveBeenCalledTimes(1);
    expect(mocks.refundCreditForRender).toHaveBeenCalledWith("clerk_user_01", "vid_1");
  });

  it("returns 401 when unauthenticated", async () => {
    mocks.requireAuth.mockRejectedValueOnce(new Error("UNAUTHORIZED") as never);
    const res = await POST(buildReq({ videoId: "vid_1" }));
    expect(res.status).toBe(401);
    expect(mocks.deductCreditForRender).not.toHaveBeenCalled();
  });

  it("returns 429 when rate-limited", async () => {
    mocks.checkRateLimit.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ data: null, error: { message: "Rate limit exceeded." } }),
        { status: 429, headers: { "content-type": "application/json" } }
      ) as never
    );
    const res = await POST(buildReq({ videoId: "vid_1" }));
    expect(res.status).toBe(429);
    expect(mocks.deductCreditForRender).not.toHaveBeenCalled();
  });
});
