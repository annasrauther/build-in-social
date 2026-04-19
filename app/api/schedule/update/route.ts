import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/auth";
import * as db from "@/lib/services/db";

const BodySchema = z.object({
  videoId: z.string().min(1),
  scheduledDay: z.string().min(1),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.errors[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { videoId, scheduledDay, scheduledTime } = parsed.data;

    await db.updateVideoSchedule(videoId, scheduledDay, scheduledTime);

    return NextResponse.json({ data: { videoId, scheduledDay }, error: null });
  } catch (err) {
    console.error("[schedule/update] error:", err);
    return NextResponse.json(
      { data: null, error: "Build In Social couldn't reschedule this video." },
      { status: 500 }
    );
  }
}
