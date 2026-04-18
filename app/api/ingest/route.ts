/**
 * POST /api/ingest
 *
 * Accepts a Notion URL, a pasted transcript, or an RSS feed URL. Parses the
 * source, calls Haiku (tool-forced JSON) to extract 5-8 topic candidates,
 * and returns them. The client stores the result on the onboarding data so
 * downstream plan generation can seed from it.
 *
 * Rate limits:
 *   - 10/min per IP (Upstash sliding window) — spam/abuse defense
 *   - 1/hour per IP for successful ingests — cost ceiling
 *     (in-memory Map fallback when Upstash not configured; Phase 1 memory-only)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { extractTopics, IngestError } from "@/lib/services/ingest";
import type { IngestResult } from "@/lib/types/ingest";

const BodySchema = z.discriminatedUnion("sourceType", [
  z.object({
    sourceType: z.literal("notion"),
    input: z.string().trim().min(8).max(500),
  }),
  z.object({
    sourceType: z.literal("transcript"),
    input: z.string().trim().min(80).max(20000),
  }),
  z.object({
    sourceType: z.literal("rss"),
    input: z.string().trim().min(8).max(500),
  }),
]);

/* ─── One-per-hour cost guard ─────────────────────────────────────────────
 *
 * Upstash path (preferred): uses the shared rate-limit helper.
 * Fallback: in-process Map. Phase 1 memory-only — rebuilds reset the window.
 */

const hourlyMemory = new Map<string, number>();
const HOUR_MS = 60 * 60 * 1000;

function checkMemoryHourly(key: string): boolean {
  const now = Date.now();
  const last = hourlyMemory.get(key);
  if (last && now - last < HOUR_MS) return false;
  hourlyMemory.set(key, now);
  // Light GC
  if (hourlyMemory.size > 5000) {
    for (const [k, ts] of hourlyMemory) {
      if (now - ts >= HOUR_MS) hourlyMemory.delete(k);
    }
  }
  return true;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Spam/abuse: 10/min per IP via Upstash (no-op if not configured).
  const limited = await checkRateLimit(`ip:${ip}`, "ingest", 10, "1 m");
  if (limited) return limited;

  // Cost ceiling: 1 successful ingest/hour per IP (Upstash + memory fallback).
  const hourlyLimited = await checkRateLimit(`ip:${ip}`, "ingest-hourly", 1, "1 h");
  if (hourlyLimited) return hourlyLimited;
  if (!checkMemoryHourly(ip)) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "rate_limited",
          message:
            "You've already ingested a source in the last hour. Try again later.",
        },
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: { code: "invalid_input", message: "Invalid JSON." } },
      { status: 400 }
    );
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "invalid_input",
          message:
            parsed.error.errors[0]?.message ??
            "Check the source type and input.",
        },
      },
      { status: 400 }
    );
  }

  try {
    const result: IngestResult = await extractTopics(parsed.data, req.signal);
    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    if (err instanceof IngestError) {
      const status = err.code === "invalid_input" ? 400 : 422;
      return NextResponse.json(
        { data: null, error: { code: err.code, message: err.message } },
        { status }
      );
    }
    // Abort (client cancelled)
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json(
        { data: null, error: { code: "generic", message: "Request cancelled." } },
        { status: 499 }
      );
    }
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "generic",
          message: "Something went wrong reading that source. Try again.",
        },
      },
      { status: 500 }
    );
  }
}
