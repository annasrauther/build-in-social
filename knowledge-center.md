# Build In Social — Knowledge Center
**Version:** Based on PRD v7.0 | **April 2026**
**Purpose:** Authoritative reference for Claude Code. Read this fully before writing any code.

---

## 1. Product Overview

Build In Social is a social media distribution partner for indie developers and SaaS founders. One prompt per week. It creates platform-native short-form video content for YouTube Shorts, Instagram Reels, LinkedIn, and X — correct duration, correct hook structure, correct posting time per algorithm — and posts automatically.

**The pricing frame (enforced everywhere):** Build In Social vs. a social media manager ($2,000–5,000/month). Never vs. HeyGen or any AI tool.

**What it is not:**
- Not a brand builder for people with nothing to say
- Not a replacement for genuine ideas — it distributes them
- Not a guarantee of virality

**Partner framing — enforced in all UI copy:**
```
✓ "Build In Social is preparing your week's content"
✓ "Build In Social noticed your Reels are outperforming Shorts"
✗ "Generate a video"
✗ "Create content"
✗ "Use our AI tool"
```

---

## 2. Target User

**Phase 1: Indie developers and SaaS founders only.** No other persona.

Why:
- Ship constantly — genuine daily content exists
- Already on X and YouTube — no platform education needed
- High word-of-mouth potential within builder community
- Content naturally fits short-form: feature drops, dev logs, mistake stories, roadmap teases
- Tolerate early-stage roughness, give honest feedback

**Phase 2 expansion:** Real estate agents (high WTP, proven video ROI)
**Phase 3 expansion:** Coaches, consultants, course creators

---

## 3. Product Rules — Never Break These

1. Avatar Mode is **DISABLED** in Phase 1. Show everywhere with "Coming soon" badge + waitlist CTA. No HeyGen API code — not even installed.
2. Faceless Mode is the **entire product** in Phase 1.
3. The quality gate (3 specific questions) runs **before every script generation**. Never generate a script without quality gate output. Never make it skippable.
4. Build In Social sets video duration based on platform. **User cannot choose duration.** Show the chosen duration with an optional override that requires a click.
5. Partner framing always. Never "generate video." Always "Build In Social is creating."
6. Only 4 platforms: YouTube Shorts, Instagram Reels, LinkedIn, X. Reddit = never. TikTok = never.
7. Intelligence panel is **hidden** until user has 5+ published videos with metrics.
8. Credit deduction happens **before** render job submission. Refund on failure.
9. All Claude API calls: use **Haiku** for scripts, labelling, quality gate. Use **Sonnet** only for pSEO articles and intelligence summaries.
10. Do not install, import, or write a single HeyGen API call until written confirmation is received from HeyGen that Build In Social's managed services use case is permitted.

---

## 4. Platforms & Content Architecture

**Fixed 4 platforms. Reddit and TikTok are permanently excluded from Phase 1.**

| Platform | Frequency | Duration | Key Algorithm Signal | Mode |
|---|---|---|---|---|
| YouTube Shorts | 5x/week | 30–45s | Watch-through rate, replay rate, swipe-away rate | Faceless (4x) + Avatar anchor (1x — Phase 2) |
| Instagram Reels | 4x/week | 20–30s | Sends-per-reach (DM shares), save rate | Faceless (3x) + Avatar anchor (1x — Phase 2) |
| LinkedIn | 4x/week | 45–60s | Dwell time, comments in first 60 minutes | Faceless (3x) + Avatar anchor (1x — Phase 2) |
| X / Twitter | 10x/week | 15–20s | Engagement velocity in first hour | Faceless only (no Avatar on X, ever) |

**Total per week (all 4 platforms):** 23 videos
**Total per month:** ~92 videos
**Blended average duration:** ~28 seconds

### Posting Time Intelligence (baked in — users never configure this)

| Platform | Best Days | Best Times (IST) |
|---|---|---|
| YouTube Shorts | Fri, Sat, Sun | 7:30pm – 11:30pm |
| Instagram Reels | Tue, Wed, Thu | 6:30pm – 9:30pm |
| LinkedIn | Wed, Thu, Fri | 6:30pm – 9:30pm |
| X / Twitter | Mon–Fri | 1:30pm – 3pm and 8:30pm – 10pm |

### Anchor + Fill Model

**Fill content (Phase 1 — all content):**
- Short, punchy, platform-native faceless videos
- Generated from the weekly quality gate context
- Build In Social picks optimal posting time automatically

**Anchor videos (Phase 2 only — Avatar Mode):**
- Personal face + cloned voice
- Longer, story-driven, trust-building
- 1 per platform per week (YouTube, Instagram, LinkedIn — not X)
- ~3 Anchor videos/week = ~12/month

---

## 5. Quality Gate

The quality gate is the product's core moat. It runs every single week before script generation — not once at onboarding.

**3 required questions (all text inputs, max 280 chars each, all required):**
1. What did you ship, learn, or decide? *(Be specific. "Launched Stripe billing" not "worked on my app.")*
2. What surprised you about it?
3. Who needs to hear this, and why does it matter to them?

**Specificity scoring:** Claude Haiku evaluates specificity on a 0–10 scale.
- Score ≥ 5: proceed to script generation
- Score < 5: push back with this message:
  > "This is a bit general — one specific detail makes the content 10× better. What exactly did you launch? What number surprised you? Even one sentence changes everything."

**Rule:** Never generate a script without quality gate output. Never make the quality gate skippable. Generic prompts produce generic content. Generic content gets algorithm-suppressed. Suppression = churn.

---

## 6. Faceless Mode — Visual Styles

User selects one visual style at onboarding. Cannot change per video (only in settings).

| Style | Description | Best For |
|---|---|---|
| **Dev Log** | Screen recording aesthetic, code visible in background, terminal-style captions, minimal text overlay | Tutorials, feature drops, debugging stories |
| **Documentary** | Pexels B-roll footage matched to script keywords, text captions synced to voice | Opinion pieces, industry takes, lessons learned |
| **Minimal Text** | Large animated typography on clean background, voiceover only, no footage | Hot takes, X-native content, stat-driven posts |
| **Slide** | Product screenshots, data, diagrams with voice narration | LinkedIn, product launches, feature announcements |

---

## 7. Avatar Mode (Phase 2 — Shown but Disabled in Phase 1)

**How it appears in Phase 1 UI:**
- "Coming soon" badge next to the feature name
- Description: "Your AI clone. Record once. Post your face on every platform every week without filming."
- Messaging: "We're onboarding Avatar users in cohorts to ensure quality that actually represents you."
- CTA: "Join the waitlist"

**Avatar Mode spec for Phase 2:**
- Training: 2-minute clip → HeyGen Avatar IV → clone ready in 15–45 minutes
- Output: 1080p, full Avatar IV with natural gestures, micro-expressions, accurate lip sync
- Duration: 30–60s (Anchor content only — never daily fill)
- Platforms: YouTube, Instagram, LinkedIn (never X)
- Frequency: 1 Avatar/platform/week = 3 Avatar videos/week

**Avatar Mode pricing (Phase 2 only):**
- Add-on: +$39/month for 8 Avatar videos/month
- Additional Avatar: $4.50/video

**Hard rule on Avatar:** Do not launch until HeyGen Enterprise pricing is confirmed in writing. At pay-as-you-go rates ($3.04/video COGS for 30s): 37% margin. At Enterprise rates (~$1.84/video COGS): 62% margin. Enterprise rates are required for scale.

---

## 8. pSEO

Every video automatically triggers a pSEO page on render completion. This is never optional, never skippable.

- **Model:** Claude Sonnet (never Haiku)
- **Output:** 700-word article + JSON-LD schema markup
- **Route:** `buildinsocial.com/p/[slug]` (public, no auth required)
- **Trigger:** Auto-triggered on render complete webhook
- **Phase 2 addition:** Google Indexing API ping after generation

---

## 9. Pricing

### Plans

| Plan | Monthly | Annual (per mo) | Platforms | Videos/month |
|---|---|---|---|---|
| Solo | $39 | $33 | Up to 2 | ~40 |
| Creator | $79 | $66 | Up to 3 | ~65 |
| Studio | $149 | $125 | All 4 | ~92 |

14-day free trial on all plans. No credit card required.

### Unit Economics — Video COGS per Duration

| Duration | ElevenLabs | Pexels | FFmpeg | Claude | R2 | **Total COGS** |
|---|---|---|---|---|---|---|
| 15–20s (X) | $0.04 | $0 | $0.015 | $0.04 | $0.001 | **$0.096** |
| 20–30s (Instagram) | $0.06 | $0 | $0.020 | $0.04 | $0.001 | **$0.121** |
| 30–45s (YouTube) | $0.11 | $0 | $0.025 | $0.04 | $0.002 | **$0.177** |
| 45–60s (LinkedIn) | $0.15 | $0 | $0.030 | $0.04 | $0.002 | **$0.222** |

### Monthly Video COGS per User (all 4 platforms, ~92 videos)

| Platform | Count/month | Unit COGS | Subtotal |
|---|---|---|---|
| X (15–20s) | 40 | $0.096 | $3.84 |
| YouTube (30–45s) | 20 | $0.177 | $3.54 |
| Instagram (20–30s) | 16 | $0.121 | $1.94 |
| LinkedIn (45–60s) | 16 | $0.222 | $3.55 |
| **Total** | **92** | | **~$12.87** |

### Fixed Platform Costs (monthly)

| Service | Cost |
|---|---|
| NoCodeBackend Starter | $29.00 |
| ElevenLabs Starter | $5.00 |
| Vercel | $0 (free; ~$20 at 20+ users) |
| Cloudflare R2 | ~$0.05 |
| Upstash Redis | $0 (free tier) |
| Resend | $0 (free under 3k/month) |
| PostHog | $0 (free tier) |
| Sentry | $0 (free tier) |
| Domain | $2.00 |
| **Total fixed** | **~$56/month** |

### Margins at Scale

| Plan | Revenue (10 users) | Video COGS | Fixed | Net | Margin |
|---|---|---|---|---|---|
| Solo | $390 | $56 | $62 | $272 | ~70% |
| Creator | $790 | $91 | $62 | $637 | ~81% |
| Studio | $1,490 | $129 | $62 | $1,299 | ~87% |

**Break-even: User #1 on Creator tier.** Phase 1 economics never burn.

**Cost alert:** If blended COGS exceeds $18/user/month on Creator tier, margin has collapsed. Run `@cost-optimizer` monthly.

---

## 10. Tech Stack

| Service | Purpose | Notes |
|---|---|---|
| Next.js 14 App Router + TypeScript (strict) | Frontend framework | |
| Tailwind CSS v3 | Styling | |
| Tremor Raw (Tailwind + Radix) | Component library | Design system source of truth |
| Geist font | Typography | Via `geist` package |
| Clerk | Auth | Magic link + Google OAuth. Free to 10k MAU |
| NoCodeBackend | Database + API layer | Existing Starter subscription |
| Upstash Redis + BullMQ | Render job queue | |
| Cloudflare R2 | Video storage | Zero egress fees. 30-day lifecycle rules active. Pre-signed URLs only — never permanent public URLs |
| ElevenLabs | Voice generation + cloning | Starter $5/mo for commercial use |
| Pexels API | B-roll footage | Free tier |
| FFmpeg WASM | Video assembly | Via Vercel Edge Function |
| Claude Haiku 4.5 | Scripts, quality gate scoring, topic labelling | $1/$5 per MTok |
| Claude Sonnet 4.6 | pSEO articles, intelligence summaries | $3/$15 per MTok |
| Resend | Email notifications | Free under 3k/month |
| Stripe | Payments | Checkout + webhooks + Customer Portal |
| PostHog | Product analytics | Free tier |
| Sentry | Error monitoring | Free tier. Always include user context |
| Vercel | Hosting | |
| **Ayrshare** *(Phase 2 only)* | Auto-publishing to all 4 platforms | Do not install in Phase 1 |
| **HeyGen** *(Phase 2 only)* | Avatar video generation | Do not install until ToS confirmed in writing |

---

## 11. Database Schema

### users
```
id · clerk_user_id · email · display_name · niche · building_description
· voice_notes · content_tone · plan [solo|creator|studio]
· avatar_waitlist (bool) · onboarding_complete (bool) · created_at
```

### voice_profiles
```
id · user_id · elevenlabs_voice_id · type [clone|library]
· library_voice_name · clone_status [pending|ready|failed] · created_at
```

### platform_connections
```
id · user_id · platform [youtube|instagram|linkedin|x]
· access_token · refresh_token · channel_id · channel_name
· connected (bool) · connected_at · expires_at
```

### content_weeks
```
id · user_id · week_start (date) · context_q1 · context_q2 · context_q3
· specificity_score (0–10) · status [draft|approved|publishing|complete]
· video_count · created_at
```

### videos
```
id · user_id · week_id · platform · duration_seconds · script · hook
· visual_style [devlog|documentary|minimal|slide] · video_mode [faceless|avatar]
· output_url · thumbnail_url · scheduled_at · published_at · download_url
· topic_label · hook_type · sentiment · specificity_score
· watch_time_avg · engagement_rate · ctr · traffic_from_pseo
· visibility_score · platform_video_id · created_at
```

### pseo_pages
```
id · user_id · video_id · title · slug · html_content
· canonical_url · indexed (bool) · view_count · created_at
```

### render_jobs
```
id · user_id · video_id · status [queued|rendering|complete|failed]
· provider [faceless|heygen] · provider_job_id · output_url
· error_message · created_at · completed_at
```

### schedules *(Phase 2)*
```
id · user_id · video_id · platform · scheduled_at
· status [pending|posted|failed] · ayrshare_post_id · caption · hashtags
```

### intelligence_patterns
```
id · user_id · topic_label · hook_type · sentiment
· avg_visibility_score · sample_size · updated_at
```

---

## 12. API Routes

```
# Onboarding
POST /api/onboard/context           Save context, run specificity check
POST /api/onboard/voice             Submit voice clone or select library voice
POST /api/onboard/platforms         Save selected platforms

# Weekly Plan
POST /api/plan/generate             Generate week plan from quality gate answers
POST /api/plan/[id]/approve-all     Approve all → queue all renders
POST /api/plan/[id]/video/[v]/approve  Approve single video
POST /api/plan/[id]/video/[v]/edit  Edit script → mark for re-render

# Render Pipeline
POST /api/render/faceless           Submit FFmpeg render job (deduct credit first)
POST /api/render/complete           Webhook: render done → trigger pSEO
GET  /api/render/[jobId]/status     Poll job status

# pSEO
POST /api/pseo/generate             Generate pSEO page (auto-triggered on render complete)

# Video Library
GET  /api/videos                    User's video library, paginated
GET  /api/videos/[id]               Single video + analytics
POST /api/videos/[id]/hooks         Generate 5 hook variants

# Intelligence
GET  /api/intelligence/summary      Pattern summary for intelligence panel
POST /api/intelligence/sync         Pull platform metrics, update visibility scores

# Publishing (Phase 2)
POST /api/publish/schedule          Queue post via Ayrshare
POST /api/webhooks/ayrshare         Post confirmation

# Billing
POST /api/billing/checkout          Stripe Checkout session
POST /api/webhooks/stripe           Stripe events → activate/deactivate plan
GET  /api/billing/portal            Stripe Customer Portal

# Platform OAuth
POST /api/platforms/connect/[name]  OAuth initiation
GET  /api/platforms/callback/[name] OAuth callback
DELETE /api/platforms/[name]        Disconnect platform

# Avatar
POST /api/waitlist/avatar           Join Avatar waitlist
```

---

## 13. Information Architecture

```
/                           Landing page
/login                      Clerk auth (magic link + Google OAuth)
/onboarding
  /onboarding/context       What are you building? Niche? Voice notes?
  /onboarding/platforms     Select platforms (2, 3, or all 4)
  /onboarding/voice         Clone voice or select library voice
  /onboarding/plan          Preview first week's content plan before paying

/dashboard                  Command centre
/plan                       Weekly content hub
  /plan/current             This week — approve, edit, let run
  /plan/[week-id]           Past week — performance data
/create                     One-off creation outside weekly plan
/videos                     All generated content
  /videos/[id]              Single video — player, pSEO preview, analytics, hook variants
/intelligence               Intelligence panel (unlocks after 4 weeks of data)
/settings
  /settings/profile         Name, niche, voice notes, tone
  /settings/platforms       Connect platforms, view posting schedule
  /settings/voice           Voice clone management
  /settings/billing         Stripe portal
/waitlist                   Avatar Mode waitlist (public, shareable)
/p/[slug]                   Public pSEO landing page (no auth required)
```

---

## 14. Critical Paths — 100% Test Coverage Required

These paths must never have bugs. Tester agent enforces full coverage on all of them.

1. **Credit deduction before render job** — deduct before submission, refund on failure, never double-deduct
2. **Stripe webhook idempotency** — never double-activate a plan
3. **Quality gate specificity check** — vague input (score < 5) must be rejected every time
4. **Platform duration enforcement** — YouTube = 30–45s always, Instagram = 20–30s, LinkedIn = 45–60s, X = 15–20s
5. **pSEO trigger on every render completion** — never skipped
6. **R2 pre-signed URL generation** — never permanent public URLs
7. **Voice clone consent recorded before ElevenLabs call**

---

## 15. Agent System

8 specialist agents live in `.claude/agents/`. Claude Code reads them at session start and delegates automatically, or invoke directly with `@agent-name`.

```
.claude/agents/
  ├── architect.md
  ├── implementer.md
  ├── product-manager.md
  ├── tester.md
  ├── security-auditor.md
  ├── cost-optimizer.md
  ├── marketing-copywriter.md
  └── devops.md
```

### Agent Responsibilities & Models

| Agent | Model | Responsibility |
|---|---|---|
| `@architect` | Opus | All design decisions. Runs FIRST, always. Failure modes. Phase scope. |
| `@security-auditor` | Opus | All security reviews. Runs on auth, payment, and data features. |
| `@implementer` | Sonnet | All production code. Runs after architect. `pnpm build` must pass. |
| `@product-manager` | Sonnet | All copy and UX decisions. Partner framing review. |
| `@tester` | Sonnet | All tests. Runs after implementer. 100% coverage on critical paths. |
| `@marketing-copywriter` | Sonnet | Landing page, email templates, social content. |
| `@devops` | Sonnet | Deployment, CI/CD, infrastructure. Runs before every production release. |
| `@cost-optimizer` | Haiku | Monthly margin audit. COGS checks on any render pipeline change. |

### Shell Setup Before Every Claude Code Session

```bash
export CLAUDE_CODE_SUBAGENT_MODEL="claude-sonnet-4-6"
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude --model claude-opus-4-6
```

### Standard Build Workflow for Any Feature

```
1. @architect        → Design the feature. Failure modes. Phase scope. Handoff spec.
2. @product-manager  → Review user-facing decisions. Copy. UX. Partner framing.
3. @implementer      → Build from architect's spec. pnpm build must pass.
4. @tester           → Write and run tests. 100% coverage on critical paths.
5. @security-auditor → Audit (auth/payment/data features only).
6. @devops           → Deploy checklist before any production release.
```

**Rule: Design before code. Review before ship. No implementer writes a line without architect sign-off. No feature ships without tester sign-off.**

---

## 16. Phase 1 Build Order — Strict Sequence, No Skipping

| Sprint | Days | What Ships | Agents |
|---|---|---|---|
| 1 — Foundation | 1–3 | Token system + Geist font + Tremor Raw setup + base layout + env.ts validation | `@architect` → `@implementer` → `@tester` |
| 2 — Landing Page | 4–6 | Full landing page (all copy from PRD Section 4) | `@marketing-copywriter` → `@architect` → `@implementer` → `@tester` (Lighthouse >90) |
| 3 — Auth + Onboarding | 7–10 | Clerk auth + 4-step onboarding + quality gate + voice clone flow | `@architect` → `@implementer` → `@tester` E2E → `@security-auditor` |
| 4 — Plan Generator | 11–14 | Weekly plan generation + duration enforcement + video card UI + approve flow | `@architect` → `@implementer` → `@cost-optimizer` (verify Haiku) → `@tester` |
| 5 — Render Pipeline | 15–21 | ElevenLabs + Pexels + FFmpeg + R2 + BullMQ + job status + video library | `@architect` → `@implementer` → `@tester` → `@security-auditor` → `@cost-optimizer` COGS check |
| 6 — pSEO | 22–24 | Claude Sonnet → 700-word article + JSON-LD + `/p/[slug]` public route | `@architect` → `@implementer` → `@tester` schema validation → `@cost-optimizer` |
| 7 — Stripe Billing | 25–28 | 3 packages + Checkout + webhook + Customer Portal + plan gate | `@architect` → `@implementer` → `@tester` webhook idempotency → `@security-auditor` |
| 8 — Platforms + Email | 29–32 | OAuth for 4 platforms + 6 Resend email templates | `@implementer` → `@tester` → `@security-auditor` OAuth token storage |
| 9 — Polish + Deploy | 33–38 | Silent intelligence collection + dashboard polish + Avatar waitlist + production deploy | `@implementer` → `@cost-optimizer` → `@security-auditor` → `@devops` |

### Never Build in Phase 1
- HeyGen / Avatar Mode (any code at all)
- Ayrshare auto-publishing
- Intelligence panel UI
- A/B hook testing
- Any feature not in the sprint list above

---

## 17. Phase Roadmap

### Phase 1 — The Wedge (Weeks 1–10)
**Goal:** 10 paying users. Prove the content loop works and quality is high enough to drive results.
**Exit criteria:** 20+ paying users OR $1,500 MRR for 60 consecutive days.

Ships: Landing page · Auth · Onboarding · Plan generator with quality gate · Faceless pipeline · pSEO auto-generation · 3 pricing packages (Stripe) · 14-day free trial · Video library · Platform OAuth · Email notifications · Intelligence data collection (silent) · Avatar waitlist

Does NOT ship: Ayrshare · HeyGen · Intelligence panel UI · A/B testing · Auto-publishing

### Phase 2 — The Habit (Weeks 11–24)
**Goal:** Build retention habits and unlock automation.
**Exit criteria:** 20+ paying users.

Ships: Ayrshare auto-publishing (all 4 platforms) · Scheduling calendar · Platform metric sync + visibility scores · Intelligence panel (after 4 weeks data) · Hook variant generator · Best-performing series generator · Avatar Mode (after HeyGen ToS confirmation) · Avatar waitlist cohort invitations · pSEO Google Indexing API ping · Week-over-week performance comparison

### Phase 3 — The Intelligence (Weeks 25–44)
**Goal:** Deepen personalisation, begin vertical expansion.
**Exit criteria:** $3,000 MRR for 2 consecutive months.

Ships: Hook A/B testing · Optimal post-time personalisation (per-user learning) · Algorithm health alerts · Real estate agent vertical (separate onboarding) · Referral system

### Phase 4 (Post $8K MRR)
Coaches/consultants vertical · Agency tier · iOS companion app

---

## 18. Success Metrics

| Metric | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| Paying users | 10 | 50 | 200 |
| MRR | $700 | $3,500 | $15,000 |
| Gross margin (video COGS) | >85% | >80% | >78% |
| Gross margin (incl. fixed, 10 users) | >65% | >75% | >80% |
| Videos approved/user/week | ≥8 | ≥15 | ≥20 |
| Week 4 retention | >55% | >70% | >80% |
| Onboarding completion | >60% | >72% | >80% |
| Monthly churn | <15% | <9% | <6% |
| Free → paid conversion | >15% | >20% | >25% |
| Avatar waitlist signups | 100 | 500 | — |
| pSEO pages indexed | — | >40% | >70% |

---

## 19. Failure Modes (Review Monthly)

1. **Generic content quality** — If the quality gate is soft and users post AI slop, the algorithm suppresses it, users churn. Test the quality gate aggressively with deliberately vague inputs. It must push back every time.
2. **Wrong wedge user** — If marketing attracts coaches or agents in Phase 1, the product feels generic. Keep all Phase 1 copy, onboarding, and hook templates tuned for indie devs.
3. **Building too much** — Avatar Mode, analytics, A/B testing, agency tier — none of it matters until 10 users are retained. Follow the 9-sprint sequence.
4. **Not posting in public** — The founder's personal brand is the Phase 1 distribution strategy. Post about the build on X weekly. Start now.
5. **HeyGen dependency collapse (Phase 2)** — Build the `VideoGenerationService` abstraction layer. Have D-ID ready as fallback. This is architecture, not contingency.
6. **Cost drift** — Run `@cost-optimizer` monthly. If blended COGS exceeds $18/user/month on Creator tier, fix it immediately.

---

## 20. Pre-Launch Checklist

### Legal
- [ ] Privacy policy — voice biometric data, AI content disclosure, GDPR deletion
- [ ] Terms of service
- [ ] GDPR deletion endpoint (cascade to all tables + R2 files)
- [ ] AI content disclosure in all published video metadata

### Technical
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
- [ ] PostHog events firing: `signup`, `onboarding_complete`, `plan_generated`, `video_rendered`, `billing_activated`
- [ ] Sentry capturing errors with user context
- [ ] `pnpm audit`: no HIGH or CRITICAL vulnerabilities
- [ ] `pnpm build` passes with zero TypeScript errors

### Go-to-Market
- [ ] buildinsocial.com live and loading fast
- [ ] Founding member offer active (first 10 users: 3 months free)
- [ ] 5 pre-sales committed before product code is written
- [ ] Founder posting on X weekly about the build
- [ ] HeyGen email sent — use case confirmation for Phase 2 planning
- [ ] Avatar Mode waitlist collecting from Day 1

---

*Build In Social — Knowledge Center | Based on PRD v7.0, April 2026*
*This document supersedes all previous versions. Build from this. Nothing else.*
