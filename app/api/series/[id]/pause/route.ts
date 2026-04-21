/**
 * POST /api/series/[id]/pause — pause an active series.
 *
 * A paused series is skipped by the cron scheduler until activated again.
 * Idempotent: pausing a paused or completed series is a no-op 200.
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

  const limited = await checkRateLimit(userId, "series/pause", 30, "1 m");
  if (limited) return limited;

  if (record.status !== "active") {
    return NextResponse.json({ data: record, error: null });
  }

  const updated = await updateSeries(id, { status: "paused" });
  if (!updated) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }
  return NextResponse.json({ data: updated, error: null });
}
