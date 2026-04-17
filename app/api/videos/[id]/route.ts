import { NextRequest, NextResponse } from "next/server";
import { getVideo, updateVideo, getUserByClerkId } from "@/lib/services/db";
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

/** requireAuth() returns the Clerk user id. videos.userId is the internal id. */
async function resolveOwnedVideo(clerkUserId: string, videoId: string) {
  const [user, video] = await Promise.all([
    getUserByClerkId(clerkUserId),
    getVideo(videoId),
  ]);
  if (!video) return { kind: "not_found" as const };
  if (!user || video.userId !== user.id) return { kind: "forbidden" as const };
  return { kind: "ok" as const, video };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let clerkUserId: string;
  try {
    clerkUserId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const r = await resolveOwnedVideo(clerkUserId, id);
    if (r.kind === "not_found")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (r.kind === "forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ data: r.video, error: null });
  } catch {
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let clerkUserId: string;
  try {
    clerkUserId = await requireAuth();
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
    const r = await resolveOwnedVideo(clerkUserId, id);
    if (r.kind === "not_found")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (r.kind === "forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  let clerkUserId: string;
  try {
    clerkUserId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const r = await resolveOwnedVideo(clerkUserId, id);
    if (r.kind === "not_found")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (r.kind === "forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await updateVideo(id, { status: "failed" });
    return NextResponse.json({ data: { ok: true } });
  } catch {
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
