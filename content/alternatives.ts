/**
 * Copy for `/alternative/{competitor}` SEO landing pages.
 *
 * Each entry is a structured head-to-head comparison so the page can rank on
 * "competitor alternative" queries. Keep tone factual; every claim should be
 * verifiable in the corresponding pricing + FAQ pages.
 */

export interface AlternativeRow {
  feature: string;
  competitor: string;
  buildInSocial: string;
  winsFor: "competitor" | "build-in-social" | "tie";
}

export interface AlternativePage {
  slug: string;
  competitorName: string;
  competitorUrl?: string;
  /** One-line meta description — SEO title + hero subhead share this framing. */
  headline: string;
  subhead: string;
  /** Opinion-first, factual take on when each tool is the right pick. */
  summary: string;
  /** Structured comparison. Tie rows are fine — keeps the page honest. */
  table: AlternativeRow[];
  /** CTA copy. */
  ctaLabel: string;
}

export const ALTERNATIVES: Record<string, AlternativePage> = {
  "autoshorts-ai": {
    slug: "autoshorts-ai",
    competitorName: "Autoshorts.ai",
    competitorUrl: "https://autoshorts.ai",
    headline: "Build In Social vs Autoshorts.ai",
    subhead:
      "Both automate short-form video. Autoshorts focuses on faceless entertainment niches. Build In Social runs domain-presence content around what you build or sell \u2014 with four render modes, unlimited series, and credit-based pricing.",
    summary:
      "Autoshorts is a great pick if you want to spin up a faceless entertainment channel (Scary Stories, Urban Legends) and let it run. If you\u2019re a builder or seller who needs distribution around your actual product or domain, Build In Social is built for you: pick your own face via HeyGen, run multiple parallel series, and mix render modes freely.",
    table: [
      {
        feature: "Render modes",
        competitor: "Faceless only (stock B-roll + voice)",
        buildInSocial: "Faceless, stock-AI avatar, HeyGen licensed avatar, your HeyGen twin, or combo (AI picks per video)",
        winsFor: "build-in-social",
      },
      {
        feature: "Series per account",
        competitor: "1 (additional series are a paid add-on)",
        buildInSocial: "Unlimited \u2014 split your credit pool across any number of parallel shows",
        winsFor: "build-in-social",
      },
      {
        feature: "Pricing axis",
        competitor: "Posting cadence ($19/$39/$69)",
        buildInSocial: "Credit pool scaled by render kind (faceless = 1 credit, HeyGen = 15)",
        winsFor: "build-in-social",
      },
      {
        feature: "Content style",
        competitor: "Generic entertainment topics (Scary Stories, Urban Legends, Fun Facts)",
        buildInSocial: "Domain-presence: content tied to your niche, product, or expertise",
        winsFor: "build-in-social",
      },
      {
        feature: "Avatar library",
        competitor: "~2,900 pre-rendered AI avatars",
        buildInSocial: "Curated AI avatars + HeyGen marketplace (licensed humans) + your own twin",
        winsFor: "tie",
      },
      {
        feature: "Per-platform hooks",
        competitor: "Single script across surfaces",
        buildInSocial: "Distinct hooks per platform (YouTube / Instagram / LinkedIn / X)",
        winsFor: "build-in-social",
      },
      {
        feature: "Indexable SEO articles",
        competitor: "No",
        buildInSocial: "Every video auto-generates a Google-indexed article (Solo and above)",
        winsFor: "build-in-social",
      },
      {
        feature: "WordPress publishing",
        competitor: "No",
        buildInSocial: "One-click publish to your WordPress site on Creator / Studio",
        winsFor: "build-in-social",
      },
      {
        feature: "Free trial / preview",
        competitor: "Free plan temporarily paused (1 video, no edit, watermark)",
        buildInSocial: "Free preview of a week of titles + hooks \u2014 no card required, pay only to ship",
        winsFor: "build-in-social",
      },
      {
        feature: "TikTok support",
        competitor: "Yes",
        buildInSocial: "Not yet (TikTok API approval pending)",
        winsFor: "competitor",
      },
    ],
    ctaLabel: "Preview your content free",
  },
  "vadoo-ai": {
    slug: "vadoo-ai",
    competitorName: "Vadoo AI",
    competitorUrl: "https://vadoo.tv",
    headline: "Build In Social vs Vadoo AI",
    subhead:
      "Vadoo AI is a video-generation playground for one-offs. Build In Social is a weekly distribution engine for people who build or sell \u2014 scripts, renders, posts to four platforms, and writes an indexable article per video.",
    summary:
      "Vadoo is a strong one-off generator: give it a topic, get a video. If you want an ongoing weekly distribution system that runs on your niche and ships on a schedule, Build In Social is the better fit. It also exposes the full render-mode spectrum (faceless \u2192 your HeyGen twin) in one pricing pool.",
    table: [
      {
        feature: "Primary use case",
        competitor: "One-off video generation",
        buildInSocial: "Weekly distribution engine with ongoing series",
        winsFor: "build-in-social",
      },
      {
        feature: "Series / autopilot mode",
        competitor: "No (one video at a time)",
        buildInSocial: "Unlimited series, cron-scheduled autopilot + manual modes",
        winsFor: "build-in-social",
      },
      {
        feature: "Render modes",
        competitor: "Faceless + AI avatar",
        buildInSocial: "Faceless, stock-AI, HeyGen licensed, HeyGen twin, combo",
        winsFor: "build-in-social",
      },
      {
        feature: "Your own face (digital twin)",
        competitor: "Not supported",
        buildInSocial: "Yes, on Creator ($79) and Studio ($149) \u2014 60-sec recording trains the twin",
        winsFor: "build-in-social",
      },
      {
        feature: "Auto-posting",
        competitor: "Download + post yourself",
        buildInSocial: "Auto-posts to YouTube Shorts, Reels, LinkedIn, X",
        winsFor: "build-in-social",
      },
      {
        feature: "pSEO article per video",
        competitor: "No",
        buildInSocial: "Every video generates a Google-indexed article",
        winsFor: "build-in-social",
      },
      {
        feature: "Pricing",
        competitor: "Credit-pack top-ups",
        buildInSocial: "Monthly credit pool (30 / 75 / 160 / 300) + top-offs that never expire",
        winsFor: "tie",
      },
    ],
    ctaLabel: "Preview your content free",
  },
};

export function getAlternative(slug: string): AlternativePage | undefined {
  return ALTERNATIVES[slug];
}
