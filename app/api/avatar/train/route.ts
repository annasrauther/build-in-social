/**
 * POST /api/avatar/train
 * Kicks off HeyGen twin-avatar training from a user-uploaded video clip.
 * Creator+ tier only. Returns a polling handle (avatarId + status).
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { createAvatarFromVideo } from "@/lib/services/heygen";
import { canCreateTwin } from "@/lib/utils/avatar-access";

const schema = z.object({
  sourceClipUrl: z.string().url().max(2048),
});

export async function POST(request: Request) {
  let userId: string;
  let tier: string;
  try {
    const user = await getOrCreateUser();
    userId = user.clerkUserId;
    tier = user.subscriptionTier;
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  if (!canCreateTwin(tier as Parameters<typeof canCreateTwin>[0])) {
    return NextResponse.json(
      { data: null, error: "Twin avatars require the Creator plan or higher." },
      { status: 402 },
    );
  }

  const limited = await checkRateLimit(userId, "avatar/train", 5, "1 h");
  if (limited) return limited;

  try {
    const raw = await request.json();
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await createAvatarFromVideo({
      sourceClipUrl: parsed.data.sourceClipUrl,
      userId,
    });

    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    console.error("[avatar/train] error:", error);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
