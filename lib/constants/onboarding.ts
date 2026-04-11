import type { Variants } from "framer-motion";

export const EASE_STANDARD = [0.25, 0.1, 0.25, 1.0] as const;
export const EASE_SPRING = [0.16, 1, 0.3, 1] as const;
export const DURATION_STEP = 0.28;
export const DURATION_ENTRY = 0.28;
export const STAGGER_CHILDREN = 0.05;
export const STAGGER_CARDS = 0.06;

export const STORAGE_KEY = "buildinsocial_onboarding";
export const TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

export const TOTAL_STEPS = 5;

export const STEP_ROUTES: Record<number, string> = {
  1: "/onboarding/start",
  2: "/onboarding/platforms",
  3: "/onboarding/voice",
  4: "/onboarding/pricing",
  5: "/onboarding/activation",
};

export const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER_CHILDREN },
  },
};

export const childVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION_ENTRY, ease: [...EASE_SPRING] },
  },
};

export const NICHE_OPTIONS = [
  "SaaS founders",
  "Dev tool builders",
  "AI / ML teams",
  "Frontend developers",
  "Backend engineers",
  "Mobile app developers",
  "DevOps / Platform teams",
  "Data engineers",
  "Product managers",
  "Startup founders",
  "Indie hackers",
  "E-commerce operators",
  "Fintech builders",
  "Health tech teams",
  "Education platforms",
  "Creator tool makers",
  "Open source maintainers",
  "No-code / low-code builders",
  "Agency owners",
  "Security engineers",
  "Web3 / Crypto builders",
  "Game developers",
  "Design engineers",
  "Technical writers",
  "API consumers",
  "Small business owners",
  "Solo consultants",
  "Marketing teams",
  "Growth hackers",
  "CTOs / Engineering leaders",
  "Developer advocates",
  "Content creators",
  "Freelance developers",
  "Bootstrapped founders",
  "Enterprise engineering teams",
  "QA / Test engineers",
  "Cloud architects",
  "HR tech teams",
  "Legal tech builders",
  "Marketplace operators",
] as const;

export const TONE_OPTIONS = [
  {
    id: "straight-shooter" as const,
    title: "Straight shooter",
    description: "Direct. No fluff. Say what matters, skip the rest.",
    example: '"We shipped billing in 3 days. Here\'s exactly how."',
  },
  {
    id: "friendly-expert" as const,
    title: "Friendly expert",
    description: "Warm but authoritative. Approachable without being casual.",
    example: '"I\'ve seen this pattern break 40 SaaS teams. Let me walk you through it."',
  },
  {
    id: "technical-deep-dive" as const,
    title: "Technical deep-dive",
    description: "Detailed and specific. You like showing your work.",
    example: '"The p99 latency dropped 62% after we switched from polling to WebSockets."',
  },
  {
    id: "casual-builder" as const,
    title: "Casual builder",
    description: "Conversational. Behind-the-scenes. Building in public energy.",
    example: '"Okay so I completely broke prod at 2am and here\'s what I learned."',
  },
] as const;

export const LIBRARY_VOICES = [
  { id: "alex", name: "Alex", personality: "Confident" },
  { id: "morgan", name: "Morgan", personality: "Warm" },
  { id: "sam", name: "Sam", personality: "Crisp" },
  { id: "jordan", name: "Jordan", personality: "Analytical" },
  { id: "casey", name: "Casey", personality: "Energetic" },
  { id: "riley", name: "Riley", personality: "Dry wit" },
] as const;

export const SOCIAL_PROOF_LINES = [
  "Priya, LaunchKit \u2014 340 LinkedIn impressions in week one. Zero effort.",
  "Marcus, ShipLog \u2014 12 YouTube subscribers from one week of Shorts. No filming.",
  "Ava, PingBase \u2014 6 inbound leads traced to a Reel she never recorded.",
] as const;

export const LOADING_MESSAGES = [
  "Analyzing what works in your niche...",
  "Finding content angles your audience responds to...",
  "Matching each piece to the right platform...",
  "Choosing durations each algorithm rewards...",
  "Writing hooks that earn the first 3 seconds...",
  "Building your posting schedule for maximum reach...",
  "Reviewing the plan against what\u2019s trending in your space...",
  "Finishing your 5 platform-native videos...",
] as const;

export const PRICING_PACKAGES = [
  {
    tier: "solo" as const,
    name: "Solo",
    price: 39,
    annualPrice: 33,
    platforms: 2,
    videosPerMonth: 40,
    outcome: "Consistent presence on 2 platforms. No weekly effort.",
    details: [
      "2 platforms",
      "~40 videos/month",
      "Library voices",
      "1 SEO page per video",
      "Autopilot + manual modes",
    ],
  },
  {
    tier: "creator" as const,
    name: "Creator",
    price: 79,
    annualPrice: 66,
    platforms: 3,
    videosPerMonth: 65,
    outcome: "Three platforms, your cloned voice, and a plan that runs itself.",
    badge: "Most chosen by solo founders",
    details: [
      "3 platforms",
      "~65 videos/month",
      "Your cloned voice",
      "Hook variant suggestions",
      "Performance insights from week 4",
      "Everything in Solo",
    ],
  },
  {
    tier: "studio" as const,
    name: "Studio",
    price: 149,
    annualPrice: 125,
    platforms: 4,
    videosPerMonth: 92,
    outcome: "All 4 platforms. Maximum distribution. Priority rendering.",
    details: [
      "All 4 platforms",
      "~92 videos/month",
      "Your cloned voice",
      "Full intelligence panel",
      "Priority rendering",
      "Avatar Mode add-on available (coming soon)",
      "Everything in Creator",
    ],
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "What's included in the free trial?",
    answer: "14 days on any plan. No credit card required. Full content generation and download. Auto-publishing activates when you connect your platforms.",
  },
  {
    question: "Why does Build In Social set the video duration?",
    answer: "YouTube Shorts performs best at 30\u201345 seconds. Instagram Reels at 20\u201330. LinkedIn at 45\u201360. X at 15\u201320. Build In Social builds every video at the duration each platform's algorithm rewards. You can override it, but the defaults are right 90% of the time.",
  },
  {
    question: "Is the content actually good?",
    answer: "That depends on specifics. In manual mode, Build In Social asks you 3 focused questions every week. Specific answers produce content that performs. Vague answers get pushed back \u2014 Build In Social will tell you when your input is not detailed enough. In autopilot mode, Build In Social draws from your niche, your voice, and what\u2019s trending in your space to build a full week without any input from you.",
  },
  {
    question: "What if I want to cancel?",
    answer: "Cancel anytime from your dashboard. No contracts. No penalties. If you just need a break, you can pause your subscription instead \u2014 your content plan and voice clone stay saved.",
  },
] as const;
