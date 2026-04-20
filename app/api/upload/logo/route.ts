/**
 * POST /api/upload/logo
 * Accepts multipart/form-data with a `file` field, uploads to Cloudflare R2,
 * and returns the public URL. PNG/SVG/JPG, max 2 MB.
 * → { data: { url: string }, error: null }
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { uploadBuffer } from "@/lib/services/r2";

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await getOrCreateUser();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ data: null, error: "Failed to authenticate" }, { status: 500 });
  }

  // Validate file presence and size
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { data: null, error: "No file provided" },
        { status: 400 }
      );
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { data: null, error: "File must be under 2 MB" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/png", "image/svg+xml", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { data: null, error: "Only PNG, SVG, or JPG files are allowed" },
        { status: 400 }
      );
    }

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/svg+xml"
          ? "svg"
          : "jpg";
    const key = `logos/${user.id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { publicUrl } = await uploadBuffer({
      key,
      buffer,
      contentType: file.type,
    });

    return NextResponse.json({ data: { url: publicUrl }, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Upload failed" },
      { status: 500 }
    );
  }
}
