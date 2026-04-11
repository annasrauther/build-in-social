# Build In Social — Agent Workflow Guide
# How to use the 8-agent system to ship a production SaaS product
# Read this BEFORE starting any build session.

---

## What this system is

Build In Social's `.claude/agents/` directory contains 8 specialist agents. Each is a Markdown file
with YAML frontmatter that Claude Code reads at session start. They are your team.

You (the founder) are the CEO. Claude Code's main session is the team lead. The 8 agents
are your specialists — each owns a specific domain and cannot be overridden by another.

```
You (founder)
    │
    ▼
Claude Code (orchestrator / team lead)
    │
    ├── @architect         → All design decisions
    ├── @implementer       → All production code
    ├── @product-manager   → All copy and product decisions
    ├── @tester            → All tests and QA
    ├── @security-auditor  → All security reviews
    ├── @cost-optimizer    → All cost and margin checks
    ├── @marketing-copywriter → All external-facing content
    └── @devops            → All deployment and infrastructure
```

---

## The golden rule of this system

**Design before you code. Review before you ship.**

No agent writes production code without architect approval.
No code ships to production without tester and security-auditor sign-off.
This is not bureaucracy — this is how you ship a product that works.

---

## The standard build workflow for any feature

### Step 1 — Architect designs it
```
@architect Design the [feature name] based on PRD-v7.md section [X].
Consider: [any specific constraints or questions].
Output: design decision, failure modes, Phase 1 scope, implementation spec.
```

### Step 2 — Product manager reviews user-facing decisions
```
@product-manager Review the architect's design for [feature].
Check: does this match the partner framing? Is the copy in scope for Phase 1?
Any UX decisions that need clarification?
```

### Step 3 — Implementer builds it
```
@implementer Implement [feature] using this spec: [paste architect output].
Follow all standards in your system prompt.
Run pnpm build and pnpm lint before reporting done.
```

### Step 4 — Tester verifies it
```
@tester Write and run tests for [feature just built].
Check the critical paths in your system prompt. Report pass/fail and coverage.
```

### Step 5 — Security auditor reviews it (for auth/payment/data features)
```
@security-auditor Audit [feature] for security vulnerabilities.
Focus areas: [auth / payment / data exposure / input validation — pick relevant].
Report all findings with severity and fix.
```

### Step 6 — Deploy
```
@devops Run the production deploy checklist for this release.
Confirm all environment variables present. Check Stripe webhooks. Report ready/not-ready.
```

---

## The Phase 1 build sequence (in order)

Run these in strict sequence. Each block is a sprint.

### Sprint 1 — Foundation (Days 1–3)
**Goal:** Running skeleton. Design tokens live. Can see something in a browser.

```bash
# Start a new Claude Code session, then:

@architect Design the Next.js 16 project structure for Build In Social.
Token system, Geist font loading, Radix UI setup, Tailwind config (layout only),
base layout component (sidebar + main content), env.ts validation file.
Reference PRD-v7.md Section 11 for the tech stack.

# After architect responds:

@implementer Set up the project foundation:
1. Install all dependencies from PRD-v7.md Section 11
2. Create /styles/tokens.css with the full token system from PRD-v7.md Section 3
3. Set up Geist font in layout.tsx
4. Create the base app layout shell (sidebar + main) — placeholder content only
5. Create env.ts that validates all environment variables on startup
6. Set up Radix UI with our token system
pnpm build must pass. pnpm lint must pass.
```

### Sprint 2 — Landing Page (Days 4–6)
**Goal:** buildinsocial.com exists and converts.

```bash
@marketing-copywriter Write the complete landing page copy based on PRD-v7.md Section 4.
Produce: nav copy, hero section, how it works (3 steps), platform cards (4 platforms),
pSEO section, pricing section (3 packages), FAQ (6 questions).
Follow all brand voice rules in your system prompt.

# After copy is ready:

@architect Design the landing page component structure.
Sections: Nav, Hero, HowItWorks, PlatformCards, pSEOSection, Pricing, FAQ, Footer.
Which are server components vs client? Any animations needed?

@implementer Build the landing page at /app/page.tsx.
Use the copy from marketing-copywriter and structure from architect.
Match Linear.app's design language EXACTLY — white background, Geist font,
borders not shadows, violet accent sparingly. Product screenshot in hero.
All 4 platform cards. 3 pricing packages with outcomes language (no credits).
Avatar Mode add-on card shows "Coming soon" badge.

@tester Check the landing page:
- All links work (no 404s)
- Responsive layout works at 375px, 768px, 1280px, 1440px
- All copy matches approved version
- No console errors
- Lighthouse score >90 on mobile

@security-auditor Quick check: no sensitive data in page source, no API keys in bundle.
```

### Sprint 3 — Auth and Onboarding (Days 7–10)
**Goal:** User can sign up and complete onboarding.

```bash
@architect Design the onboarding flow:
4 steps: context → platforms → voice → plan preview
How does state persist across steps? What gets saved to NoCodeBackend at each step?
How does the quality gate work in step 1?
How does the voice clone async flow work (submit → pending → email when ready)?

@implementer Build Clerk auth integration and the 4-step onboarding:
Step 1: 3 quality gate questions + niche + voice notes
Step 2: Platform selection (4 platforms, multi-select)
Step 3: Voice clone upload OR library voice selection (6 options with audio preview)
Step 4: "Your first plan is generating..." loading state

Connect to NoCodeBackend: users table, voice_profiles table, platform_connections.

@product-manager Review the onboarding UX:
Does the quality gate pushback feel right for vague input?
Does the partner framing show throughout?
Is the Avatar Mode "Coming soon" shown at appropriate moments?

@tester Test the complete onboarding flow:
- Signup → step 1 → step 2 → step 3 → step 4 works end-to-end
- Vague quality gate input triggers pushback (specificity_score < 5)
- Platform selection stores correctly
- Voice clone submission creates pending record in DB
- Refreshing mid-onboarding resumes at correct step

@security-auditor Audit the onboarding:
- Voice biometric consent recorded before ElevenLabs call
- User can only see their own onboarding data
- Clerk session validated on every step API call
```

### Sprint 4 — Content Plan Generator (Days 11–14)
**Goal:** User can generate and see their weekly content plan.

```bash
@architect Design the weekly plan generator:
Input: 3 quality gate answers + user context + platform selections
Processing: Claude Haiku → 23 video scripts (4 platforms, correct durations)
Output structure: grouped by day, platform, duration
How does regeneration work? What happens when user edits a single script?
Duration table: YouTube 30-45s, Instagram 20-30s, LinkedIn 45-60s, X 15-20s.

@implementer Build:
1. POST /api/plan/generate — Claude Haiku call, enforce platform durations
2. Weekly plan UI at /plan/current — grouped by day, video cards
3. Video card component: platform, duration badge, title, hook preview, approve button
4. Single video edit modal: script editor, regenerate this one button
5. "Approve all" button → queues all renders

@cost-optimizer Review the plan generator:
- Confirm Claude Haiku (not Sonnet) is used for script generation
- Estimate tokens per plan generation (23 videos × avg script length)
- What's the cost per plan generation? Should be under $0.05.

@tester Test the plan generator:
- 23 videos generated for all 4 platforms
- Durations match platform rules (YouTube never under 25s or over 50s, etc.)
- Quality gate with vague input produces pushback, not a plan
- Edit single script works and updates DB
- Approve all queues render jobs for each video

@security-auditor:
- User can only generate plans for their own account
- Plan generation validates the user's current plan tier
```

### Sprint 5 — Faceless Render Pipeline (Days 15–21)
**Goal:** Videos actually render and are downloadable.

```bash
@architect Design the Faceless render pipeline:
Components: ElevenLabs TTS → Pexels B-roll fetch → FFmpeg assembly → R2 upload
Async job flow: job created → Upstash queue → worker processes → webhook → pSEO trigger
Error handling: ElevenLabs failure? Pexels API down? FFmpeg timeout?
Credit deduction timing: BEFORE job submission, refund on failure.
How does the pre-signed R2 URL work for the download button?

@implementer Build the complete Faceless pipeline:
1. ElevenLabs TTS integration (voice clone if ready, library voice fallback)
2. Pexels API B-roll fetching (keyword extraction from script)
3. FFmpeg WASM assembly (voiceover + B-roll + animated captions)
4. Cloudflare R2 upload with pre-signed download URL
5. BullMQ job queue setup with Upstash
6. POST /api/render/faceless — credit deduct → job submit → return job ID
7. POST /api/render/complete webhook — update job status → trigger pSEO
8. GET /api/render/[jobId]/status — poll for progress
9. Video library page at /videos — grid of video cards with status
10. Individual video page at /videos/[id] — player + download button

@tester Test the complete render pipeline:
- Credit deducted before job starts
- Job status updates: queued → rendering → complete
- Download URL works and returns the actual video file
- Failed render: credit refunded, job status = failed, retry button shows
- Video player works in Chrome and Safari
- pSEO page generated after every successful render (check /p/[slug] exists)

@cost-optimizer Audit the pipeline:
- ElevenLabs characters per video: is it within estimates?
- FFmpeg Vercel compute time: any timeout risks?
- R2 storage accumulating correctly?
- Estimate blended COGS for 65-video Creator month

@security-auditor Audit the pipeline:
- R2 URLs are pre-signed and time-limited (not permanent public)
- ElevenLabs API key only server-side
- Credit deduction is atomic (cannot be double-deducted)
- Webhook validates it's actually from our job queue (not spoofed)
```

### Sprint 6 — pSEO Generation (Days 22–24)
```bash
@architect Design the pSEO pipeline:
Trigger: render complete webhook
Input: script, platform, user context
Claude Sonnet call → 700-word article + FAQ + VideoObject JSON-LD + OG tags
Storage: NoCodeBackend pseo_pages table + standalone HTML file in R2
Hosting: buildinsocial.com/p/[slug] — Next.js dynamic route, reads from R2

@implementer Build:
1. POST /api/pseo/generate — Claude Sonnet call, HTML generation
2. /app/p/[slug]/page.tsx — public pSEO page with VideoObject schema
3. pSEO page preview in /videos/[id] right panel (iframe)
4. "Copy link" button for buildinsocial.com/p/[slug]

@tester:
- pSEO page generates after every render
- VideoObject JSON-LD validates at schema.org/validator
- Page is publicly accessible without auth
- OG tags render correctly (use opengraph.xyz to check)

@cost-optimizer:
- Claude Sonnet cost per pSEO page (~$0.03–0.05): verify
- R2 storage for HTML files: ~50KB each, calculate monthly at scale
```

### Sprint 7 — Stripe Billing (Days 25–28)
```bash
@architect Design the billing system:
3 packages (Solo $39, Creator $79, Studio $149)
Stripe Checkout for initial purchase
Stripe Customer Portal for management
Webhook events: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
No credit system in UI — package activation on successful payment

@implementer Build:
1. POST /api/billing/checkout — create Stripe Checkout session
2. POST /api/webhooks/stripe — handle payment events, activate package
3. GET /api/billing/portal — Stripe Customer Portal redirect
4. Pricing page with 3 package cards + Avatar add-on (coming soon)
5. Package gate middleware — prevent video generation if no active package

@tester:
- Test Stripe webhook with Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe
- Test each package activation
- Test failed payment → package deactivated
- Test free trial period (14 days, no CC)
- Verify idempotency: replay same webhook event → no double-activation

@security-auditor:
- Stripe webhook signature verified before processing
- Package amount validated server-side (not from client payload)
- User can only access billing for their own account
- Stripe secret key only server-side
```

### Sprint 8 — Platform Connections and Email (Days 29–32)
```bash
@implementer Build:
1. OAuth flow for YouTube, Instagram, LinkedIn, X (for future scheduling)
2. /settings/platforms — connection status, connect/disconnect
3. Resend email templates:
   - welcome.tsx — "Build In Social is ready. Here's how to start."
   - plan-ready.tsx — "Your content plan for [week] is ready to review."
   - video-complete.tsx — "Your video is ready to download."
   - voice-ready.tsx — "Your voice clone is ready."
   - billing-confirmed.tsx — "You're on [package]. Here's what happens next."
   - render-failed.tsx — "Something went wrong. Your credit has been refunded."

@tester: Test all 6 email templates in browser preview + send to test address

@security-auditor: OAuth tokens stored encrypted, refresh token rotation working
```

### Sprint 9 — Intelligence Collection and Polish (Days 33–38)
```bash
@implementer Build:
1. Background intelligence data collection (silent — no UI yet):
   - Claude Haiku labelling on every render: topic_label, hook_type, sentiment, specificity_score
   - Store in videos table
   - Nightly platform metric sync skeleton (for Phase 2 API connections)
2. Dashboard polish:
   - Week summary card
   - Upcoming videos sidebar
   - Platform connection status
3. Avatar Mode waitlist page at /waitlist — email collection + Resend confirmation

@cost-optimizer Final pre-launch cost audit:
- Run through 1 full Creator month simulation (65 videos)
- Total COGS calculation
- Margin check: must be >80% for Phase 1
- Flag any unexpected costs found in implementation

@security-auditor Final security review:
- Full audit of all API routes (auth check present on every protected route)
- Dependency audit: pnpm audit
- Environment variables double-check
- No secrets in client bundle

@devops Production deploy checklist:
- All env vars in Vercel production
- Stripe webhook registered with production URL
- Sentry configured
- R2 lifecycle rules active
- GitHub Actions CI passing

@tester Final E2E pass:
- New user signup → onboarding → first plan → render → download → pSEO page live
- Billing: free trial → upgrade to Creator → plan generates correctly
- All 6 email templates send correctly
```

---

## How to invoke agents in practice

### Option 1 — @ mention (April 2026+, fastest)
Type `@architect` in your Claude Code prompt. The agent activates immediately.
```
@architect Should the pSEO generation run synchronously in the render webhook
or as a separate queued job? What are the tradeoffs?
```

### Option 2 — Natural language (Claude delegates automatically)
Claude Code reads agent descriptions and delegates when it detects a match:
```
Check this auth middleware for security vulnerabilities.
[Claude automatically spawns @security-auditor]
```

### Option 3 — Explicit parallel agents (for independent tasks)
```
Run these in parallel:
1. @tester — run the full test suite and report results
2. @cost-optimizer — audit the ElevenLabs usage this month
3. @security-auditor — check the new Stripe webhook handler
```

### Option 4 — Agent Teams (for complex coordinated work)
Enable with: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
```
Create an agent team to implement the complete Faceless render pipeline:
- Backend agent: API routes, job queue, webhook handler
- Pipeline agent: ElevenLabs, Pexels, FFmpeg integration
- Frontend agent: video library UI, status tracking, download button
- Test agent: write and run tests as the other agents finish each piece
```

---

## Rules for using this system

1. **Architect first, always.** Never let the implementer design. Never let anyone else architect.

2. **One agent, one concern.** Don't ask the implementer to also review security.
   That's what the security-auditor is for.

3. **Pass context explicitly.** Agents don't share memory. If the architect made a decision,
   paste it into the implementer's prompt. Don't assume the implementer "remembers."

4. **Gate on tester before shipping.** No feature goes to production without tester sign-off.

5. **Monthly cost-optimizer run.** Run `@cost-optimizer` once a month to catch margin drift
   before it becomes a problem.

6. **Security-auditor on every auth/payment change.** Not optional.

7. **Build order is law.** The 9-sprint sequence above is the order. Never skip a sprint.
   Never build Phase 2 features in Phase 1 sessions.

---

## Agent model selection rationale

| Agent | Model | Why |
|---|---|---|
| architect | opus | Highest-stakes decisions. Worth the cost. |
| security-auditor | opus | Missed vulnerabilities cost more than Opus. |
| implementer | sonnet | Production code needs quality, not speed. |
| product-manager | sonnet | Copy quality matters. Haiku isn't good enough. |
| tester | sonnet | Test logic needs reasoning. |
| marketing-copywriter | sonnet | Copy quality matters. |
| devops | sonnet | Infrastructure decisions need reliability. |
| cost-optimizer | haiku | Ironic: the cost-checker should be cheap. |

Main session model: `claude --model claude-opus-4-6` for orchestration.
Subagent default: `export CLAUDE_CODE_SUBAGENT_MODEL="claude-sonnet-4-6"` (individual agents override this).

---

## What "production grade" means for this system

A feature is production grade when:
1. @architect designed it ✓
2. @implementer built it with zero TypeScript errors, zero lint warnings ✓
3. @tester reports 100% coverage on critical paths ✓
4. @security-auditor found no HIGH or CRITICAL issues (or they're fixed) ✓
5. @devops confirms the deploy checklist passes ✓
6. The feature works in Chrome and Safari on mobile ✓

That's the bar. Every sprint. No exceptions.
