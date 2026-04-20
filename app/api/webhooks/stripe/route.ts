import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateUser, getUserByClerkId, recordStripeEvent } from "@/lib/services/db";
import { sendEmail } from "@/lib/services/resend";
import {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_STARTER_MONTHLY,
  STRIPE_PRICE_STARTER_ANNUAL,
  STRIPE_PRICE_SOLO,
  STRIPE_PRICE_SOLO_ANNUAL,
  STRIPE_PRICE_CREATOR,
  STRIPE_PRICE_CREATOR_ANNUAL,
  STRIPE_PRICE_STUDIO,
  STRIPE_PRICE_STUDIO_ANNUAL,
} from "@/lib/env";
import type { SubscriptionTier } from "@/lib/types/user";

export const runtime = "nodejs";

// Register this URL in the Stripe dashboard:
//   Developers → Webhooks → Add endpoint → https://yourdomain.com/api/webhooks/stripe
//   Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted

/**
 * Build price→tier map. Skip empty env values so an unset STRIPE_PRICE_*
 * doesn't map "" → tier and let any webhook with a missing priceId resolve
 * to a paid tier.
 */
function buildPriceToTierMap(): Record<string, SubscriptionTier> {
  const map: Record<string, SubscriptionTier> = {};
  const entries: Array<[string | undefined, SubscriptionTier]> = [
    [STRIPE_PRICE_STARTER_MONTHLY, "starter"],
    [STRIPE_PRICE_STARTER_ANNUAL, "starter"],
    [STRIPE_PRICE_SOLO, "solo"],
    [STRIPE_PRICE_SOLO_ANNUAL, "solo"],
    [STRIPE_PRICE_CREATOR, "creator"],
    [STRIPE_PRICE_CREATOR_ANNUAL, "creator"],
    [STRIPE_PRICE_STUDIO, "studio"],
    [STRIPE_PRICE_STUDIO_ANNUAL, "studio"],
  ];
  for (const [priceId, tier] of entries) {
    if (priceId && priceId.trim()) map[priceId] = tier;
  }
  return map;
}

export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe-webhook] Stripe not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // ─── Critical path #2: idempotency ────────────────────────────────────────
  // Stripe retries on any non-2xx, including transient network blips. Without
  // a dedupe check, the same `checkout.session.completed` could activate the
  // plan twice and send two billing-confirmed emails.
  const isFirstSeen = await recordStripeEvent(event.id).catch((err) => {
    // If the dedupe layer itself fails, fail closed — better to retry the
    // webhook than to risk double-processing.
    console.error("[stripe-webhook] idempotency check failed:", err);
    return null;
  });

  if (isFirstSeen === null) {
    return NextResponse.json(
      { error: "Idempotency layer unavailable" },
      { status: 503 }
    );
  }

  if (!isFirstSeen) {
    // Already processed — return 200 so Stripe stops retrying.
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const PRICE_TO_TIER = buildPriceToTierMap();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, tier } = session.metadata ?? {};

    if (userId && tier) {
      // Resolve user FIRST so we can verify the metadata matches a real user
      // and update by their internal ID rather than trusting the metadata
      // claim blindly.
      const user = await getUserByClerkId(userId).catch(() => null);
      if (!user) {
        console.warn("[stripe-webhook] checkout for unknown user:", userId);
        return NextResponse.json({ ok: true });
      }
      await updateUser(user.id, { subscriptionTier: tier as SubscriptionTier });

      if (user.email) {
        sendEmail({
          to: user.email,
          template: "billing-confirmed",
          data: { displayName: user.displayName, tier },
        }).catch((err) =>
          console.error("[stripe-webhook] billing-confirmed email failed:", err)
        );
      }
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.userId;
    if (!userId) return NextResponse.json({ ok: true });

    const user = await getUserByClerkId(userId);
    if (!user) return NextResponse.json({ ok: true });

    const priceId = sub.items.data[0]?.price.id ?? "";

    // MED-4: if Stripe sends a priceId we don't know, don't nuke the user to
    // trial — that would demote every Creator/Studio customer on a misconfigured
    // env var. Log and ack; real operator intervention needed.
    if (priceId && !(priceId in PRICE_TO_TIER)) {
      console.warn("[stripe-webhook] unknown priceId:", priceId, "— not mutating user tier");
      return NextResponse.json({ ok: true, reason: "unknown_price" });
    }

    // HIGH-1: honor sub.status. past_due / paused / unpaid / incomplete_expired
    // should not retain paid access. Keep paid tier only when actively paying
    // (active / trialing) OR scheduled to cancel at period end AND still inside
    // the paid window.
    const nowMs = Date.now();
    // Stripe v22: current_period_end moved to SubscriptionItem.
    const itemPeriodEnd = sub.items.data[0]?.current_period_end ?? 0;
    const periodEndMs = itemPeriodEnd ? itemPeriodEnd * 1000 : 0;
    const isPaying = sub.status === "active" || sub.status === "trialing";
    const isScheduledCancelStillValid =
      sub.cancel_at_period_end === true && periodEndMs > nowMs;
    const mappedTier = PRICE_TO_TIER[priceId];
    const nextTier: SubscriptionTier =
      mappedTier && (isPaying || isScheduledCancelStillValid) ? mappedTier : "trial";

    await updateUser(user.id, {
      subscriptionTier: nextTier,
      currentPeriodEnd: periodEndMs || null,
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.userId;
    if (!userId) return NextResponse.json({ ok: true });

    const user = await getUserByClerkId(userId);
    if (!user) return NextResponse.json({ ok: true });

    // HIGH-2: honor access-through-period-end. Stripe usually fires .deleted at
    // period end for cancel_at_period_end=true, so current_period_end is
    // typically in the past. If somehow still in the future (immediate cancel
    // with pro-rata), keep paid tier until the period actually ends.
    const nowMs = Date.now();
    const itemPeriodEnd = sub.items.data[0]?.current_period_end ?? 0;
    const periodEndMs = itemPeriodEnd ? itemPeriodEnd * 1000 : 0;
    if (periodEndMs > nowMs) {
      console.warn(
        "[stripe-webhook] .deleted received but current_period_end is in the future; keeping paid tier until",
        new Date(periodEndMs).toISOString()
      );
      // Leave subscriptionTier unchanged; persist periodEnd so downstream can gate.
      await updateUser(user.id, { currentPeriodEnd: periodEndMs });
    } else {
      await updateUser(user.id, { subscriptionTier: "trial", currentPeriodEnd: null });
    }
  }

  return NextResponse.json({ ok: true });
}
