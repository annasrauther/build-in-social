import { NextRequest, NextResponse } from "next/server";
import { getRenderJob } from "@/lib/services/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await getRenderJob(id);
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (job.status === "completed" || job.status === "failed") {
      return NextResponse.json({
        status: job.status,
        progress: job.status === "completed" ? 100 : 0,
        message: job.status === "completed" ? "Done!" : "Render failed",
        outputUrl: job.outputUrl,
      });
    }

    // Faceless render pipeline — Sprint 7
    return NextResponse.json({
      status: job.status,
      progress: job.status === "rendering" ? 50 : 0,
      message: job.status === "rendering" ? "Rendering..." : "Queued",
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch render status" }, { status: 500 });
  }
}
