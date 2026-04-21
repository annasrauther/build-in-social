/**
 * Mock Claude API — realistic responses that mirror real API output shape.
 * Used when ANTHROPIC_API_KEY is not set. Content is niche-aware and
 * platform-native so the app looks real E2E without calling the actual API.
 */

import type { ScriptOutput, HookVariant, TopicLabel, HookType, Sentiment, Video, ContentMode } from "@/lib/types/video";
import type { SeriesPlan } from "@/lib/types/series";
import type { Platform } from "@/lib/types/user";

const MOCK_DELAY_MS = 900;
const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms));

// ─── Platform-specific hook styles ───────────────────────────────────────────

const PLATFORM_HOOKS: Record<Platform, string[]> = {
  youtube: [
    "I made this mistake for 6 months straight — here's what it actually costs you.",
    "Nobody talks about the part that comes AFTER you ship. Let me change that.",
    "3 decisions that moved the needle. 1 that almost killed the project.",
  ],
  instagram: [
    "Save this if you're building something nobody understands yet 🧵",
    "The thing they don't tell you about shipping in public ↓",
    "Real numbers. Real mistakes. No filter.",
  ],
  linkedin: [
    "6 months ago I thought I had the right strategy. I was wrong about one critical thing.",
    "Most founders skip this step and wonder why growth stalls. Here's what I learned.",
    "I tracked every decision I made this week. The pattern surprised me.",
  ],
  x: [
    "hot take: shipping > perfecting",
    "the thing nobody warns you about when you go from idea to product:",
    "stopped doing this one thing → engagement doubled",
  ],
};

const PLATFORM_CTAS: Record<Platform, string> = {
  youtube: "Subscribe for weekly breakdowns — new video every Friday.",
  instagram: "Follow for more honest founder content. DM me 'breakdown' for the full story.",
  linkedin: "Follow for weekly insights from the build. What's your experience been?",
  x: "follow for the unfiltered version of building in public",
};

const PLATFORM_BODIES: Record<Platform, string> = {
  youtube: "Here's what actually happened: I spent 3 weeks building a feature nobody asked for. When I finally showed it to a user, they said 'cool, but what I really need is X.' That one conversation saved me 2 months of wasted work. The lesson isn't obvious — it's not just 'talk to users.' It's that your intuition about what matters is always biased toward what you already know how to build.",
  instagram: "Three things I learned the hard way:\n\n1. Your first 10 users tell you everything\n2. Revenue is feedback, everything else is opinion\n3. The scary decision is usually the right one\n\nBuilding in the open so you don't have to learn these alone.",
  linkedin: "The data point that changed how I think about growth: our best-retained users didn't come from Product Hunt or Twitter. They came from a single LinkedIn post I almost didn't write because I thought it was 'too niche.' Specificity converts. Broad appeal doesn't. This is counterintuitive when you're early and desperate for any user at all — but it's the most consistent pattern I've seen.",
  x: "shipped → got feedback → rebuilt → shipped again\n\nthe loop works. trust the loop.",
};

// ─── checkQualityGate ─────────────────────────────────────────────────────────

const QUALITY_GATE_PUSHBACK =
  "This is a bit general — one specific detail makes the content 10× better. " +
  "What exactly did you launch? What number surprised you? " +
  "Even one sentence changes everything.";

export async function checkQualityGate(answers: [string, string, string]): Promise<{
  passed: boolean;
  specificityScore: number;
  pushback?: string;
}> {
  await delay(600);
  const text = answers.join(" ");
  const avgLength = text.length / 3;
  const hasDigit = /\d/.test(text);
  const hasProperNoun = /[A-Z][a-z]{2,}/.test(text);
  const hasSpecificTool = /\b(stripe|clerk|postgres|redis|nextjs|react|tailwind|vercel|supabase|prisma)\b/i.test(text);
  const passed = avgLength > 40 && (hasDigit || hasProperNoun || hasSpecificTool);
  const score = passed ? (hasDigit && hasSpecificTool ? 8 : 7) : 3;
  return {
    passed,
    specificityScore: score,
    pushback: passed ? undefined : QUALITY_GATE_PUSHBACK,
  };
}

// ─── generateAutopilotAngles ──────────────────────────────────────────────────

export async function generateAutopilotAngles(params: {
  niche: string;
  tone: string;
  weekNumber: number;
  recentTopicLabels?: string[];
  hint?: string;
}): Promise<{ angles: string[]; rationale: string }> {
  await delay(700);
  const n = params.niche;
  const hintNote = params.hint ? ` (hint: "${params.hint}")` : "";
  return {
    angles: [
      `The most underrated practice in ${n} that senior practitioners never explain`,
      `Why the standard advice about ${n} breaks down past a certain scale`,
      `The ${n} decision I delayed for 3 months — and what finally forced my hand`,
      `Honest breakdown: what ${n} looks like week 1 vs week 12`,
      `The question I ask every time I get stuck on a ${n} problem`,
    ],
    rationale: `Week ${params.weekNumber} autopilot plan for "${n}"${hintNote} — mixing authority angles, contrarian takes, and vulnerability to maintain trust without needing a specific update.`,
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
}): Promise<(Pick<Video, "title" | "scriptJson" | "platform" | "dayOfWeek" | "facelessStyle" | "durationSeconds" | "contentType" | "platformHooks"> & { confidenceScore: number })[]> {
  await delay(1800);

  const { getPlatformConfig } = await import("@/lib/utils/platform-config");
  const days: Video["dayOfWeek"][] = ["mon", "tue", "wed", "thu", "fri"];

  const result: (Pick<Video, "title" | "scriptJson" | "platform" | "dayOfWeek" | "facelessStyle" | "durationSeconds" | "contentType" | "platformHooks"> & { confidenceScore: number })[] = [];

  const isManual = params.mode === "manual";
  const userContext = isManual && params.qualityGateAnswers
    ? params.qualityGateAnswers[0]
    : null;

  const angles = params.autopilotAngles?.length
    ? params.autopilotAngles
    : [
        `A core insight about ${params.niche} worth sharing`,
        `A common mistake in ${params.niche} I see constantly`,
        `What changed my thinking about ${params.niche}`,
        `The honest truth about growing in ${params.niche}`,
        `One framework I use for ${params.niche} decisions`,
      ];

  const facelessStyles: Video["facelessStyle"][] = ["dev-log", "minimal-text", "documentary", "slide"];

  let dayIndex = 0;
  for (const platform of params.platforms) {
    const cfg = getPlatformConfig(platform);
    const hooks = PLATFORM_HOOKS[platform];
    const cta = PLATFORM_CTAS[platform];
    const body = PLATFORM_BODIES[platform];

    for (let i = 0; i < cfg.videosPerWeek; i++) {
      const angle = angles[i % angles.length];
      const hook = userContext
        ? `${hooks[i % hooks.length].split("—")[0].trim()} — ${userContext.slice(0, 60)}.`
        : hooks[i % hooks.length];

      // Per-platform hooks: the primary platform carries its own hook, and
      // every other surface gets a native-to-platform rewrite of the same
      // angle. Lets the renderer cross-post a single video body under 4
      // different opening lines without re-rendering.
      const platformHooks: Partial<Record<Platform, string>> = {};
      for (const p of ["youtube", "instagram", "linkedin", "x"] as Platform[]) {
        platformHooks[p] = PLATFORM_HOOKS[p][i % PLATFORM_HOOKS[p].length];
      }

      result.push({
        title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} — ${angle.slice(0, 55)}`,
        scriptJson: {
          hook,
          body: isManual && userContext
            ? `${userContext} ${body.slice(0, 180)}`
            : body,
          cta,
        },
        platform,
        dayOfWeek: days[dayIndex % 5],
        facelessStyle: facelessStyles[i % facelessStyles.length],
        durationSeconds: cfg.optimalDurationSeconds,
        contentType: isManual ? "founder-story" : "domain-tip",
        platformHooks,
        confidenceScore: isManual ? 8 : 7,
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
  await delay(900);
  const platform = input.platforms[0] ?? "youtube";
  const hook = PLATFORM_HOOKS[platform][0];
  const body = PLATFORM_BODIES[platform];
  const cta = PLATFORM_CTAS[platform];

  return {
    script: { hook, body, cta },
    estimatedDurationSeconds: 42,
    platformNotes: {
      youtube: "Open with the hook within 2 seconds. Pause after the first sentence.",
      instagram: "Add captions — 85% of Reels are watched without sound.",
      linkedin: "Lead with the data point. LinkedIn rewards specificity over story.",
      x: "Under 200 chars. End with a question or a hard statement, not a CTA.",
    },
    pseoKeywords: [
      `${input.contentType} strategy`,
      "indie founder content",
      "build in public",
      "saas growth",
      "founder lessons",
    ],
    topicLabel: "founder-story" as TopicLabel,
    hookType: "bold_claim" as HookType,
    sentiment: "confident" as Sentiment,
    estimatedOptimalLength: 42,
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
  await delay(1200);
  const slug = params.videoTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const metaDescription = `${params.script.slice(0, 140)}…`;
  const keywords = params.pseoKeywords.length
    ? params.pseoKeywords
    : ["indie founder", "build in public", "saas growth", "content strategy"];

  const faqJson = JSON.stringify([
    {
      q: "How long does it take to see traction from short-form video?",
      a: "Most founders see meaningful engagement within 4–8 weeks of consistent posting. The first 10 videos are data collection — don't optimise before you have signal.",
    },
    {
      q: "Which platform should I start with?",
      a: "Start where your audience already lives. For B2B SaaS founders: LinkedIn first, then X. For consumer or dev tools: YouTube Shorts and X together.",
    },
    {
      q: "How do I measure if a video actually worked?",
      a: "Watch-through rate beats view count every time. A 200-view video with 70% watch-through outperforms a 2,000-view video at 8%. The algorithm agrees.",
    },
  ]);

  const videoObjectJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: params.videoTitle,
    description: metaDescription,
    thumbnailUrl: "https://buildinsocial.com/og-default.png",
    uploadDate: new Date().toISOString(),
    publisher: {
      "@type": "Organization",
      name: "Build In Social",
      url: "https://buildinsocial.com",
    },
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${params.videoTitle} | Build In Social</title>
<meta name="description" content="${metaDescription}">
<meta property="og:title" content="${params.videoTitle}">
<meta property="og:description" content="${metaDescription}">
<meta property="og:site_name" content="Build In Social">
<script type="application/ld+json">${videoObjectJsonLd}</script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:720px;margin:0 auto;padding:2.5rem 1.25rem;color:#111;line-height:1.65;background:#faf9f5}
  h1{font-size:1.875rem;font-weight:700;line-height:1.2;margin-bottom:1rem;color:#0a0a0a}
  h2{font-size:1.125rem;font-weight:600;margin:2.5rem 0 .75rem;color:#0a0a0a}
  p{margin-bottom:1rem;color:#3a3a3a}
  .tag{display:inline-block;background:#f0ede8;color:#6b6b6b;padding:.2rem .65rem;border-radius:4px;font-size:.75rem;margin:0 .3rem .4rem 0}
  .takeaway{border-left:3px solid #d97757;padding:.75rem 1rem;background:#fff8f5;margin:1rem 0;border-radius:0 6px 6px 0}
  .faq{border:1px solid #e8e4df;border-radius:8px;padding:1rem 1.25rem;margin:.75rem 0}
  .faq strong{display:block;margin-bottom:.35rem;color:#0a0a0a}
  footer{margin-top:3.5rem;padding-top:1.5rem;border-top:1px solid #e4e0da;font-size:.8125rem;color:#888;text-align:center}
  footer a{color:#d97757;text-decoration:none}
</style>
</head>
<body>
<h1>${params.videoTitle}</h1>
<div style="margin:.75rem 0 1.5rem">${keywords.map((k) => `<span class="tag">${k}</span>`).join("")}</div>
<h2>Key Takeaways</h2>
<div class="takeaway"><p>${params.script.slice(0, 220)}</p></div>
<h2>Why This Matters</h2>
<p>Short-form video is the highest-leverage distribution channel available to indie founders right now. The algorithm rewards consistency and specificity — exactly what Build In Social automates for you.</p>
<p>Content that compounds means every video you post today is still working for you in 6 months. This one is no different.</p>
<h2>Frequently Asked Questions</h2>
${JSON.parse(faqJson).map((f: { q: string; a: string }) => `<div class="faq"><strong>${f.q}</strong><p>${f.a}</p></div>`).join("")}
<footer>
  <p>Generated by <a href="https://buildinsocial.com">Build In Social</a> — your social media distribution partner.</p>
</footer>
</body>
</html>`;

  return { title: params.videoTitle, slug, htmlContent, metaDescription, faqJson, videoObjectJsonLd };
}

// ─── generateHookVariants ─────────────────────────────────────────────────────

export async function generateHookVariants(params: {
  script: string;
  topicLabel: string;
  platform: Platform;
}): Promise<HookVariant[]> {
  await delay(800);
  const hooks = PLATFORM_HOOKS[params.platform];
  return [
    { type: "bold_claim",        label: "Bold claim",       hook: hooks[0] },
    { type: "pain_question",     label: "Pain question",    hook: `Are you still doing ${params.topicLabel.replace("_", " ")} the hard way?` },
    { type: "shock_stat",        label: "Shock stat",       hook: "92% of founders skip this step. It shows in their metrics." },
    { type: "results_preview",   label: "Results preview",  hook: "I tested this for 30 days. Here's the exact number." },
    { type: "unexpected_twist",  label: "Unexpected twist", hook: "The advice everyone gives on this is backwards. Here's why." },
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
  await delay(1400);
  const count = params.videoCount ?? 7;
  const all: SeriesPlan[] = [
    { title: `The mistake that set my ${params.topic} back 6 months`,          hook: "I made one call that cost me half a year of momentum. Here's exactly what it was.", platform: params.platform, suggestedLength: 58, angle: "Vulnerability — highest trust signal" },
    { title: `My exact ${params.topic} framework (reverse-engineered from 3 winners)`, hook: "I studied three people doing this at a high level. The pattern was not what I expected.", platform: params.platform, suggestedLength: 52, angle: "Authority through research" },
    { title: `Why most ${params.topic} advice is wrong for early stage`,         hook: "The standard playbook assumes you have things you don't have yet.", platform: params.platform, suggestedLength: 48, angle: "Contrarian — drives comments" },
    { title: `The week I almost quit ${params.topic} — and what stopped me`,     hook: "2am. Laptop open. Seriously considered closing everything.", platform: params.platform, suggestedLength: 65, angle: "Raw moment — maximum engagement" },
    { title: `First real traction in ${params.topic}: the exact breakdown`,      hook: "Here's every number, every action, every mistake from the first month that worked.", platform: params.platform, suggestedLength: 60, angle: "Transparency + data" },
    { title: `What I'd do differently starting ${params.topic} from scratch`,    hook: "If I kept the knowledge but lost the headstart — here's the exact playbook.", platform: params.platform, suggestedLength: 55, angle: "Aspirational + actionable" },
    { title: `The ${params.topic} question nobody asks (but everyone needs)`,    hook: "I've had this conversation with 40+ founders. The answer is always the same.", platform: params.platform, suggestedLength: 50, angle: "Educational + viral-safe" },
  ];
  return all.slice(0, count);
}

// ─── reviseScript ─────────────────────────────────────────────────────────────

export async function reviseScript(
  original: { hook: string; body: string; cta: string },
  note: string,
  context: {
    platform: Platform;
    durationSeconds: number;
    niche?: string;
    contentType?: string;
    title?: string;
  }
): Promise<{ opening_hook: string; body: string; cta?: string }> {
  await delay(700);
  const tag = note.slice(0, 60).replace(/\s+/g, " ").trim();
  return {
    opening_hook: `(v2 — ${tag}) ${original.hook}`,
    body: `${original.body}\n\nRevised for ${context.platform} at ${context.durationSeconds}s based on your note.`,
    cta: original.cta,
  };
}

// ─── labelVideo ───────────────────────────────────────────────────────────────

export async function labelVideo(_params: {
  script: string;
  topic: string;
  platform: Platform;
}): Promise<{ topicLabel: TopicLabel; hookType: HookType; estimatedOptimalLength: number; sentiment: Sentiment }> {
  await delay(400);
  return {
    topicLabel: "founder-story" as TopicLabel,
    hookType: "results_preview" as HookType,
    estimatedOptimalLength: 45,
    sentiment: "confident" as Sentiment,
  };
}
