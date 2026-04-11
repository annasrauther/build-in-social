import { NextResponse } from "next/server";
import { getVideos } from "@/lib/services/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const videos = await getVideos(userId);
    return NextResponse.json(videos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
