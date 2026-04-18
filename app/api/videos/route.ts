import { NextResponse } from "next/server";
import { getVideos } from "@/lib/services/db";
import { getOrCreateUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";

export async function GET() {
  let user;
  try {
    user = await getOrCreateUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // SECURITY (S4): userId-keyed rate limit, 60/min.
  const limited = await checkRateLimit(user.id, "videos/list", 60, "1 m");
  if (limited) return limited;
  try {
    const videos = await getVideos(user.id);
    return NextResponse.json({ data: videos, error: null });
  } catch {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
