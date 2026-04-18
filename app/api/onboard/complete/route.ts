/**
 * POST /api/onboard/complete
 * Persists onboarding data to the user record in NoCodeBackend.
 * Called from the activation page after payment success.
 */

import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import {
  updateUser,
  createVoiceProfile,
  recordVoiceConsent,
} from "@/lib/services/db";
import { z } from "zod";

const onboardCompleteSchema = z.object({
  niche: z.string().max(500).optional(),
  tone: z.enum(["professional", "casual", "nerdy-warm", "fun-energetic"]).optional(),
  platforms: z.array(z.enum(["youtube", "instagram", "linkedin", "x"])).optional(),
  voiceChoice: z.enum(["library", "clone"]).optional(),
  libraryVoiceId: z.string().optional(),
  selectedTier: z.enum(["solo", "creator", "studio"]).optional(),
  productName: z.string().max(200).optional(),
  productDescription: z.string().max(1000).optional(),
  voiceConsentAt: z.string().optional(),
});

export async function POST(request: Request) {
  let user;
  let userId: string;
  try {
    user = await getOrCreateUser();
    userId = user.clerkUserId;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await request.json();
    const parsed = onboardCompleteSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const {
      niche,
      tone,
      platforms,
      voiceChoice,
      libraryVoiceId,
      selectedTier,
      productName,
      voiceConsentAt,
    } = parsed.data;

    // Critical path #7: persist voice consent to DB BEFORE creating any
    // voice profile (which is the trigger for downstream ElevenLabs calls).
    // The /api/onboard/voice route also writes this; we double-write here for
    // the activation submit path. recordVoiceConsent is upsert-safe.
    if (voiceChoice === "clone") {
      if (!voiceConsentAt) {
        return NextResponse.json(
          { error: "Voice clone consent timestamp is required for clone mode" },
          { status: 422 }
        );
      }
      await recordVoiceConsent({
        userId,
        consentedAt: voiceConsentAt,
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          undefined,
        userAgent: request.headers.get("user-agent") ?? undefined,
      });
    }

    // Create voice profile if voice was selected
    let voiceProfileId: string | undefined;
    if (voiceChoice && libraryVoiceId) {
      const voiceProfile = await createVoiceProfile({
        userId: user.id,
        elevenLabsVoiceId: String(libraryVoiceId),
        name: String(libraryVoiceId),
        isClone: voiceChoice === "clone",
      });
      voiceProfileId = voiceProfile.id;
    }

    // Persist all onboarding data to user record
    await updateUser(user.id, {
      niche: niche ?? undefined,
      tone: tone ?? undefined,
      platforms: platforms ?? undefined,
      brandName: productName ?? undefined,
      onboardingComplete: true,
      subscriptionTier: selectedTier ?? "creator",
      voiceProfileId,
    });

    return NextResponse.json({
      data: {
        success: true,
        userId: user.id,
        voiceProfileId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete onboarding";
    console.error("[onboard/complete]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
