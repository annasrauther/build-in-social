/**
 * GET /api/cron/series
 * Daily cron job (Vercel Cron) — generates autopilot content for users with active subscriptions.
 *
 * Protected by CRON_SECRET header validation (Vercel injects this automatically).
 */

export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // In Phase 1 with mock/stub layer, this is a no-op that confirms the cron is reachable.
    // When NoCodeBackend + Claude API keys are connected, this will:
    // 1. Query users with active autopilot subscriptions
    // 2. Generate weekly series content via generateSeriesPlan
    // 3. Create videos and content weeks for each user

    return NextResponse.json({
      data: {
        ok: true,
        message: "Cron series check complete",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron series failed";
    console.error("[cron/series] error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
