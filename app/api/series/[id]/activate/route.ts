/**
 * POST /api/series/[id]/activate — move a paused/completed series back to "active".
 *
 * Activation is idempotent: re-activating an already-active series is a no-op
 * that still returns 200 with the current record. The scheduler looks at
 * status=active to decide whether to generate the next video.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getSeriesById, updateSeries } from "@/lib/services/db";
import { checkRateLimit } from "@/lib/services/rate-limit";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await getSeriesById(id);
  if (!record || record.userId !== userId) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }

  const limited = await checkRateLimit(userId, "series/activate", 30, "1 m");
  if (limited) return limited;

  if (record.status === "active") {
    return NextResponse.json({ data: record, error: null });
  }

  const updated = await updateSeries(id, { status: "active" });
  if (!updated) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }
  return NextResponse.json({ data: updated, error: null });
}
