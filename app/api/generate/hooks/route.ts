import { NextRequest, NextResponse } from "next/server";
import { getVideo } from "@/lib/services/db";
import { generateHookVariants } from "@/lib/services/claude";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { videoId } = await req.json();
    if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

    const video = await getVideo(videoId);
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    const fullScript = `${video.scriptJson.hook} ${video.scriptJson.body} ${video.scriptJson.cta}`;

    const variants = await generateHookVariants({
      script: fullScript,
      topicLabel: video.topicLabel ?? "how_to",
      platform: video.platform,
    });

    return NextResponse.json({ variants });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Hook generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
