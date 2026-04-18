/**
 * Real source-ingestion implementation.
 *
 * Fetches Notion / RSS source material or accepts pasted transcripts,
 * truncates to 8000 chars, then forces a Haiku tool-call to extract 5-8
 * topic candidates that would make good weekly social-media video content
 * for a founder.
 *
 * Cost ceiling: Haiku only. Never Sonnet.
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  IngestRequest,
  IngestResult,
  IngestTopicCandidate,
} from "@/lib/types/ingest";

const HAIKU = "claude-haiku-4-5-20251001";
const SOURCE_CHAR_LIMIT = 8000;
const TRANSCRIPT_CHAR_LIMIT = 20000;
const FETCH_TIMEOUT_MS = 6000;

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export class IngestError extends Error {
  code:
    | "source_unreachable"
    | "source_private"
    | "source_empty"
    | "invalid_input"
    | "generic";
  constructor(
    code: IngestError["code"],
    message: string
  ) {
    super(message);
    this.code = code;
  }
}

/* ─── SSRF protection (reuse pattern from infer-product) ─────────────────── */

function isPrivateUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return true;
    if (hostname === "0.0.0.0" || hostname.endsWith(".local")) return true;
    if (hostname === "metadata.google.internal") return true;
    const parts = hostname.split(".").map(Number);
    if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
      if (parts[0] === 10) return true;
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      if (parts[0] === 192 && parts[1] === 168) return true;
      if (parts[0] === 169 && parts[1] === 254) return true;
      if (parts[0] === 127) return true;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return true;
    return false;
  } catch {
    return true;
  }
}

function combinedSignal(outer?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  return outer ? AbortSignal.any([outer, timeout]) : timeout;
}

/* ─── Notion fetching ────────────────────────────────────────────────────── */

function isNotionUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host === "notion.so" || host === "www.notion.so" || host.endsWith(".notion.site");
  } catch {
    return false;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#x27;|&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchNotion(url: string, signal?: AbortSignal): Promise<string> {
  if (!isNotionUrl(url)) {
    throw new IngestError(
      "invalid_input",
      "That doesn't look like a Notion URL. Use notion.so or *.notion.site."
    );
  }
  if (isPrivateUrl(url)) {
    throw new IngestError("invalid_input", "That URL is not reachable.");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      signal: combinedSignal(signal),
      redirect: "follow",
      headers: {
        "User-Agent": "BuildInSocial/1.0 (+https://buildinsocial.com)",
      },
    });
  } catch {
    throw new IngestError(
      "source_unreachable",
      "Couldn't reach that Notion page. Check the link and try again."
    );
  }

  if (res.status === 404) {
    throw new IngestError(
      "source_private",
      "That Notion page is private or deleted. Set it to public share, then paste again."
    );
  }
  if (res.status === 429) {
    throw new IngestError(
      "source_unreachable",
      "Notion is rate-limiting us right now. Try again in a minute."
    );
  }
  if (!res.ok) {
    throw new IngestError(
      "source_unreachable",
      "Notion returned an error. Make sure the page is set to public."
    );
  }

  const html = await res.text();
  const text = stripHtml(html);

  if (text.length < 80) {
    throw new IngestError(
      "source_empty",
      "That page looks empty or isn't public. Set it to public share and try again."
    );
  }

  return text.slice(0, SOURCE_CHAR_LIMIT);
}

/* ─── RSS fetching ───────────────────────────────────────────────────────── */

async function fetchRss(url: string, signal?: AbortSignal): Promise<string> {
  if (isPrivateUrl(url)) {
    throw new IngestError("invalid_input", "That URL is not reachable.");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      signal: combinedSignal(signal),
      redirect: "follow",
      headers: {
        "User-Agent": "BuildInSocial/1.0 (+https://buildinsocial.com)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });
  } catch {
    throw new IngestError(
      "source_unreachable",
      "Couldn't reach that feed. Check the URL and try again."
    );
  }

  if (!res.ok) {
    throw new IngestError(
      "source_unreachable",
      "The feed returned an error. Double-check the URL."
    );
  }

  const xml = await res.text();

  // MVP-grade parser: grab up to 5 most recent items/entries.
  const itemRegex = /<(item|entry)\b[\s\S]*?<\/\1>/gi;
  const items: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
    items.push(match[0]);
  }

  if (items.length === 0) {
    throw new IngestError(
      "source_empty",
      "Couldn't find any items in that feed. Make sure it's a valid RSS or Atom feed."
    );
  }

  function pick(block: string, tag: string): string {
    const m = block.match(
      new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i")
    );
    if (!m) return "";
    const cdata = m[1].match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    return stripHtml(cdata ? cdata[1] : m[1]);
  }

  const parts: string[] = [];
  for (const block of items) {
    const title = pick(block, "title");
    const description =
      pick(block, "description") || pick(block, "summary") || pick(block, "content");
    parts.push(`${title}\n${description}`.trim());
  }

  const joined = parts.join("\n\n---\n\n").trim();
  if (joined.length < 40) {
    throw new IngestError(
      "source_empty",
      "That feed didn't have enough content to extract topics from."
    );
  }
  return joined.slice(0, SOURCE_CHAR_LIMIT);
}

/* ─── Transcript ─────────────────────────────────────────────────────────── */

function prepTranscript(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length < 80) {
    throw new IngestError(
      "source_empty",
      "Paste a longer transcript (at least a few sentences) so we have something to work with."
    );
  }
  const capped = trimmed.slice(0, TRANSCRIPT_CHAR_LIMIT);
  return capped.slice(0, SOURCE_CHAR_LIMIT);
}

/* ─── Haiku extraction ───────────────────────────────────────────────────── */

async function extractWithHaiku(
  sourceLabel: string,
  source: string
): Promise<IngestTopicCandidate[]> {
  const client = getClient();

  const prompt = `You are a content strategist. You've been given raw source material (${sourceLabel}) from an indie developer or SaaS founder. Extract 5-8 topic candidates that would make strong weekly social-media video content for that founder.

Rules:
- Each topic title is ONE sentence max, specific, actionable. No vague titles.
- The hookIdea is a 1-2 sentence opening the founder could use on camera.
- Pick a contentType from: "insight", "story", "teardown", "opinion", "teaching".
- Favor specifics (named tools, numbers, decisions, surprises) over generic framings.
- Ignore navigation/boilerplate text in the source.

Source material:
"""
${source}
"""`;

  const response = await client.messages.create({
    model: HAIKU,
    max_tokens: 2048,
    tools: [
      {
        name: "extract_topic_candidates",
        description:
          "Return 5-8 topic candidates extracted from the founder's source material.",
        input_schema: {
          type: "object",
          properties: {
            topics: {
              type: "array",
              minItems: 5,
              maxItems: 8,
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  hookIdea: { type: "string" },
                  contentType: {
                    type: "string",
                    enum: ["insight", "story", "teardown", "opinion", "teaching"],
                  },
                },
                required: ["title", "hookIdea", "contentType"],
              },
            },
          },
          required: ["topics"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "extract_topic_candidates" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
  );
  if (!toolUse) {
    throw new IngestError("generic", "Couldn't read the source. Try another one.");
  }
  const input = toolUse.input as { topics: IngestTopicCandidate[] };
  if (!input.topics || input.topics.length === 0) {
    throw new IngestError(
      "source_empty",
      "We couldn't find enough topic-worthy material. Try a different source."
    );
  }
  return input.topics.slice(0, 8);
}

/* ─── Public entry point ─────────────────────────────────────────────────── */

export async function extractTopics(
  request: IngestRequest,
  outerSignal?: AbortSignal
): Promise<IngestResult> {
  let source: string;
  let label: string;

  switch (request.sourceType) {
    case "notion":
      source = await fetchNotion(request.input, outerSignal);
      label = "a Notion page";
      break;
    case "rss":
      source = await fetchRss(request.input, outerSignal);
      label = "an RSS/Atom feed (5 most recent items)";
      break;
    case "transcript":
      source = prepTranscript(request.input);
      label = "a transcript or raw notes";
      break;
  }

  const topics = await extractWithHaiku(label, source);
  return {
    topics,
    sourceType: request.sourceType,
    sourceExcerpt: source.slice(0, 400),
  };
}
