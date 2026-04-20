/**
 * GET /api/dev/billing/activate?tier=creator&userId=X
 *
 * Dev-only endpoint that simulates a completed Stripe checkout.
 * Activates the user's plan directly in the DB and redirects to the
 * success page — exactly what the real Stripe webhook does, without
 * needing Stripe keys or a live webhook tunnel.
 *
 * Returns 404 in production. Never reachable by end users.
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId, updateUser } from "@/lib/services/db";
import { sendEmail } from "@/lib/services/resend";
import type { SubscriptionTier } from "@/lib/types/user";

const VALID_TIERS = new Set<SubscriptionTier>(["starter", "solo", "creator", "studio"]);

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const tier = searchParams.get("tier") as SubscriptionTier | null;
  const userId = searchParams.get("userId") ?? "";

  if (!tier || !VALID_TIERS.has(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const user = await getUserByClerkId(userId).catch(() => null);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await updateUser(user.id, { subscriptionTier: tier });

  sendEmail({
    to: user.email,
    template: "billing-confirmed",
    data: { displayName: user.displayName ?? "there", tier },
  }).catch(() => null);

  return NextResponse.redirect(
    new URL(`/settings/billing?upgrade_success=true&tier=${tier}`, req.url)
  );
}
