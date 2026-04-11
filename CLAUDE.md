# Build In Social — Claude Code Project Rules

## What this is
Build In Social is a social media distribution partner for indie developers and SaaS founders.
It builds and maintains their **domain presence** — not just shipping announcements.
Every week, Build In Social generates platform-native content around who the user is and
what they know. If they have something to share, they share it. If not, Build In Social
runs on autopilot using its intelligent content system.
Platform-native content for YouTube Shorts, Instagram Reels, LinkedIn, and X.
Posts automatically. Every video generates a pSEO page.
Full spec: /PRD-v7.md — read it completely before writing any code.

## The agent system
9 specialist agents live in .claude/agents/. They are your team.
Read AGENT-WORKFLOW.md for how to use them and in what order.
Always invoke @architect before @implementer. Always invoke @tester after @implementer.
Always invoke @ux-designer before building any new screen or interaction.

## Design rules (never break these)
1. WHITE-FIRST. --bg-page = #ffffff. Light mode is default and primary.
2. ONLY use CSS tokens from globals.css. Never hardcode hex values anywhere.
3. Single neutral accent --accent = rgb(36, 36, 36) (black) for all interactive states:
   primary actions, buttons, selected states, progress indicators, active highlights,
   input focus rings, tab indicators. No secondary accent colour.
   --accent-subtle = rgba(0, 0, 0, 0.05) for light backgrounds on selected states.
   --accent-green = #1A8917 for success/connected states.
   Approved badges use --success / --success-subtle (green).
4. Font: Source Serif 4 for headings (h1/h2/h3, --font-heading), Geist for body/UI.
   Heading weight: 400 (light serif). Geist Mono for numbers, timestamps, durations.
   No Inter, no system fonts.
5. Base Web (Uber) component library + Styletron CSS-in-JS for ALL visual components:
   Button, Input, Textarea, Select, Tabs, Modal — all from Base Web, themed via baseweb-theme.ts.
   No custom CSS for component styling. Styletron handles colors, borders, focus rings, radii.
   Tailwind for LAYOUT ONLY: flex, grid, gap, padding, margin, responsive breakpoints.
   Never use Tailwind for colors, borders, typography, or focus states.
   Framer Motion for page transitions and micro-interactions.
6. Uber Base surface rule: Cards and selection elements use bg-elevated fill with NO borders.
   Borders are ONLY for: structural dividers (sidebar, topnav, footer, ListRow separators),
   form inputs (Input, Textarea, Select), and floating overlays (Dialog, BottomSheet, Dropdown).
   Shadows only for overlays and modals.
7. Uber Base design principles: flat surfaces, extreme clarity, zero decoration,
   generous consistent spacing, every element earns its place.
8. All spacing: 4px base grid, multiples of 4 only.
9. Tailwind for layout/spacing ONLY. Never for colours or typography.
10. Framer Motion for page transitions. Standard easing: [0.16, 1, 0.3, 1].
    Interactive state changes: 120ms max (--transition-fast, --transition-state).
11. Mobile-first. Design 375px first. All touch targets ≥ 44px, preferred 48px.
12. Strict type scale (app pages):
    Display: 20px mobile / 24px desktop (--type-display-*)
    Section: 15px mobile / 16px desktop (--type-section-*)
    Body: 14px mobile / 15px desktop (--type-body-*)
    Supporting: 12px mobile / 13px desktop (--type-supporting-*)
    Micro: 11px uppercase tracking 0.07em (--type-micro)
13. Interactive elements: exactly 4 states — default, hover, active, disabled.
    No animated idle states. No pulsing except approved loading spinners.
14. Mobile layout: ListRow (full-width rows) for content items. Cards on desktop only.
15. All app strings live in /content/app.ts. No hardcoded strings in components.

## Unified component guidelines (must be identical across LP, onboarding, and app)

### Buttons — Base Web Button (used directly)
- **Import `Button, KIND, SIZE` from `baseui/button`** — no custom wrapper.
- Use Base Web's default styling (border-radius 8px, default colors from theme primitives).
- 3 kinds: `KIND.primary`, `KIND.secondary`, `KIND.tertiary` (ghost).
- 3 sizes: `SIZE.compact` (sm), `SIZE.default` (md), `SIZE.large` (lg).
- For danger buttons: use `KIND.primary` + negative color overrides via `$theme.colors.negative`.
- `isLoading` prop for loading state. `type` prop for form buttons.
- Touch targets: compact=40px, default=44px, large=48px minimum height.
- Never use bare `<button>` elements — always use Base Web `<Button>`.
- Never add custom border-radius or font-weight overrides to buttons.

### Typography
- All headings (h1, h2, h3): `fontFamily: var(--font-heading)`, `fontWeight: 400`.
- Body/UI text: Geist (var(--font-sans)).
- Page titles in TopNav and OnboardingShell: 16–20px, serif, weight 400.
- Never use font-semibold or font-bold on headings — always weight 400 serif.

### Layout
- Landing page: full-bleed sections, `.lp-container` for max-width content.
- App pages: `AppShell` with Sidebar + TopNav. No global max-width on main.
  Per-page max-width based on content density (max-w-2xl to max-w-4xl).
- Onboarding: full-width edge-to-edge. No maxWidth on content. Generous padding.
  Buttons constrained to maxWidth: 480px.
- All horizontal dividers/borders must extend full available width.

### Cards and surfaces
- Cards (ContentCard): `bg: var(--bg-elevated)`, no border, `border-radius: var(--radius-lg)` (12px).
  Padding: 16px mobile / 24px desktop. No box-shadow on default.
- CardHeader: title (font-semibold) + optional action, border-bottom 1px --border-default.
- Interactive cards: hover `-translate-y-0.5` + subtle shadow on desktop.
- Cards keep their border-radius (12px). Buttons use Base Web default (8px).
- ListRow: full-width rows for mobile layouts, 48px min-height, border-bottom.
- StickyBar: fixed bottom bar on mobile for page-level CTAs.

## Product rules (never break these)
12. Avatar Mode is DISABLED in Phase 1.
    Show everywhere with "Coming soon" badge + waitlist CTA.
    No HeyGen API code whatsoever in Phase 1. Not even installed.
13. Faceless Mode is the entire product in Phase 1.
14. **Content model is domain-presence, not ship-announcements.**
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
15. The quality gate (3 specific questions) runs ONLY in manual mode.
    Never generate a manual script without the quality gate output. Never make it skippable.
    Autopilot mode bypasses the quality gate — the AI provides its own specificity.
16. Build In Social sets video duration based on platform. User cannot choose duration.
    Show the chosen duration in the UI with an optional override that requires a click.
17. Partner framing always. Never "generate video." Always "Build In Social is creating."
18. Only 4 platforms: YouTube Shorts, Instagram Reels, LinkedIn, X.
    Reddit = never. TikTok = never. In Phase 1 or any session unless told otherwise.
19. Intelligence panel hidden until user has 5+ published videos with metrics.
20. All Claude API calls: use Haiku for scripts/labelling/quality gate/autopilot suggestions.
    Use Sonnet only for pSEO articles and intelligence summaries.

## Tech stack
- **Framework:** Next.js 16 App Router (NOT Pages Router)
- **Language:** TypeScript 5, strict mode
- **UI:** React 19, Base Web (Uber) + Styletron, Tailwind CSS v4 (layout only), Framer Motion
- **Font:** Geist (via `geist` package)
- **Auth:** Clerk (`@clerk/nextjs` v7) — added LAST, after all pages built
- **State:** TanStack Query v5
- **Database:** NoCodeBackend (REST API)
- **Storage:** Cloudflare R2
- **Payments:** Stripe (Solo $39 / Creator $79 / Studio $149 subscriptions)
- **AI:** Claude API (Haiku for scripts, Sonnet for pSEO)
- **Voice:** ElevenLabs
- **B-roll:** Pexels API
- **Video assembly:** FFmpeg WASM
- **Email:** Resend
- **Job queue:** Upstash Redis

## Key conventions

### Mock services pattern
All external integrations live in `lib/services/` with mock fallbacks in `lib/mock/`.
To wire a real integration, set the API key in `.env.local` — the service auto-switches.

### Component conventions
- **Use Base Web components directly** (`baseui/button`, `baseui/input`, `baseui/modal`, etc.) — no custom wrappers.
- `components/ui/` contains composition components (ResponsiveDialog, ConfirmDialog, BottomSheet)
  and non-Base-Web UI (Skeleton, Badge, Card, ListRow, StickyBar, etc.).
- Base Web theme: `lib/baseweb-theme.ts` (brand primitives + typography only, no component styling overrides)
- Styletron engine: `lib/styletron.ts`
- Feature components: `components/<feature>/`
- Layouts: `components/layout/`
- App strings: `content/app.ts` (single source of truth for all UI copy)

### API route pattern
- All routes return `{ data, error }` shape
- Input validation with Zod before any DB operation
- Environment variables via `lib/env.ts`, never `process.env` directly

## Phase 1 build order — strict sequence, no skipping
1.  Token system + Geist font + Radix setup + base layout
2.  Landing page (Linear design, research-driven copy, domain-presence model)
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
