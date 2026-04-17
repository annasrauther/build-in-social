import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";

const ContextSchema = z.object({
  domain: z.string().min(2).max(120),
  audience: z.string().min(2).max(120),
  tone: z.enum(["technical", "conversational", "founder"]),
  voiceNotes: z.string().max(400).optional(),
});

export async function POST(req: NextRequest) {
  let _userId: string;
  try {
    _userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const result = ContextSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    // In Sprint 9 (auth), this will save to the user record via db.ts
    return NextResponse.json({ data: { saved: true }, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Invalid request" }, { status: 400 });
  }
}
