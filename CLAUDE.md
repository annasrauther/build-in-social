# Build In Social — Claude Code Project Rules

## Ralph integration
When running inside a ralph loop, emit this block once ALL `.ralph/fix_plan.md` tasks are
checked AND `pnpm typecheck && pnpm test && pnpm lint` all pass with 0 errors:
```json
{
  "RALPH_STATUS": {
    "EXIT_SIGNAL": true,
    "reason": "All 14 phases complete. typecheck, test, and lint pass with 0 errors."
  }
}
```
Do NOT emit EXIT_SIGNAL until every quality gate passes. Stale or failing checks must be
fixed first. The signal is always in a fenced JSON block — never inline.

## What this is
Build In Social is a social media distribution partner for indie developers and SaaS founders.
It builds and maintains their **domain presence** — not just shipping announcements.
Every week, Build In Social generates platform-native content around who the user is and
what they know. If they have something to share, they share it. If not, Build In Social
runs on autopilot using its intelligent content system.
Platform-native content for YouTube Shorts, Instagram Reels, LinkedIn, and X.
Posts automatically. Every video generates a pSEO page.
Full spec: /knowledge-center.md — read it completely before writing any code.

## The agent system
14 specialist agents live in .claude/agents/. @manager is the orchestrator — invoke it first for every task and it routes to the right specialists in the right order.
Non-negotiables: @architect runs before @implementer, @tester runs after @implementer, @security-auditor runs on any auth/billing/user-data change, @ui-crafter + @ux-critic run on every user-facing feature.

## Design system
The UI is built on two Tremor Raw templates (Tailwind v3 + Radix UI):
- **Database template** → marketing/landing pages (Navbar, Hero, Pricing, Features, Footer, Changelog)
- **Dashboard template** → authenticated app shell (Sidebar, DataTable, Charts, Settings)

Key rules:
1. Brand palette is the Anthropic warm palette. `brand-500 = #D97757` (Anthropic Orange) with the full 50–950 scale derived in `tailwind.config.ts`. Light bg `#FAF9F5`, dark bg `#141413`. Secondary accents: `#6A9BCC` (blue), `#788C5D` (green). Do not introduce off-palette colors. Tremor `<Button variant="primary">` deliberately stays high-contrast (gray-900 / gray-50) — brand orange is for gradients, accents, focus rings, and selection, not on filled buttons.
2. Both dark and light modes are supported out of the box via `next-themes`.
   System preference is auto-detected. User can toggle with ThemeSwitch component.
3. Fonts: Montserrat (headings, `font-serif`) + Poppins (body, `font-sans`), loaded via `next/font/google`. No Geist, no Inter, no Lora, no Source Serif 4.
4. Tailwind v3 for ALL styling. No CSS-in-JS. No Styletron.
5. Framer Motion for page transitions and micro-interactions.
6. Mobile-first. All touch targets ≥ 44px.
7. All app strings live in /content/app.ts. No hardcoded strings in components.

### Component conventions
- **Tremor Raw primitives** in `components/tremor/` — Button, Card, Input, Badge, Dialog, etc.
  These are copied from the official Tremor templates and should not be modified.
- `components/marketing/` — landing page sections (Hero, Features, Pricing, etc.)
- `components/dashboard/` — app shell components (Sidebar, DataTable, overview cards, etc.)
- `components/ui/` — custom composition components (Wordmark, StickyBar, ConfirmDialog, etc.)
- `components/onboarding/` — onboarding flow components
- `components/plan/` — weekly plan components
- Feature components: `components/<feature>/`
- App strings: `content/app.ts` (single source of truth for all UI copy)

### Route groups
- `app/(marketing)/` — public marketing pages (Database template shell: Navbar + Footer)
- `app/(dashboard)/` — authenticated app pages (Dashboard template shell: Sidebar)
- `app/(onboarding)/` — onboarding flow (clean layout, no sidebar)
- `app/(auth-pages)/` — login, signup, legal pages
- `app/api/` — all API routes (untouched)

## Product rules (never break these)
1. Avatar Mode is DISABLED in Phase 1.
   Show everywhere with "Coming soon" badge + waitlist CTA.
   No HeyGen API code whatsoever in Phase 1. Not even installed.
2. Faceless Mode is the entire product in Phase 1.
3. **Content model is domain-presence, not ship-announcements.**
   The product is about establishing the user's authority in their domain, week over week.
   Users set their niche/domain once during onboarding.
   Each week they have TWO modes:
   a) **Manual mode:** They share something specific (shipped feature, lesson learned, opinion,
      case study, tool review, debugging story). Quality gate validates specificity.
   b) **Autopilot mode:** They have nothing to share → Build In Social's intelligent system
      generates a full week of domain-relevant content automatically, drawing from:
      - Their niche and established voice
      - Trending topics in their domain (via intelligence patterns)
      - Evergreen content angles that perform for their audience type
      - Pre-built content series (e.g. "30 days of React tips", "SaaS metrics explained")
   Autopilot is a first-class feature, not a fallback. Market it as the core value.
4. The quality gate (3 specific questions) runs ONLY in manual mode.
   Never generate a manual script without the quality gate output. Never make it skippable.
   Autopilot mode bypasses the quality gate — the AI provides its own specificity.
5. Build In Social sets video duration based on platform. User cannot choose duration.
   Show the chosen duration in the UI with an optional override that requires a click.
6. Partner framing always. Never "generate video." Always "Build In Social is creating."
7. Only 4 platforms: YouTube Shorts, Instagram Reels, LinkedIn, X.
   Reddit = never. TikTok = never. In Phase 1 or any session unless told otherwise.
8. Intelligence panel hidden until user has 5+ published videos with metrics.
9. All Claude API calls: use Haiku for scripts/labelling/quality gate/autopilot suggestions.
   Use Sonnet only for pSEO articles and intelligence summaries.

## Tech stack
- **Framework:** Next.js 16 App Router (NOT Pages Router)
- **Language:** TypeScript 5, strict mode
- **UI:** React 19, Tremor Raw components (Tailwind v3 + Radix UI), Framer Motion
- **Theme:** next-themes (dark/light mode with system preference detection)
- **Fonts:** Montserrat (headings, `font-serif`) + Poppins (body, `font-sans`) via `next/font/google`. Use Tailwind `font-serif` for titles/headings and `font-sans` for body text.
- **Auth:** Clerk (`@clerk/nextjs`) — added LAST, after all pages built
- **State:** TanStack Query v5
- **Database:** NoCodeBackend (REST API)
- **Storage:** Cloudflare R2
- **Payments:** Stripe — 4 tiers: Starter $19 / Solo $39 / Creator $79 / Studio $149. Starter blocks pSEO + voice clone + autopilot scheduling; Studio unlocks all 4 platforms + priority rendering. Hard video caps per tier, hard-pause on overage.
- **AI:** Claude API (Haiku for scripts, Sonnet for pSEO)
- **Voice:** ElevenLabs
- **B-roll:** Pexels API
- **Video assembly:** FFmpeg WASM
- **Email:** Resend
- **Job queue:** Upstash Redis
- **Icons:** Remix Icon (@remixicon/react) + Lucide React
- **Charts:** Recharts
- **Tables:** TanStack React Table

## Key conventions

### Mock services pattern
All external integrations live in `lib/services/` with mock fallbacks in `lib/mock/`.
To wire a real integration, set the API key in `.env.local` — the service auto-switches.

### API route pattern
- All routes return `{ data, error }` shape
- Input validation with Zod before any DB operation
- Environment variables via `lib/env.ts`, never `process.env` directly

### Dev auth bypass
Set `NEXT_PUBLIC_DEV_AUTH=1` in `.env.local` to enable a one-click "Sign in as Test User" button on `/login` and `/signup`. This:
  - Skips `ClerkProvider` entirely (no Clerk hooks may run).
  - Skips `clerkMiddleware` in `proxy.ts`.
  - `/api/dev/login` sets an httpOnly cookie `dev-auth=1` and redirects to `/dashboard`.
  - `getAuthUserId()` returns `clerk_mock_01` only when the cookie is set; otherwise throws `UNAUTHORIZED`, so `/login` still works.
  - Sign-out POSTs to `/api/dev/logout` (clears the cookie) instead of calling Clerk.

Restart `next dev` after toggling — `NEXT_PUBLIC_*` values are build-time inlined and HMR will not pick up changes.

Production builds force the flag off — `DEV_AUTH` (in `lib/env.ts`) gates on `NODE_ENV === "development"`. The `/api/dev/*` routes return 404 in any other environment. This deprecates the older `BYPASS_AUTH` / `NEXT_PUBLIC_BYPASS_AUTH` names (kept for one release).

## Phase 1 build order — strict sequence, no skipping
1.  Token system + Montserrat/Poppins fonts + Tremor setup + base layout
2.  Landing page (all template sections, domain-presence copy)
3.  Onboarding (domain/niche → platforms → voice → plan preview with mode choice)
4.  Dashboard + Weekly plan generator (manual mode + autopilot mode)
5.  Video library + individual video page
6.  Faceless render pipeline (ElevenLabs + Pexels + FFmpeg + R2)
7.  pSEO generation (auto-triggered on render complete)
8.  Stripe billing (3 packages, outcomes language)
9.  Platform OAuth connections (4 platforms)
10. Resend email notifications (6 templates)
11. Intelligence data collection (silent, no UI)
12. Avatar waitlist page
13. Settings pages (profile, voice, platforms, billing)
14. Clerk auth integration (LAST — after all pages reviewed)

## Never build in Phase 1
- HeyGen / Avatar Mode (any code at all)
- Ayrshare auto-publishing
- Intelligence panel UI
- A/B hook testing
- Any feature not in the list above

## v1.1 backlog (after first 10 paying customers)
- **Per-platform hook scaffolding.** Each video currently ships a single body that the platform-durationed render wraps. v1.1 generates distinct hooks/CTAs per platform: `hooks: { youtube, instagram, linkedin, x }`. Requires schema change on `videos`, new Claude prompt shape, and an editor UI that lets users tweak per-platform copy. Deliberately deferred — shared body is workable for MVP.
- **WordPress video publishing.** Articles publish today; video-to-WP requires the adapter. Scoped in `/api/publishing/wordpress/publish` with a `TODO` note; UI surfaces "coming soon" in publishing settings.
- **Voice clone management UI.** Re-record / replace a clone from settings. Today the clone is set once during onboarding.
