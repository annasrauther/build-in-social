/**
 * Logo upload stub — Phase 1.
 * Accepts a multipart/form-data POST with a `file` field.
 * In Phase 1, returns a placeholder URL. Real R2 upload wired in Phase 2.
 *
 * POST /api/upload/logo
 * → { data: { url: string }, error: null }
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";

const PLACEHOLDER_URL =
  "https://pub-placeholder.r2.dev/logos/placeholder-logo.png";

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

    // TODO Phase 2: upload to Cloudflare R2 via lib/services/r2.ts
    // const r2Key = `logos/${user.id}/${Date.now()}-${filename}`;
    // await uploadBuffer(r2Key, buffer);
    // const url = `${R2_PUBLIC_URL}/${r2Key}`;
    void user; // Referenced to satisfy linter

    return NextResponse.json({
      data: { url: PLACEHOLDER_URL },
      error: null,
    });
  } catch {
    return NextResponse.json(
      { data: null, error: "Upload failed" },
      { status: 500 }
    );
  }
}
