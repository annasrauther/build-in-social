export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createBillingPortalSession } from "@/lib/services/stripe";
import { requireAuth } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  // TODO: look up customerId from DB using userId
  const customerId = "cus_mock";

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
