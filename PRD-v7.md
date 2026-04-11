# Castly — Product Requirements Document
## Version 7.0 — Final. Every decision from every conversation is in here.
**Date:** April 2026 | **Status:** Build from this. Nothing else exists.

---

## 0. The One Sentence

**Castly is your social media distribution employee — it knows what each platform wants, creates the right content in the right format, and posts while you build.**

---

## 1. Positioning

### What Castly is
A distribution partner. An autonomous employee for your social presence. You tell it what you're building this week. It creates platform-native content for YouTube Shorts, Instagram Reels, LinkedIn, and X — correct duration, correct hook structure, correct posting time for each algorithm — and posts it automatically.

The pricing comparison is never "Castly vs HeyGen ($29/month)." It is always "Castly vs hiring a social media manager ($2,000–5,000/month)." That is the frame on every pricing page, every ad, every onboarding screen.

### What Castly is not (stated honestly in onboarding)
- Not a magic brand builder for people with nothing to say
- Not a replacement for genuine ideas — it distributes them, it doesn't invent them
- Not guaranteed virality — consistent quality distribution gives you more chances, that's the real value

### The partner framing — enforced everywhere in the UI
Castly speaks as a partner, not a tool. This is not cosmetic. It changes the user's mental model of what they're paying for.

```
✓ "Castly is preparing your week's content"
✓ "Castly noticed your Reels are outperforming Shorts — here's the adjusted plan"
✓ "Your content is ready for approval. Castly posts on schedule."
✗ "Generate a video"
✗ "Create content"
✗ "Use our AI tool"
```

---

## 2. The Wedge User — Non-Negotiable

**Phase 1 is built for indie developers and SaaS founders. Only them.**

Not real estate agents. Not coaches. Not "solo professionals." The product, the copy, the onboarding questions, the hook templates, the content intelligence — everything in Phase 1 is tuned for this one persona.

**Why indie devs:**
- They ship constantly and have genuine things to post about every single day
- They're already on X and YouTube — no platform education needed
- They share tools that work — one founder posting about Castly on X is worth 50 other user types
- Clear, daily content: what I built, what broke, what I learned, what shipped
- High tolerance for early-stage products, forgive rough edges, give honest feedback
- Their content naturally fits short-form — feature drops, mistake stories, roadmap teases, dev logs

**Phase 2 expansion:** Real estate agents (high WTP, proven video ROI, clear content loop)
**Phase 3 expansion:** Coaches, consultants, course creators

---

## 3. Design System — Uber Base Web

### The reference
**Uber's Base Web design system is the reference.** The principles are density, neutrality, and precision. The interface disappears. The task remains. White-first default. One neutral accent (black). No gradients, no illustrations, no shadows except for overlays.

Build In Social uses Base Web (Uber) component primitives + Styletron CSS-in-JS + custom CSS token system + Tailwind for layout spacing only.

### Core principles (Uber Base Web)
1. **Density:** Every element earns its place. Nothing costs the user attention it has not earned.
2. **Neutrality:** The interface is invisible. Black accent, white surfaces, no decorative colour.
3. **Precision:** Every spacing value is a multiple of 4. Every type size is from the scale. Every transition is from the motion system. No individual decisions.
4. **Task-first:** Can the user identify the primary action in under 1 second? If not, the hierarchy is wrong.

### Why white-first (not dark)
White reads as professional infrastructure — like Uber, Notion, Stripe. Dark reads as creative tool or media app. Build In Social is distribution infrastructure. The design must communicate that.

### Token system (light mode default, dark mode secondary)

```css
/* =============================================
   BUILD IN SOCIAL DESIGN TOKENS — /app/globals.css
   Uber Base Web principles. White-first.
   Single neutral accent. No decorative colour.
   ============================================= */

:root {
  /* Surfaces */
  --bg-page:        #FFFFFF;
  --bg-surface:     #FFFFFF;
  --bg-elevated:    #F9FAFB;
  --bg-overlay:     #F3F4F6;

  /* Borders — use these, never shadows for separation */
  --border-subtle:  rgba(0,0,0,0.06);
  --border-default: rgba(0,0,0,0.10);
  --border-strong:  rgba(0,0,0,0.16);

  /* Text */
  --text-primary:   rgb(36, 36, 36);
  --text-secondary: rgba(0, 0, 0, 0.54);
  --text-tertiary:  rgba(0, 0, 0, 0.4);
  --text-disabled:  rgba(0, 0, 0, 0.25);
  --text-inverse:   #FFFFFF;

  /* Accent — single neutral accent (black). No secondary colour. */
  --accent:         rgb(36, 36, 36);
  --accent-subtle:  rgba(0, 0, 0, 0.05);
  --accent-hover:   rgb(60, 60, 60);

  /* Semantic */
  --accent-green:   #1A8917;
  --success:        #1A8917;
  --success-subtle: rgba(26, 137, 23, 0.08);
  --warning:        #92400E;
  --warning-subtle: rgba(146, 64, 14, 0.08);
  --danger:         #9B1C1C;
  --danger-subtle:  rgba(155, 28, 28, 0.08);

  /* Radius */
  --radius-xs: 3px;
  --radius-sm: 5px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows — overlays and floating elements only */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.08);

  /* Transitions */
  --transition-fast:  120ms ease;
  --transition-state: 100ms ease;
}

[data-theme="dark"] {
  --bg-page:        #0a0a0a;
  --bg-surface:     #111111;
  --bg-elevated:    #1a1a1a;
  --bg-overlay:     #222222;
  --border-subtle:  rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.10);
  --border-strong:  rgba(255,255,255,0.18);
  --text-primary:   #f4f4f5;
  --text-secondary: #a1a1aa;
  --text-tertiary:  #52525b;
  --text-disabled:  #3f3f46;
  --text-inverse:   #0a0a0a;
  --accent:         #f4f4f5;
  --accent-subtle:  rgba(255,255,255,0.08);
  --accent-hover:   #d4d4d8;
}
```

### Typography
**Headings:** Source Serif 4 (--font-heading), weight 400 (light serif). Brand decision — gives warmth to the neutral system.
**Body/UI:** Geist (--font-sans). No Inter. No system fonts.
**Mono:** Geist Mono for timestamps, numbers, durations, code.

Uber Base type scale (app pages):
- Display: 20px mobile / 24px desktop (--type-display-*)
- Section: 15px mobile / 16px desktop (--type-section-*)
- Body: 14px mobile / 15px desktop (--type-body-*)
- Supporting: 12px mobile / 13px desktop (--type-supporting-*)
- Micro: 11px uppercase tracking 0.07em (--type-micro)

Line heights: 1.2 headings, 1.6 body

### Button system (sharp corners, sliding-fill micro-interactions)
- **border-radius: 0** on all buttons (enforced in CSS classes, never Tailwind rounded).
- 4 variants: `app-btn-primary` (black fill, white text), `app-btn-secondary` (transparent, black border), `app-btn-ghost` (subtle fill on hover), `app-btn-danger` (red fill).
- Sliding-fill gradient micro-interaction: `linear-gradient`, `background-size: 200% 100%`, slides on hover.
- Hover lift: `translateY(-2px)` + subtle shadow. Active: `scale(0.97)`.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (320ms fill, 150ms transform, 80ms active).
- All buttons use the `Button.tsx` component. No bare `<button>` elements for actions.

### Card system (Uber Base elevated pattern)
- Background: `--bg-elevated`. No border. Radius: `--radius-lg`.
- Padding: 16px mobile / 24px desktop.
- CardTitle: font-semibold (not font-medium).
- Interactive cards: hover `-translate-y-0.5` + subtle shadow.
- No box-shadow on default cards. Shadows only for overlays.

### Component rules (Uber Base Web)
1. Borders define separation on non-card surfaces — `1px solid var(--border-subtle)` or `var(--border-default)`
2. Shadows only for dropdown menus, modals, and floating elements — never for cards
3. Hover state: `background: var(--bg-elevated)` — subtle, never colour
4. Active/selected: `background: var(--accent-subtle)` with `border: 2px solid var(--accent)`
5. Approved/success states: `--success` / `--success-subtle` (green)
6. All spacing: 4px base grid, multiples of 4 only
7. Never hardcode a hex value anywhere in component files
8. All interactive elements use the `Button` component — no bare `<button>` elements
9. Animation system: `lib/motion.ts` exports `PAGE_ENTER`, `ELEMENT_ENTER`, `ease` — never inline duration values

---

## 4. Landing Page — Full Specification

White background. Linear layout rhythm. Product screenshot as hero. One accent accent. No gradients, no illustrations, no decoration.

### Navigation
```
[Castly wordmark — Geist 600, 16px]

                  Product  Pricing  Changelog

                                    [Sign in]  [Start free →]
```
Sticky. `backdrop-filter: blur(16px)`. `background: rgba(255,255,255,0.85)`.
`border-bottom: 1px solid var(--border-subtle)`.

### Hero
```
[Eyebrow — 11px, uppercase, letter-spacing 0.08em, --text-tertiary]
BUILT FOR BUILDERS

[H1 — 56px, weight 700, line-height 1.08, --text-primary, max-width 600px]
Your social media
employee is here.

[Subheading — 18px, weight 400, --text-secondary, line-height 1.6, max-width 460px]
Tell Castly what you're building this week.
It creates the content, picks the format, and posts
to every platform in exactly the way each algorithm rewards.

[CTAs — gap 12px, margin-top 36px]
[Start free — filled accent, 10px 20px padding]  [See how it works →  — ghost, accent text]

[Social proof — 13px, --text-tertiary, margin-top 48px]
Trusted by indie developers who ship and forget to post about it.
```

Below hero: full-width dark-bordered product screenshot of the Castly weekly plan UI.
Same treatment as Linear — the product IS the marketing. No device frame.

### Section 2 — How it works (3 numbered steps, Linear style)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

01        Tell Castly what you're building
          Your niche, your story, your platforms.
          Castly learns your voice once. Doesn't forget.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

02        Castly builds your distribution plan
          Platform-native content. Right duration for each algorithm.
          Right hook for each audience. Built and ready every week.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

03        It posts. You build.
          Approve the week in one click or let it run on autopilot.
          Every video generates a matching SEO page. Compounding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Section 3 — 4 platform cards (2×2 grid)
Each card: white surface, `border: 1px solid var(--border-default)`, `border-radius: var(--radius-md)`, `padding: 24px`.

```
┌──────────────────────────┐  ┌──────────────────────────┐
│ YouTube Shorts           │  │ Instagram Reels           │
│                          │  │                           │
│ 5× per week              │  │ 4× per week               │
│ 30–45 second videos      │  │ 20–30 second videos       │
│                          │  │                           │
│ Castly knows the first   │  │ Castly knows sends-per-   │
│ 3 seconds determine      │  │ reach drives algorithmic  │
│ your entire distribution.│  │ amplification.            │
└──────────────────────────┘  └──────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│ LinkedIn                 │  │ X / Twitter               │
│                          │  │                           │
│ 4× per week              │  │ 10× per week              │
│ 45–60 second videos      │  │ 15–20 second clips        │
│                          │  │                           │
│ Castly knows dwell time  │  │ Castly knows engagement   │
│ and first-hour comments  │  │ velocity in the first     │
│ drive LinkedIn reach.    │  │ hour drives distribution. │
└──────────────────────────┘  └──────────────────────────┘
```

Footnote (13px, tertiary): "Castly adapts format, duration, and hook structure to each platform's algorithm. One prompt. Four native outputs."

### Section 4 — pSEO proof section
```
[11px uppercase tertiary label]
EVERY VIDEO BECOMES A GOOGLE PAGE

[H2 — 36px, weight 700]
Social posts drive traffic.
SEO pages compound it.

[Body — 16px, secondary, max 480px]
Most tools give you one or the other.
Castly generates a matching landing page for every piece of content —
indexed, schema-marked, and live before your video goes up.

[Product mockup: video card → arrow → SEO page card]
```

### Section 5 — Pricing
Three packages. Outcome language only. No credits visible. See Section 9 for full copy.

### Footer
4 columns. `border-top: 1px solid var(--border-subtle)`.
```
Castly          Product          Company          Legal
[tagline]       How it works     About            Privacy
                Pricing          X / Twitter      Terms
                Changelog        Contact
```

---

## 5. The 4 Platforms (Fixed. Reddit and TikTok not included.)

Reddit and TikTok are removed permanently from Phase 1. The 4 platforms below are where indie developers, SaaS founders, and eventually coaches and real estate agents actually win. They are the platforms with the clearest algorithmic rules, the most developed creator ecosystems, and the highest signal-to-noise ratio for the wedge user.

| Platform | Frequency | Duration | Key algorithm signal | Mode |
|---|---|---|---|---|
| YouTube Shorts | 5x/week | 30–45s | Watch-through rate, replay rate, swipe-away rate | Faceless (4x) + Avatar anchor (1x in Phase 2) |
| Instagram Reels | 4x/week | 20–30s | Sends-per-reach (DM shares), save rate | Faceless (3x) + Avatar anchor (1x in Phase 2) |
| LinkedIn | 4x/week | 45–60s | Dwell time, comments in first 60 minutes | Faceless (3x) + Avatar anchor (1x in Phase 2) |
| X / Twitter | 10x/week | 15–20s | Engagement velocity in first hour, recency | Faceless all (no Avatar on X) |

**Total per week (all 4 platforms):** 23 videos
**Total per month:** ~92 videos
**Average duration (blended):** ~28 seconds

Castly sets the duration. The user does not choose it. The UI shows it explicitly with an optional override. Defaults win 90% of the time because they're correct.

### Posting time intelligence (baked in, users don't configure this)
| Platform | Best days | Best times (IST) |
|---|---|---|
| YouTube Shorts | Fri, Sat, Sun | 7:30pm – 11:30pm |
| Instagram Reels | Tue, Wed, Thu | 6:30pm – 9:30pm |
| LinkedIn | Wed, Thu, Fri | 6:30pm – 9:30pm |
| X / Twitter | Mon–Fri | 1:30pm – 3pm and 8:30pm – 10pm |

---

## 6. Content Architecture

### The Anchor + Fill model

**Anchor videos** (Phase 2 only — Avatar Mode, 1x per platform per week except X):
- Personal face + cloned voice
- Longer, story-driven, trust-building
- YouTube 45s, Instagram 30s, LinkedIn 60s
- 3 Anchor videos/week = ~12/month

**Fill content** (Phase 1 — all content is Faceless fill):
- Short, punchy, platform-native
- Generated from the same weekly context prompt
- Automatic schedule, Castly picks the optimal time

### The quality gate — the most important design decision in the product

Every week, before any script is generated, Castly asks 3 specific questions. Not "what's your topic." Real questions that force specific context.

```
Screen: "What happened this week?"

Q1: What did you ship, learn, or decide?
    Be specific. "Launched Stripe billing" not "worked on my app."
    [text input, max 280 chars, required]

Q2: What surprised you about it?
    [text input, max 280 chars, required]

Q3: Who needs to hear this, and why does it matter to them?
    [text input, max 280 chars, required]
```

This runs every single week. Not once at onboarding. Every week. Because specific context from this week is what produces content that performs. Generic prompts produce generic content. Generic content gets algorithm-suppressed. Algorithm suppression means user churn.

If specificity_score (Claude Haiku evaluation) < 5, Castly pushes back:
```
"This is a bit general — one specific detail makes the content 10× better.
What exactly did you launch? What number surprised you?
Even one sentence changes everything."
```

This is the product's core moat. No competitor asks these questions every week.

### Faceless Mode visual styles (4 options, user selects once at onboarding)

**Dev Log** — for indie devs and builders
Screen recording aesthetic, code visible in background, terminal-style captions, minimal text overlay.
Best for: tutorial content, feature drops, debugging stories.

**Documentary** — real B-roll + clean captions
Pexels footage matched to script keywords, text captions synced to voice.
Best for: opinion pieces, industry takes, lessons learned.

**Minimal Text** — large typography on clean background
White or near-black background, large animated text, voiceover only, no footage.
Best for: hot takes, X-native content, stat-driven posts.

**Slide** — screenshot-forward
Product screenshots, data, diagrams with voice narration.
Best for: LinkedIn, product launches, feature announcements.

---

## 7. Avatar Mode — Positioned Deliberately, Ships in Phase 2

Avatar Mode is shown from Day 1 but disabled. This is intentional and must feel confident, not apologetic. The "Coming soon" badge is accent, small, and adjacent to the feature name — not hidden below a fold.

### How it appears in the UI
```
[Badge: accent, 11px] COMING SOON

Avatar Mode
────────────────────────────────────
Your AI clone. Record once.
Post your face on every platform
every week without filming.

We're onboarding Avatar users in cohorts
to ensure quality that actually represents you.

[Join the waitlist →]
```

### Avatar Mode spec for Phase 2
- Training: 2-minute clip → HeyGen Avatar IV → clone ready in 15–45 minutes
- Output: 1080p, full Avatar IV with natural gestures, micro-expressions, accurate lip sync
- Duration: 30–60s (Anchor content only — never daily fill)
- Platforms: YouTube, Instagram, LinkedIn (not X)
- Frequency: 1 Avatar/platform/week = 3 Avatar videos/week

### Avatar Mode pricing (Phase 2 only)
Add-on: **+$39/month** for 8 Avatar videos/month
Additional Avatar: **$4.50/video**

**Hard rule:** Avatar add-on does not launch until HeyGen Enterprise pricing is confirmed in writing. At pay-as-you-go rates ($3.04/video COGS for 30s), margin at $4.88 revenue = 37%. At Enterprise rates (~$1.84/video COGS), margin = 62%. Enterprise rates are required for this to work at scale.

---

## 8. Unit Economics — Verified Math

### COGS per Faceless video by duration

| Duration | ElevenLabs | Pexels | FFmpeg | Claude (script+pSEO+label) | R2 | **Total** |
|---|---|---|---|---|---|---|
| 15–20s | $0.04 | $0 | $0.015 | $0.04 | $0.001 | **$0.096** |
| 20–30s | $0.06 | $0 | $0.020 | $0.04 | $0.001 | **$0.121** |
| 30–45s | $0.11 | $0 | $0.025 | $0.04 | $0.002 | **$0.177** |
| 45–60s | $0.15 | $0 | $0.030 | $0.04 | $0.002 | **$0.222** |

### Monthly COGS per user (all 4 platforms, ~92 videos)
- X (15–20s × 40/month): $0.096 × 40 = $3.84
- YouTube Shorts (30–45s × 20/month): $0.177 × 20 = $3.54
- Instagram Reels (20–30s × 16/month): $0.121 × 16 = $1.94
- LinkedIn (45–60s × 16/month): $0.222 × 16 = $3.55
- **Total monthly video COGS per user: ~$12.87**

### Platform fixed costs (monthly)
| Service | Cost |
|---|---|
| NoCodeBackend Starter | $29.00 (existing subscription) |
| ElevenLabs Starter | $5.00 (commercial voice use) |
| Vercel | $0 (free tier, Pro ~$20 at 20+ users) |
| Cloudflare R2 | ~$0.05 (92 videos × 150MB, lifecycle rules active) |
| Upstash Redis | $0 (free tier covers early stage) |
| Resend | $0 (free under 3k/month) |
| PostHog | $0 (free tier) |
| Sentry | $0 (free tier) |
| Domain | $2.00 |
| **Total fixed** | **~$56/month** |

### Pricing packages with verified margins

**Solo — $39/month** (or $33/mo annual)
2 platforms, ~40 videos/month
Video COGS: ~$5.60 | Fixed share: ~$56 (1 user) → $14 (4 users)
At 4 users: Revenue $156, COGS $22 video + $56 fixed = **+$78 (50% margin)**
At 10 users: Revenue $390, COGS $56 video + $62 fixed = **+$272 (70% margin)**

**Creator — $79/month** (or $66/mo annual)
3 platforms, ~65 videos/month
Video COGS: ~$9.10 | Fixed amortises rapidly
At 4 users: Revenue $316, COGS $36 video + $56 fixed = **+$224 (71% margin)**
At 10 users: Revenue $790, COGS $91 video + $62 fixed = **+$637 (81% margin)**

**Studio — $149/month** (or $125/mo annual)
All 4 platforms, ~92 videos/month
Video COGS: ~$12.87
At 4 users: Revenue $596, COGS $51 video + $56 fixed = **+$489 (82% margin)**
At 10 users: Revenue $1,490, COGS $129 video + $62 fixed = **+$1,299 (87% margin)**

### Break-even
| Mix | Revenue | Video COGS | Fixed | **Net** |
|---|---|---|---|---|
| 1 Creator user | $79 | $9 | $56 | **+$14 ✓** |
| 3 Creator users | $237 | $27 | $58 | **+$152** |
| 5 Creator users | $395 | $45 | $62 | **+$288** |
| 5 Solo + 5 Creator | $590 | $74 | $65 | **+$451** |

**Break-even: User #1 on Creator tier.** Phase 1 economics never burn.

### Phase 2 with Avatar (after HeyGen Enterprise confirmed)
At Enterprise rates (~$1.84 COGS for 30s Avatar):
Creator + Avatar add-on: $79 + $39 = $118 revenue, ~$9 Faceless + ~$22 Avatar COGS = **72% margin**
Studio + Avatar add-on: $149 + $39 = $188 revenue, ~$13 Faceless + ~$22 Avatar COGS = **81% margin**

---

## 9. Pricing Page — Full Copy

Three packages. Outcomes language only. No credits anywhere.

### Solo — $39/month ($33/mo billed annually)
```
For builders getting started on one or two platforms.

Consistent presence. No effort.
Castly creates and schedules ~40 platform-native
videos per month across your chosen platforms.
You approve once. It runs.

· Up to 2 platforms
· ~40 videos/month, platform-optimised durations
· 1 pSEO landing page per video (indexed, schema-marked)
· Voice from ElevenLabs library (6 curated voices)
· Distribution intelligence from week 4
· 14-day free trial, no credit card required

[Start free →]
```

### Creator — $79/month ($66/mo billed annually) [Most popular]
```
For builders serious about growing across 3 channels.

Three platforms. Platform-native. One prompt per week.
Castly builds your weekly content plan — each video
in exactly the format each algorithm rewards — and
posts on schedule while you build.

Everything in Solo, plus:
· Up to 3 platforms
· ~65 videos/month
· Your cloned voice (from a 60-second recording)
· One-click weekly plan approval
· Hook variant suggestions
· Best-performing pattern insights from week 4

[Start free →]
```

### Studio — $149/month ($125/mo billed annually)
```
For builders who want maximum distribution velocity.

All four platforms. Full autopilot.
YouTube. Instagram. LinkedIn. X.
Each in the exact format its algorithm rewards.

Everything in Creator, plus:
· All 4 platforms
· ~92 videos/month
· Full autopilot scheduling (Phase 2)
· Priority rendering
· Full intelligence panel
· Avatar Mode add-on available [+$39/mo →]

[Start free →]
```

### Avatar add-on (shown with Coming Soon state in Phase 1)
```
Avatar Mode — +$39/month
[COMING SOON badge]

Your face. At scale.
8 Avatar anchor videos per month —
one per platform per week in your
face and voice. No filming.

[Join the Avatar waitlist →]
```

### Pricing FAQ
```
Q: What's included in the free trial?
A: 14 days on any plan. No credit card. Full content generation and download.
   Auto-publishing activates when you connect your platforms.

Q: What are "platform-optimised durations"?
A: YouTube Shorts performs best at 30–45s. Instagram Reels at 20–30s. LinkedIn at 45–60s.
   X at 15–20s. Castly generates every video at the right length for where it's going.
   You don't set this — Castly does.

Q: Is the content actually good?
A: That depends on what you give Castly. Every week it asks you 3 specific questions.
   Specific answers produce content that performs. Vague answers get pushed back.
   Castly will tell you when your input isn't specific enough.

Q: Can I still post manually?
A: Always. Every video is downloadable in full quality. In Phase 1, all posting is manual.
   Auto-publishing launches in Phase 2.

Q: When does Avatar Mode launch?
A: We're onboarding Avatar users in cohorts. Join the waitlist.
   We won't rush it — quality that actually represents you takes time.
```

---

## 10. Information Architecture

```
/                       Landing page
/login                  Clerk auth (magic link + Google OAuth)
/onboarding
  /onboarding/context   What are you building? Niche? Voice notes?
  /onboarding/platforms Select platforms (2, 3, or all 4)
  /onboarding/voice     Clone voice or select library voice
  /onboarding/plan      Preview first week's content plan before paying

/dashboard              Command centre
/plan                   Weekly content hub
  /plan/current         This week — approve, edit, let run
  /plan/[week-id]       Past week — performance data
/create                 One-off creation outside weekly plan
/videos                 All generated content
  /videos/[id]          Single video — player, pSEO preview, analytics, hook variants
/intelligence           Intelligence panel (unlocks after 4 weeks of data)
/settings
  /settings/profile     Name, niche, voice notes, tone
  /settings/platforms   Connect platforms, view posting schedule
  /settings/voice       Voice clone management
  /settings/billing     Stripe portal
/waitlist               Avatar Mode waitlist (public, shareable)
/p/[slug]               Public pSEO landing page (no auth required)
```

---

## 11. App UI Specification

### Layout
Left sidebar (240px, `var(--bg-surface)`, `border-right: 1px solid var(--border-subtle)`) + main content.

### Sidebar
```
[Castly wordmark]

── Navigation ──────────────────
  Dashboard
  This week →
  Content library
  Intelligence     [locked until week 4]

── Platforms ───────────────────
  YouTube Shorts   [● connected]
  Instagram Reels  [● connected]
  LinkedIn         [○ not connected]
  X / Twitter      [● connected]

── ─────────────────────────────
  Settings
  Help
```

### Dashboard main content
```
Good morning. Here's what Build In Social is doing this week.

[Week summary card — full width, elevated bg, padding 24px]
This week — 23 videos across 3 platforms
[Platform pills: YouTube 5 ✓  Instagram 4 ✓  X 10 ✓]
[Progress bar: 14/23 approved]
[Review this week →]

[2-column grid]
Left: Next 3 scheduled posts
Right: Last week's top performer (visibility score + platform + title)
```

### Weekly plan screen
```
This week · Apr 7–13              [Approve all →]  [Regenerate]

[Quality gate — always visible at top]
What happened this week?
[Q1 input]  [Q2 input]  [Q3 input]
[Save — triggers plan regeneration]

[Video cards grouped by day]

Mon, Apr 7
──────────────────────────────────────────────
[Video card]                  [Video card]
YouTube Shorts · 38s          X · 16s
"Why I rewrote..."            "The mistake..."
[▷ Preview] [Edit] [✓ Approve] [▷ Preview] [Edit] [✓ Approve]
──────────────────────────────────────────────
```

### Video card
```
┌─────────────────────────────────────────┐
│ [Platform icon]         [Duration badge] │
│ [Thumbnail / waveform preview]           │
│ [Title — 2 lines max]                   │
│ [Hook — 1 line, --text-tertiary]        │
│                                          │
│ [▷ Preview]  [Edit script]  [✓ Approve] │
└─────────────────────────────────────────┘
```
States: Draft / Approved (accent left border) / Rendering / Ready / Posted / Failed (red left border)

---

## 12. Technical Stack

```
Frontend:        Next.js 14 App Router + TypeScript (strict mode)
Design:          Custom token system (/styles/tokens.css) — NO Atlaskit
                 Radix UI primitives for accessible components
                 Geist font from Google Fonts
                 Tailwind for spacing/layout utilities only
Auth:            Clerk (free to 10k MAU)
Database/API:    NoCodeBackend (existing Starter subscription)
Job queue:       Upstash Redis + BullMQ
Storage:         Cloudflare R2 (zero egress fees, 30-day lifecycle rules)

Voice:           ElevenLabs API — Starter $5/mo (commercial use)
B-roll:          Pexels API (free tier)
Assembly:        FFmpeg WASM via Vercel Edge Function
AI/LLM:          Claude Haiku 4.5 — scripts, quality gate, labelling ($1/$5 per MTok)
                 Claude Sonnet 4.6 — pSEO articles, intelligence summaries ($3/$15 per MTok)

Email:           Resend (free under 3k/month)
Payments:        Stripe
Analytics:       PostHog (free tier)
Monitoring:      Sentry (free tier)
Hosting:         Vercel

── Phase 2 only (not in Phase 1 codebase) ──
Publishing:      Ayrshare Premium
Avatar video:    HeyGen API Pay-as-you-go → Enterprise (after ToS confirmation)
```

**Hard rule on HeyGen:** Do not install, import, or write a single HeyGen API call until written confirmation is received from HeyGen that Castly's managed services use case is permitted. This is a build-order constraint, not a suggestion.

---

## 13. Database Schema

**users**
`id · clerk_user_id · email · display_name · niche · building_description · voice_notes · content_tone · plan [solo|creator|studio] · avatar_waitlist (bool) · onboarding_complete (bool) · created_at`

**voice_profiles**
`id · user_id · elevenlabs_voice_id · type [clone|library] · library_voice_name · clone_status [pending|ready|failed] · created_at`

**platform_connections**
`id · user_id · platform [youtube|instagram|linkedin|x] · access_token · refresh_token · channel_id · channel_name · connected (bool) · connected_at · expires_at`

**content_weeks**
`id · user_id · week_start (date) · context_q1 · context_q2 · context_q3 · specificity_score (0-10) · status [draft|approved|publishing|complete] · video_count · created_at`

**videos**
`id · user_id · week_id · platform · duration_seconds · script · hook · visual_style [devlog|documentary|minimal|slide] · video_mode [faceless|avatar] · output_url · thumbnail_url · scheduled_at · published_at · download_url · topic_label · hook_type · sentiment · specificity_score · watch_time_avg · engagement_rate · ctr · traffic_from_pseo · visibility_score · platform_video_id · created_at`

**pseo_pages**
`id · user_id · video_id · title · slug · html_content · canonical_url · indexed (bool) · view_count · created_at`

**render_jobs**
`id · user_id · video_id · status [queued|rendering|complete|failed] · provider [faceless|heygen] · provider_job_id · output_url · error_message · created_at · completed_at`

**schedules** (Phase 2)
`id · user_id · video_id · platform · scheduled_at · status [pending|posted|failed] · ayrshare_post_id · caption · hashtags`

**intelligence_patterns**
`id · user_id · topic_label · hook_type · sentiment · avg_visibility_score · sample_size · updated_at`

---

## 14. API Routes

```
POST /api/onboard/context           Save context, run specificity check
POST /api/onboard/voice             Submit voice clone or select library
POST /api/onboard/platforms         Save selected platforms

POST /api/plan/generate             Generate week plan from quality gate answers
POST /api/plan/[id]/approve-all     Approve all → queue all renders
POST /api/plan/[id]/video/[v]/approve  Approve single video
POST /api/plan/[id]/video/[v]/edit  Edit script → mark for re-render

POST /api/render/faceless           Submit FFmpeg render job (deduct credit first)
POST /api/render/complete           Webhook: render done → trigger pSEO
GET  /api/render/[jobId]/status     Poll job status

POST /api/pseo/generate             Generate pSEO page (auto-triggered)

GET  /api/videos                    User's video library, paginated
GET  /api/videos/[id]               Single video + analytics
POST /api/videos/[id]/hooks         Generate 5 hook variants

GET  /api/intelligence/summary      Pattern summary for intelligence panel
POST /api/intelligence/sync         Pull platform metrics, update scores

POST /api/publish/schedule          Queue post via Ayrshare (Phase 2)
POST /api/webhooks/ayrshare         Post confirmation (Phase 2)

POST /api/billing/checkout          Stripe Checkout session
POST /api/webhooks/stripe           Stripe events → activate/deactivate plan
GET  /api/billing/portal            Stripe Customer Portal

POST /api/platforms/connect/[name]  OAuth initiation
GET  /api/platforms/callback/[name] OAuth callback
DELETE /api/platforms/[name]        Disconnect platform

POST /api/waitlist/avatar           Join Avatar waitlist
```

---

## 15. The 8-Agent System

This is how the product gets built to production quality by Claude Code. Not one session doing everything — 8 specialist agents each owning a domain, invoked in the right sequence for every feature.

### Agent architecture overview
```
You (founder — the CEO)
    │
    ▼
Claude Code main session (orchestrator)
    │
    ├── @architect         → All design decisions — runs FIRST, always
    ├── @implementer       → All production code — runs AFTER architect
    ├── @product-manager   → All copy and UX decisions
    ├── @tester            → All tests — runs AFTER implementer
    ├── @security-auditor  → All security reviews — runs on auth/payment/data
    ├── @cost-optimizer    → Monthly margin audit
    ├── @marketing-copywriter → Landing page, emails, social content
    └── @devops            → Deployment, CI/CD, infrastructure
```

### How agents are set up
All 8 agents live in `.claude/agents/` as individual Markdown files with YAML frontmatter. Claude Code reads them at session start and delegates automatically based on task type, or you invoke directly with `@agent-name`.

```
castly/
└── .claude/
    └── agents/
        ├── architect.md
        ├── implementer.md
        ├── product-manager.md
        ├── tester.md
        ├── security-auditor.md
        ├── cost-optimizer.md
        ├── marketing-copywriter.md
        └── devops.md
```

The full content of each agent file is in `castly-agents.md` in the project root. Split it into 8 individual files before starting.

### Agent model selection
| Agent | Model | Reasoning |
|---|---|---|
| architect | opus | Highest-stakes decisions, worth the cost |
| security-auditor | opus | Missed vulnerabilities cost more than Opus |
| implementer | sonnet | Production code quality over speed |
| product-manager | sonnet | Copy quality matters |
| tester | sonnet | Test logic needs real reasoning |
| marketing-copywriter | sonnet | Copy quality matters |
| devops | sonnet | Infrastructure decisions need reliability |
| cost-optimizer | haiku | The cost-checker should itself be cheap |

### Shell setup before every Claude Code session
```bash
export CLAUDE_CODE_SUBAGENT_MODEL="claude-sonnet-4-6"
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude --model claude-opus-4-6
```

### The standard build workflow for any feature
Every feature goes through this sequence. No exceptions.

```
1. @architect  → Design the feature. Failure modes. Phase scope. Handoff spec.
2. @product-manager → Review user-facing decisions. Copy. UX. Partner framing.
3. @implementer → Build from architect's spec. pnpm build must pass.
4. @tester → Write and run tests. 100% coverage on critical paths.
5. @security-auditor → Audit (auth/payment/data features only).
6. @devops → Deploy checklist before any production release.
```

### The 9-sprint Phase 1 build sequence

**Sprint 1 — Foundation (Days 1–3)**
Token system + Geist font + Radix setup + base layout shell + env.ts validation
`@architect design → @implementer build → @tester verify build passes`

**Sprint 2 — Landing Page (Days 4–6)**
Full Linear-aesthetic landing page with all copy from Section 4
`@marketing-copywriter copy → @architect structure → @implementer build → @tester lighthouse >90`

**Sprint 3 — Auth + Onboarding (Days 7–10)**
Clerk auth + 4-step onboarding + quality gate + voice clone flow
`@architect design → @implementer build → @tester E2E → @security-auditor audit`

**Sprint 4 — Content Plan Generator (Days 11–14)**
Weekly plan generation + platform duration enforcement + video card UI + approve flow
`@architect design → @implementer build → @cost-optimizer verify Haiku used → @tester test`

**Sprint 5 — Faceless Render Pipeline (Days 15–21)**
ElevenLabs + Pexels + FFmpeg + R2 + BullMQ + job status + video library
`@architect design → @implementer build → @tester critical path tests → @security-auditor → @cost-optimizer COGS check`

**Sprint 6 — pSEO Generation (Days 22–24)**
Claude Sonnet → 700-word article + JSON-LD + castly.app/p/[slug] public route
`@architect design → @implementer build → @tester schema validation → @cost-optimizer Sonnet cost check`

**Sprint 7 — Stripe Billing (Days 25–28)**
3 packages + Checkout + webhook + Customer Portal + package gate
`@architect design → @implementer build → @tester webhook idempotency → @security-auditor amount validation`

**Sprint 8 — Platform Connections + Email (Days 29–32)**
OAuth for 4 platforms + 6 Resend email templates
`@implementer build → @tester all templates → @security-auditor OAuth token storage`

**Sprint 9 — Intelligence Collection + Polish + Deploy (Days 33–38)**
Silent intelligence collection + dashboard polish + Avatar waitlist + full production deploy
`@implementer build → @cost-optimizer final audit → @security-auditor final review → @devops deploy checklist`

### Critical paths that must have 100% test coverage (tester enforces)
1. Credit deduction before render job (never double-deduct)
2. Stripe webhook idempotency (never double-activate a plan)
3. Quality gate specificity check (vague input must be rejected)
4. Platform duration enforcement (YouTube = 30–45s, always)
5. pSEO trigger on every render completion (never skipped)
6. R2 pre-signed URL generation (never permanent public URLs)
7. Voice clone consent recorded before ElevenLabs call

### The rule that governs the whole system
**Design before code. Review before ship.**
No implementer writes a line without architect sign-off.
No feature ships to production without tester and security-auditor sign-off.
This is not bureaucracy. This is how a solo founder ships a product that works.

---

## 16. CLAUDE.md (Project Context File)

```markdown
# Castly — Claude Code Project Rules

## What this is
Castly is a social media distribution partner for indie developers and SaaS founders.
One prompt per week. Platform-native content for YouTube Shorts, Instagram Reels,
LinkedIn, and X. Posts automatically. Every video generates a pSEO page.
Full spec: /PRD-v7.md — read it completely before writing any code.

## The agent system
8 specialist agents live in .claude/agents/. They are your team.
Read AGENT-WORKFLOW.md for how to use them and in what order.
Always invoke @architect before @implementer. Always invoke @tester after @implementer.

## Design rules (never break these)
1. WHITE-FIRST. --bg-page = #ffffff. Light mode is default and primary.
2. ONLY use CSS tokens from /styles/tokens.css. Never hardcode hex values anywhere.
3. Accent colour --accent = rgb(36, 36, 36) (black). Single neutral accent for all interactive states.
4. Font: Geist only. Loaded from Google Fonts. No Inter, no system fonts.
5. Radix UI primitives + custom CSS. No Atlaskit. No other component libraries.
6. Borders define separation. Shadows only for overlays and modals.
7. Match Linear.app's visual language — white surfaces, clean borders, confident typography.
8. All spacing: 4px base grid, multiples of 4 only.

## Product rules (never break these)
9. Avatar Mode is DISABLED in Phase 1.
   Show everywhere with "Coming soon" badge + waitlist CTA.
   No HeyGen API code whatsoever in Phase 1. Not even installed.
10. Faceless Mode is the entire product in Phase 1.
11. The quality gate (3 specific questions) runs before EVERY script generation.
    Never generate a script without the quality gate output. Never make it skippable.
12. Castly sets video duration based on platform. User cannot choose duration.
    Show the chosen duration in the UI with an optional override that requires a click.
13. Partner framing always. Never "generate video." Always "Castly is creating."
14. Only 4 platforms: YouTube Shorts, Instagram Reels, LinkedIn, X.
    Reddit = never. TikTok = never. In Phase 1 or any session unless told otherwise.
15. Intelligence panel hidden until user has 5+ published videos with metrics.
16. Credit deduction happens BEFORE render job submission. Refund on failure.
17. All Claude API calls: use Haiku for scripts/labelling/quality gate.
    Use Sonnet only for pSEO articles and intelligence summaries.

## Phase 1 build order — strict sequence, no skipping
1.  Token system + Geist font + Radix setup + base layout
2.  Landing page (Linear design, full copy from PRD Section 4)
3.  Clerk auth (signup, login, deletion)
4.  Onboarding (context → platforms → voice → plan preview)
5.  NoCodeBackend schema + API client
6.  Weekly plan generator with quality gate
7.  Faceless render pipeline (ElevenLabs + Pexels + FFmpeg + R2)
8.  pSEO generation (auto-triggered on render complete)
9.  Stripe billing (3 packages, outcomes language)
10. Video library + individual video page
11. Platform OAuth connections (4 platforms)
12. Resend email notifications (6 templates)
13. Intelligence data collection (silent, no UI)
14. Avatar waitlist page

## Never build in Phase 1
- HeyGen / Avatar Mode (any code at all)
- Ayrshare auto-publishing
- Intelligence panel UI
- A/B hook testing
- Any feature not in the list above
```

---

## 17. Phase Rollout

### Phase 1 — The Wedge (Weeks 1–10)
**Goal:** 10 paying users. Prove the loop works. Prove quality is high enough users see results.
**Exit criteria:** 20+ paying users OR $1,500 MRR for 60 consecutive days.

Ships (14 items only — see CLAUDE.md build order):
Landing page · Auth · Onboarding · Plan generator with quality gate · Faceless pipeline ·
pSEO auto-generation · 3 pricing packages (Stripe) · 14-day free trial · Video library ·
Platform OAuth · Email notifications · Intelligence data collection (silent) ·
Avatar waitlist

Does NOT ship:
Ayrshare · HeyGen · Intelligence panel UI · A/B testing · Auto-publishing

### Phase 2 — The Habit (Weeks 11–24)
**Exit criteria:** 20+ paying users

Ships:
Ayrshare auto-publishing (YouTube, Instagram, LinkedIn, X) ·
Scheduling calendar · Platform metric sync + visibility scores ·
Intelligence panel (after 4 weeks data) · Hook variant generator ·
Best-performing series generator · Avatar Mode (HeyGen, after ToS confirmation) ·
Avatar waitlist cohort invitations · pSEO Google Indexing API ping ·
Week-over-week performance comparison

### Phase 3 — The Intelligence (Weeks 25–44)
**Exit criteria:** $3K MRR for 2 consecutive months

Ships:
Hook A/B testing · Optimal post-time personalisation (per-user learning) ·
Algorithm health alerts · Real estate agent vertical (separate onboarding) ·
Referral system

### Phase 4 (Post $8K MRR)
Coaches/consultants vertical · Agency tier · iOS companion app

---

## 18. Pre-Launch Checklist

**Legal:**
- [ ] Privacy policy — voice biometric data, AI content disclosure, GDPR deletion
- [ ] Terms of service
- [ ] GDPR deletion endpoint (cascade to all tables + R2 files)
- [ ] AI content disclosure in all published video metadata

**Technical:**
- [ ] Full Faceless pipeline E2E tested (all 4 platforms × 4 visual styles)
- [ ] Quality gate rejects vague input (specificity_score < 5 triggers pushback)
- [ ] Duration enforcement working (test each platform)
- [ ] Stripe webhooks tested with Stripe CLI in production mode
- [ ] Clerk auth tested — signup, magic link, Google OAuth, deletion
- [ ] ElevenLabs voice clone: 60s clip → voice in output video
- [ ] FFmpeg: all 4 visual styles render correctly
- [ ] R2: upload, retrieve, 30-day lifecycle rule active
- [ ] R2: training clip auto-delete after 30 days active
- [ ] 6 Resend email templates sending correctly
- [ ] PostHog events firing: signup, onboarding_complete, plan_generated, video_rendered, billing_activated
- [ ] Sentry capturing errors with user context
- [ ] pnpm audit: no HIGH or CRITICAL vulnerabilities
- [ ] `pnpm build` passes with zero TypeScript errors

**Go-to-market:**
- [ ] castly.app live and loading fast
- [ ] Founding member offer active (first 10 users: 3 months free)
- [ ] 5 pre-sales committed before a single line of product code is written
- [ ] Founder posting on X weekly about the build (starts today, not at launch)
- [ ] HeyGen email sent — use case confirmation for Phase 2 planning
- [ ] Avatar Mode waitlist collecting from Day 1

---

## 19. Success Metrics

| Metric | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| Paying users | 10 | 50 | 200 |
| MRR | $700 | $3,500 | $15,000 |
| Gross margin (video COGS) | >85% | >80% | >78% |
| Gross margin (including fixed, 10 users) | >65% | >75% | >80% |
| Videos approved/user/week | ≥8 | ≥15 | ≥20 |
| Week 4 retention | >55% | >70% | >80% |
| Onboarding completion | >60% | >72% | >80% |
| Monthly churn | <15% | <9% | <6% |
| Free → paid conversion | >15% | >20% | >25% |
| Avatar waitlist signups | 100 | 500 | — |
| pSEO pages indexed | — | >40% | >70% |

---

## 20. What Will Kill This Product

Review this section monthly. These are the failure modes, in order of likelihood.

**1. Generic content quality (most likely failure)**
If the quality gate is soft and users post AI slop, the algorithm suppresses it, users churn, and they blame Castly. The quality gate is the product's core value. Test it aggressively with deliberately vague inputs. It must push back every time.

**2. Wrong wedge user**
If marketing attracts coaches and agents instead of indie devs in Phase 1, the product feels generic to everyone and brilliant to nobody. Every piece of Phase 1 copy, onboarding, and hook template is tuned for indie devs. Keep it that way.

**3. Building too much**
Avatar Mode, LinkedIn analytics, A/B testing, agency tier, iOS app — none of this matters until 10 users are retained and happy. The 9-sprint sequence is the build order. Nothing else gets built until it's complete.

**4. Not posting in public**
The founder's personal brand is the distribution strategy for the first 10 users. If you're not posting about the build on X weekly, the first 10 users don't exist. Start today.

**5. HeyGen dependency collapse (Phase 2)**
When Avatar Mode launches, it runs on HeyGen. Any ToS change, price increase, or API issue breaks the flagship feature. Build the VideoGenerationService abstraction layer. Have D-ID ready as fallback. This is architecture, not contingency planning.

**6. Cost drift**
At scale, ElevenLabs overage costs and Vercel compute grow. Run `@cost-optimizer` monthly. The moment blended COGS exceeds $18/user/month on Creator tier, the margin has collapsed. Fix it before it compounds.

---

*Castly PRD v7.0 — April 2026*
*This document supersedes all previous PRD versions.*
*Every decision from every conversation is in here.*
*Build from this. Nothing else.*
