/**
 * POST /api/onboard/complete
 * Persists onboarding data to the user record in NoCodeBackend.
 * Called from the activation page after payment success.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserByClerkId, updateUser, createVoiceProfile } from "@/lib/services/db";
import type { ContentTone } from "@/lib/types/user";

export async function POST(request: Request) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      niche,
      tone,
      platforms,
      voiceChoice,
      libraryVoiceId,
      selectedTier,
      productName,
      productDescription,
      voiceConsentAt,
    } = body as Record<string, unknown>;

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
      niche: niche ? String(niche) : undefined,
      tone: tone ? String(tone) as ContentTone : undefined,
      platforms: Array.isArray(platforms) ? platforms : undefined,
      brandName: productName ? String(productName) : undefined,
      onboardingComplete: true,
      subscriptionTier: selectedTier ? String(selectedTier) as "solo" | "creator" | "studio" : "creator",
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
