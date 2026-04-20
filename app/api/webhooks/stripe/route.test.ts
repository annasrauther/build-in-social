/**
 * Critical path #2: Stripe webhook idempotency.
 *
 * Stripe retries on transient failures. Without dedupe, the same
 * checkout.session.completed event can:
 *   - activate the plan twice (double-billing on the customer's record)
 *   - send the billing-confirmed email twice
 *
 * recordStripeEvent must return true exactly once per event.id.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/env", () => ({
  STRIPE_SECRET_KEY: "sk_test_dummy",
  STRIPE_WEBHOOK_SECRET: "whsec_dummy",
  STRIPE_PRICE_STARTER_MONTHLY: "price_starter_m_test",
  STRIPE_PRICE_STARTER_ANNUAL: "price_starter_a_test",
  STRIPE_PRICE_SOLO: "price_solo_test",
  STRIPE_PRICE_SOLO_ANNUAL: "price_solo_a_test",
  STRIPE_PRICE_CREATOR: "price_creator_test",
  STRIPE_PRICE_CREATOR_ANNUAL: "price_creator_a_test",
  STRIPE_PRICE_STUDIO: "price_studio_test",
  STRIPE_PRICE_STUDIO_ANNUAL: "price_studio_a_test",
}));

// vi.mock is hoisted; use vi.hoisted so mock vars are also hoisted and
// available inside the factory.
const mocks = vi.hoisted(() => {
  const seenEvents = new Set<string>();
  return {
    seenEvents,
    updateUser: vi.fn(async () => ({})),
    getUserByClerkId: vi.fn(async (clerkId: string) => ({
      id: `db_${clerkId}`,
      clerkUserId: clerkId,
      email: "test@example.com",
      displayName: "Test User",
      brandName: "",
      tone: "casual" as const,
      platforms: [],
      onboardingComplete: true,
      subscriptionTier: "trial" as const,
      createdAt: new Date().toISOString(),
    })),
    sendEmail: vi.fn(async () => ({})),
    recordStripeEvent: vi.fn(async (eventId: string) => {
      if (seenEvents.has(eventId)) return false;
      seenEvents.add(eventId);
      return true;
    }),
  };
});

vi.mock("@/lib/services/db", () => ({
  updateUser: mocks.updateUser,
  getUserByClerkId: mocks.getUserByClerkId,
  recordStripeEvent: mocks.recordStripeEvent,
}));

vi.mock("@/lib/services/resend", () => ({
  sendEmail: mocks.sendEmail,
}));

// Stub Stripe's webhook signature constructor — we only care about dedupe + handler logic.
vi.mock("stripe", () => ({
  default: class FakeStripe {
    webhooks = {
      constructEvent: (payload: string) => JSON.parse(payload),
    };
  },
}));

import { POST } from "./route";

function makeReq(event: unknown): Request {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: {
      "stripe-signature": "test-sig",
      "content-type": "application/json",
    },
    body: JSON.stringify(event),
  });
}

const checkoutEvent = {
  id: "evt_test_001",
  type: "checkout.session.completed",
  data: {
    object: {
      metadata: { userId: "clerk_test_user", tier: "creator" },
    },
  },
};

describe("Stripe webhook idempotency (critical path #2)", () => {
  beforeEach(() => {
    mocks.seenEvents.clear();
    mocks.updateUser.mockClear();
    mocks.sendEmail.mockClear();
    mocks.recordStripeEvent.mockClear();
  });

  it("first delivery activates the plan and sends one email", async () => {
    const res = await POST(makeReq(checkoutEvent) as never);
    expect(res.status).toBe(200);
    expect(mocks.updateUser).toHaveBeenCalledTimes(1);
    expect(mocks.updateUser).toHaveBeenCalledWith("db_clerk_test_user", {
      subscriptionTier: "creator",
    });
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("duplicate delivery (same event.id) does NOT re-activate or re-email", async () => {
    await POST(makeReq(checkoutEvent) as never);
    const res2 = await POST(makeReq(checkoutEvent) as never);

    expect(res2.status).toBe(200);
    const json = await res2.json();
    expect(json.duplicate).toBe(true);

    // Still only one update + one email despite two webhook deliveries.
    expect(mocks.updateUser).toHaveBeenCalledTimes(1);
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("different event.id processes independently", async () => {
    await POST(makeReq(checkoutEvent) as never);
    const second = { ...checkoutEvent, id: "evt_test_002" };
    const res = await POST(makeReq(second) as never);

    expect(res.status).toBe(200);
    expect(mocks.updateUser).toHaveBeenCalledTimes(2);
  });

  it("ignores webhook for unknown user (no metadata match)", async () => {
    mocks.getUserByClerkId.mockResolvedValueOnce(null as never);
    const evt = { ...checkoutEvent, id: "evt_test_unknown" };
    const res = await POST(makeReq(evt) as never);
    expect(res.status).toBe(200);
    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });
});
