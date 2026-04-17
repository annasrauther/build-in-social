/**
 * Stripe service — subscription model.
 * Falls back to mock responses if STRIPE_SECRET_KEY is not set (local dev without Stripe).
 */

import {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_SOLO,
  STRIPE_PRICE_CREATOR,
  STRIPE_PRICE_STUDIO,
  APP_URL,
} from "@/lib/env";

const PRICE_IDS: Record<"solo" | "creator" | "studio", string | undefined> = {
  solo: STRIPE_PRICE_SOLO,
  creator: STRIPE_PRICE_CREATOR,
  studio: STRIPE_PRICE_STUDIO,
};

function getStripe() {
  if (!STRIPE_SECRET_KEY) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require("stripe");
  return new Stripe(STRIPE_SECRET_KEY) as import("stripe").default;
}

// ── Checkout ──────────────────────────────────────────────────────────────────

export async function createSubscriptionCheckout(params: {
  packageId: "solo" | "creator" | "studio";
  userId: string;
  userEmail?: string;
  trialDays?: number;
}): Promise<{ sessionUrl: string; sessionId: string }> {
  const stripe = getStripe();

  if (!stripe) {
    return {
      sessionUrl: "/dashboard?mock_checkout=true",
      sessionId: "mock_sess_xxx",
    };
  }

  const priceId = PRICE_IDS[params.packageId];
  if (!priceId) {
    throw new Error(
      `STRIPE_PRICE_${params.packageId.toUpperCase()} env var is not configured`
    );
  }

  const trialDays = params.trialDays ?? 14;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: trialDays,
      metadata: {
        userId: params.userId,
        tier: params.packageId,
      },
    },
    metadata: {
      userId: params.userId,
      tier: params.packageId,
    },
    ...(params.userEmail ? { customer_email: params.userEmail } : {}),
    success_url: `${APP_URL}/settings/billing?upgrade_success=true&tier=${params.packageId}`,
    cancel_url: `${APP_URL}/settings/billing`,
  });

  return {
    sessionUrl: session.url!,
    sessionId: session.id,
  };
}

// ── Billing portal ─────────────────────────────────────────────────────────────

export async function createBillingPortalSession(params: {
  userId: string;
  customerId: string;
}): Promise<{ portalUrl: string }> {
  const stripe = getStripe();

  if (!stripe) {
    return { portalUrl: "/settings/billing?mock_portal=true" };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: `${APP_URL}/settings/billing`,
  });

  return { portalUrl: session.url };
}

// ── Cancel subscription ────────────────────────────────────────────────────────

export async function cancelSubscription(
  subscriptionId: string
): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return; // no-op in mock mode

  await stripe.subscriptions.cancel(subscriptionId);
}

// ── Subscription status ────────────────────────────────────────────────────────

export async function getSubscriptionStatus(customerId: string): Promise<{
  status: "active" | "trialing" | "canceled" | "past_due" | "none";
  tier: "solo" | "creator" | "studio" | null;
  currentPeriodEnd: string | null;
}> {
  const stripe = getStripe();

  if (!stripe) {
    return { status: "none", tier: null, currentPeriodEnd: null };
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: "all",
    expand: ["data.items.data.price"],
  });

  const sub = subscriptions.data[0];
  if (!sub) {
    return { status: "none", tier: null, currentPeriodEnd: null };
  }

  const rawStatus = sub.status;
  const status: "active" | "trialing" | "canceled" | "past_due" | "none" =
    rawStatus === "active" ||
    rawStatus === "trialing" ||
    rawStatus === "canceled" ||
    rawStatus === "past_due"
      ? rawStatus
      : "none";

  const priceId = sub.items.data[0]?.price.id ?? "";
  const tierEntry = (
    Object.entries(PRICE_IDS) as Array<
      ["solo" | "creator" | "studio", string | undefined]
    >
  ).find(([, id]) => id === priceId);
  const tier = tierEntry ? tierEntry[0] : null;

  // Stripe v22 exposes current_period_end on the billing phase; access via cast
  const subAny = sub as unknown as { current_period_end?: number };
  const currentPeriodEnd =
    subAny.current_period_end != null
      ? new Date(subAny.current_period_end * 1000).toISOString()
      : null;

  return { status, tier, currentPeriodEnd };
}

// ── Webhook helper (kept for webhook route) ────────────────────────────────────

export async function constructWebhookEvent(
  payload: string,
  signature: string
) {
  const stripe = getStripe();
  const secret = STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    const { constructWebhookEvent: mockFn } = await import(
      "@/lib/mock/stripe.mock"
    );
    return mockFn(payload, signature);
  }

  return stripe.webhooks.constructEvent(payload, signature, secret);
}
