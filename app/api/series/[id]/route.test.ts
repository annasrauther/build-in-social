/**
 * Tests for /api/series/[id] — fetch, patch, delete, and owner-scoping.
 *
 * Ownership guard collapses "not yours" into 404 (not 403) on purpose —
 * leaking existence of another user's series is a soft info-disclosure.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const currentUserId = { value: "test_user_01" };

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(async () => currentUserId.value),
  getAuthUserId: vi.fn(async () => currentUserId.value),
}));
vi.mock("@/lib/services/rate-limit", () => ({
  checkRateLimit: vi.fn(async () => null),
}));

import { POST as createSeriesRoute } from "../route";
import { GET, PATCH, DELETE } from "./route";
import { POST as activateRoute } from "./activate/route";
import { POST as pauseRoute } from "./pause/route";
import { _resetSeries } from "@/lib/mock/nocodebackend.mock";

beforeEach(() => {
  _resetSeries();
  currentUserId.value = "test_user_01";
});

async function createSeries(bodyOverrides: Record<string, unknown> = {}) {
  const body = {
    name: "Weekly React tips",
    topic: "React performance optimization",
    contentType: "tutorial",
    facelessStyle: "slide",
    frequency: "3x-week",
    platforms: ["youtube", "linkedin"],
    mode: "faceless",
    ...bodyOverrides,
  };
  const res = await createSeriesRoute(
    new Request("http://localhost/api/series", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  );
  return (await res.json()).data as { id: string };
}

function mkCtx(id: string) {
  return { params: Promise.resolve({ id }) };
}

function jsonReq(method: string, body: unknown): Request {
  return new Request("http://localhost/api/series/some-id", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/series/[id]", () => {
  it("returns the series for the owner", async () => {
    const { id } = await createSeries();
    const res = await GET(new Request("http://localhost/"), mkCtx(id));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe(id);
  });

  it("returns 404 when the series does not exist", async () => {
    const res = await GET(new Request("http://localhost/"), mkCtx("srs_missing"));
    expect(res.status).toBe(404);
  });

  it("returns 404 (not 403) when the series belongs to another user", async () => {
    const { id } = await createSeries();
    currentUserId.value = "test_user_02";
    const res = await GET(new Request("http://localhost/"), mkCtx(id));
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/series/[id]", () => {
  it("updates mutable fields and returns the new record", async () => {
    const { id } = await createSeries();
    const res = await PATCH(
      jsonReq("PATCH", { name: "Renamed", frequency: "daily" }),
      mkCtx(id)
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.name).toBe("Renamed");
    expect(json.data.frequency).toBe("daily");
  });

  it("leaves userId/id/createdAt untouched — immutable identity fields", async () => {
    const { id } = await createSeries();
    const before = (
      await (await GET(new Request("http://localhost/"), mkCtx(id))).json()
    ).data;
    await PATCH(jsonReq("PATCH", { name: "x" }), mkCtx(id));
    const after = (
      await (await GET(new Request("http://localhost/"), mkCtx(id))).json()
    ).data;
    expect(after.id).toBe(before.id);
    expect(after.userId).toBe(before.userId);
    expect(after.createdAt).toBe(before.createdAt);
  });

  it("rejects an empty patch body — at least one field required", async () => {
    const { id } = await createSeries();
    const res = await PATCH(jsonReq("PATCH", {}), mkCtx(id));
    expect(res.status).toBe(400);
  });

  it("rejects unknown fields (strict schema)", async () => {
    const { id } = await createSeries();
    const res = await PATCH(jsonReq("PATCH", { foo: 1 }), mkCtx(id));
    expect(res.status).toBe(400);
  });

  it("cannot patch another user's series — 404", async () => {
    const { id } = await createSeries();
    currentUserId.value = "test_user_02";
    const res = await PATCH(jsonReq("PATCH", { name: "hijacked" }), mkCtx(id));
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/series/[id]", () => {
  it("deletes owner's series and subsequent GETs return 404", async () => {
    const { id } = await createSeries();
    const del = await DELETE(new Request("http://localhost/", { method: "DELETE" }), mkCtx(id));
    expect(del.status).toBe(200);
    const fetched = await GET(new Request("http://localhost/"), mkCtx(id));
    expect(fetched.status).toBe(404);
  });

  it("404s when deleting another user's series", async () => {
    const { id } = await createSeries();
    currentUserId.value = "test_user_02";
    const del = await DELETE(new Request("http://localhost/", { method: "DELETE" }), mkCtx(id));
    expect(del.status).toBe(404);
  });
});

describe("POST /api/series/[id]/activate + /pause — lifecycle", () => {
  it("pauses an active series", async () => {
    const { id } = await createSeries();
    const paused = await pauseRoute(
      new Request("http://localhost/", { method: "POST" }),
      mkCtx(id)
    );
    expect(paused.status).toBe(200);
    expect((await paused.json()).data.status).toBe("paused");
  });

  it("pause is idempotent on an already-paused series", async () => {
    const { id } = await createSeries();
    await pauseRoute(new Request("http://localhost/", { method: "POST" }), mkCtx(id));
    const again = await pauseRoute(
      new Request("http://localhost/", { method: "POST" }),
      mkCtx(id)
    );
    expect(again.status).toBe(200);
    expect((await again.json()).data.status).toBe("paused");
  });

  it("activates a paused series", async () => {
    const { id } = await createSeries();
    await pauseRoute(new Request("http://localhost/", { method: "POST" }), mkCtx(id));
    const activated = await activateRoute(
      new Request("http://localhost/", { method: "POST" }),
      mkCtx(id)
    );
    expect(activated.status).toBe(200);
    expect((await activated.json()).data.status).toBe("active");
  });

  it("activate on an already-active series is idempotent", async () => {
    const { id } = await createSeries();
    const res = await activateRoute(
      new Request("http://localhost/", { method: "POST" }),
      mkCtx(id)
    );
    expect(res.status).toBe(200);
    expect((await res.json()).data.status).toBe("active");
  });

  it("lifecycle routes are owner-scoped", async () => {
    const { id } = await createSeries();
    currentUserId.value = "test_user_02";
    const p = await pauseRoute(
      new Request("http://localhost/", { method: "POST" }),
      mkCtx(id)
    );
    expect(p.status).toBe(404);
    const a = await activateRoute(
      new Request("http://localhost/", { method: "POST" }),
      mkCtx(id)
    );
    expect(a.status).toBe(404);
  });
});
