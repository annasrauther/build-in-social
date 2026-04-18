/**
 * Source-ingestion types — Notion / Transcript / RSS → topic candidates.
 */

export type IngestSourceType = "notion" | "transcript" | "rss";

export type IngestContentType =
  | "insight"
  | "story"
  | "teardown"
  | "opinion"
  | "teaching";

export interface IngestTopicCandidate {
  title: string;
  hookIdea: string;
  contentType: IngestContentType;
}

export interface IngestRequest {
  sourceType: IngestSourceType;
  input: string;
}

export interface IngestResult {
  topics: IngestTopicCandidate[];
  sourceType: IngestSourceType;
  sourceExcerpt: string;
}

export type IngestErrorCode =
  | "source_unreachable"
  | "source_private"
  | "source_empty"
  | "rate_limited"
  | "invalid_input"
  | "generic";

export interface IngestError {
  code: IngestErrorCode;
  message: string;
}
