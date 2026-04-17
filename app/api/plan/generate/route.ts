import { NextResponse } from "next/server";
import {
  generateWeeklyPlan,
  checkQualityGate,
  generateAutopilotAngles,
} from "@/lib/services/claude";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { clampDurationForPlatform } from "@/lib/utils/platform-config";
import type { ContentMode } from "@/lib/types/video";
import type { Platform } from "@/lib/types/user";

const VALID_PLATFORMS: ReadonlySet<Platform> = new Set([
  "youtube",
  "instagram",
  "linkedin",
  "x",
]);

function isValidPlatform(p: unknown): p is Platform {
  return typeof p === "string" && VALID_PLATFORMS.has(p as Platform);
}

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
      tone?: string;
      qualityGateAnswers?: [string, string, string];
    };

    if (!mode || !["manual", "autopilot"].includes(mode)) {
      return NextResponse.json(
        { error: "mode must be 'manual' or 'autopilot'" },
        { status: 400 }
      );
    }
    if (!Array.isArray(platforms) || platforms.length === 0 || !platforms.every(isValidPlatform)) {
      return NextResponse.json(
        { error: "platforms must be a non-empty array of: youtube, instagram, linkedin, x" },
        { status: 400 }
      );
    }
    if (!niche || typeof niche !== "string" || !niche.trim()) {
      return NextResponse.json(
        { error: "niche is required" },
        { status: 400 }
      );
    }

    // ─── Critical path #3: server-side quality gate enforcement ────────────
    if (mode === "manual") {
      if (
        !qualityGateAnswers ||
        !Array.isArray(qualityGateAnswers) ||
        qualityGateAnswers.length !== 3 ||
        qualityGateAnswers.some((a) => !a?.trim())
      ) {
        return NextResponse.json(
          { error: "Manual mode requires 3 non-empty quality gate answers" },
          { status: 422 }
        );
      }
      const gate = await checkQualityGate(qualityGateAnswers);
      if (!gate.passed) {
        return NextResponse.json(
          {
            error: "quality_gate_failed",
            specificityScore: gate.specificityScore,
            pushback: gate.pushback,
          },
          { status: 422 }
        );
      }
    }

    const weekNumber = Math.ceil(
      (Date.now() - new Date("2026-01-01").getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );

    // ─── Autopilot mode: produce angles before plan generation ─────────────
    let autopilotAngles: string[] | undefined;
    if (mode === "autopilot") {
      const anglesResult = await generateAutopilotAngles({
        niche,
        tone: tone ?? "confident",
        weekNumber,
      });
      autopilotAngles = anglesResult.angles;
    }

    const result = await generateWeeklyPlan({
      mode,
      niche,
      platforms,
      weekNumber,
      qualityGateAnswers:
        mode === "manual" ? qualityGateAnswers : undefined,
      autopilotAngles,
    });

    // ─── Critical path #4: clamp every duration to platform spec ───────────
    const videos = result.map((item, index) => ({
      id: `${item.platform}-${index}`,
      platform: item.platform,
      title: item.title,
      hook: item.scriptJson.hook,
      script: `${item.scriptJson.hook}\n\n${item.scriptJson.body}\n\n${item.scriptJson.cta}`,
      durationSeconds: clampDurationForPlatform(item.platform, item.durationSeconds),
      contentType: item.contentType,
      status: "draft" as const,
      dayOfWeek: item.dayOfWeek,
    }));

    return NextResponse.json({ data: { videos }, error: null });
  } catch (err) {
    console.error("[plan/generate]", err);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
