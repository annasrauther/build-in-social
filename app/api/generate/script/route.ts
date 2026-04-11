import { NextRequest, NextResponse } from "next/server";
import { generateScript, checkQualityGate } from "@/lib/services/claude";
import { requireAuth } from "@/lib/auth";
import type { Platform, FacelessStyle } from "@/lib/types/user";
import type { ContentMode } from "@/lib/types/video";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const mode: ContentMode = body.mode ?? "manual";

    // Quality gate is mandatory for manual mode (PRD rule 15)
    if (mode === "manual") {
      const answers = body.qualityGateAnswers as [string, string, string] | undefined;

      if (
        !answers ||
        !Array.isArray(answers) ||
        answers.length !== 3 ||
        answers.some((a: string) => typeof a !== "string" || a.trim().length < 20)
      ) {
        return NextResponse.json(
          { error: "Manual mode requires 3 quality-gate answers (each ≥ 20 characters)." },
          { status: 422 },
        );
      }

      const gate = await checkQualityGate(answers);
      if (!gate.passed) {
        return NextResponse.json(
          { error: gate.pushback ?? "Quality gate not passed. Add more specific detail.", specificityScore: gate.specificityScore },
          { status: 422 },
        );
      }
    }

    const script = await generateScript({
      prompt: body.prompt ?? "",
      url: body.url,
      platforms: body.platforms ?? ["youtube"],
      contentType: body.contentType ?? "founder-story",
      facelessStyle: body.facelessStyle ?? "dev-log",
    });
    return NextResponse.json(script);
  } catch {
    return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
  }
}
