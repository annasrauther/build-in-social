/**
 * POST /api/onboard/complete
 * Persists onboarding data to the user record in NoCodeBackend.
 * Called from the activation page after payment success.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserByClerkId, updateUser, createVoiceProfile } from "@/lib/services/db";
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
  let userId: string;
  try {
    userId = await requireAuth();
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

    // Find the user in DB
    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found. Complete signup first." }, { status: 404 });
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

    // Log consent timestamp
    if (voiceConsentAt) {
      console.log(`[onboard/complete] Voice consent recorded for user ${user.id} at ${voiceConsentAt}`);
    }

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
