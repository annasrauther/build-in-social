import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * Publish video to social platforms — stubbed for Sprint 1.
 * Platform OAuth connections will be implemented in Sprint 9.
 * Ayrshare is NOT used in Build In Social — direct platform APIs instead.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let _userId: string;
  try {
    _userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  return NextResponse.json(
    { error: "Publishing not yet implemented", videoId: id },
    { status: 501 }
  );
}
