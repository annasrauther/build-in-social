// content/landing.ts
// All landing page copy — Uber Base, direct, outcome-first.

// ─── Types ────────────────────────────────────────────────

interface NavContent {
  wordmark: string;
  links: { label: string; href: string }[];
  signInLabel: string;
  ctaLabel: string;
  mainLinks: { label: string; href: string }[];
}

interface HeroContent {
  headline: string;
  subhead: string;
  callout?: string;
  subCallout?: string;
  primaryCta: string;
  secondaryCta: string;
  reassurance: string;
}

interface ValueProp {
  title: string;
  body: string;
}

interface ValuePropsContent {
  headline: string;
  items: ValueProp[];
}

interface HowItWorksStep {
  num: string;
  title: string;
  body: string;
}

interface HowItWorksContent {
  headline: string;
  steps: HowItWorksStep[];
}

interface Testimonial {
  handle: string;
  name: string;
  product: string;
  role: string;
  quote: string;
  /** Optional metric callout (e.g. "4x engagement") */
  metric?: string;
  metricLabel?: string;
}

interface TestimonialPlaceholder {
  heading: string;
  body: string;
}

interface TestimonialsContent {
  headline: string;
  testimonials: Testimonial[];
  placeholder?: TestimonialPlaceholder;
}

interface PricingPlan {
  id: "starter" | "solo" | "creator" | "studio";
  name: string;
  price: number;
  annualPrice: number;
  description: string;
  bullets: string[];
  ctaLabel: string;
  popular?: boolean;
}

interface PricingFaq {
  q: string;
  a: string;
}

interface PricingContent {
  headline: string;
  subhead: string;
  plans: PricingPlan[];
  faqs: PricingFaq[];
}

interface PartnerCalloutContent {
  quote: string;
}

interface FinalCtaContent {
  headline: string;
  subhead: string;
  ctaLabel: string;
  reassurance: string;
}

interface FooterContent {
  links: { label: string; href: string }[];
  copyright: string;
  dataLine?: string;
}

interface SocialProofContent {
  /** Honest one-line framing of what a week looks like, e.g. "23 videos · 4 platforms · 1 weekly review". */
  heading: string;
  summary: string;
}

interface GlobalDatabaseContent {
  videoCount: string;
}

interface Feature {
  title: string;
  description: string;
  image?: string;
}

interface FeaturesContent {
  headline: string;
  builtFor?: string;
  features: Feature[];
}

interface AudiencePersona {
  title: string;
  body: string;
}

interface AudienceContent {
  headline: string;
  subhead: string;
  personas: AudiencePersona[];
}

interface ModeCard {
  name: string;
  title: string;
  body: string;
  bestFor: string;
  creditCost: string;
}

interface ModesContent {
  eyebrow: string;
  headline: string;
  subhead: string;
  cards: ModeCard[];
}

export interface LandingContent {
  NAV: NavContent;
  HERO: HeroContent;
  AUDIENCE: AudienceContent;
  MODES: ModesContent;
  SOCIAL_PROOF: SocialProofContent;
  GLOBAL_DATABASE: GlobalDatabaseContent;
  FEATURES: FeaturesContent;
  VALUE_PROPS: ValuePropsContent;
  HOW_IT_WORKS: HowItWorksContent;
  TESTIMONIALS: TestimonialsContent;
  PARTNER_CALLOUT: PartnerCalloutContent;
  PRICING: PricingContent;
  FINAL_CTA: FinalCtaContent;
  FOOTER: FooterContent;
}

export const LANDING: LandingContent = {
  NAV: {
    wordmark: "Build In Social",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
    ],
    mainLinks: [
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "What's new", href: "/changelog" },
    ],
    signInLabel: "Sign in",
    ctaLabel: "Sign up",
  },

  HERO: {
    headline: "You built it. Let the world see it.",
    subhead:
      "Distribution for developers, creators, and founders. Build In Social scripts, renders, and posts platform-native videos to YouTube Shorts, Reels, LinkedIn, and X \u2014 plus an indexable article per video. First preview in under 2 minutes, free.",
    primaryCta: "Preview my week",
    secondaryCta: "See pricing",
    reassurance: "No credit card to preview. Pay only when you ship.",
  },

  AUDIENCE: {
    headline: "Built for people who build or sell",
    subhead: "Four canonical stories. If any of these is you, Build In Social is for you.",
    personas: [
      {
        title: "Indie developer or SaaS founder",
        body: "You shipped a product. Nobody knows it exists. Build In Social runs weekly content around your domain so your app gets seen.",
      },
      {
        title: "Course creator or educator",
        body: "You sell courses or services. Build In Social builds authority content around your expertise, week over week, while you teach.",
      },
      {
        title: "Agency or consultant",
        body: "Your pipeline is inbound-starved. Build In Social runs domain-presence content around your niche to keep leads warm.",
      },
      {
        title: "Solopreneur or knowledge worker",
        body: "You have expertise, no distribution. Turn your niche into platform-native content you don\u2019t have to film.",
      },
    ],
  },

  MODES: {
    eyebrow: "Four modes. One credit pool.",
    headline: "Your face or no face \u2014 your choice, per series.",
    subhead:
      "Pick a rendering mode when you create a series. Build In Social handles the rest. Switch any week from Settings, or override per video.",
    cards: [
      {
        name: "Faceless",
        title: "B-roll + voice",
        body: "Our renderer stitches stock footage to your script with your chosen voice. Cheapest option, unlimited reuse.",
        bestFor: "List-style posts, tip breakdowns, data-heavy angles.",
        creditCost: "1 credit / video",
      },
      {
        name: "Stock AI avatar",
        title: "A curated AI persona narrates",
        body: "A pre-rendered AI influencer-style character with your text overlay and hook. No setup, no training.",
        bestFor: "Quick hook videos where a face helps but consistency doesn\u2019t matter.",
        creditCost: "1 credit / video",
      },
      {
        name: "HeyGen avatar",
        title: "A real face \u2014 theirs or yours",
        body: "Pick a licensed HeyGen marketplace avatar, or train your own digital twin from a 60-second clip.",
        bestFor: "Hero content, founder stories, category leadership posts.",
        creditCost: "15 credits / video",
      },
      {
        name: "Combo",
        title: "AI picks per video",
        body: "You pick \u201ccombo\u201d once; Build In Social decides faceless vs avatar per video based on the angle and your budget.",
        bestFor: "Running a mixed-format weekly show without deciding every time.",
        creditCost: "1\u201315 credits / video",
      },
    ],
  },

  SOCIAL_PROOF: {
    heading: "What one month looks like",
    summary: "Up to 92 videos \u00b7 4 platforms \u00b7 1 weekly review",
  },

  GLOBAL_DATABASE: {
    videoCount: "23",
  },

  FEATURES: {
    headline: "You ship. Nobody sees it. That\u2019s what we fix.",
    builtFor:
      "Built for anyone building a social presence \u2014 solo founders, indie devs, freelancers, creators, newsletter writers, agencies managing a single brand. Designed for humans who don\u2019t want social to become their full-time job.",
    features: [
      { title: "Rank on Google from every video", description: "Every video auto-generates a Google-indexed search article on your subdomain (e.g. yourproduct.buildinsocial.com/topic). Your long-tail SEO compounds while you ship. (Solo and above.)", image: "/images/features/autopilot.png" },
      { title: "Script, voice, render, post", description: "Build In Social writes the script, renders your voice over B-roll, assembles platform-native video, and posts to YouTube Shorts, Reels, LinkedIn, and X. End to end \u2014 not a scheduler.", image: "/images/features/four-platforms.png" },
      { title: "Ship 92 posts a month", description: "Month-of-content \u2014 formatted for each platform, prepared and scheduled in batches. 5 minutes a week of review, not 15 minutes a day of scheduling.", image: "/images/features/weekly-batches.png" },
      { title: "Run zero-input weeks", description: "Works from your niche alone \u2014 no product, no launch, no news required. Build In Social prepares a full week of content.", image: "/images/features/manual-mode.png" },
      { title: "Sound like yourself", description: "Content matches your domain, your audience, and how you talk. Every time.", image: "/images/features/your-voice.png" },
      { title: "See what resonates", description: "Videos post on your schedule. Performance data flows back so you know what lands.", image: "/images/features/post-track.png" },
    ],
  },

  VALUE_PROPS: {
    headline: "Why Build In Social?",
    items: [
      {
        title: "Post consistently without lifting a finger",
        body: "Set your niche once. Build In Social prepares and posts a full week of video automatically — whether or not you shipped something this week.",
      },
      {
        title: "Reach every audience where they scroll",
        body: "YouTube Shorts, Instagram Reels, LinkedIn, and X. Each video matches that platform's algorithm — right duration, hook structure, and posting window.",
      },
      {
        title: "Build 300+ search articles per quarter",
        body: "Every video generates a Google-indexed search article. Articles published on your subdomain (e.g. yourproduct.buildinsocial.com/topic) and indexed by Google. Your long-tail search presence compounds while you focus on your product.",
      },
      {
        title: "Your voice, not a template",
        body: "Three-minute setup. Build In Social learns what you build, who it's for, and how you talk about it. Clone your voice on Creator and Studio plans.",
      },
      {
        title: "Spend zero hours a week on social",
        body: "Share something specific when you want. Or do nothing \u2014 full autopilot runs without you touching it. 5 minutes a week of review, not 15 minutes a day of scheduling.",
      },
    ],
  },

  HOW_IT_WORKS: {
    headline: "How it works",
    steps: [
      {
        num: "1",
        title: "Describe what you build",
        body: "Your niche, your audience, your tone. Three minutes, once. Never again (update any time from Settings).",
      },
      {
        num: "2",
        title: "Review your batch, or let it fly",
        body: "Each month, Build In Social prepares up to 92 videos. Review them, or let autopilot post on schedule.",
      },
      {
        num: "3",
        title: "Post to four platforms automatically",
        body: "YouTube Shorts, Reels, LinkedIn, X. Each one formatted for its platform. Each one building a search article behind it.",
      },
    ],
  },

  // Testimonials intentionally empty pre-launch — no fake social proof.
  // Re-enable once we have at least one real, verifiable testimonial.
  TESTIMONIALS: {
    headline: "What founders are saying",
    testimonials: [],
  },

  PARTNER_CALLOUT: {
    quote:
      "Faster than editing one video yourself. Cheaper than skipping social entirely.",
  },

  PRICING: {
    headline: "Simple, honest pricing. Pick your scale.",
    subhead: "Simple pricing. Cancel any time.",
    plans: [
      {
        id: "starter",
        name: "Starter",
        price: 19,
        annualPrice: 15,
        description: "30 credits/month. Unlimited series. Hard cap \u2014 no surprise charges.",
        bullets: [
          "30 credits/month (30 faceless videos OR 2 HeyGen videos, or any mix)",
          "Unlimited series \u2014 run as many parallel shows as you want",
          "One posting platform of your choice",
          "Professional library voice",
          "Stock AI avatars (starter set)",
          "Manual + autopilot modes",
        ],
        ctaLabel: "Start free",
      },
      {
        id: "solo",
        name: "Solo",
        price: 39,
        annualPrice: 31,
        description: "75 credits/month. 2 platforms. pSEO included.",
        bullets: [
          "75 credits/month (75 faceless, 5 HeyGen, or any mix)",
          "Unlimited series",
          "YouTube Shorts + one other platform",
          "Google-indexed search article per video",
          "Full stock AI avatar library",
        ],
        ctaLabel: "Pick Solo",
      },
      {
        id: "creator",
        name: "Creator",
        price: 79,
        annualPrice: 63,
        description: "160 credits/month. 3 platforms. Clone your voice + train a twin.",
        bullets: [
          "160 credits/month (160 faceless, 10 HeyGen, or any mix)",
          "Unlimited series",
          "Three platforms of your choice",
          "Your cloned voice from a 60-second recording",
          "HeyGen digital twin \u2014 your face narrates every video",
          "Publish pSEO articles + video embeds to your own WordPress site",
        ],
        ctaLabel: "Pick Creator",
        popular: true,
      },
      {
        id: "studio",
        name: "Studio",
        price: 149,
        annualPrice: 119,
        description: "300 credits/month. All 4 platforms. Priority rendering.",
        bullets: [
          "300 credits/month (300 faceless, 20 HeyGen, or any mix)",
          "Unlimited series",
          "All four platforms with full autopilot scheduling",
          "Priority rendering lane",
          "Publish pSEO + video to your own WordPress site",
          "Deeper performance insights (unlocks after 5 published videos)",
        ],
        ctaLabel: "Pick Studio",
      },
    ],
    faqs: [
      {
        q: "Can I publish pSEO articles to my own domain?",
        a: "Yes \u2014 connect your WordPress site on Creator or Studio, and pSEO articles publish to your-domain.com/topic instead of a buildinsocial.com subdomain. Works with self-hosted WordPress and WordPress.com. Other CMS integrations (Ghost, Webflow) are on the roadmap.",
      },
      {
        q: "Is the content actually good, or is it generic AI slop?",
        a: "Every script runs through a specificity gate before it renders. You review the full week in ~5 minutes before anything publishes. If something is off, one-click regenerate with a nudge. (We\u2019re shipping example week-in-life videos in the next release.)",
      },
      {
        q: "Why not TikTok?",
        a: "TikTok\u2019s content API requires a lengthy app review + is restricted per post. We\u2019re working on it. For now, YouTube Shorts + Reels cover the short-form faceless-video audience and post reliably.",
      },
      {
        q: "How is this different from autoshorts.ai?",
        a: "Autoshorts runs faceless-only content series with generic topics like Scary Stories. Build In Social runs domain-presence content tied to what you actually build or sell, with four render modes (faceless, stock avatar, HeyGen licensed, your trained twin). You get unlimited series; autoshorts caps at one. Pricing is credit-based, not cadence-based \u2014 a HeyGen render costs the same whether you post once a week or daily.",
      },
      {
        q: "What counts as a credit?",
        a: "One credit = one faceless render, or one stock-AI-avatar render. One HeyGen render (licensed marketplace avatar or your own trained twin) = 15 credits, because the upstream cost is ~15\u00d7 higher. Starter gets 30 credits/month, Solo 75, Creator 160, Studio 300. Mix and match freely \u2014 the system deducts the right amount at render time.",
      },
      {
        q: "Can I use my own face?",
        a: "Yes, on Creator ($79) and Studio ($149). Record a 60-second clip once; HeyGen trains a digital twin; every video can narrate as you. Or pick a licensed face from HeyGen\u2019s marketplace instead. Both bill 15 credits per render.",
      },
      {
        q: "Does it work for course creators / indie devs / agencies?",
        a: "That\u2019s exactly who it\u2019s for. Anyone who builds or sells and needs distribution. Drop your niche; Build In Social writes around your expertise, not generic short-form templates.",
      },
      {
        q: "Do I lose control over what gets posted?",
        a: "You choose. Manual mode lets you review and approve every video before it goes live. Autopilot posts on schedule without waiting for you. You can switch between modes any week. Most founders start with manual, then move to autopilot once they trust the output.",
      },
      {
        q: "What if I have nothing to share this week?",
        a: "That is exactly what autopilot is for. Build In Social draws from your niche, trending topics in your domain, and evergreen angles that perform for your audience type. You can go weeks without touching it and your channels stay active.",
      },
      {
        q: "How fast can I start posting?",
        a: "Three minutes. Describe your niche, connect your platform accounts, and your first weekly batch is ready. No credit card required. Most founders are live the same day they sign up.",
      },
      {
        q: "What happens if I hit my monthly video cap?",
        a: "We pause your next render and tell you. Every plan has a hard cap \u2014 Starter 15, Solo 40, Creator 65, Studio 92. We never auto-charge you for extras. You can upgrade to the next tier for more this month, or wait until your monthly reset. Videos you\u2019ve already made stay available.",
      },
      {
        q: "Can I use this for multiple projects?",
        a: "Build In Social is designed for one niche/product per account. You can update your niche any time from Settings. If you\u2019re managing multiple distinct brands simultaneously, contact us \u2014 agency tooling is on our roadmap.",
      },
      {
        q: "Can I use this for client accounts / agency use?",
        a: "Build In Social is built for anyone running a single brand \u2014 founders, freelancers, creators, newsletter writers, and agencies managing one client brand. For agency use across multiple clients, reach out \u2014 we\u2019re collecting interest for a dedicated tier.",
      },
      {
        q: "Does my voice clone work if English is my second language?",
        a: "Yes. ElevenLabs accurately reproduces your specific voice \u2014 accent, tone, cadence included. Your clone sounds like you.",
      },
      {
        q: "I don\u2019t have a product yet \u2014 is this for me?",
        a: "Yes. Autopilot generates weekly content from your niche alone. You don\u2019t need a product URL, a launch, or weekly news.",
      },
      {
        q: "How is this different from Taplio or Hypefury?",
        a: "Taplio helps you rewrite LinkedIn posts. Hypefury schedules X threads. Neither produces video or touches YouTube Shorts / Reels. Build In Social renders platform-native video across all four platforms and spawns a pSEO article for every video. Many founders run both \u2014 text tools for one platform, Build In Social for everything else.",
      },
      {
        q: "Does this replace Buffer / Hootsuite?",
        a: "No \u2014 those are schedulers for content you\u2019ve already written. Build In Social writes, renders, and publishes. If you have a junior who drafts and a senior who approves, stay on Buffer. If you\u2019re a solo founder who doesn\u2019t draft at all, that\u2019s who Build In Social is built for.",
      },
      {
        q: "How is this different from Opus Clip or Descript?",
        a: "Opus Clip and Descript edit long-form content you already filmed. Build In Social writes and renders content from scratch \u2014 ideal for founders who don\u2019t record weekly. If you publish a podcast or YouTube channel, stick with Descript. Build In Social covers the weeks you can\u2019t film.",
      },
      {
        q: "I already have ChatGPT and ElevenLabs. Why would I pay for this?",
        a: "Scripts take 10 minutes in ChatGPT. The 3 hours between a script and a video posted to four platforms \u2014 sourcing B-roll, rendering the voice, assembling the video, reformatting for each aspect ratio, posting \u2014 is the part Build In Social automates. Plus a pSEO article per video, which you\u2019d need a blog and a CMS to build yourself.",
      },
      {
        q: "Is this for teams or just solo operators?",
        a: "Anyone running a single brand \u2014 solo founders, freelancers, creators, and small agencies managing one brand. Build In Social has no seats, approvals, or shared workspaces. If you run content for a team or multiple clients, stay on Jasper Business or Hootsuite \u2014 or join our agency waitlist.",
      },
    ],
  },

  FINAL_CTA: {
    headline: "You\u2019ll never run another Sunday-night scripting session.",
    subhead:
      "Or never got started? Autopilot runs without you. Your first video batch is ready in under three minutes.",
    ctaLabel: "Plan my week",
    reassurance: "No credit card required. Cancel any time. Takes 3 minutes.",
  },

  FOOTER: {
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Sign in", href: "/login" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Support", href: "mailto:support@buildinsocial.com" },
      { label: "Data partners", href: "/subprocessors" },
      { label: "Data residency", href: "/subprocessors#residency" },
    ],
    copyright: "\u00a9 2026 Build In Social",
    dataLine: "Data stored on Cloudflare R2. See data partners.",
  },
};
