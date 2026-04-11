export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createBillingPortalSession } from "@/lib/services/stripe";
import { requireAuth } from "@/lib/auth";
import { getUserByClerkId } from "@/lib/services/db";

export async function POST(_req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  const user = await getUserByClerkId(userId);
  // Use Stripe customer ID from user record, or fall back to mock for dev
  // stripeCustomerId is not yet on the User type; will be added when Stripe webhook stores it
  const customerId = (user as unknown as Record<string, unknown>)?.stripeCustomerId as string | undefined ?? "cus_mock";

  try {
    const { portalUrl } = await createBillingPortalSession({
      userId,
      customerId,
    });

    return NextResponse.json({ data: { portalUrl }, error: null });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Portal session creation failed";
    console.error("[billing/portal] error:", err);
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}
