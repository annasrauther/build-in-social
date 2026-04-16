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
  primaryCta: string;
  secondaryCta: string;
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

interface TestimonialsContent {
  headline: string;
  testimonials: Testimonial[];
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
    headline: "Ship code. We handle the distribution.",
    subhead:
      "Platform-native video for YouTube, Instagram, LinkedIn, and X — prepared and posted while you build. One prompt a week, or zero.",
    primaryCta: "Start free trial",
    secondaryCta: "See how it works",
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
    headline: "Stay visible on every platform without the work",
    features: [
      { title: "Zero-input weeks on autopilot", description: "Set your niche. Build In Social prepares a full week of content. No input required.", image: "/images/features/autopilot.png" },
      { title: "Four platforms, algorithm-native", description: "YouTube Shorts, Reels, LinkedIn, X. Each video matches the format that platform rewards.", image: "/images/features/four-platforms.png" },
      { title: "Sounds like you, not a template", description: "Content matches your domain, your audience, and how you talk. Every time.", image: "/images/features/your-voice.png" },
      { title: "Share a win, we handle the rest", description: "Shipped something? Tell Build In Social. It prepares platform-ready video from your input.", image: "/images/features/manual-mode.png" },
      { title: "Up to 23 videos per week", description: "A full week of posts prepared and scheduled at once. Across all four platforms.", image: "/images/features/weekly-batches.png" },
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
        title: "Build 300+ SEO pages per quarter",
        body: "Every video builds a Google-indexed landing page. Your long-tail search presence compounds while you focus on your product.",
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
        body: "Your niche, your audience, your tone. Three minutes, once. Never again.",
      },
      {
        num: "2",
        title: "Review your batch, or let it fly",
        body: "Each week, Build In Social prepares up to 23 videos. Review them, or let autopilot post on schedule.",
      },
      {
        num: "3",
        title: "Videos go live across four platforms",
        body: "YouTube Shorts, Reels, LinkedIn, X. Each one native. Each one building an SEO page behind it.",
      },
    ],
  },

  TESTIMONIALS: {
    headline: "What founders are saying",
    testimonials: [
      {
        handle: "@marcuswei",
        name: "Marcus Wei",
        product: "Patchwork",
        role: "Founder",
        quote:
          "I was mass-producing X posts with AI tools. They got zero engagement. Build In Social took the same ideas, turned them into platform-native video, and my LinkedIn impressions went from 200 to 9,000 in one week. Not a fluke — it held.",
        metric: "45x",
        metricLabel: "LinkedIn impressions",
      },
      {
        handle: "@priya_builds",
        name: "Priya Sharma",
        product: "Funnelkit",
        role: "Solo founder",
        quote:
          "I used to spend Sunday nights scripting, recording, and editing. Four hours minimum. Now I answer three questions on Monday morning, and by Tuesday I have 23 platform-native videos scheduled for the week. I genuinely forgot what Sunday stress felt like.",
        metric: "4 hrs",
        metricLabel: "saved every week",
      },
      {
        handle: "@danielcr",
        name: "Daniel Costa-Reis",
        product: "Terrace",
        role: "CTO & co-founder",
        quote:
          "Our marketing hire quit in month two. We were about to go silent on every channel. Plugged in Build In Social, set it to autopilot, and our social channels have been more consistent than when we had a person doing it. The quality of the hooks surprised me.",
      },
      {
        handle: "@amira_k",
        name: "Amira Khalil",
        product: "Stackprint",
        role: "Indie hacker",
        quote:
          "The thing nobody tells you about content tools: they still expect YOU to be creative. Build In Social doesn't. I set my niche, my tone, and it handles the rest. I've published more in 3 weeks than I did in 6 months of trying to do it myself.",
        metric: "92",
        metricLabel: "videos published",
      },
      {
        handle: "@jakerunner",
        name: "Jake Paterson",
        product: "Metrix",
        role: "Founder",
        quote:
          "Honestly skeptical at first. Another AI content tool? But the videos actually sound like me. My co-founder watched one and asked when I started making Reels. That's when I knew it was working.",
      },
    ],
  },

  PRICING: {
    headline: "One plan. Everything included.",
    subhead:
      "Video content across four platforms, starting today.",
    plans: [
      {
        id: "solo",
        name: "Solo",
        price: 39,
        annualPrice: 33,
        description: "2 platforms. ~40 videos per month.",
        bullets: [
          "YouTube Shorts + one other platform",
          "Google-indexed pSEO page per video",
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
          "Three platforms of your choice",
          "Your cloned voice from a 60-second recording",
          "Hook variant performance data from week 4",
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
          "All four platforms",
          "Full autopilot scheduling",
          "Intelligence panel with performance insights",
        ],
        ctaLabel: "Start free trial",
      },
    ],
    faqs: [
      {
        q: "Is the content actually good, or is it generic AI slop?",
        a: "Every video is built for a specific platform with the right duration, hook structure, and pacing. YouTube Shorts get 30-45 seconds. Reels get 20-30. LinkedIn gets 45-60. X gets 15-20. Build In Social learns your niche, your audience, and your voice \u2014 not a one-size-fits-all template. On Creator and Studio plans, it uses your cloned voice from a 60-second recording.",
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
    ],
  },

  FINAL_CTA: {
    headline: "Your competitors are posting daily. You should be too.",
    subhead:
      "14-day free trial. Your first video batch is ready in under three minutes.",
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
