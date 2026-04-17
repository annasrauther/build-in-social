/**
 * POST /api/onboard/voice
 *
 * Critical path #7: voice clone consent MUST be recorded in the DB BEFORE
 * any ElevenLabs API call. ElevenLabs ToS and most jurisdictions require
 * provable consent for biometric voice cloning.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { recordVoiceConsent } from "@/lib/services/db";

const VoiceSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("library"),
    voiceId: z.string().min(1),
  }),
  z.object({
    mode: z.literal("clone"),
    fileName: z.string().min(1),
    // Hard requirement: explicit, server-validated consent boolean.
    consent: z.literal(true, {
      errorMap: () => ({
        message:
          "Voice clone consent is required. Check the consent box to continue.",
      }),
    }),
  }),
]);

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const result = VoiceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // ── Critical path #7: persist consent BEFORE any ElevenLabs call ─────
    if (result.data.mode === "clone") {
      await recordVoiceConsent({
        userId,
        consentedAt: new Date().toISOString(),
        ipAddress:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          req.headers.get("x-real-ip") ??
          undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      });
    }

    // The actual ElevenLabs cloneVoice() call happens in a downstream step
    // (Sprint 7 worker). cloneVoice() now refuses to run without the consent
    // record this route just wrote.
    return NextResponse.json({ data: { saved: true }, error: null });
  } catch (error) {
    console.error("[onboard/voice]", error);
    return NextResponse.json(
      { data: null, error: "Failed to record voice choice" },
      { status: 500 }
    );
  }
}
