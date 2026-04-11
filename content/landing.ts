// content/landing.ts
// All landing page copy — Uber Base, direct, outcome-first.

// ─── Types ────────────────────────────────────────────────

interface NavContent {
  wordmark: string;
  links: { label: string; href: string }[];
  signInLabel: string;
  ctaLabel: string;
}

interface HeroContent {
  headline: string;
  subhead: string;
  primaryCta: string;
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
    signInLabel: "Sign in",
    ctaLabel: "Get started",
  },

  HERO: {
    headline: "Your content. Every platform. On autopilot.",
    subhead:
      "Video content for YouTube, Instagram, LinkedIn, and X — created and posted automatically.",
    primaryCta: "Start posting today",
  },

  SOCIAL_PROOF: {
    metrics: [
      { value: "12,400+", label: "Videos published" },
      { value: "4", label: "Platforms supported" },
      { value: "7 days", label: "Of content per batch" },
      { value: "3 min", label: "Average setup time" },
    ],
  },

  FEATURES: {
    headline: "Everything you need to post consistently",
    features: [
      { title: "Autopilot mode", description: "Set your niche. Get a full week of content. No input required.", image: "/images/features/autopilot.png" },
      { title: "Four platforms, one click", description: "YouTube Shorts, Reels, LinkedIn, X. Native format for each.", image: "/images/features/four-platforms.png" },
      { title: "Your voice, not ours", description: "Content matches your domain and audience. Every time.", image: "/images/features/your-voice.png" },
      { title: "Manual mode", description: "Share what matters to you. We turn it into platform-ready video.", image: "/images/features/manual-mode.png" },
      { title: "Weekly content batches", description: "Seven days of posts generated and scheduled at once.", image: "/images/features/weekly-batches.png" },
      { title: "Post and track", description: "Content goes live on your schedule. See what performs.", image: "/images/features/post-track.png" },
    ],
  },

  VALUE_PROPS: {
    headline: "Why Build In Social?",
    items: [
      {
        title: "Autopilot by default",
        body: "Set your domain once. Build In Social creates and posts a full week of content automatically — whether or not you shipped something this week.",
      },
      {
        title: "Four platforms, native formats",
        body: "YouTube Shorts, Instagram Reels, LinkedIn, and X. Each video is built for that platform's algorithm — different duration, hook structure, and posting window.",
      },
      {
        title: "SEO pages that compound",
        body: "Every video creates a Google-indexed landing page. 300+ pages per quarter, ranking for long-tail queries your audience is searching.",
      },
      {
        title: "Your voice, your niche",
        body: "Five-minute setup. Build In Social learns what you build, who it's for, and how you talk about it. The content sounds like you, not a robot.",
      },
      {
        title: "Under one hour a week",
        body: "Share something specific when you want. Or don't — full autopilot runs without you touching it.",
      },
    ],
  },

  HOW_IT_WORKS: {
    headline: "How it works",
    steps: [
      {
        num: "1",
        title: "Set your domain",
        body: "Tell us your niche and target audience. That\u2019s it.",
      },
      {
        num: "2",
        title: "Review or skip",
        body: "Check your weekly batch, or let autopilot handle everything.",
      },
      {
        num: "3",
        title: "Content goes live",
        body: "Posts publish across all four platforms on schedule.",
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
          "I was mass-producing Twitter threads with AI tools. They got zero engagement. Build In Social took the same ideas, turned them into platform-native video, and my LinkedIn impressions went from 200 to 9,000 in one week. Not a fluke — it held.",
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
        q: "What kind of videos does it create?",
        a: "Short-form video optimized for each platform \u2014 Reels, Shorts, LinkedIn video, and X. Each post is formatted natively, not cross-posted.",
      },
      {
        q: "Do I need to provide content ideas?",
        a: "No. Autopilot mode generates everything from your domain and niche. Manual mode lets you feed in specific topics if you prefer.",
      },
      {
        q: "Can I review posts before they go live?",
        a: "Yes. Manual mode includes a review step. Autopilot publishes directly on your schedule.",
      },
      {
        q: "How fast can I start?",
        a: "Set your domain, connect your accounts, and your first content batch generates in minutes. Most users are live the same day.",
      },
    ],
  },

  FINAL_CTA: {
    headline: "Stop planning content. Start posting it.",
    subhead:
      "Your first week of video content is ready in minutes.",
    ctaLabel: "Get started free",
    reassurance: "No credit card. Cancel anytime.",
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
