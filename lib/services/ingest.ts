/**
 * Source-ingestion service — routes to the real Haiku-backed implementation
 * when ANTHROPIC_API_KEY is set, otherwise returns a mock result.
 */

import type { IngestRequest, IngestResult } from "@/lib/types/ingest";
import * as real from "@/lib/services/ingest.real";
import * as mock from "@/lib/mock/ingest.mock";

const useReal = !!process.env.ANTHROPIC_API_KEY;

export async function extractTopics(
  request: IngestRequest,
  signal?: AbortSignal
): Promise<IngestResult> {
  if (useReal) return real.extractTopics(request, signal);
  return mock.extractTopics(request);
}

export { IngestError } from "@/lib/services/ingest.real";
