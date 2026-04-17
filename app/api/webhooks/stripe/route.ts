import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateUser, getUserByClerkId, recordStripeEvent } from "@/lib/services/db";
import { sendEmail } from "@/lib/services/resend";
import {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_SOLO,
  STRIPE_PRICE_CREATOR,
  STRIPE_PRICE_STUDIO,
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
    [STRIPE_PRICE_SOLO, "solo"],
    [STRIPE_PRICE_CREATOR, "creator"],
    [STRIPE_PRICE_STUDIO, "studio"],
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
    const tier = PRICE_TO_TIER[priceId] ?? "trial";
    await updateUser(user.id, { subscriptionTier: tier });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.userId;
    if (!userId) return NextResponse.json({ ok: true });

    const user = await getUserByClerkId(userId);
    if (user) {
      await updateUser(user.id, { subscriptionTier: "trial" });
    }
  }

  return NextResponse.json({ ok: true });
}
