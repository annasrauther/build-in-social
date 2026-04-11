/**
 * GET /api/render/[jobId]/status
 * Poll the status of a render job.
 *
 * Returns: { data: RenderJob } or { error: "not found" } with 404
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getRenderJob } from "@/lib/services/queue";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const job = await getRenderJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({ data: job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch job status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
