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
    subtitle: "Your domain presence at a glance.",
    weekSummary: "This week",
    reviewCta: "Review this week",
    modeAutopilot: "Autopilot active",
    modeManual: "Manual mode",
    approved: (n: number, total: number) => `${n}/${total} approved`,
    noApproved: "No videos approved yet",
    nextScheduled: "Next scheduled",
    nextScheduledEmpty:
      "Your next posts will appear here once this week\u2019s plan is ready.",
    buildPlanCta: "Build this week\u2019s plan",
    buildPlanCtaAutopilot: "See this week\u2019s plan",
    nextPostPrefix: "Next post:",
    autopilotStatusActive: "Autopilot is running. ",
    topPerformer: "Last week\u2019s top performer",
    topPerformerEmpty:
      "Performance data will appear after your first published week.",
    topPerformerSub: "Views, watch time, and click-through per platform.",
    topPerformerProgress: (posted: number, threshold: number) =>
      `Post ${threshold - posted} more video${threshold - posted === 1 ? "" : "s"} to unlock performance insights`,
    emptyTitle: "Your first week is ready to build",
    emptyDescription:
      "Hit autopilot and Build In Social runs the week. Or share something you worked on and we\u2019ll build around it.",
    emptyCta: "Start this week",
  },

  PLAN: {
    weeklyPlanLabel: "Weekly plan",
    manualTitle: "I have something to share this week",
    manualDescription:
      "Answer 3 quick questions. Build In Social builds the week around your specific work \u2014 a launch, a lesson, a decision, or anything worth sharing.",
    autopilotTitle: "Hand it to autopilot",
    autopilotBadge: "Recommended",
    autopilotCta: "Hand it to autopilot",
    autopilotDescription:
      "Build In Social draws on your niche, your tone, and what\u2019s resonating in your domain. Builds the full week. Publishes automatically.",
    approveAll: "Approve all",
    startFresh: "Rebuild this week",
    startFreshTitle: "Rebuild this week\u2019s content?",
    startFreshDescription:
      "This clears all videos and approvals for this week. You\u2019ll pick manual or autopilot again.",
    startFreshConfirm: "Rebuild this week",
  },

  QUALITY_GATE: {
    title: "What did you work on this week?",
    subtitle: "Three quick questions. The more specific, the better the content.",
    q1: "What did you learn, build, ship, or figure out?",
    q1Placeholder:
      'Be specific. "Traced a re-render bug to a missing memo," "Launched Stripe billing," "Finally got TypeScript generics to click," or "Closed a pilot deal" \u2014 all work.',
    q2: "What surprised you about it?",
    q2Placeholder: "The unexpected detail makes content worth sharing.",
    q3: "Who needs to hear this, and why does it matter to them?",
    q3Placeholder: "Your audience and their specific pain point.",
    submitCta: "Continue",
    switchToAutopilot: "Let Build In Social run this week instead",
    pushback:
      "Can you give me one more specific detail? A number, a name, a decision, a tool \u2014 even one concrete thing makes the content sound like you and nobody else.",
    specificityLabels: ["Too vague", "Getting there", "Specific enough"],
    stickyLabel: "Specific answers = better content",
    pasteToggle: "Have something written already? Paste it in",
    pasteLabel: "Your notes, draft, or content",
    pastePlaceholder:
      "Paste a rough draft, bullet points, tweet thread, or anything you\u2019ve already written \u2014 Build In Social will use it as the foundation.",
    pasteHint: "Optional \u00b7 the AI will draw from this alongside your answers above.",
  },

  SERIES: {
    title: "Series",
    subtitle: (n: number) =>
      n === 0
        ? "Run as many parallel content shows as you want."
        : `${n} series running — each with its own mode, cadence, and niche.`,
    createCta: "Create a series",
    emptyTitle: "No series yet",
    emptyDescription:
      "A series runs your content on autopilot — pick a niche, a mode, and a cadence. Build In Social does the rest.",
    emptyCta: "Create your first series",
    list: {
      columns: {
        name: "Name",
        mode: "Mode",
        cadence: "Cadence",
        status: "Status",
        credits: "Credits",
      },
      rowOpen: "Open series",
    },
    statusLabels: {
      active: "Active",
      paused: "Paused",
      completed: "Completed",
    },
    modeLabels: {
      faceless: "Faceless",
      "stock-ai-avatar": "Stock AI avatar",
      "heygen-avatar": "HeyGen avatar",
      combo: "Combo",
    },
    frequencyLabels: {
      daily: "Daily",
      "3x-week": "3× per week",
      "5x-week": "5× per week",
      custom: "Custom",
    },
    create: {
      title: "Create a series",
      subtitle:
        "Pick a niche, a rendering mode, and a cadence. Build In Social takes it from there.",
      steps: {
        basics: "Basics",
        mode: "Rendering mode",
        cadence: "Posting cadence",
        voice: "Narration",
        review: "Review",
      },
      modeOptions: {
        faceless: {
          label: "Faceless",
          helper: "B-roll + voice. Cheapest. Ideal for tip-style and list content.",
        },
        "stock-ai-avatar": {
          label: "Stock AI avatar",
          helper:
            "A curated AI persona narrates the video. Same cost as faceless.",
        },
        "heygen-avatar": {
          label: "HeyGen avatar",
          helper:
            "A real licensed face or your own twin. Higher credit cost per render.",
        },
        combo: {
          label: "Combo",
          helper:
            "Build In Social picks faceless vs avatar per video, biased by your credit budget and content type.",
        },
      },
      submit: "Create series",
      cancel: "Cancel",
    },
    detail: {
      backToList: "\u2190 Back to series",
      notFound: "Series not found.",
      pause: "Pause",
      resume: "Resume",
      delete: "Delete series",
      deleteConfirm: "Delete this series? Past videos stay, but nothing new will be queued.",
      fields: {
        mode: "Mode",
        cadence: "Cadence",
        platforms: "Platforms",
        nextVideo: "Next video",
        creditsConsumed: "Credits consumed",
      },
      neverScheduled: "Ready to run",
    },
  },

  VIDEOS: {
    title: "Content library",
    subtitle: (n: number) =>
      `${n} video${n !== 1 ? "s" : ""} across all platforms`,
    emptyTitle: "No videos yet",
    emptyDescription:
      "Build your first weekly plan to see videos here.",
    emptyCta: "Build this week",
    emptyFirstWeekCta: "Build In Social will create your first week of content",
    noFilter: (filter: string) => `No videos with status \u201c${filter}\u201d.`,
    filterAll: "All",
    filterDraft: "Draft",
    filterApproved: "Approved",
    filterRendering: "Rendering",
    filterReady: "Ready",
    filterPosted: "Posted",
    filterFailed: "Failed",
    failedHint:
      "Build In Social hit a snag rendering this video. Try regenerating, or contact support if it keeps failing.",
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
    renderingHint:
      "Build In Social is rendering \u2014 usually ready in about 4 minutes.",
    download: "Download",
    revisionCta: "Request revision",
    revisionPlaceholder:
      "What's off? 'Too salesy', 'hook is weak', 'wrong audience' \u2014 even one sentence helps.",
    revisionCharsRemaining: (n: number) => `${n} chars remaining`,
    revisionSendCta: "Send revision",
    revisionCancelCta: "Cancel",
    revisionRewriting: "Build In Social is rewriting this...",
    revisionSuccess: "New version ready.",
    revisionRemaining: (n: number) =>
      `${n} revision${n === 1 ? "" : "s"} left on this video.`,
    revisionLimitReached:
      "Revision limit reached on this video. Approve or skip.",
    revisionDailyCap:
      "Daily revision limit reached \u2014 try again tomorrow.",
    revisionError: "Build In Social couldn't rewrite this. Try again shortly.",

    // Thread preview (X platform)
    threadLabel: "Thread preview",
    threadTweetCount: (n: number) => `${n} tweets`,
    threadCharCount: (n: number) => `${n}/280`,

    // Inline script editor
    editScript: "Edit script",
    editScriptCancel: "Cancel",
    editScriptSave: "Save changes",
    editScriptSaved: "Saved",
    editScriptCharCount: (n: number) => `${n}/2000`,
    editScriptPlaceholder: "Edit your script directly\u2026",

    // Render mode section
    RENDER_MODE: {
      sectionTitle: "Render mode",
      facelessLabel: "Faceless",
      facelessDescription: "Stock footage, text overlays, and your voice.",
      avatarLabel: "Avatar",
      avatarDescription: "Your AI avatar presents on screen.",
      selectAvatarLabel: "Select avatar",
      selectVoiceLabel: "Avatar voice",
      renderCta: "Start render",
      renderingStatus: "Build In Social is rendering your video...",
      avatarRendering: "Build In Social is creating your avatar video...",
    },
  },

  INTELLIGENCE: {
    lockedTitle: "Intelligence unlocks after 5 videos",
    lockedDescription:
      "Publish 5 videos to unlock: views and watch time by platform, hook strength scores for your first 3 seconds, best posting day, and weekly content recommendations tuned to your audience.",
    videosPublished: "Videos published",
    lockCta: "Build this week\u2019s plan",
    metricBestPlatform: "Best platform",
    metricTopContent: "Top content type",
    metricBestDay: "Best posting day",
    metricHookScore: "Hook score",
    hookScoreTooltip:
      "Hook score measures how well your video\u2019s first 3 seconds hold viewer attention \u2014 based on watch-through rate for seconds 0\u20133.",
    week4Rationale:
      "Four weeks is the minimum dataset for signal over noise \u2014 we won\u2019t show patterns that aren\u2019t real yet.",
  },

  SETTINGS: {
    title: "Settings",
    profileLabel: "Profile",
    profileDescription: "Name, niche, voice notes, tone",
    platformsLabel: "Platforms",
    platformsDescription: "Connect YouTube, Instagram, LinkedIn, X",
    voiceLabel: "Narration voice",
    voiceDescription: "Manage your narration clone or library selection",
    billingLabel: "Billing",
    billingDescription: "Subscription and payment management",
    webhooksLabel: "Webhooks",
    webhooksDescription: "Pipe Build In Social events into your own stack.",
    brandLabel: "Brand kit",
    brandDescription: "Colors, logo, watermark, and caption font.",
    publishingLabel: "Publishing",
    publishingDescription:
      "Publish pSEO articles to your own WordPress site so the SEO juice accrues to your domain.",
  },

  SETTINGS_PUBLISHING: {
    title: "Publishing",
    subtitle:
      "Route pSEO articles to your own domain so search rankings accrue to you \u2014 not a buildinsocial.com subdomain.",
    wpCardTitle: "Publish pSEO articles to your own WordPress site",
    wpCardSubtitle:
      "Connect WordPress once. Every pSEO article goes live on your domain \u2014 no copy-paste, no CMS switcheroo.",
    wpBenefitBullets: [
      "Your domain earns the backlinks and long-tail search traffic.",
      "Works with self-hosted WordPress (\u22655.6) and Jetpack-connected WordPress.com sites.",
      "Uses a scoped Application Password \u2014 never your admin login.",
    ],
    siteUrlLabel: "Site URL",
    siteUrlPlaceholder: "https://yoursite.com",
    siteUrlHelp: "Use the full https:// URL of your WordPress site.",
    usernameLabel: "WordPress username",
    usernamePlaceholder: "your-wp-username",
    appPasswordLabel: "Application password",
    appPasswordPlaceholder: "xxxx xxxx xxxx xxxx xxxx xxxx",
    appPasswordHelp:
      "Generate this in wp-admin \u2192 Users \u2192 Profile \u2192 Application Passwords. We encrypt it at rest \u2014 you can rotate it any time.",
    appPasswordHelpLinkLabel:
      "How to generate a WordPress application password \u2192",
    appPasswordHelpLinkHref:
      "https://wordpress.org/documentation/article/application-passwords/",
    testCta: "Test connection",
    testing: "Build In Social is reaching out to your site\u2026",
    testSuccessWithTitle: (siteTitle: string) =>
      `Connected to ${siteTitle}. Credentials verified.`,
    testSuccessNoTitle: "Credentials verified.",
    testFailure: "We couldn\u2019t verify those credentials.",
    saveCta: "Save connection",
    saving: "Build In Social is saving\u2026",
    saved: "Saved \u2713",
    statusTitle: "Connected",
    statusSiteUrl: "Site URL",
    statusUsername: "WordPress user",
    statusLastTested: "Last verified",
    statusLastPublished: "Last published",
    statusLastPublishedNever: "No posts yet",
    enabledToggleLabel: "Enable for pSEO articles",
    enabledToggleDescription:
      "When on, new pSEO articles publish to your WordPress site instead of the buildinsocial.com subdomain.",
    disconnectCta: "Disconnect",
    disconnectTitle: "Disconnect this WordPress site?",
    disconnectDescription:
      "Future pSEO articles will publish to your buildinsocial.com subdomain again. Existing posts already on your site stay put.",
    disconnectConfirm: "Disconnect site",
    disconnectError:
      "Build In Social couldn\u2019t disconnect the site. Try again or contact support.",
    lockedTitle: "Publish to your own WordPress site",
    lockedDescription:
      "Available on Creator and Studio. Your pSEO articles publish to your-domain.com/topic so the long-tail traffic lands on your domain.",
    lockedCta: "Upgrade \u2192",
    loadError: "Couldn\u2019t load your WordPress connection.",
    saveError: "Build In Social couldn\u2019t save your connection.",
    retestCta: "Re-test connection",
    retestSuccess: "Connection is still healthy.",
    retestFailure: (reason: string) => `Connection failed \u2014 ${reason}`,
    roadmapNote:
      "WordPress publishes pSEO articles today. Video publishing and Ghost/Webflow integrations are on the roadmap.",
  },

  SETTINGS_BRAND: {
    title: "Brand kit",
    description: "Customize how your videos look across all platforms.",
    primaryColor: "Primary color",
    accentColor: "Accent color",
    logoLabel: "Logo",
    logoHint: "PNG, SVG or JPG \u00b7 max 2 MB",
    logoUpload: "Upload logo",
    watermarkLabel: "Watermark position",
    fontStyleLabel: "Caption font style",
    saveLabel: "Save brand kit",
    savedLabel: "Saved",
    fontStyles: {
      modern: "Modern",
      bold: "Bold",
      minimal: "Minimal",
      playful: "Playful",
    } as Record<string, string>,
    watermarkPositions: {
      "top-left": "Top left",
      "top-right": "Top right",
      "bottom-left": "Bottom left",
      "bottom-right": "Bottom right",
      none: "No watermark",
    } as Record<string, string>,
  },

  CAPTION_STYLES: {
    label: "Caption style",
    none: "No captions",
    minimal: "Minimal",
    bold: "Bold",
    gradient: "Gradient",
    outline: "Outline",
    preview: "Preview",
  },

  SETTINGS_WEBHOOKS: {
    title: "Webhooks",
    subtitle:
      "Build In Social will post a signed JSON payload to your endpoint every time a tracked event happens. Use this to pipe events into your own stack.",
    partnerNote:
      "You are the partner. We deliver the event \u2014 your stack decides what to do with it.",
    emptyTitle: "No webhooks yet",
    emptyDescription:
      "Add an endpoint to start receiving signed events. Every delivery is HMAC-SHA256 signed with your subscription secret.",
    addCta: "Add webhook",
    addDialogTitle: "Add a webhook endpoint",
    addDialogSubtitle:
      "We\u2019ll POST a signed JSON payload to this URL every time an event fires.",
    urlLabel: "Endpoint URL",
    urlPlaceholder: "https://your-app.example.com/webhooks/build-in-social",
    eventsLabel: "Events to subscribe to",
    eventsHint: "Pick at least one. You can change this later.",
    saveCta: "Create webhook",
    saving: "Build In Social is registering your endpoint...",
    cancelCta: "Cancel",
    secretRevealTitle: "Copy your signing secret",
    secretRevealDescription:
      "This is the only time we\u2019ll show this secret. Store it somewhere safe \u2014 you\u2019ll need it to verify every delivery.",
    secretCopy: "Copy",
    secretCopied: "Copied",
    secretDoneCta: "I\u2019ve saved my secret",
    columnUrl: "Endpoint",
    columnEvents: "Events",
    columnStatus: "Status",
    columnLastDelivered: "Last delivered",
    columnActions: "",
    statusActive: "Active",
    statusDegraded: "Degraded",
    statusDisabled: "Disabled",
    lastDeliveredNever: "Never",
    eventLabels: {
      "video.rendered": "Video rendered",
      "video.posted": "Video posted",
      "revision.requested": "Revision requested",
      "plan.generated": "Plan generated",
    } as Record<string, string>,
    testCta: "Send test",
    testSending: "Build In Social is sending a test payload...",
    testSuccess: "Test delivered successfully",
    testFailure: "Test failed \u2014 we couldn\u2019t reach your endpoint.",
    deleteCta: "Delete",
    deleteConfirmTitle: "Delete this webhook?",
    deleteConfirmDescription:
      "We\u2019ll stop delivering events to this endpoint. This cannot be undone.",
    deleteConfirmCta: "Delete webhook",
    deleteError: "Build In Social couldn\u2019t delete this webhook.",
    loadError: "Couldn\u2019t load your webhooks. Please try again.",
    createError:
      "Build In Social couldn\u2019t register that endpoint. Check the URL and try again.",
    signatureHint:
      "Every request includes an X-Build-In-Social-Signature header \u2014 an HMAC-SHA256 of the body signed with your secret.",
    retryHint:
      "Non-2xx responses retry 3 times (1s, 5s, 30s). If all fail, the webhook is marked degraded and surfaced here.",
    developersLink: "See the developer docs \u2192",
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
    contentLanguageLabel: "Content language",
    contentLanguageDescription: "The language Build In Social writes content in.",
    voicePrefsLabel: "Voice preferences",
    voicePrefsOptional: "Optional",
    voicePrefsPlaceholder:
      "Phrases you always use, things you never say, references your audience gets...",
    saving: "Build In Social is saving...",
    saveCta: "Save changes",
    saved: "Saved \u2713",
    exportDataTitle: "Download your data",
    exportDataDescription:
      "Export everything Build In Social has about you \u2014 profile, videos, scripts, and settings. JSON format.",
    exportDataCta: "Download my data",
    exportDataPreparing: "Build In Social is preparing your export...",
    exportDataReady: "Download ready",
    exportDataError:
      "Build In Social couldn\u2019t prepare your export. Please try again.",
    deleteAccountTitle: "Delete account",
    deleteAccountDescription:
      "This permanently deletes your account and all associated data \u2014 videos, scripts, voice clone, and settings. This action cannot be undone.",
    deleteAccountConfirm: "Delete account",
    deleteAccountConfirmPrompt: "Type DELETE to confirm.",
    deleteAccountConfirmCta: "Delete my account",
    deleteAccountProcessing: "Build In Social is deleting your account...",
    deleteAccountError:
      "Build In Social couldn\u2019t delete your account. Please try again or contact support.",
    deleteAccountSuccess: "Your account has been deleted.",
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
    title: "Narration voice",
    subtitle: "The voice used to narrate your videos.",
    disambiguation:
      "This is the voice that narrates your videos \u2014 not your written brand voice. Built on ElevenLabs.",
    cloneTitle: "Narration clone",
    cloneActive: "Your narration clone is active.",
    cloneEmpty: "No narration clone yet. Powered by ElevenLabs.",
    removeClone: "Remove",
    uploadSample: "Upload voice sample",
    uploadHint:
      "Record 30+ seconds of natural speech, upload here, and your clone is ready in ~5 minutes.",
    libraryTitle: "Library voice",
    libraryFallback: "(fallback when clone is unavailable)",
    previewComingSoon: "Audio previews coming soon",
    previewCloneCta: "Preview your clone",
    previewRendering: "Build In Social is rendering your preview...",
    previewPlaying: "Now playing",
    previewStop: "Stop",
    previewRateLimited:
      "Previews are limited to one every 10 minutes \u2014 try again shortly.",
    previewUpgradeNeeded:
      "Voice clone previews are available on Creator and Studio plans.",
    previewUpgradeCta: "Upgrade \u2192",
    previewError:
      "Build In Social couldn't render your preview. Try again shortly.",
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
    avatarBadge: "New",
    avatarDescription:
      "Your AI clone. Record once. Post your face on every platform, every week, without filming.",
    avatarCta: "Choose render mode",
    usageTitle: "This month",
    usageVideos: (count: number, limit: number) =>
      `${count} of ${limit} videos this month`,
    usagePlatforms: (active: number, total: number) =>
      `${active} of ${total} platforms connected`,
    usageRenews: (date: string) => `Resets ${date}`,
    usagePending: "Usage data syncs after your first videos.",
    hardCapExplainer:
      "Hard cap \u2014 we never auto-charge for extras. Hit your cap and we pause until the monthly reset, or you can upgrade.",
    cancellationPolicyTitle: "Cancellation",
    cancellationPolicyBody:
      "Cancel anytime from the billing portal. Access continues through your billing period. Your videos stay downloadable for 30 days after cancellation.",
    afterTrialNote:
      "After your 14-day trial, pick a plan. Your account pauses cleanly if you don\u2019t \u2014 no charges, no data loss.",
  },

  QUOTA: {
    dialogTitle: (cap: number) => `Monthly cap reached \u2014 ${cap} videos published`,
    dialogBody: (nextTier: string | null, resetDate: string) =>
      nextTier
        ? `Every video you publish becomes a permanent pSEO page that compounds in search. Upgrading to ${nextTier} keeps that compounding going this month instead of pausing until ${resetDate}.`
        : `Every video you\u2019ve published is a permanent pSEO page compounding in search. You\u2019re on the top plan \u2014 your cap resets ${resetDate} and all previous pages stay live.`,
    upgradeCta: (nextTier: string) => `Keep compounding \u2014 upgrade to ${nextTier}`,
    waitCta: `Wait for reset`,
    headerUsage: (used: number, cap: number) => `${used} of ${cap} videos this month`,
    headerNearCap: (used: number, cap: number) =>
      `${used} of ${cap} videos \u2014 near your cap`,
    headerAtCap: (cap: number) =>
      `${cap} of ${cap} videos \u2014 cap reached. Upgrade to keep publishing.`,
    noSurpriseCharges: "Hard cap \u00b7 no surprise charges \u00b7 all published pages stay live.",
  },

  WAITLIST: {
    badge: "Coming soon",
    title: "Avatar Mode",
    headline:
      "Your AI clone. Record once. Post your face on every platform \u2014 every week, without filming.",
    description:
      "Build In Social is training an Instant Avatar pipeline for founder-grade vertical video. You record once, we clone your voice and likeness, and every weekly autopilot video ships with your face \u2014 no studio, no filming.",
    howItWorksLabel: "How it works",
    howItWorks: [
      "Record a 2-minute webcam clip. Good light, one take \u2014 phone or laptop works.",
      "Build In Social trains your clone in under 24 hours.",
      "Every autopilot video renders with your face and cloned voice.",
    ],
    specsLabel: "What Avatar Mode is (and isn\u2019t)",
    specs: [
      "Built for vertical short-form \u2014 YouTube Shorts, Reels, LinkedIn, X.",
      "Single avatar per account. One background, recorded from your session.",
      "Not a Synthesia replacement \u2014 we are founder-grade, not enterprise broadcast.",
      "Pricing: Studio plan add-on. Final price announced at cohort launch.",
    ],
    targetAudience:
      "Built for solo founders and creator-founders. If you need enterprise training videos or multi-avatar teams, stay on Synthesia.",
    cohortNote:
      "Rolling out to the waitlist in cohorts. We\u2019ll email you when yours opens.",
    waitlistPerk:
      "Waitlist members get early-access pricing locked in for life.",
    emailPlaceholder: "your@email.com",
    emailError: "Enter a valid email address.",
    joining: "Adding you to the list...",
    joinCta: "Join waitlist",
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
      headline: "Show us your product. We\u2019ll show you next week.",
      subheading:
        "Drop your site. In 60 seconds, see the videos Build In Social would post for you across YouTube Shorts, Reels, LinkedIn, and X. No site? Describe what you build \u2014 autopilot works from your niche alone.",
      cta: "See my content plan \u2192",
      socialProof: "For anyone who ships, writes, or builds faster than they can market.",
      productSectionLabel: "Your website",
      websitePlaceholder: "yourproduct.com",
      nichePhaseSectionLabel: "Your expertise area",
      nichePhaseQuestion: "What\u2019s your expertise area?",
      nichePhaseHint:
        "Select all that apply. Build In Social uses this to shape every video it creates for you. You can update these any time in Settings.",
      noNewsReassurance:
        "Nothing shipped this week? No problem. Autopilot runs on your niche \u2014 no news required.",
      customNicheHint: "Don\u2019t see your niche? Type your own.",
      manualNamePlaceholder:
        "What\u2019s it called? (product, project, or just your focus area)",
      manualDescriptionPlaceholder:
        "Describe it \u2014 \u2018a SaaS for X\u2019 or \u2018I\u2019m a freelance React dev helping startups ship\u2019.",
      noWebsiteLink: "No website yet? Describe it instead",
      ingestLabel: "I already have source material",
      ingestHint:
        "Paste a Notion page, a transcript, or an RSS feed. Build In Social reads it and seeds your first week.",
      ingestTypeNotion: "Notion page",
      ingestTypeTranscript: "Transcript / text",
      ingestTypeRss: "RSS / podcast feed",
      ingestNotionPlaceholder: "https://yourname.notion.site/...",
      ingestTranscriptPlaceholder:
        "Paste a transcript, talk notes, or raw writing (at least a paragraph).",
      ingestRssPlaceholder: "https://yourpodcast.com/feed.xml",
      ingestSubmitCta: "Read this source",
      ingestLoading: "Build In Social is reading your source...",
      ingestSuccess: (n: number) =>
        `Extracted ${n} topic candidate${n === 1 ? "" : "s"}. We\u2019ll use these in your first week\u2019s plan.`,
      ingestErrorNotion:
        "Couldn\u2019t read that Notion page. Make sure it\u2019s set to public share.",
      ingestErrorTranscript:
        "That transcript is too short or empty. Paste at least a few sentences.",
      ingestErrorRss:
        "Couldn\u2019t parse that feed. Check that the URL points to a valid RSS or Atom feed.",
      ingestErrorRateLimit:
        "You\u2019ve already read a source in the last hour. Try again later \u2014 we cap this to keep costs low.",
      ingestErrorGeneric:
        "Something went wrong reading that source. Try another one.",
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
      libraryIntro:
        "Start with a library voice \u2014 professionally recorded, platform-optimized. You can upgrade to a voice clone later on Creator or Studio.",
      cta: "Looks good \u2192",
    },
    step5: {
      generating: "Build In Social is preparing your first week...",
      title: "Here\u2019s your first week",
      showingCount: (shown: number, total: number) =>
        `Showing ${shown} of ${total} videos`,
      cta: "Choose your plan",
      stickyLabel: "14-day free trial, no card needed",
      modeHeading: "How do you want to run each week?",
      modeManualTitle: "I have something to share this week",
      modeManualDescription:
        "Answer 3 quick questions. Build In Social builds the week around your specific work.",
      modeAutopilotTitle: "Run on autopilot",
      modeAutopilotBadge: "Recommended",
      modeAutopilotDescription:
        "Build In Social picks the best angles for your niche and builds a full week. No input needed.",
      modeNote:
        "You can switch modes any week from your dashboard. Review before anything goes live, or let it post on schedule.",
      modeLaunchHint:
        "Launching something? Manual mode builds the whole week around your moment.",
    },
    step6: {
      title: "Start your free trial",
      framingLine:
        "Faster than editing one video yourself. Cheaper than skipping social entirely.",
      toggleAnnual: "Annual",
      toggleMonthly: "Monthly",
      mostChosen: "Most chosen",
      noCreditCard: "No credit card \u00b7 14-day trial \u00b7 Cancel anytime",
      afterTrial:
        "After 14 days, pick a plan \u2014 your account pauses cleanly if you don\u2019t. No charges, no data loss.",
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
    calendarView: "Calendar view",
    listView: "List view",
    unscheduled: "Unscheduled",
    dropToSchedule: "Drop to schedule",
    scheduledDay: (day: string) => `Scheduled for ${day}`,
    switchToAutopilot: "Switch to autopilot instead",
    switchToManual: "Switch to manual instead",
    showScript: "Show script",
    hideScript: "Hide script",
    approve: "Approve",
    approved: "Approved",
  },

  NAV: {
    dashboard: "Dashboard",
    weeklyPlan: "Weekly Plan",
    videos: "Videos",
    settings: "Settings",
    avatarMode: "Avatar Mode",
    help: "Help",
    planSubtitle: "Build In Social is building this week\u2019s content.",
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

  WAITLIST_CTA: {
    submitting: "Joining...",
    successTitle: "You\u2019re on the list.",
    successBody: "We\u2019ll email you when your trial opens.",
    errorGeneral: "Something went wrong. Try again.",
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

  NICHE_PRESETS: [
    { id: "indie-hacking",      label: "Indie hacking"              },
    { id: "saas-growth",        label: "SaaS growth"                },
    { id: "dev-tools",          label: "Developer tools"            },
    { id: "no-code",            label: "No-code & automation"       },
    { id: "ai-builders",        label: "AI for builders"            },
    { id: "b2b-gtm",            label: "B2B & GTM"                  },
    { id: "product-design",     label: "Product design"             },
    { id: "startup-ops",        label: "Startup ops"                },
    { id: "open-source",        label: "Open source"                },
    { id: "technical-writing",  label: "Technical writing"          },
    { id: "wellness-fitness",   label: "Wellness & fitness"         },
    { id: "creator-economy",    label: "Creator economy"            },
    { id: "real-estate",        label: "Real estate"                },
    { id: "personal-finance",   label: "Personal finance"           },
    { id: "ecommerce-dtc",      label: "E-commerce / DTC"           },
    { id: "health-nutrition",   label: "Health & nutrition"         },
    { id: "productivity",       label: "Productivity & mindset"     },
    { id: "education-courses",  label: "Education / online courses" },
    { id: "freelancing",        label: "Freelancing & consulting"   },
    { id: "design-branding",    label: "Design & branding"          },
    { id: "content-marketing",  label: "Content marketing"          },
    { id: "agency-ops",         label: "Agency ops"                 },
    { id: "climate-tech",       label: "Climate tech"               },
    { id: "developer-journey",  label: "Developer journey"          },
    { id: "personal-brand",         label: "Personal brand / thought leadership" },
    { id: "learning-in-public",     label: "Learning in public"          },
    { id: "frontend-engineering",   label: "Frontend engineering"        },
    { id: "developer-career",       label: "Developer career"            },
    { id: "b2b-saas",               label: "B2B SaaS"                    },
    { id: "non-technical-founder",  label: "Non-technical founder"       },
  ],

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

  DASHBOARD_NAV: {
    dashboardLabel: "Dashboard",
    planLabel: "Weekly Plan",
    videosLabel: "Videos",
    settingsLabel: "Settings",
  },

  A11Y: {
    skipToContent: "Skip to main content",
    loading: "Loading\u2026",
    loaded: "Loaded",
    toggleNav: "Toggle navigation menu",
    heroDashboardAlt: "A preview of the Build In Social dashboard",
  },
} as const;
