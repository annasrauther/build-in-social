import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * Automation — Pause autopilot. Stub for P1-17; real impl lands when the
 * autopilot scheduler service is wired. Returns 501 with an honest message.
 */
export async function POST() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { error: "Autopilot pause is coming soon. You'll be emailed when it's live." },
    { status: 501 }
  );
}
