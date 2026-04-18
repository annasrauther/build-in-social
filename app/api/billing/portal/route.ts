export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createBillingPortalSession } from "@/lib/services/stripe";
import { getOrCreateUser } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  let user;
  try {
    user = await getOrCreateUser();
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  // stripeCustomerId is not yet on the User type; added when Stripe webhook stores it
  const customerId = (user as unknown as Record<string, unknown>)?.stripeCustomerId as string | undefined ?? "cus_mock";

  try {
    const { portalUrl } = await createBillingPortalSession({
      userId: user.clerkUserId,
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
