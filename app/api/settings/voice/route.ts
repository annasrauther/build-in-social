/**
 * PATCH /api/settings/voice
 *
 * Switch the user's library voice post-onboarding. Clone voices are not
 * changed here — cloning has its own consent-gated flow at /api/onboard/voice.
 * Body: { voiceId: string }  (must be one of LIBRARY_VOICES[].id)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { createVoiceProfile, updateUser } from "@/lib/services/db";
import { LIBRARY_VOICES } from "@/lib/constants/onboarding";

const Schema = z.object({
  voiceId: z.string().min(1),
});

export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await getOrCreateUser();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 });
  }

  const limited = await checkRateLimit(user.id, "settings/voice", 20, "1 m");
  if (limited) return limited;

  const raw = await req.json().catch(() => null);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const voice = LIBRARY_VOICES.find((v) => v.id === parsed.data.voiceId);
  if (!voice) {
    return NextResponse.json(
      { error: "Unknown voice — must be a library voice" },
      { status: 400 }
    );
  }

  try {
    const profile = await createVoiceProfile({
      userId: user.id,
      elevenLabsVoiceId: voice.elevenlabsId,
      name: voice.name,
      isClone: false,
    });
    const updated = await updateUser(user.id, { voiceProfileId: profile.id });
    return NextResponse.json({
      data: { voiceId: voice.id, voiceProfileId: profile.id, user: updated },
      error: null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to change voice" }, { status: 500 });
  }
}
