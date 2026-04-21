/**
 * GET /api/avatar/train/status?avatarId=...
 * Polls HeyGen for the training status of a twin-avatar job.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { getCustomAvatarStatus } from "@/lib/services/heygen";

export async function GET(request: Request) {
  let userId: string;
  try {
    const user = await getOrCreateUser();
    userId = user.clerkUserId;
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkRateLimit(userId, "avatar/train/status", 60, "1 m");
  if (limited) return limited;

  const url = new URL(request.url);
  const avatarId = url.searchParams.get("avatarId");
  if (!avatarId) {
    return NextResponse.json(
      { data: null, error: "avatarId is required" },
      { status: 400 },
    );
  }

  try {
    const status = await getCustomAvatarStatus({ avatarId });
    return NextResponse.json({ data: status, error: null });
  } catch (error) {
    console.error("[avatar/train/status] error:", error);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
