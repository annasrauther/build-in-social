/**
 * Mock Claude API
 * Auto-used when ANTHROPIC_API_KEY is not set.
 */

import type { ScriptOutput, HookVariant, TopicLabel, HookType, Sentiment, Video, ContentMode } from "@/lib/types/video";
import type { SeriesPlan } from "@/lib/types/series";
import type { Platform } from "@/lib/types/user";

const MOCK_DELAY_MS = 1200;
const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms));

// ─── checkQualityGate ─────────────────────────────────────────────────────────

// Mirror canonical pushback from claude.real.ts so mock and real return the same string.
const QUALITY_GATE_PUSHBACK_MOCK =
  "This is a bit general — one specific detail makes the content 10× better. " +
  "What exactly did you launch? What number surprised you? " +
  "Even one sentence changes everything.";

export async function checkQualityGate(answers: [string, string, string]): Promise<{
  passed: boolean;
  specificityScore: number;
  pushback?: string;
}> {
  console.log("[MOCK claude] checkQualityGate");
  await delay(800);
  // Heuristic: long-enough answers with at least one digit/proper noun pass.
  const text = answers.join(" ");
  const avgLength = text.length / 3;
  const hasDigit = /\d/.test(text);
  const hasProperNoun = /[A-Z][a-z]{2,}/.test(text);
  const passed = avgLength > 40 && (hasDigit || hasProperNoun);
  const score = passed ? 7 : 3;
  return {
    passed,
    specificityScore: score,
    pushback: passed ? undefined : QUALITY_GATE_PUSHBACK_MOCK,
  };
}

// ─── generateAutopilotAngles ──────────────────────────────────────────────────

export async function generateAutopilotAngles(params: {
  niche: string;
  tone: string;
  weekNumber: number;
  recentTopicLabels?: string[];
}): Promise<{ angles: string[]; rationale: string }> {
  console.log("[MOCK claude] generateAutopilotAngles");
  await delay(900);
  return {
    angles: [
      `The most underrated ${params.niche} concept nobody talks about`,
      `Why the standard advice on ${params.niche} is completely wrong for early-stage founders`,
      `The one ${params.niche} decision I wish I'd made 12 months earlier`,
      `How I approach ${params.niche} after getting it wrong for 6 months`,
      `The ${params.niche} framework that changed how I think about growth`,
    ],
    rationale: `Week ${params.weekNumber} autopilot angles for "${params.niche}" — mixing evergreen tips, contrarian takes, and vulnerability to maintain engagement without needing a specific update to share.`,
  };
}

// ─── generateWeeklyPlan ───────────────────────────────────────────────────────

export async function generateWeeklyPlan(params: {
  mode: ContentMode;
  niche: string;
  platforms: Platform[];
  weekNumber: number;
  qualityGateAnswers?: [string, string, string];
  autopilotAngles?: string[];
}): Promise<Pick<Video, "title" | "scriptJson" | "platform" | "dayOfWeek" | "facelessStyle" | "durationSeconds" | "contentType">[]> {
  console.log("[MOCK claude] generateWeeklyPlan", params.mode);
  await delay(2000);

  const { getPlatformConfig } = await import("@/lib/utils/platform-config");
  const days: Video["dayOfWeek"][] = ["mon", "tue", "wed", "thu", "fri"];
  const result: Pick<Video, "title" | "scriptJson" | "platform" | "dayOfWeek" | "facelessStyle" | "durationSeconds" | "contentType">[] = [];

  const isAutopilot = params.mode === "autopilot";
  const angles = isAutopilot
    ? (params.autopilotAngles ?? [`A ${params.niche} insight worth sharing this week`])
    : [];

  let dayIndex = 0;
  for (const platform of params.platforms) {
    const cfg = getPlatformConfig(platform);
    for (let i = 0; i < cfg.videosPerWeek; i++) {
      const angle = isAutopilot
        ? angles[i % angles.length]
        : `What I shipped in ${params.niche} this week`;

      result.push({
        title: `${cfg.name} — ${angle.substring(0, 60)}`,
        scriptJson: {
          hook: isAutopilot
            ? `${angle} — and most people in ${params.niche} haven't figured this out yet.`
            : `Here's what changed in my ${params.niche} work this week.`,
          body: isAutopilot
            ? `I've spent a lot of time in ${params.niche} and this is the pattern I keep seeing. Most people focus on the obvious thing. The actually important thing is harder to see until you've been through it.`
            : `${params.qualityGateAnswers?.[0] ?? `Working in ${params.niche}`}. What made this week different was the approach I took to the problem.`,
          cta: `Follow for weekly ${params.niche} content. Drop a comment if this hit.`,
        },
        platform,
        dayOfWeek: days[dayIndex % 5],
        facelessStyle: "dev-log",
        durationSeconds: cfg.optimalDurationSeconds,
        contentType: isAutopilot ? "domain-tip" : "founder-story",
      });
      dayIndex++;
    }
  }

  return result;
}

// ─── generateScript ───────────────────────────────────────────────────────────

export async function generateScript(input: {
  prompt: string;
  url?: string;
  platforms: Platform[];
  contentType: string;
  facelessStyle: string;
}): Promise<ScriptOutput> {
  console.log("[MOCK claude] generateScript", input.contentType);
  await delay();
  return {
    script: {
      hook: "Most founders spend 80% of their time on things that don't move the needle. Here's how to fix that in 10 minutes.",
      body: "Every week I score every task I did from 1-10 on how much it actually drove growth. The pattern: the 10s are always customer conversations, content that compounds, and product decisions. The 1s are meetings that could've been emails and features nobody asked for. Once you see it, you can't unsee it.",
      cta: "Drop a 🔥 if you're doing this exercise this week. I'll share my list.",
    },
    estimatedDurationSeconds: 58,
    platformNotes: {
      youtube: "Great for Shorts format with chapter marker at the scoring exercise.",
      linkedin: "Lead with the stat — LinkedIn rewards data-backed takes.",
      x: "Thread potential: each point can become a tweet.",
    },
    pseoKeywords: ["founder productivity", "startup time management", "prioritisation framework", "how to focus as a founder"],
    topicLabel: "how_to",
    hookType: "bold_claim",
    sentiment: "educational",
    estimatedOptimalLength: 60,
  };
}

// ─── generatePseoPage ─────────────────────────────────────────────────────────

export async function generatePseoPage(params: {
  script: string;
  videoTitle: string;
  platform: string;
  brandName: string;
  pseoKeywords: string[];
}): Promise<{ title: string; slug: string; htmlContent: string; metaDescription: string; faqJson: string; videoObjectJsonLd: string }> {
  console.log("[MOCK claude] generatePseoPage");
  await delay(1500);
  const slug = params.videoTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const metaDescription = params.script.substring(0, 155);
  const faqJson = JSON.stringify([
    { q: "How long does it take to see results?", a: "Most creators see meaningful traction within 30-90 days of consistent posting." },
    { q: "What platform should I start with?", a: "Start where your audience already is. For B2B founders that's usually LinkedIn or X." },
    { q: "How do I measure success?", a: "Track watch time over view count. 60% watch time beats 8% any day." },
  ]);
  const videoObjectJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: params.videoTitle,
    description: metaDescription,
    uploadDate: new Date().toISOString(),
  });
  const htmlContent = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${params.videoTitle} | ${params.brandName}</title>
<meta name="description" content="${metaDescription}">
<script type="application/ld+json">${videoObjectJsonLd}</script>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;max-width:760px;margin:0 auto;padding:2rem 1rem;color:#0a0a0a;line-height:1.6}h1{font-size:2rem;font-weight:700;margin-bottom:1rem}h2{font-size:1.25rem;font-weight:600;margin:2rem 0 .75rem}.tag{display:inline-block;background:#f0f0f1;color:#52525b;padding:.2rem .6rem;border-radius:4px;font-size:.75rem;margin:0 .25rem .5rem 0}</style>
</head><body>
<h1>${params.videoTitle}</h1>
<div>${params.pseoKeywords.map((k) => `<span class="tag">${k}</span>`).join("")}</div>
<h2>Key Takeaways</h2><p>${params.script}</p>
<h2>Why This Matters</h2><p>Consistent content compounds. This insight applies directly to your audience and keeps working for you long after you post it.</p>
<footer style="margin-top:3rem;padding-top:1.5rem;border-top:1px solid #e4e4e7;font-size:.875rem;color:#71717a">
<p>Generated by <a href="https://buildinsocial.com" style="color:rgb(36,36,36)">Build In Social</a> — your social media employee.</p>
</footer>
</body></html>`;

  return { title: params.videoTitle, slug, htmlContent, metaDescription, faqJson, videoObjectJsonLd };
}

// ─── generateHookVariants ─────────────────────────────────────────────────────

export async function generateHookVariants(_params: {
  script: string;
  topicLabel: string;
  platform: Platform;
}): Promise<HookVariant[]> {
  console.log("[MOCK claude] generateHookVariants");
  await delay(1200);
  return [
    { type: "bold_claim", label: "Bold claim", hook: "This one insight changed how I think about content forever." },
    { type: "pain_question", label: "Pain question", hook: "Why does nobody talk about what actually drives growth?" },
    { type: "shock_stat", label: "Shock stat", hook: "78% of founders are creating content for the wrong audience." },
    { type: "results_preview", label: "Results preview", hook: "I tried this for 30 days. Here's exactly what happened." },
    { type: "unexpected_twist", label: "Unexpected twist", hook: "The obvious answer to growing your audience is completely wrong." },
  ];
}

// ─── generateSeriesPlan ───────────────────────────────────────────────────────

export async function generateSeriesPlan(params: {
  topic: string;
  contentType: string;
  tone: string;
  platform: Platform;
  videoCount?: number;
}): Promise<SeriesPlan[]> {
  console.log("[MOCK claude] generateSeriesPlan");
  await delay(2000);
  const count = params.videoCount ?? 7;
  const plans: SeriesPlan[] = [
    { title: "The mistake that cost me 6 months of momentum", hook: "I made one decision that set my growth back by half a year.", platform: params.platform, suggestedLength: 65, angle: "Vulnerability story — builds trust" },
    { title: "My exact content framework (stolen from $10M founders)", hook: "I reverse-engineered the content strategy of three 8-figure founders.", platform: params.platform, suggestedLength: 58, angle: "Credibility through research" },
    { title: "The week I almost quit — and what stopped me", hook: "Tuesday, 3am. I had my laptop open, about to close the whole thing.", platform: params.platform, suggestedLength: 72, angle: "Raw emotional moment — highest engagement" },
    { title: "Why 'build in public' is overrated (and what actually works)", hook: "Everyone says build in public. Nobody tells you the part that doesn't work.", platform: params.platform, suggestedLength: 55, angle: "Contrarian take — drives comments" },
    { title: "Our first $1,000 month: the exact breakdown", hook: "First $1,000 in revenue. Here's every transaction.", platform: params.platform, suggestedLength: 62, angle: "Transparency + numbers" },
    { title: "The user interview that changed everything", hook: "One 20-minute call rewrote our entire product strategy.", platform: params.platform, suggestedLength: 68, angle: "Narrative + lesson" },
    { title: "What I'd do differently if starting over today", hook: "If I could restart with what I know now — here's the exact playbook.", platform: params.platform, suggestedLength: 75, angle: "Aspirational + actionable" },
  ];
  return plans.slice(0, count);
}

// ─── labelVideo ───────────────────────────────────────────────────────────────

export async function labelVideo(_params: {
  script: string;
  topic: string;
  platform: Platform;
}): Promise<{ topicLabel: TopicLabel; hookType: HookType; estimatedOptimalLength: number; sentiment: Sentiment }> {
  console.log("[MOCK claude] labelVideo");
  await delay(500);
  return {
    topicLabel: "how_to",
    hookType: "results_preview",
    estimatedOptimalLength: 62,
    sentiment: "confident",
  };
}
