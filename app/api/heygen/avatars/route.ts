/**
 * GET /api/heygen/avatars
 * Returns the list of available HeyGen avatars.
 * Auth required. Mock data returned unless HEYGEN_API_KEY is set.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { listAvatars } from "@/lib/services/heygen";

export async function GET() {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkRateLimit(userId, "heygen/avatars", 30, "1 m");
  if (limited) return limited;

  try {
    const avatars = await listAvatars();
    return NextResponse.json({ data: avatars, error: null });
  } catch (error) {
    console.error("[heygen/avatars] error:", error);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
