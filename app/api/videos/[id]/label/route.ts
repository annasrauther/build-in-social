import { NextRequest, NextResponse } from "next/server";
import { getVideo, updateVideo } from "@/lib/services/db";
import { labelVideo } from "@/lib/services/claude";
import { requireAuth } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id: videoId } = await params;
    const video = await getVideo(videoId);
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    const fullScript = `${video.scriptJson.hook} ${video.scriptJson.body} ${video.scriptJson.cta}`;

    const labels = await labelVideo({
      script: fullScript,
      topic: video.title,
      platform: video.platform,
    });

    await updateVideo(videoId, {
      topicLabel: labels.topicLabel,
      hookType: labels.hookType,
      sentiment: labels.sentiment,
    });

    return NextResponse.json({ labels });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Labelling failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
