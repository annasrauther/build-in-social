import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";

const VoiceSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("library"),
    voiceId: z.string().min(1),
  }),
  z.object({
    mode: z.literal("clone"),
    fileName: z.string().min(1),
  }),
]);

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const result = VoiceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    // In Sprint 7, this will trigger ElevenLabs voice clone job
    return NextResponse.json({ data: { saved: true }, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Invalid request" }, { status: 400 });
  }
}
