/**
 * App content strings — single source of truth.
 * Every string in authenticated pages and onboarding imports from here.
 * Partner framing: "Build In Social is..." not "Generate..."
 */

export const APP = {
  DASHBOARD: {
    greetingMorning: "Good morning.",
    greetingAfternoon: "Good afternoon.",
    greetingEvening: "Good evening.",
    subtitle: "Here\u2019s what Build In Social is doing this week.",
    weekSummary: "This week",
    reviewCta: "Review this week \u2192",
    modeAutopilot: "Autopilot active",
    modeManual: "Manual mode",
    approved: (n: number, total: number) => `${n}/${total} approved`,
    noApproved: "No videos approved yet",
    nextScheduled: "Next scheduled",
    nextScheduledEmpty:
      "Your upcoming posts will appear here once Build In Social has built your plan and you\u2019ve approved it.",
    buildPlanCta: "Build this week\u2019s plan \u2192",
    topPerformer: "Last week\u2019s top performer",
    topPerformerEmpty:
      "Performance data will appear after your first published week.",
    topPerformerSub: "Views, watch time, and click-through per platform.",
    emptyTitle: "Your first week is ready to build",
    emptyDescription:
      "Tell Build In Social what you\u2019re building \u2014 or hit autopilot.",
    emptyCta: "Start this week \u2192",
  },

  PLAN: {
    weeklyPlanLabel: "Weekly plan",
    manualTitle: "I have something to share this week",
    manualDescription:
      "Answer 3 quick questions. Build In Social builds the week around your specific work.",
    autopilotTitle: "Hand it to autopilot",
    autopilotBadge: "Recommended",
    autopilotDescription:
      "Build In Social picks the best angles for your niche and builds the full week. No input needed.",
    approveAll: "Approve all \u2192",
    startFresh: "Start fresh \u2192",
    startFreshTitle: "Start fresh?",
    startFreshDescription:
      "This removes all videos and approvals from this week. You\u2019ll choose between manual and autopilot mode again.",
    startFreshConfirm: "Start fresh",
  },

  QUALITY_GATE: {
    title: "What happened this week?",
    q1: "What did you ship, learn, or decide?",
    q1Placeholder: 'Be specific. "Launched Stripe billing" not "worked on my app."',
    q2: "What surprised you about it?",
    q2Placeholder: "The unexpected detail makes content 10\u00d7 better.",
    q3: "Who needs to hear this, and why does it matter to them?",
    q3Placeholder: "Your audience and their specific pain point.",
    submitCta: "Continue",
    switchToAutopilot: "Let Build In Social run this week instead",
    pushback:
      "This is a bit general \u2014 one specific detail makes the content 10\u00d7 better. What exactly did you launch? What number surprised you? Even one sentence changes everything.",
    specificityLabels: ["Too vague", "Getting there", "Specific enough"],
    stickyLabel: "Specific answers = better content",
  },

  VIDEOS: {
    title: "Content library",
    subtitle: (n: number) =>
      `${n} video${n !== 1 ? "s" : ""} across all platforms`,
    emptyTitle: "No videos yet",
    emptyDescription:
      "Build your first weekly plan to see videos here.",
    emptyCta: "Build this week \u2192",
    noFilter: (filter: string) => `No videos with status \u201c${filter}\u201d.`,
    filterAll: "All",
    filterDraft: "Draft",
    filterApproved: "Approved",
    filterRendering: "Rendering",
    filterReady: "Ready",
    filterPosted: "Posted",
    filterFailed: "Failed",
  },

  VIDEO_DETAIL: {
    backToLibrary: "\u2190 Back to library",
    notFound: "Video not found.",
    openingHook: "Opening hook",
    script: "Script",
    seoArticle: "SEO article ready",
    seoArticlePending:
      "Build In Social creates the SEO article automatically when the video is rendered.",
    viewSeo: "View \u2192",
    playVideo: "Play video",
    previewUnavailable: "Preview not available yet",
    notRendered: "Video not yet rendered",
    download: "Download",
  },

  INTELLIGENCE: {
    lockedTitle: "Intelligence unlocks after 5 videos",
    lockedDescription:
      "Build In Social needs data to find patterns. Publish 5 videos to unlock platform performance insights, hook analysis, and content recommendations.",
    videosPublished: "Videos published",
    lockCta: "Build this week\u2019s plan \u2192",
    metricBestPlatform: "Best platform",
    metricTopContent: "Top content type",
    metricBestDay: "Best posting day",
    metricHookScore: "Hook score",
  },

  SETTINGS: {
    title: "Settings",
    profileLabel: "Profile",
    profileDescription: "Name, niche, voice notes, tone",
    platformsLabel: "Platforms",
    platformsDescription: "Connect YouTube, Instagram, LinkedIn, X",
    voiceLabel: "Voice",
    voiceDescription: "Manage your voice clone or library selection",
    billingLabel: "Billing",
    billingDescription: "Subscription and payment management",
  },

  SETTINGS_PROFILE: {
    title: "Profile",
    subtitle:
      "How Build In Social understands your voice, niche, and audience.",
    nicheLabel: "Your niche",
    nichePlaceholder:
      "Be specific. Used to find content angles every week.",
    audienceLabel: "Who you build for",
    toneLabel: "Tone",
    toneDescription: "Controls how Build In Social writes scripts.",
    voicePrefsLabel: "Voice preferences",
    voicePrefsOptional: "Optional",
    voicePrefsPlaceholder:
      "Phrases you always use, things you never say, references your audience gets...",
    saving: "Build In Social is saving...",
    saveCta: "Save changes",
    saved: "Saved \u2713",
  },

  SETTINGS_PLATFORMS: {
    title: "Platform connections",
    subtitle:
      "Connect your accounts so Build In Social can post automatically.",
    connected: "Connected",
    disconnect: "Disconnect",
    connecting: "Build In Social is connecting your account...",
    connect: "Connect",
    oauthNotice:
      "Platform OAuth connections are being set up. Auto-posting will be available shortly.",
  },

  SETTINGS_VOICE: {
    title: "Voice",
    subtitle: "The voice used to narrate your videos.",
    cloneTitle: "Voice clone",
    cloneActive: "Your voice clone is active.",
    cloneEmpty: "No voice clone yet. Powered by ElevenLabs.",
    removeClone: "Remove",
    uploadSample: "Upload voice sample",
    uploadHint:
      "Record 30+ seconds of natural speech, upload here, and your clone is ready in ~5 minutes.",
    libraryTitle: "Library voice",
    libraryFallback: "(fallback when clone is unavailable)",
    previewComingSoon: "Audio previews coming soon",
    saveCta: "Save changes",
    saved: "Saved \u2713",
  },

  SETTINGS_BILLING: {
    title: "Billing",
    currentPlan: "Current plan",
    trialActive: "14-day free trial active",
    perMonth: "/mo",
    upgrade: "Upgrade",
    downgrade: "Downgrade",
    manageBilling: "Manage billing",
    manageBillingDescription:
      "Update payment method, download invoices, cancel subscription.",
    billingPortalCta: "Billing portal \u2192",
    avatarTitle: "Avatar Mode",
    avatarComingSoon: "Coming soon",
    avatarDescription:
      "Add an AI avatar for on-camera content. HeyGen-powered, lip-synced to your script.",
    avatarCta: "Join waitlist",
  },

  WAITLIST: {
    badge: "Coming soon",
    title: "Avatar Mode",
    headline:
      "Your AI clone. Record once. Post your face on every platform every week \u2014 without filming.",
    description:
      "HeyGen-powered. Lip-synced to your script. Looks like you. Sounds like you. We\u2019re onboarding Avatar users in cohorts to ensure quality.",
    emailPlaceholder: "your@email.com",
    emailError: "Enter a valid email address.",
    joining: "Adding you to the list...",
    joinCta: "Join waitlist \u2192",
    noSpam: "No spam. Notified when your cohort opens.",
    successTitle: "You\u2019re on the list.",
    successDescription: (email: string) =>
      `We\u2019ll email ${email} when your cohort opens.`,
  },

  ONBOARDING: {
    common: {
      back: "Back",
      continueLabel: "Continue",
      skipForNow: "Skip for now",
    },
    step1: {
      headline: "Your social media employee starts here.",
      subheading:
        "Drop your domain. Build In Social shows you your first content week in 60 seconds.",
      cta: "See my content plan \u2192",
      socialProof: "Trusted by indie developers who ship and forget to post about it.",
    },
    step2: {
      title: "What happened this week?",
      stickyLabel: "Specific answers = better content",
      cta: "Continue",
    },
    step3: {
      title: "Where do you build in public?",
      cta: "Continue",
    },
    step4: {
      title: "Set up your voice",
      cloneTitle: "Clone your voice",
      libraryTitle: "Library voice",
      cta: "Looks good \u2192",
    },
    step5: {
      generating: "Build In Social is preparing your first week...",
      title: "Here\u2019s your first week",
      showingCount: (shown: number, total: number) =>
        `Showing ${shown} of ${total} videos`,
      cta: "Choose your plan",
      stickyLabel: "14-day free trial, no card needed",
    },
    step6: {
      title: "Start your free trial",
      framingLine:
        "You\u2019re not paying for a tool. You\u2019re hiring a distribution partner.",
      toggleAnnual: "Annual",
      toggleMonthly: "Monthly",
      mostChosen: "Most chosen",
      noCreditCard: "No credit card \u00b7 14-day trial \u00b7 Cancel anytime",
    },
    step7: {
      headline: "You\u2019re in.",
      subheading:
        "Build In Social is preparing your first week of content. Check your email \u2014 confirmation is on its way.",
      cta: "Go to dashboard",
    },
  },

  PLAN_UI: {
    shareWhatsNew: "Share what\u2019s new",
    approvedStatus: "Approved",
    back: "Back",
  },

  DASHBOARD_UI: {
    comparedTo: "compared to",
    edit: "Edit",
    customiseCharts: "Customise overview charts",
    customiseChartsDescription: "Add or remove the charts for the overview panel.",
    cancel: "Cancel",
    apply: "Apply",
    from: "from",
  },

  COMMON: {
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save changes",
    saved: "Saved \u2713",
    loading: "Build In Social is loading...",
    retry: "Try again",
    errorGeneric:
      "Build In Social couldn\u2019t complete this action. Try again or refresh the page.",
    errorSave:
      "Build In Social couldn\u2019t save your changes. Try again or refresh the page.",
    errorGenerate:
      "Build In Social couldn\u2019t build your plan this time. Try again or refresh the page.",
  },

  PLATFORMS: {
    youtube: { label: "YouTube Shorts", short: "YT", frequency: "5 videos/week \u00b7 30\u201345s" },
    instagram: { label: "Instagram Reels", short: "IG", frequency: "4 videos/week \u00b7 20\u201330s" },
    linkedin: { label: "LinkedIn", short: "LI", frequency: "4 videos/week \u00b7 45\u201360s" },
    x: { label: "X", short: "X", frequency: "10 videos/week \u00b7 15\u201320s" },
  },

  TONES: [
    { id: "technical", label: "Technical & precise", description: "Data-driven. Specific." },
    { id: "conversational", label: "Conversational & punchy", description: "Short sentences. Real talk." },
    { id: "transparent", label: "Founder-transparent", description: "Metrics, mistakes, build-in-public energy." },
  ],

  VOICES: [
    { id: "alex", name: "Alex", description: "Clear, neutral, confident. Works everywhere." },
    { id: "morgan", name: "Morgan", description: "Warm and conversational. Great for tutorials." },
    { id: "sam", name: "Sam", description: "Crisp and fast. Ideal for punchy X content." },
    { id: "jordan", name: "Jordan", description: "Deep and measured. Strong for LinkedIn." },
    { id: "casey", name: "Casey", description: "Energetic and upbeat. Born for Reels." },
    { id: "riley", name: "Riley", description: "Dry wit. Great for contrarian takes." },
  ],
} as const;
