import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * Platform OAuth connection — stubbed for Sprint 1.
 * Direct platform OAuth will be implemented in Sprint 9.
 */
export async function POST(_req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { error: "Platform connections not yet implemented" },
    { status: 501 }
  );
}
