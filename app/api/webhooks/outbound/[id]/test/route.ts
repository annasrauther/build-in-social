/**
 * POST /api/webhooks/outbound/[id]/test — synchronous test delivery.
 * Body is a fixed `webhook.test` payload.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getWebhookSubscription } from "@/lib/services/db";
import { sendTestWebhook } from "@/lib/services/webhooks";
import { checkRateLimit } from "@/lib/services/rate-limit";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const limited = await checkRateLimit(userId, "webhooks/test", 20, "1 m");
  if (limited) return limited;

  const sub = await getWebhookSubscription(id);
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (sub.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const result = await sendTestWebhook(id);
  return NextResponse.json({
    data: {
      success: result.success,
      status: result.status,
      attempts: result.attempts,
      error: result.error,
    },
    error: null,
  });
}
