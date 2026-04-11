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
    const withScores = videos.filter((v) => v.visibilityScore !== undefined);

    if (withScores.length < 5) {
      return NextResponse.json({ available: false, videoCount: withScores.length });
    }

    const hookGroups: Record<string, { total: number; count: number }> = {};
    for (const v of withScores) {
      if (!v.hookType) continue;
      if (!hookGroups[v.hookType]) hookGroups[v.hookType] = { total: 0, count: 0 };
      hookGroups[v.hookType].total += v.visibilityScore ?? 0;
      hookGroups[v.hookType].count++;
    }

    const bestHook = Object.entries(hookGroups)
      .map(([type, { total, count }]) => ({ type, avg: total / count }))
      .sort((a, b) => b.avg - a.avg)[0];

    const topicGroups: Record<string, { total: number; count: number }> = {};
    for (const v of withScores) {
      if (!v.topicLabel) continue;
      if (!topicGroups[v.topicLabel]) topicGroups[v.topicLabel] = { total: 0, count: 0 };
      topicGroups[v.topicLabel].total += v.visibilityScore ?? 0;
      topicGroups[v.topicLabel].count++;
    }

    const bestTopic = Object.entries(topicGroups)
      .map(([type, { total, count }]) => ({ type, avg: total / count }))
      .sort((a, b) => b.avg - a.avg)[0];

    return NextResponse.json({
      available: true,
      videoCount: withScores.length,
      bestHookType: bestHook?.type,
      bestHookScore: bestHook?.avg,
      bestTopic: bestTopic?.type,
      bestTopicScore: bestTopic?.avg,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch intelligence" }, { status: 500 });
  }
}
