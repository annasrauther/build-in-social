import { NextResponse } from "next/server";

/**
 * Mock download endpoint — returns a minimal valid MP4 file.
 * Replace with real R2 presigned URL when pipeline is wired.
 */
export async function GET() {
  // Minimal valid MP4 file (ftyp + moov boxes)
  const mp4 = new Uint8Array([
    // ftyp box
    0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70,
    0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
    0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
    0x6d, 0x70, 0x34, 0x31,
    // moov box (minimal)
    0x00, 0x00, 0x00, 0x08, 0x6d, 0x6f, 0x6f, 0x76,
  ]);

  return new NextResponse(mp4, {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": 'attachment; filename="build-in-social-video.mp4"',
      "Content-Length": String(mp4.length),
    },
  });
}
