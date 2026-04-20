import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * Automation — Skip next scheduled post. Stub for P1-17.
 */
export async function POST() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { error: "Skip-next is coming soon. You'll be emailed when it's live." },
    { status: 501 }
  );
}
