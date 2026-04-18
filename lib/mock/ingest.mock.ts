/**
 * Mock ingest service — returns a plausible set of topic candidates without
 * calling Claude. Used when ANTHROPIC_API_KEY is not set.
 */

import type {
  IngestRequest,
  IngestResult,
  IngestTopicCandidate,
} from "@/lib/types/ingest";

const MOCK_DELAY_MS = 900;
const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms));

const MOCK_TOPICS: IngestTopicCandidate[] = [
  {
    title: "The one metric I wish I had tracked from day one",
    hookIdea: "Most founders measure the wrong thing for their first six months.",
    contentType: "insight",
  },
  {
    title: "Why I rewrote my onboarding three times",
    hookIdea: "Our activation rate moved from 14% to 41% after this one change.",
    contentType: "story",
  },
  {
    title: "Teardown of a pricing page that actually converts",
    hookIdea: "Here's what most SaaS pricing pages get wrong — and the 2 fixes that help.",
    contentType: "teardown",
  },
  {
    title: "Hot take: your roadmap is a marketing document",
    hookIdea: "Nobody cares about your roadmap until you explain who it's for.",
    contentType: "opinion",
  },
  {
    title: "How I ship small in a way that compounds",
    hookIdea: "The 30-minute change I make every Friday that reduced my backlog by 60%.",
    contentType: "teaching",
  },
];

export async function extractTopics(request: IngestRequest): Promise<IngestResult> {
  await delay();
  const excerpt = request.input.slice(0, 400);
  return {
    topics: MOCK_TOPICS,
    sourceType: request.sourceType,
    sourceExcerpt: excerpt,
  };
}
