import { NextRequest, NextResponse } from "next/server";
import { getVideo, updateVideo } from "@/lib/services/db";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const videoUpdateSchema = z.object({
  status: z.enum(["draft", "approved", "rendering", "ready", "posted", "failed"]).optional(),
  title: z.string().max(500).optional(),
  scriptJson: z.object({
    hook: z.string(),
    body: z.string(),
    cta: z.string(),
  }).optional(),
}).strict();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const video = await getVideo(id);
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (video.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json(video);
  } catch {
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const raw = await req.json();
    const parsed = videoUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields", details: parsed.error.flatten() }, { status: 400 });
    }
    const video = await getVideo(id);
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (video.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const updated = await updateVideo(id, parsed.data);
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const video = await getVideo(id);
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (video.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await updateVideo(id, { status: "failed" });
    return NextResponse.json({ data: { ok: true } });
  } catch {
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
