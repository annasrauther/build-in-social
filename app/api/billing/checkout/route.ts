export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSubscriptionCheckout } from "@/lib/services/stripe";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { PACKAGES } from "@/lib/types/billing";
import { assertSameOrigin } from "@/lib/security/csrf";

type PaidTier = "starter" | "solo" | "creator" | "studio";
const validPackageIds = Object.keys(PACKAGES) as [PaidTier, ...PaidTier[]];

const CheckoutBodySchema = z.object({
  packageId: z.enum(validPackageIds),
  cycle: z.enum(["monthly", "annual"]).optional(),
});

export async function POST(req: NextRequest) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
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

  const { packageId, cycle } = parsed.data;

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
      cycle,
    });

    return NextResponse.json({ data: { sessionUrl }, error: null });
  } catch (err) {
    // SECURITY (M6): log full error, return generic message to client.
    console.error("[billing/checkout] error:", err);
    return NextResponse.json(
      { data: null, error: "Internal error" },
      { status: 500 }
    );
  }
}
