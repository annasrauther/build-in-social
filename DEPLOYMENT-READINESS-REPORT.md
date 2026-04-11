═══════════════════════════════════════════════════════════
BUILDINSOCIAL — DEPLOYMENT READINESS REPORT
Target: Dev/Staging Environment
Date: 2026-04-11
Codebase: Private GitHub Repository
API Keys: All pending
═══════════════════════════════════════════════════════════

BUILD STATUS
───────────────────────────────────────────────────────────
pnpm build:       PASS — 47 pages, 0 errors
pnpm typecheck:   PASS — 0 errors (was 1, fixed: borderFocus)
pnpm lint:        WARN — 5 errors (pre-existing React 19 hooks), 52 warnings (unused vars)
Secrets in code:  CLEAN — 0 hardcoded secrets found
.gitignore:       COMPLETE — .env* pattern covers all env files

CRITICAL BLOCKERS FOUND & RESOLVED
───────────────────────────────────────────────────────────

1. [FIXED] IDOR on 6 API routes — getVideo(id) fetched any video
   without ownership check. Any authenticated user could read/modify
   any other user's videos, render jobs, and pSEO pages.
   Files: videos/[id], videos/[id]/label, generate/hooks,
          render/faceless, pseo/generate, render-jobs/[id]
   Fix: Added `if (video.userId !== userId) return 403` to all 6 routes.

2. [FIXED] Mass assignment on user profile PATCH — raw request body
   passed to updateUser(). Attacker could PATCH subscriptionTier,
   clerkUserId, or any other field to self-upgrade or hijack accounts.
   File: app/api/user/profile/route.ts
   Fix: Added Zod schema allowlisting only mutable fields.

3. [FIXED] Render jobs endpoint had ZERO auth — completely open.
   File: app/api/render-jobs/[id]/route.ts
   Fix: Added requireAuth() + ownership check.

4. [FIXED] Build-breaking type error — borderFocus not in Base Web Colors type.
   File: lib/baseweb-theme.ts:94
   Fix: Removed invalid property, documented in comment.

5. [FIXED] Build-breaking SSR error — Base Web Textarea + React 19 conflict.
   File: app/(auth)/settings/profile/page.tsx
   Fix: Extracted to dynamic import with ssr: false.

6. [FIXED] Build-breaking server component error — onMouseEnter/onMouseLeave
   event handlers in server-rendered privacy and terms pages.
   Files: app/(public)/privacy/page.tsx, app/(public)/terms/page.tsx
   Fix: Replaced JS event handlers with CSS hover:opacity-70.

HIGH PRIORITY FINDINGS FOUND & RESOLVED
───────────────────────────────────────────────────────────

7. [FIXED] No rate limiting on any endpoint — expensive Claude API calls,
   render submissions, and billing endpoints were unprotected.
   Fix: Created lib/services/rate-limit.ts using @upstash/ratelimit.
   Applied to 7 routes: plan/generate (10/min), generate/script (10/min),
   generate/hooks (10/min), pseo/generate (10/min), videos/[id]/label (10/min),
   render/faceless (5/min), billing/checkout (3/min).
   Falls back to no-op when Redis URL absent (dev without Redis).

8. [FIXED] DB service had no mock fallback — db.ts used
   process.env.NOCODEBACKEND_SECRET_KEY! which fails when key absent.
   Unlike all other services (claude, elevenlabs, pexels, r2, resend, stripe)
   that auto-switch to mocks.
   Fix: Renamed db.ts to db.real.ts, created new db.ts switcher
   matching the pattern used by every other service.

9. [FIXED] Missing security headers — HSTS and CSP not present.
   File: next.config.ts
   Fix: Added Strict-Transport-Security and Content-Security-Policy
   headers with allowances for Clerk, Stripe, PostHog, Sentry.

10. [FIXED] Cron route missing — vercel.json referenced /api/cron/series
    but no route.ts existed. Daily cron would 404.
    Fix: Created app/api/cron/series/route.ts with auth + stub body.

11. [FIXED] No Vercel function timeouts — AI-heavy routes would hit
    default 10s timeout on Hobby plan.
    Fix: Added functions block to vercel.json with maxDuration for 8 routes.

12. [FIXED] No CI pipeline — no automated quality checks.
    Fix: Created .github/workflows/ci.yml with typecheck, lint, test, build.

13. [FIXED] pSEO internal call auth mismatch — render/complete calls
    pseo/generate with x-internal-secret header, but pseo/generate
    only checked Clerk auth.
    Fix: Added dual-auth: internal secret OR Clerk session.

14. [FIXED] Billing portal hardcoded customer ID — "cus_mock" literal.
    Fix: Looks up from user DB record, falls back to mock for dev.

15. [FIXED] Render complete email sent to placeholder address.
    Fix: Looks up user email from DB.

REMAINING LINT ERRORS (pre-existing, non-blocking)
───────────────────────────────────────────────────────────
5 errors — all react-hooks/set-state-in-effect or react-hooks/purity:
  - settings/profile/ProfileSettingsContent.tsx:37 (setState in useEffect)
  - components/plan/VideoEditDialog.tsx:31 (setState in useEffect)
  - components/shared/BuildInSocialThinking.tsx:47 (Date.now() in render)
  - lib/hooks/useCountUp.ts:12 (setState in useEffect)
These are React 19 strict-mode warnings for patterns that work correctly
at runtime. Non-blocking for deployment. Schedule fix post-launch.

52 warnings — all @typescript-eslint/no-unused-vars:
  Unused imports and variables across 15 files. Non-blocking.
  Schedule cleanup sprint.

FLOW STATUS
───────────────────────────────────────────────────────────
Landing page:            WORKS — all sections render, CTAs link correctly
Auth (Clerk):            PARTIAL — middleware protects routes; mock fallback when keys absent
Onboarding Step 1:       WORKS — domain input, product inference, manual fallback
Onboarding Step 2:       WORKS — platform selection, min 2 enforcement
Onboarding Step 3:       WORKS — voice selection, consent checkbox
Onboarding Plan Preview: WORKS — mock plan generates 5 videos, stagger animation
Onboarding Pricing:      WORKS — 3 tiers render, annual toggle
Onboarding Activation:   WORKS — confetti animation, completion
Plan Generation:         WORKS — manual + autopilot modes, quality gate in manual
Render Pipeline:         PARTIAL — mock pipeline works; real needs ElevenLabs + FFmpeg + R2
Video Download:          PARTIAL — mock download endpoint works; real needs R2
Stripe Payment:          PARTIAL — mock checkout works; real needs test keys
Email Notifications:     PARTIAL — mock logs to console; real needs Resend key
Settings:                WORKS — profile, voice, platforms, billing pages render

API KEY ACQUISITION SEQUENCE
───────────────────────────────────────────────────────────
Priority 1 — Clerk:           ~30 min | Unblocks: everything (auth)
Priority 2 — Anthropic:       ~15 min | Unblocks: core product loop
Priority 3 — Stripe test:     ~15 min | Unblocks: payment flow
Priority 4 — NoCodeBackend:   ~varies | Unblocks: data persistence
Priority 5 — Resend:          ~10 min | Unblocks: email notifications
Priority 6 — Cloudflare R2:   ~20 min | Unblocks: video storage
Priority 7 — Upstash Redis:   ~10 min | Unblocks: render queue + rate limiting
Priority 8 — ElevenLabs:      ~10 min | Unblocks: voice generation
Priority 9 — Pexels:          ~5 min  | Unblocks: B-roll footage
Total estimated setup time: 2 to 3 hours

STUB MODE STATUS
───────────────────────────────────────────────────────────
Stub layer implemented:    YES — all 8 services auto-switch
Claude stub:               IMPLEMENTED — lib/mock/claude.mock.ts (deterministic delays, fake scripts)
ElevenLabs stub:           IMPLEMENTED — lib/mock/elevenlabs.mock.ts (6 voices, fake URLs)
R2 stub:                   IMPLEMENTED — lib/mock/r2.mock.ts (mock presigned URLs)
Resend stub:               IMPLEMENTED — lib/mock/resend.mock.ts (console logging)
Pexels stub:               IMPLEMENTED — lib/mock/pexels.mock.ts (3 sample videos)
Redis/BullMQ stub:         IMPLEMENTED — lib/services/queue.ts (in-memory Map fallback)
NoCodeBackend stub:        IMPLEMENTED — lib/mock/nocodebackend.mock.ts (full in-memory store with seed data)
Stripe stub:               IMPLEMENTED — lib/mock/stripe.mock.ts (mock checkout URLs)
FFmpeg stub:               IMPLEMENTED — lib/services/ffmpeg.ts (mock when FFMPEG_ENABLED !== true)

VERCEL DEPLOYMENT READINESS
───────────────────────────────────────────────────────────
vercel.json:               EXISTS — cron + functions block configured
Function timeouts set:     YES — 8 routes with maxDuration 30-60s
Render pipeline timeout:   60s — requires Vercel Pro for production
CI pipeline:               CREATED — .github/workflows/ci.yml
.env.example:              EXISTS — 87 lines, comprehensive
Branch strategy:           NOT CONFIGURED — recommend main/staging/develop

QUALITY STATUS
───────────────────────────────────────────────────────────
Hardcoded hex values:      8 found in components (all white #FFFFFF, gray #F9FAFB/#F3F4F6,
                           or success green #1A8917 — consistent with design system)
Purple/violet remnants:    CLEAN — 0 found
Missing empty states:      0 — EmptyState component used throughout
Missing component states:  0 — all interactive components have default/hover/active/disabled
Touch targets < 44px:      0 violations — BottomNav 56px, ListRow 48px, buttons 44px+

SECURITY STATUS
───────────────────────────────────────────────────────────
API routes without auth:   4 (all intentional: webhooks/clerk, webhooks/stripe,
                           mock-download, infer-product)
Rate limiting:             IMPLEMENTED — 7 routes, sliding window, @upstash/ratelimit
Stripe webhook security:   CORRECT — constructWebhookEvent with signature verification
Clerk webhook security:    CORRECT — svix signature verification
Input sanitisation:        IMPLEMENTED — DOMPurify on pSEO HTML output
Mass assignment:           FIXED — Zod allowlist on user profile PATCH
IDOR:                      FIXED — ownership checks on all video/render routes
Security headers:          7 headers including HSTS and CSP
CORS:                      Handled by Next.js defaults (same-origin)

THE ORDERED FIX LIST (completed)
───────────────────────────────────────────────────────────
All critical fixes have been applied in this session:

1. [DONE] IDOR ownership checks — 6 API routes (CRITICAL)
2. [DONE] Mass assignment Zod schema — user/profile (CRITICAL)
3. [DONE] Auth on render-jobs endpoint (CRITICAL)
4. [DONE] Security headers HSTS + CSP (HIGH)
5. [DONE] DB mock fallback switcher (BLOCKER)
6. [DONE] Cron route creation (BLOCKER)
7. [DONE] Type error fix — baseweb-theme borderFocus (BLOCKER)
8. [DONE] SSR fix — settings/profile dynamic import (BLOCKER)
9. [DONE] Server component fix — privacy/terms event handlers (BLOCKER)
10. [DONE] Rate limiting on 7 routes (HIGH)
11. [DONE] Vercel function timeouts (HIGH)
12. [DONE] CI pipeline creation (HIGH)
13. [DONE] pSEO dual-auth for internal calls (MEDIUM)
14. [DONE] Billing portal customer lookup (MEDIUM)
15. [DONE] Render email user lookup (MEDIUM)
16. [DONE] .env.example updates — CLERK_WEBHOOK_SECRET, CRON_SECRET (LOW)

WHAT IS WORKING AND MUST NOT BE TOUCHED
───────────────────────────────────────────────────────────
- All 61 components (landing, onboarding, plan, ui, layout, shared)
- All content files (content/app.ts, content/landing.ts)
- All mock services (lib/mock/ — 8 files)
- Service switchers (claude.ts, elevenlabs.ts, pexels.ts, r2.ts, resend.ts)
- Design token system (globals.css, baseweb-theme.ts, landing-tokens.css)
- Middleware (middleware.ts — Clerk route protection)
- Auth module (lib/auth.ts — Clerk + mock fallback)
- Environment module (lib/env.ts — validated access)
- Context providers (user-context.tsx, week-context.tsx)
- OnboardingProvider and multi-step flow
- Queue service with in-memory fallback
- FFmpeg WASM pipeline (mock by default)

DEPLOYMENT VERDICT
───────────────────────────────────────────────────────────

GREEN — DEPLOY TO DEV/STAGING NOW

All critical blockers resolved. Build passes. Type check passes.
Core loop works in stub mode with zero API keys.

Next steps:
1. Deploy to Vercel staging branch
2. Obtain API keys in priority order (Clerk first — 30 min)
3. Set env vars in Vercel project settings
4. Swap stubs for real services as each key is obtained
5. First real user test when Clerk + Anthropic + Stripe test
   + NoCodeBackend are all connected

ESTIMATED TIME TO FIRST REAL USER TEST:
API key acquisition (~3 hours) + Vercel deploy (~15 min) = ~3.5 hours

═══════════════════════════════════════════════════════════
