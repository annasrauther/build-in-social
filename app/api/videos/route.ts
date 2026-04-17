import { NextResponse } from "next/server";
import { getVideos, getUserByClerkId } from "@/lib/services/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  let clerkUserId: string;
  try {
    clerkUserId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // getVideos filters by internal user id, not Clerk user id, so resolve first.
    const user = await getUserByClerkId(clerkUserId);
    if (!user) return NextResponse.json({ data: [], error: null });
    const videos = await getVideos(user.id);
    return NextResponse.json({ data: videos, error: null });
  } catch {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
