/**
 * Real Claude API implementation using @anthropic-ai/sdk
 * Falls back to mock when ANTHROPIC_API_KEY is not set.
 *
 * Model usage:
 *   - Haiku: scripts, quality gate, labelling
 *   - Sonnet: pSEO articles, intelligence summaries only
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  ScriptOutput,
  TopicLabel,
  HookType,
  Sentiment,
  HookVariant,
  ContentMode,
  Video,
} from "@/lib/types/video";
import type { Platform } from "@/lib/types/user";
import type { SeriesPlan } from "@/lib/types/series";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

const HAIKU = "claude-haiku-4-5-20251001";
const SONNET = "claude-sonnet-4-6";

async function callWithTool<T>(
  prompt: string,
  toolName: string,
  toolDescription: string,
  inputSchema: Anthropic.Tool["input_schema"],
  model = HAIKU
): Promise<T> {
  const client = getClient();
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    tools: [{ name: toolName, description: toolDescription, input_schema: inputSchema }],
    tool_choice: { type: "tool", name: toolName },
    messages: [{ role: "user", content: prompt }],
  });
  const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("No tool_use block in Claude response");
  return toolUse.input as T;
}

// ─── Quality gate ─────────────────────────────────────────────────────────────

export async function checkQualityGate(answers: [string, string, string]): Promise<{
  passed: boolean;
  specificityScore: number;
  pushback?: string;
}> {
  const prompt = `You are evaluating content quality gate answers from an indie developer.
They answered 3 questions about what they're building this week:

1. "${answers[0]}"
2. "${answers[1]}"
3. "${answers[2]}"

Score the specificity from 1-10. Score < 5 means too vague for good content.
A score of 5+ means content can be generated. If < 5, provide a pushback message.`;

  return callWithTool(
    prompt,
    "evaluate_quality_gate",
    "Evaluate quality gate answers for content specificity",
    {
      type: "object",
      properties: {
        passed: { type: "boolean" },
        specificityScore: { type: "number", minimum: 1, maximum: 10 },
        pushback: { type: "string", description: "Message asking for more detail (only when score < 5)" },
      },
      required: ["passed", "specificityScore"],
    }
  );
}

// ─── generateAutopilotAngles ──────────────────────────────────────────────────

/**
 * Generates content angles for autopilot mode — no user input required.
 * Uses the user's niche and domain to produce a week of relevant content ideas.
 */
export async function generateAutopilotAngles(params: {
  niche: string;
  tone: string;
  weekNumber: number;
  recentTopicLabels?: string[];
}): Promise<{ angles: string[]; rationale: string }> {
  const avoidRepeat = params.recentTopicLabels?.length
    ? `Avoid repeating these recent topic types: ${params.recentTopicLabels.join(", ")}.`
    : "";

  const prompt = `You are Build In Social — a social media content engine for indie developers.

The user is in the "${params.niche}" domain with a "${params.tone}" tone.
It's week ${params.weekNumber} of the year. They have nothing specific to share this week
but want content to keep going. Generate 5 strong content angles for this week.

Good angles for indie devs / SaaS founders:
- Evergreen domain tips ("The one thing I always do before deploying")
- Opinion/contrarian takes ("Everyone talks about X but nobody mentions Y")
- Domain myth-busting ("Why [common advice] is actually wrong for [niche]")
- Case study framing ("How [niche concept] changed my [metric]")
- Educational series episodes ("The complete guide to [topic], part N")

${avoidRepeat}

Generate 5 content angles that would perform well for this niche and tone.
Each angle is a one-sentence content premise, not a title.`;

  return callWithTool<{ angles: string[]; rationale: string }>(
    prompt,
    "generate_autopilot_angles",
    "Generate domain-relevant content angles for autopilot mode",
    {
      type: "object",
      properties: {
        angles: {
          type: "array",
          minItems: 5,
          maxItems: 5,
          items: { type: "string" },
        },
        rationale: {
          type: "string",
          description: "Brief explanation of why these angles fit this niche this week",
        },
      },
      required: ["angles", "rationale"],
    }
  );
}

// ─── generateWeeklyPlan ───────────────────────────────────────────────────────

export async function generateWeeklyPlan(params: {
  mode: ContentMode;
  niche: string;
  platforms: Platform[];
  weekNumber: number;
  /** Manual mode only */
  qualityGateAnswers?: [string, string, string];
  /** Autopilot mode only — from generateAutopilotAngles() */
  autopilotAngles?: string[];
}): Promise<Pick<Video, "title" | "scriptJson" | "platform" | "dayOfWeek" | "facelessStyle" | "durationSeconds" | "contentType">[]> {
  const { getPlatformConfig } = await import("@/lib/utils/platform-config");

  const platformDetails = params.platforms
    .map((p) => {
      const cfg = getPlatformConfig(p);
      return `${cfg.name}: ${cfg.videosPerWeek} videos/week, ${cfg.minDurationSeconds}-${cfg.maxDurationSeconds}s`;
    })
    .join("\n");

  const contextBlock =
    params.mode === "manual" && params.qualityGateAnswers
      ? `This week the founder is sharing:
  Q1: "${params.qualityGateAnswers[0]}"
  Q2: "${params.qualityGateAnswers[1]}"
  Q3: "${params.qualityGateAnswers[2]}"`
      : `Running on autopilot. Use these content angles for the week:
${(params.autopilotAngles ?? []).map((a, i) => `  ${i + 1}. ${a}`).join("\n")}
Distribute these angles across platforms with platform-native framing for each.`;

  const prompt = `You are Build In Social — a social media content engine for indie developers.

Generate a weekly content plan for week ${params.weekNumber}.

Founder context:
- Niche: "${params.niche}"
- Mode: ${params.mode}
- ${contextBlock}

Platforms and requirements:
${platformDetails}

Create exactly ${params.platforms.reduce((sum, p) => sum + getPlatformConfig(p).videosPerWeek, 0)} video briefs.
Each video must have platform-native content — different hooks, angles, and formats per platform.
Spread across Mon-Fri. Duration MUST match platform specs exactly.`;

  type VideoItem = {
    title: string;
    hook: string;
    body: string;
    cta: string;
    platform: Platform;
    dayOfWeek: string;
    facelessStyle: string;
    durationSeconds: number;
    contentType: string;
  };

  const result = await callWithTool<{ videos: VideoItem[] }>(
    prompt,
    "generate_weekly_plan",
    "Generate platform-native weekly content plan",
    {
      type: "object",
      properties: {
        videos: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              hook: { type: "string" },
              body: { type: "string" },
              cta: { type: "string" },
              platform: { type: "string", enum: ["youtube", "instagram", "linkedin", "x"] },
              dayOfWeek: { type: "string", enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] },
              facelessStyle: { type: "string", enum: ["dev-log", "documentary", "minimal-text", "slide"] },
              durationSeconds: { type: "number" },
              contentType: { type: "string" },
            },
            required: ["title", "hook", "body", "cta", "platform", "dayOfWeek", "facelessStyle", "durationSeconds", "contentType"],
          },
        },
      },
      required: ["videos"],
    },
    HAIKU
  );

  return result.videos.map((v) => ({
    title: v.title,
    scriptJson: { hook: v.hook, body: v.body, cta: v.cta },
    platform: v.platform as Platform,
    dayOfWeek: v.dayOfWeek as Video["dayOfWeek"],
    facelessStyle: v.facelessStyle as Video["facelessStyle"],
    durationSeconds: v.durationSeconds,
    contentType: v.contentType as Video["contentType"],
  }));
}

// ─── generatePseoPage ─────────────────────────────────────────────────────────

export async function generatePseoPage(params: {
  script: string;
  videoTitle: string;
  platform: string;
  brandName: string;
  pseoKeywords: string[];
}): Promise<{ title: string; slug: string; htmlContent: string; metaDescription: string; faqJson: string; videoObjectJsonLd: string }> {
  const slug = params.videoTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const prompt = `You are an SEO expert. Generate a landing page for this short-form video.

Title: "${params.videoTitle}"
Brand: "${params.brandName}"
Platform: ${params.platform}
Keywords: ${params.pseoKeywords.join(", ")}
Script: "${params.script}"

Requirements:
- Full HTML with head + body, inline CSS only
- Meta tags + og: tags
- VideoObject JSON-LD
- Sections: intro, "Key Takeaways", "Why This Matters", FAQ (3 questions)
- Max-width 760px, mobile-first, Geist font from Google Fonts
- Branded footer linking to buildinsocial.com`;

  const result = await callWithTool<{
    title: string;
    htmlContent: string;
    metaDescription: string;
    faqJson: string;
    videoObjectJsonLd: string;
  }>(
    prompt,
    "generate_pseo_page",
    "Generate SEO-optimized HTML landing page",
    {
      type: "object",
      properties: {
        title: { type: "string" },
        htmlContent: { type: "string" },
        metaDescription: { type: "string" },
        faqJson: { type: "string" },
        videoObjectJsonLd: { type: "string" },
      },
      required: ["title", "htmlContent", "metaDescription", "faqJson", "videoObjectJsonLd"],
    },
    SONNET
  );

  return { ...result, slug };
}

// ─── generateHookVariants ─────────────────────────────────────────────────────

export async function generateHookVariants(params: {
  script: string;
  topicLabel: string;
  platform: Platform;
}): Promise<HookVariant[]> {
  const prompt = `Rewrite the hook for this video in 5 styles. Platform: ${params.platform}.
Script: "${params.script.substring(0, 400)}"
Topic: ${params.topicLabel}
Generate: bold_claim, pain_question, shock_stat, results_preview, unexpected_twist.`;

  type Result = { variants: HookVariant[] };
  const result = await callWithTool<Result>(
    prompt, "generate_hook_variants", "Generate 5 hook variants",
    {
      type: "object",
      properties: {
        variants: {
          type: "array",
          minItems: 5,
          maxItems: 5,
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["bold_claim", "pain_question", "shock_stat", "results_preview", "unexpected_twist"] },
              label: { type: "string" },
              hook: { type: "string" },
            },
            required: ["type", "label", "hook"],
          },
        },
      },
      required: ["variants"],
    }
  );
  return result.variants;
}

// ─── generateSeriesPlan ───────────────────────────────────────────────────────

export async function generateSeriesPlan(params: {
  topic: string;
  contentType: string;
  tone: string;
  platform: Platform;
  videoCount?: number;
}): Promise<SeriesPlan[]> {
  const count = params.videoCount ?? 7;
  const prompt = `Plan a ${count}-video series for indie founders.
Topic: "${params.topic}", Type: ${params.contentType}, Tone: ${params.tone}, Platform: ${params.platform}
Mix: vulnerability, research-backed, contrarian, transparency, how-tos.`;

  type Result = { videos: SeriesPlan[] };
  const result = await callWithTool<Result>(
    prompt, "generate_series_plan", `Generate ${count}-video series plan`,
    {
      type: "object",
      properties: {
        videos: {
          type: "array",
          minItems: count,
          maxItems: count,
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              hook: { type: "string" },
              platform: { type: "string", enum: ["youtube", "instagram", "linkedin", "x"] },
              suggestedLength: { type: "number" },
              angle: { type: "string" },
            },
            required: ["title", "hook", "platform", "suggestedLength", "angle"],
          },
        },
      },
      required: ["videos"],
    }
  );
  return result.videos.map((v) => ({ ...v, platform: params.platform }));
}

// ─── labelVideo ───────────────────────────────────────────────────────────────

export async function labelVideo(params: {
  script: string;
  topic: string;
  platform: Platform;
}): Promise<{ topicLabel: TopicLabel; hookType: HookType; estimatedOptimalLength: number; sentiment: Sentiment }> {
  const prompt = `Classify this video script. Script: "${params.script.substring(0, 600)}", Topic: ${params.topic}, Platform: ${params.platform}`;

  return callWithTool(
    prompt, "label_video", "Classify video script for analytics",
    {
      type: "object",
      properties: {
        topicLabel: { type: "string", enum: ["feature_drop", "mistake_story", "roadmap_tease", "how_to", "opinion", "social_proof"] },
        hookType: { type: "string", enum: ["bold_claim", "pain_question", "shock_stat", "unexpected_twist", "results_preview"] },
        estimatedOptimalLength: { type: "number" },
        sentiment: { type: "string", enum: ["confident", "vulnerable", "educational", "entertaining"] },
      },
      required: ["topicLabel", "hookType", "estimatedOptimalLength", "sentiment"],
    }
  );
}

// ─── generateScript (legacy single-video) ────────────────────────────────────

export async function generateScript(input: {
  prompt: string;
  url?: string;
  platforms: Platform[];
  contentType: string;
  facelessStyle: string;
}): Promise<ScriptOutput> {
  const prompt = `Write a short-form video script for indie founders.
Prompt: "${input.prompt}", Type: ${input.contentType}, Platforms: ${input.platforms.join(", ")}
Hook (1-2 punchy sentences), Body (3-5 sentences, one key insight), CTA (1 sentence).`;

  type Result = {
    hook: string; body: string; cta: string;
    estimatedDurationSeconds: number;
    platformNotes: Record<string, string>;
    pseoKeywords: string[];
    topicLabel: TopicLabel; hookType: HookType; sentiment: Sentiment;
    estimatedOptimalLength: number;
  };

  const result = await callWithTool<Result>(
    prompt, "generate_script", "Generate structured video script with metadata",
    {
      type: "object",
      properties: {
        hook: { type: "string" }, body: { type: "string" }, cta: { type: "string" },
        estimatedDurationSeconds: { type: "number" },
        platformNotes: { type: "object", additionalProperties: { type: "string" } },
        pseoKeywords: { type: "array", items: { type: "string" } },
        topicLabel: { type: "string", enum: ["feature_drop", "mistake_story", "roadmap_tease", "how_to", "opinion", "social_proof"] },
        hookType: { type: "string", enum: ["bold_claim", "pain_question", "shock_stat", "unexpected_twist", "results_preview"] },
        sentiment: { type: "string", enum: ["confident", "vulnerable", "educational", "entertaining"] },
        estimatedOptimalLength: { type: "number" },
      },
      required: ["hook", "body", "cta", "estimatedDurationSeconds", "platformNotes", "pseoKeywords", "topicLabel", "hookType", "sentiment", "estimatedOptimalLength"],
    }
  );

  return {
    script: { hook: result.hook, body: result.body, cta: result.cta },
    estimatedDurationSeconds: result.estimatedDurationSeconds,
    platformNotes: result.platformNotes as Partial<Record<Platform, string>>,
    pseoKeywords: result.pseoKeywords,
    topicLabel: result.topicLabel,
    hookType: result.hookType,
    sentiment: result.sentiment,
    estimatedOptimalLength: result.estimatedOptimalLength,
  };
}
