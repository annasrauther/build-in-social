/**
 * DELETE /api/webhooks/outbound/[id] — hard delete a subscription.
 * PATCH  /api/webhooks/outbound/[id] — update url/events/status.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/auth";
import {
  getWebhookSubscription,
  deleteWebhookSubscription,
  updateWebhookSubscription,
} from "@/lib/services/db";
import { validateWebhookUrl } from "@/lib/services/webhooks";
import {
  WEBHOOK_EVENT_TYPES,
  type WebhookEventType,
} from "@/lib/types/webhook";

const patchSchema = z
  .object({
    url: z.string().min(1).max(500).optional(),
    events: z
      .array(
        z.enum(
          WEBHOOK_EVENT_TYPES as unknown as [WebhookEventType, ...WebhookEventType[]]
        )
      )
      .min(1)
      .optional(),
    status: z.enum(["active", "disabled"]).optional(),
  })
  .strict();

async function loadOwned(id: string, userId: string) {
  const sub = await getWebhookSubscription(id);
  if (!sub) return { sub: null, status: 404 as const };
  if (sub.userId !== userId) return { sub: null, status: 403 as const };
  return { sub, status: 200 as const };
}

export async function DELETE(
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
  const { sub, status } = await loadOwned(id, userId);
  if (!sub) {
    return NextResponse.json(
      { error: status === 403 ? "Forbidden" : "Not found" },
      { status }
    );
  }
  const ok = await deleteWebhookSubscription(id);
  if (!ok) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
  return NextResponse.json({ data: { id, deleted: true }, error: null });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { sub, status } = await loadOwned(id, userId);
  if (!sub) {
    return NextResponse.json(
      { error: status === 403 ? "Forbidden" : "Not found" },
      { status }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid fields", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.url !== undefined) {
    const urlCheck = validateWebhookUrl(parsed.data.url);
    if (!urlCheck.ok) {
      return NextResponse.json(
        { error: urlCheck.reason ?? "Invalid URL" },
        { status: 400 }
      );
    }
  }

  const updated = await updateWebhookSubscription(id, {
    url: parsed.data.url,
    events: parsed.data.events
      ? Array.from(new Set(parsed.data.events))
      : undefined,
    status: parsed.data.status,
  });
  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
  const { secret: _s, ...safe } = updated;
  void _s;
  return NextResponse.json({ data: safe, error: null });
}
