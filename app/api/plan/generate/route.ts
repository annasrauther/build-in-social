import { NextResponse } from "next/server";
import { generateWeeklyPlan } from "@/lib/services/claude";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import type { ContentMode } from "@/lib/types/video";
import type { Platform } from "@/lib/types/user";

export async function POST(request: Request) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limited = await checkRateLimit(userId, "plan/generate", 10, "1 m");
  if (limited) return limited;

  try {
    const body = await request.json();
    const { mode, platforms, niche, tone, qualityGateAnswers } = body as {
      mode: ContentMode;
      platforms: Platform[];
      niche: string;
      tone: string;
      qualityGateAnswers?: [string, string, string];
    };

    if (!mode || !platforms?.length || !niche) {
      return NextResponse.json(
        { error: "Missing required fields: mode, platforms, niche" },
        { status: 400 }
      );
    }

    if (
      mode === "manual" &&
      (!qualityGateAnswers ||
        !Array.isArray(qualityGateAnswers) ||
        qualityGateAnswers.length !== 3 ||
        qualityGateAnswers.some((a: string) => !a?.trim()))
    ) {
      return NextResponse.json(
        { error: "Manual mode requires 3 non-empty quality gate answers" },
        { status: 422 }
      );
    }

    const weekNumber = Math.ceil(
      (Date.now() - new Date("2026-01-01").getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );

    const result = await generateWeeklyPlan({
      mode,
      niche,
      platforms,
      weekNumber,
      qualityGateAnswers:
        mode === "manual" ? qualityGateAnswers : undefined,
    });

    const videos = result.map((item, index) => ({
      id: `${item.platform}-${index}`,
      platform: item.platform,
      title: item.title,
      hook: item.scriptJson.hook,
      script: `${item.scriptJson.hook}\n\n${item.scriptJson.body}\n\n${item.scriptJson.cta}`,
      durationSeconds: item.durationSeconds,
      contentType: item.contentType,
      status: "draft" as const,
      dayOfWeek: item.dayOfWeek,
    }));

    return NextResponse.json({ videos });
  } catch (err) {
    console.error("[plan/generate]", err);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
