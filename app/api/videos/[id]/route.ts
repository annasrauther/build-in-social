import { NextRequest, NextResponse } from "next/server";
import { getVideo, updateVideo } from "@/lib/services/db";
import { getOrCreateUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/services/rate-limit";
import type { User } from "@/lib/types/user";
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

async function resolveOwnedVideo(user: User, videoId: string) {
  const video = await getVideo(videoId);
  if (!video) return { kind: "not_found" as const };
  if (video.userId !== user.id) return { kind: "forbidden" as const };
  return { kind: "ok" as const, video };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user: User;
  try {
    user = await getOrCreateUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // SECURITY (S4): userId-keyed rate limit, 60/min.
  const limited = await checkRateLimit(user.id, "videos/item", 60, "1 m");
  if (limited) return limited;
  try {
    const { id } = await params;
    const r = await resolveOwnedVideo(user, id);
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
  let user: User;
  try {
    user = await getOrCreateUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // SECURITY (S4): userId-keyed rate limit, 60/min.
  const limited = await checkRateLimit(user.id, "videos/item", 60, "1 m");
  if (limited) return limited;
  try {
    const { id } = await params;
    const raw = await req.json();
    const parsed = videoUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields", details: parsed.error.flatten() }, { status: 400 });
    }
    const r = await resolveOwnedVideo(user, id);
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
  let user: User;
  try {
    user = await getOrCreateUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // SECURITY (S4): userId-keyed rate limit, 60/min.
  const limited = await checkRateLimit(user.id, "videos/item", 60, "1 m");
  if (limited) return limited;
  try {
    const { id } = await params;
    const r = await resolveOwnedVideo(user, id);
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
