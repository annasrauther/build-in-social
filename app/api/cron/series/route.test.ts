/**
 * Tests for /api/cron/series — scheduler correctness.
 *
 * Covers CRON_SECRET auth, the due-then-advance cycle, idempotency (series
 * not yet due are left alone), and the paused-series skip.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Force a known CRON_SECRET for auth tests.
vi.mock("@/lib/env", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/env")>();
  return { ...actual, CRON_SECRET: "test-cron-secret" };
});

import { GET } from "./route";
import { createSeries, updateSeries } from "@/lib/services/db";
import { _resetSeries } from "@/lib/mock/nocodebackend.mock";

beforeEach(() => {
  _resetSeries();
});

function cronReq(auth: string | null): Request {
  const headers: Record<string, string> = {};
  if (auth !== null) headers.authorization = auth;
  return new Request("http://localhost/api/cron/series", {
    method: "GET",
    headers,
  });
}

async function makeSeries(overrides: {
  nextVideoAt?: string;
  status?: "active" | "paused" | "completed";
}) {
  const series = await createSeries("user_A", {
    name: "Test",
    topic: "test topic",
    contentType: "tutorial",
    facelessStyle: "slide",
    frequency: "daily",
    platforms: ["youtube"],
    mode: "faceless",
    startDate: new Date().toISOString(),
  });
  if (overrides.nextVideoAt !== undefined || overrides.status) {
    await updateSeries(series.id, {
      nextVideoAt: overrides.nextVideoAt,
      status: overrides.status ?? "active",
    });
  }
  return series;
}

describe("GET /api/cron/series — auth", () => {
  it("rejects requests without a bearer header", async () => {
    const res = await GET(cronReq(null) as never);
    expect(res.status).toBe(401);
  });

  it("rejects a wrong bearer token", async () => {
    const res = await GET(cronReq("Bearer wrong-secret") as never);
    expect(res.status).toBe(401);
  });

  it("accepts the correct bearer token", async () => {
    const res = await GET(cronReq("Bearer test-cron-secret") as never);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/cron/series — scheduling", () => {
  it("advances nextVideoAt for series that are due (nextVideoAt in the past) and queues a video", async () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    await makeSeries({ nextVideoAt: past });

    const res = await GET(cronReq("Bearer test-cron-secret") as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.scanned).toBe(1);
    expect(json.data.advanced).toBe(1);
    expect(json.data.generatedVideoIds.length).toBe(1);
    expect(Array.isArray(json.data.errors)).toBe(true);

    // Re-running should be a no-op now that nextVideoAt is in the future.
    const res2 = await GET(cronReq("Bearer test-cron-secret") as never);
    const json2 = await res2.json();
    expect(json2.data.advanced).toBe(0);
    expect(json2.data.generatedVideoIds.length).toBe(0);
  });

  it("advances brand-new series immediately (nextVideoAt undefined)", async () => {
    await makeSeries({});

    const res = await GET(cronReq("Bearer test-cron-secret") as never);
    const json = await res.json();
    expect(json.data.scanned).toBe(1);
    expect(json.data.advanced).toBe(1);
  });

  it("does NOT advance paused series — they're excluded from the active list", async () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    await makeSeries({ nextVideoAt: past, status: "paused" });

    const res = await GET(cronReq("Bearer test-cron-secret") as never);
    const json = await res.json();
    expect(json.data.scanned).toBe(0);
    expect(json.data.advanced).toBe(0);
  });

  it("leaves future-scheduled series alone", async () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await makeSeries({ nextVideoAt: future });

    const res = await GET(cronReq("Bearer test-cron-secret") as never);
    const json = await res.json();
    expect(json.data.scanned).toBe(1);
    expect(json.data.advanced).toBe(0);
  });

  it("returns a well-shaped payload on empty store", async () => {
    const res = await GET(cronReq("Bearer test-cron-secret") as never);
    const json = await res.json();
    expect(json.data).toMatchObject({
      ok: true,
      scanned: 0,
      advanced: 0,
      generatedVideoIds: [],
      errors: [],
    });
    expect(typeof json.data.timestamp).toBe("string");
  });
});
