/**
 * GET  /api/webhooks/outbound — list subscriptions for the current user.
 * POST /api/webhooks/outbound — create a new subscription.
 *
 * The secret is returned ONLY in the POST response so the UI can show it once.
 * Subsequent GETs redact it.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/auth";
import {
  listWebhookSubscriptions,
  createWebhookSubscription,
} from "@/lib/services/db";
import {
  generateWebhookSecret,
  validateWebhookUrl,
} from "@/lib/services/webhooks";
import {
  WEBHOOK_EVENT_TYPES,
  type PublicWebhookSubscription,
  type WebhookEventType,
} from "@/lib/types/webhook";
import { checkRateLimit } from "@/lib/services/rate-limit";

function redact(
  subs: Awaited<ReturnType<typeof listWebhookSubscriptions>>
): PublicWebhookSubscription[] {
  return subs.map((s) => {
    const { secret: _unused, ...rest } = s;
    void _unused;
    return rest;
  });
}

export async function GET() {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subs = await listWebhookSubscriptions(userId);
  return NextResponse.json({ data: redact(subs), error: null });
}

const createSchema = z
  .object({
    url: z.string().min(1).max(500),
    events: z
      .array(z.enum(WEBHOOK_EVENT_TYPES as unknown as [WebhookEventType, ...WebhookEventType[]]))
      .min(1)
      .max(WEBHOOK_EVENT_TYPES.length),
  })
  .strict();

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkRateLimit(userId, "webhooks/create", 20, "1 m");
  if (limited) return limited;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid fields", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const urlCheck = validateWebhookUrl(parsed.data.url);
  if (!urlCheck.ok) {
    return NextResponse.json(
      { error: urlCheck.reason ?? "Invalid URL" },
      { status: 400 }
    );
  }

  const secret = generateWebhookSecret();
  // De-dupe events.
  const events = Array.from(new Set(parsed.data.events));

  const created = await createWebhookSubscription({
    userId,
    url: parsed.data.url,
    events,
    secret,
    status: "active",
  });

  // Return the secret ONCE.
  return NextResponse.json({
    data: { ...created, secret },
    error: null,
  });
}
