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
  callout: string;
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
  id: "solo" | "creator" | "studio";
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
}

interface SocialProofMetric {
  value: string;
  label: string;
}

interface SocialProofContent {
  metrics: SocialProofMetric[];
}

interface Feature {
  title: string;
  description: string;
  image?: string;
}

interface FeaturesContent {
  headline: string;
  features: Feature[];
}

export interface LandingContent {
  NAV: NavContent;
  HERO: HeroContent;
  SOCIAL_PROOF: SocialProofContent;
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
      { label: "Changelog", href: "/changelog" },
    ],
    signInLabel: "Sign in",
    ctaLabel: "Get started",
  },

  HERO: {
    headline: "Your domain presence, on autopilot.",
    subhead:
      "You ship. You consult. You learn. You forget to post. Build In Social runs a full week of YouTube Shorts, Reels, LinkedIn, and X about what you actually know.",
    callout:
      "Even when nothing shipped — Build In Social runs on autopilot.",
    primaryCta: "Start free trial",
    secondaryCta: "See how it works",
    reassurance: "No credit card required. 14-day trial.",
  },

  SOCIAL_PROOF: {
    metrics: [
      { value: "12,400+", label: "Videos posted for founders" },
      { value: "$39/mo", label: "vs. $3,000/mo for a hire" },
      { value: "92", label: "Videos per month on Studio" },
      { value: "3 min", label: "From signup to first batch" },
    ],
  },

  FEATURES: {
    headline: "You ship. Nobody sees it. That\u2019s what we fix.",
    features: [
      { title: "Zero-input weeks on autopilot", description: "Works from your niche alone — no product, no launch, no news required. Build In Social prepares a full week of content.", image: "/images/features/autopilot.png" },
      { title: "Four platforms, algorithm-native", description: "YouTube Shorts, Reels, LinkedIn, X. Each video matches the format that platform rewards.", image: "/images/features/four-platforms.png" },
      { title: "Sounds like you, not a template", description: "Content matches your domain, your audience, and how you talk. Every time.", image: "/images/features/your-voice.png" },
      { title: "Share a win, we handle the rest", description: "Shipped something? Tell Build In Social. It prepares platform-ready video from your input.", image: "/images/features/manual-mode.png" },
      { title: "Up to 23 posts across 4 platforms", description: "A full week of content — formatted for each platform, prepared and scheduled at once.", image: "/images/features/weekly-batches.png" },
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
        body: "Every video generates a Google-indexed search article. Your long-tail search presence compounds while you focus on your product.",
      },
      {
        title: "Sound like yourself, not a template",
        body: "Three-minute setup. Build In Social learns what you build, who it's for, and how you talk about it. Clone your voice on Creator and Studio plans.",
      },
      {
        title: "Spend zero hours a week on social",
        body: "Share something specific when you want. Or do nothing — full autopilot runs without you touching it.",
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
        body: "Each week, Build In Social prepares up to 23 videos. Review them, or let autopilot post on schedule.",
      },
      {
        num: "3",
        title: "Videos go live across four platforms",
        body: "YouTube Shorts, Reels, LinkedIn, X. Each one formatted for its platform. Each one building a search article behind it.",
      },
    ],
  },

  TESTIMONIALS: {
    headline: "What founders are saying",
    testimonials: [],
  },

  PARTNER_CALLOUT: {
    quote:
      "You\u2019re not paying for a tool. You\u2019re hiring a distribution partner.",
  },

  PRICING: {
    headline: "Simple, honest pricing. Pick your scale.",
    subhead:
      "You\u2019re not paying for a tool. You\u2019re hiring a distribution partner.",
    plans: [
      {
        id: "solo",
        name: "Solo",
        price: 39,
        annualPrice: 33,
        description: "2 platforms. ~40 videos per month.",
        bullets: [
          "~40 videos/month",
          "YouTube Shorts + one other platform",
          "Google-indexed search article per video",
          "Professional library voice",
        ],
        ctaLabel: "Start free trial",
      },
      {
        id: "creator",
        name: "Creator",
        price: 79,
        annualPrice: 66,
        description: "3 platforms. ~65 videos per month.",
        bullets: [
          "~65 videos/month",
          "Three platforms of your choice",
          "Scheduled posting on your 3 platforms",
          "Your cloned voice from a 60-second recording",
          "Performance breakdowns from week 4",
        ],
        ctaLabel: "Start free trial",
        popular: true,
      },
      {
        id: "studio",
        name: "Studio",
        price: 149,
        annualPrice: 125,
        description: "All 4 platforms. ~92 videos per month.",
        bullets: [
          "~92 videos/month",
          "All four platforms",
          "Full autopilot scheduling",
          "Deeper performance insights + content recommendations (week 4+)",
        ],
        ctaLabel: "Start free trial",
      },
    ],
    faqs: [
      {
        q: "Is the content actually good, or is it generic AI slop?",
        a: "Every video is formatted for the platform it lives on \u2014 the right duration, hook structure, and pacing. YouTube Shorts get 30\u201345 seconds. Reels get 20\u201330. LinkedIn gets 45\u201360. X gets 15\u201320. Build In Social learns your niche, your audience, and your voice \u2014 not a one-size-fits-all template. On Creator and Studio plans, it uses your cloned voice from a 60-second recording.",
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
        a: "Three minutes. Describe your niche, connect your platform accounts, and your first weekly batch is ready. No credit card for the 14-day trial. Most founders are live the same day they sign up.",
      },
      {
        q: "Can I use this for multiple projects?",
        a: "Build In Social is designed for one niche/product per account. You can update your niche any time from Settings. If you\u2019re managing multiple distinct brands simultaneously, contact us \u2014 agency tooling is on our roadmap.",
      },
      {
        q: "Can I use this for client accounts / agency use?",
        a: "Build In Social is built for individual founders and creators. For agency use across multiple clients, reach out \u2014 we\u2019re collecting interest for a dedicated tier.",
      },
      {
        q: "Does my voice clone work if English is my second language?",
        a: "Yes. ElevenLabs accurately reproduces your specific voice \u2014 accent, tone, cadence included. Your clone sounds like you.",
      },
      {
        q: "I don\u2019t have a product yet \u2014 is this for me?",
        a: "Yes. Autopilot generates weekly content from your niche alone. You don\u2019t need a product URL, a launch, or weekly news.",
      },
    ],
  },

  FINAL_CTA: {
    headline: "You\u2019ll never run another Sunday-night scripting session.",
    subhead:
      "Or never started? Autopilot runs without you. 14-day free trial. Your first video batch is ready in under three minutes.",
    ctaLabel: "Start your free trial",
    reassurance: "No credit card required. Cancel anytime. Takes 3 minutes.",
  },

  FOOTER: {
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Sign in", href: "/login" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
    copyright: "\u00a9 2026 Build In Social",
  },
};
