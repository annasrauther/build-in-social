import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateUser, getUserByClerkId } from "@/lib/services/db";
import { sendEmail } from "@/lib/services/resend";
import type { SubscriptionTier } from "@/lib/types/user";

export const runtime = "nodejs";

// Register this URL in the Stripe dashboard (Sprint 8):
//   Developers → Webhooks → Add endpoint → https://yourdomain.com/api/webhooks/stripe
//   Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted

const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
  [process.env.STRIPE_PRICE_SOLO ?? ""]: "solo",
  [process.env.STRIPE_PRICE_CREATOR ?? ""]: "creator",
  [process.env.STRIPE_PRICE_STUDIO ?? ""]: "studio",
};

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    console.error("[stripe-webhook] Stripe not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeKey);
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, tier } = session.metadata ?? {};

    if (userId && tier) {
      await updateUser(userId, { subscriptionTier: tier as SubscriptionTier });

      const user = await getUserByClerkId(userId).catch(() => null);
      if (user?.email) {
        sendEmail({
          to: user.email,
          template: "billing-confirmed",
          data: { displayName: user.displayName, tier },
        }).catch((err) => console.error("[stripe-webhook] billing-confirmed email failed:", err));
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
