export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSubscriptionCheckout } from "@/lib/services/stripe";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { PACKAGES } from "@/lib/types/billing";

const validPackageIds = Object.keys(PACKAGES) as [
  "solo" | "creator" | "studio",
  ...("solo" | "creator" | "studio")[],
];

const CheckoutBodySchema = z.object({
  packageId: z.enum(validPackageIds),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = CheckoutBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        error: parsed.error.issues
          .map((i) => i.message)
          .join(", "),
      },
      { status: 400 }
    );
  }

  const { packageId } = parsed.data;

  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkRateLimit(userId, "billing/checkout", 3, "1 m");
  if (limited) return limited;

  try {
    const { sessionUrl } = await createSubscriptionCheckout({
      packageId,
      userId,
      trialDays: 14,
    });

    return NextResponse.json({ data: { sessionUrl }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("[billing/checkout] error:", err);
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 }
    );
  }
}
