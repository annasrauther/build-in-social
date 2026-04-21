/**
 * DELETE /api/voice/clone — remove the user's voice clone.
 * POST   /api/voice/clone — start a new clone (records fresh consent).
 *
 * Actual ElevenLabs cloneVoice() call still happens downstream in the render
 * pipeline — these endpoints only manage the stored clone profile + consent.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing/capabilities";
import { getUserByClerkId } from "@/lib/services/db";
import { checkRateLimit } from "@/lib/services/rate-limit";
import {
  deleteVoiceProfilesForUser,
  recordVoiceConsent,
} from "@/lib/services/db";

const StartCloneSchema = z
  .object({
    fileName: z.string().min(1).max(200),
    consent: z.literal(true, {
      errorMap: () => ({
        message: "Voice clone consent is required. Check the consent box.",
      }),
    }),
  })
  .strict();

export async function DELETE(_req: NextRequest) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkRateLimit(userId, "voice/clone/delete", 5, "1 m");
  if (limited) return limited;

  await deleteVoiceProfilesForUser(userId);
  return NextResponse.json({ data: { deleted: true }, error: null });
}

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Tier-gate — voice cloning is Creator+. We reject before recording fresh
  // consent so the DB doesn't accumulate consent records for users who can't
  // actually use the feature.
  const user = await getUserByClerkId(userId).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canUseFeature(user.subscriptionTier, "voice_clone")) {
    return NextResponse.json(
      { error: "Voice cloning is available on Creator and Studio plans" },
      { status: 403 },
    );
  }

  const limited = await checkRateLimit(userId, "voice/clone/start", 3, "1 m");
  if (limited) return limited;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = StartCloneSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid fields", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Critical path #7: record explicit consent before any ElevenLabs-adjacent
  // work. A prior clone's consent does not transfer — every re-record starts
  // a fresh record.
  await recordVoiceConsent({
    userId,
    consentedAt: new Date().toISOString(),
    ipAddress:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({
    data: { started: true, fileName: parsed.data.fileName },
    error: null,
  });
}
