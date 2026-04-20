import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * Automation — Regenerate next week's plan. Stub for P1-17.
 */
export async function POST() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { error: "Next-week regeneration is coming soon. You'll be emailed when it's live." },
    { status: 501 }
  );
}
