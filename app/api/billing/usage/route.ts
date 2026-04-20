/**
 * GET /api/billing/usage
 *
 * Returns the caller's current-month video usage against their tier cap.
 * Used by the dashboard header ("12 of 15 videos this month") and the
 * billing settings page. No mutations.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { getUsageForUser } from "@/lib/services/credits";

export async function GET() {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkRateLimit(userId, "billing/usage", 60, "1 m");
  if (limited) return limited;

  const usage = await getUsageForUser(userId);
  if (!usage) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: usage, error: null });
}
