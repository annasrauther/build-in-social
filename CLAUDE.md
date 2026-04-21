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
Build In Social is an AI video autopilot for creators — a social media distribution
partner for indie developers, SaaS founders, creators, and SMB marketing teams. It builds
and maintains their **domain presence** — not just shipping announcements. Every week,
Build In Social generates platform-native content around who the user is and what they
know. If they have something to share, they share it. If not, Build In Social runs on
autopilot using its intelligent content system.
Platform-native content for YouTube Shorts, Instagram Reels, LinkedIn, and X.
Posts automatically. Every video generates a pSEO page.
Full spec: `/knowledge-center.md` — read it completely before writing any code.

## Active redesign
A top-to-bottom redesign to Linear/Raycast quality is underway. See:
- `/Users/annasrauther/.claude/plans/manager-product-redesign-kind-pascal.md` — master plan
- `DESIGN_AUDIT.md` — Phase 1 audit (routes, anti-patterns, flows)
- `REDESIGN_ROADMAP.md` — Phase 7 (forward-looking) when written

The redesign rewires the view layer only. API routes, schemas, `lib/services/*`,
and `lib/credits/*` are untouched.

## The agent system
14 specialist agents live in `.claude/agents/`. `@manager` is the orchestrator — invoke it
first for every task and it routes to the right specialists in the right order.
Non-negotiables: `@architect` runs before `@implementer`, `@tester` runs after
`@implementer`, `@security-auditor` runs on any auth/billing/user-data change,
`@ui-crafter` + `@ux-critic` run on every user-facing feature.

---

## Design system (rewritten for the redesign)

### Theme
**Dark only.** No light mode. No `next-themes`. No `prefers-color-scheme` branches.
`<html class="dark">` is forced at the layout root; the `.dark` selector is retained
in `tailwind.config.ts` purely so legacy `dark:` variants continue to resolve while
screens migrate off them.

### Color — Radix `grayDark` (neutrals) + `irisDark` (accent)
Exposed as CSS custom properties in `app/globals.css` and surfaced as Tailwind utility
classes in `tailwind.config.ts`.

| Role | Value | Tailwind |
|---|---|---|
| Page bg | `grayDark.1` | `bg-bg` |
| Surface | `grayDark.2` | `bg-surface` |
| Elevated | `grayDark.3` | `bg-elevated` |
| Border (structural) | `grayDark.6` | `border-border` |
| Border (interactive) | `grayDark.7` | `border-[color:var(--border-interactive)]` |
| Divider | `grayDark.12 @ 6%` | `border-[color:var(--divider)]` |
| Text primary | `grayDark.12` | `text-text` |
| Text secondary | `grayDark.11` | `text-text-secondary` |
| Text tertiary | `grayDark.10` | `text-text-tertiary` |
| Text disabled | `grayDark.9` | `text-text-disabled` |
| Accent | `irisDark.9` | `bg-accent`, `text-accent` |
| Accent hover | `irisDark.10` | `bg-accent-hover` |
| Accent subtle (15%) | `iris@15%` | `bg-accent-subtle` |
| Focus ring | `iris@40%` | `[--focus-ring]` via `focus-visible` |

**Body text must be ≥ `text-text-secondary` (grayDark.11) for 4.5:1 contrast. Never use
`text-text-tertiary` (.10) for body text.** Legacy `brand-*`, `anthropic-*`, `accent-orange`
classes are aliased to iris/gray for migration — do not introduce new usages of them.

### Typography — Geist + Geist Mono
Loaded via `geist/font` in `app/layout.tsx`. OpenType features enabled globally:
`cv11`, `ss01`, `ss03`, `tnum`. `font-variant-numeric: tabular-nums` on body.

- Display: Geist, tracking `-0.02em` at ≥ 24px, weight 500.
- Body: 13–14px, line-height 1.4–1.5, weight 400.
- Numerics: tabular everywhere. Mono for IDs, timestamps, code.
- Hierarchy via **weight (400 vs 500) and color**, not size.

### Spacing, radius, density
4px grid. Standard paddings: 8 / 12 / 16 / 24.
Radius: **6 inputs, 8 cards, 12 modals** (`--radius-input/--radius-card/--radius-modal`).
Nested radius = parent − padding.
List rows: 32–36px. Toolbars: 40px. Sidebars: 220–240px.

### Motion
- Default duration: 180ms, ease-out cubic `[0.22, 1, 0.36, 1]` (Tailwind
  `ease-out-cubic`, `duration-default`).
- Reveals: `translateY(8px) → 0`, `opacity 0 → 1`, 40ms stagger.
- Hover: 2–4% bg shift, not color changes or scale transforms.
- All motion gated on `prefers-reduced-motion`. Actually reduce, not shorten.
- Lenis mounted at root via `components/providers/SmoothScroll.tsx`, gated on
  reduced-motion. Marketing routes are the primary beneficiary; product UI
  does not get scroll choreography.
- Never: bouncy springs, 500ms fades, `translateY > 16px` on reveals.

### Icons
Lucide only, 16px default, `strokeWidth={1.5}`. Optically centered with labels, not
geometrically. `@remixicon/react` is legacy — retained for Tremor primitives until
owning screens migrate.

### Anti-patterns — reject on sight
- Pure `#000` / `#fff` / hardcoded hex in JSX
- Shadow-based elevation in dark mode — use hairline borders
- Purple→pink gradients (use iris-only)
- Emoji in product UI
- Inter / Arial / system font stacks
- Illustrated parallax scenes
- "Are you sure?" confirm dialogs for reversible actions
- Spinners for user-initiated mutations
- "Success!", "Oops!", "Woohoo!", "Great!", "Let's" in copy

---

## Interaction rules (non-negotiable)

### No keyboard shortcuts (deliberate)
Earlier iterations shipped `⌘K` command palette, `?` overlay, `/` slash
menu, and per-row shortcut hints (`E`, `⌘↵`, `⌘⇧A`). These were
removed — the product does not advertise or bind keyboard shortcuts.
Everything is reachable by mouse / touch.

A11y baseline is kept:
- Tab order follows reading order.
- `:focus-visible` iris ring (40% / 2px / 2px offset) on every interactive
  element.
- Native `Enter` / `Space` on buttons, `Escape` closes modals + drawers
  (Radix handles this).
- Row context menus surface via a visible `MoreHorizontal` button.

Do NOT add:
- `⌘K` / `Ctrl+K` bindings
- `?` / `/` key shortcuts
- Kbd chips on Button / Tooltip / DropdownMenu
- The old `lib/actions-registry.ts` + `useRegisterActions` contract
  (file deleted)

### Mutations
- **Optimistic updates** for all user-initiated mutations via
  `lib/optimistic.ts` (`useOptimistic({ queryKey, applyOptimistic, … })`).
- Rollback + `toast.error` on server rejection.
- Destructive actions run immediately + show `toast.undo(message, onUndo)` for 5s —
  no confirm dialog.
- Reserve `ConfirmDialog` for genuinely irreversible actions (delete workspace,
  cancel subscription, clone voice).

### Navigation
- Prefetch `<Link>` on hover.
- Route transitions under 100ms perceived. Skeletons match real layout.
- No full-page reloads. No skeleton flash for cached data.
- `/dashboard` → 308 redirect to `/plan/current` (kill vestigial hub).

### Five required states per screen
1. **Empty** — `components/ui/states/EmptyState.tsx`. One icon, one sentence, one CTA.
2. **Loading** — `components/ui/states/LoadingSkeleton.tsx`. 40ms staggered reveals.
   Never spinners.
3. **Error** — `components/ui/states/ErrorState.tsx`. What failed, why (if knowable),
   what to try. No raw error dumps.
4. **Partial** — `components/ui/states/PartialFailureChip.tsx`. One section fails,
   rest works. Don't error-page the whole screen.
5. **First-run vs returning** — `components/ui/states/FirstRunHint.tsx` backed by
   `lib/seen.ts`. Per-capability localStorage flags. Dismissed after interaction.

### Focus, hover, selection
- `:focus-visible` only — no rings on mouse click.
- Focus ring: iris at 40% opacity, 2px width, 2px offset.
- Hover: 2–4% bg shift.
- Selected row: iris@15% bg + 2px left-edge accent bar (`.is-selected` utility).

### Copy
- Verbs over nouns: "Create issue", not "New issue".
- Second person, present tense.
- Specific over generic: "Saved to Q4 Planning", not "Saved successfully".
- Calm voice. No exclamation marks.
- Errors are human: "We couldn't reach the server. Check your connection and try again."
- All strings live in `content/app.ts`.

### Performance as design
- Sub-200ms interactions. Slower requires optimistic update or designed loading state.
- Geist preloaded, `font-display: swap`.
- Image dimensions always set — zero CLS.
- Bundle budgets: marketing ≤ 150kb JS, app shell ≤ 300kb.
- 60fps scroll — if Lenis + effects drop frames, cut effects.

---

## User flow redesign (the spine of the redesign)

Six primary flows govern which screens get redesigned and in what order. See
`DESIGN_AUDIT.md` § 4 for before/after click counts.

**F1** Discovery → Signup — marketing hero becomes an inline `MiniPlanner`.
Free tools feed signup via upgrade rails.

**F2** Signup → First video — 3 steps (Context / Preview / Voice) dumping on
`/plan/current?firstRun=1` with a draft already in hand. Platform OAuth is **lazy**.

**F3** Returning-user daily loop — `/plan/current` is the default authed landing
route. Today auto-scrolls into view, clicks open the video drawer in place (not
a route change).

**F4** Plan-a-week — one theme input streams 7 cards in parallel. Per-card
Regenerate / Edit / Delete / Lock; week-level Regenerate-all / Approve-all /
Reorder / Shift-dates.

**F5** Create-a-series — materializes N upcoming cards into future weeks
immediately. No abstract "activate" step.

**F6** Publish + post-publish — one button + per-platform dots. Partial success
is first-class. Disconnected platforms show inline Connect → OAuth popup.

### Routes killed / merged / demoted (in progress across phases)
- `/dashboard` → redirect to `/plan/current`
- `/guides` → kill; content migrates into ⌘K results
- `/onboarding/start` → merge into `/onboarding`
- `/videos` → demote to filterable archive
- `/settings/*` → consolidate to 4 cards (Account / Brand / Connections / Automation)
- Sub-routes retained for deep-linking

---

## Component conventions

### Primitive layers — two, side by side during migration
- **`components/ui/shadcn/*`** — preferred. Dark-only, token-based shadcn wrappers.
  `Button`, `Input`, `Card`, `Dialog`, `DropdownMenu`, `Tooltip`, `Command`,
  `Drawer`, `Kbd`. Imports: `@/components/ui/shadcn`.
- **`components/tremor/*`** — legacy Tremor Raw. Do not add new imports. Screens
  still using Tremor are migrated when their phase runs.

### Directory map
- `app/(marketing)/` — public marketing (Phase 5 rebuild target)
- `app/(dashboard)/` — authenticated product (Phase 3 / 6 rebuild)
- `app/(onboarding)/` — 3-step activation (Phase 4 rebuild)
- `app/(auth-pages)/` — Clerk wrappers (Phase 6 restyle only)
- `app/api/` — route handlers (UNTOUCHED by redesign)
- `components/ui/shadcn/` — new primitive layer
- `components/ui/states/` — five-states primitives
- `components/ui/CommandPalette.tsx` — ⌘K shell
- `components/providers/SmoothScroll.tsx` — Lenis mount
- `components/providers/Toaster.tsx` — sonner + `toast.undo`
- `components/plan/` — weekly plan
- `components/video/` — video drawer + publish (Phase 3, new)
- `components/marketing/` — landing page sections
- `components/dashboard/` — app shell (sidebar + user menu)
- `components/onboarding/` — 3-step flow
- `lib/actions-registry.ts` — command palette registry
- `lib/optimistic.ts` — TanStack Query optimistic helper
- `lib/seen.ts` — per-capability first-run localStorage
- `content/app.ts` — single source of truth for UI copy

---

## Product rules (never break these)

1. **Avatar Mode is ENABLED.** Full HeyGen pipeline — mocked by default, real when
   `HEYGEN_API_KEY` is set. Follows the same mock/real service pattern as
   ElevenLabs, Pexels, R2.
   - Avatar Mode and Faceless Mode are equal first-class render options.
   - Never ship real HeyGen API calls without the mock fallback in place first.
2. **Content model is domain-presence, not ship-announcements.** Two modes per week:
   - **Manual** — user shares something specific. Quality gate (3 questions) runs.
   - **Autopilot** — AI generates a full week from niche + voice + evergreen angles.
     Quality gate bypassed.
   Autopilot is a first-class feature.
3. Quality gate runs ONLY in manual mode. Never skippable. Never generated without it.
4. Build In Social sets video duration per platform. User cannot choose; override
   requires explicit click.
5. Partner framing: never "generate video." Always "Build In Social is creating."
6. Only 4 platforms: YouTube Shorts, Instagram Reels, LinkedIn, X. Reddit and
   TikTok = never.
7. Intelligence panel hidden until user has 5+ published videos with metrics.
8. All Claude API calls: Haiku for scripts/labelling/quality gate/autopilot
   suggestions; Sonnet only for pSEO articles and intelligence summaries.

## Tech stack
- **Framework:** Next.js 16 App Router (NOT Pages Router)
- **Language:** TypeScript 5, strict mode
- **UI:** React 19, Tailwind v3 (v4 `@theme` migration deferred to owning screens),
  Radix primitives wrapped as shadcn/ui in `components/ui/shadcn/`.
- **Animation:** `motion` (migrating off `framer-motion`), Lenis for smooth scroll.
- **Command palette:** `cmdk`.
- **Toasts:** `sonner`.
- **Fonts:** Geist Sans + Geist Mono via `geist/font`.
- **Icons:** Lucide (new code). Remix Icon legacy.
- **Auth:** Clerk (`@clerk/nextjs`).
- **State / data:** TanStack Query v5 (now actively used via `lib/optimistic.ts`).
- **Database:** NoCodeBackend (REST API).
- **Storage:** Cloudflare R2.
- **Payments:** Stripe — 4 tiers: Starter $19 / Solo $39 / Creator $79 / Studio $149.
- **AI:** Claude API (Haiku for scripts, Sonnet for pSEO).
- **Voice:** ElevenLabs. **Avatar:** HeyGen. **B-roll:** Pexels. **Assembly:** FFmpeg WASM.
- **Email:** Resend. **Jobs:** Upstash Redis. **Charts:** Recharts. **Tables:** TanStack React Table.

## Key conventions

### Mock services pattern
All external integrations live in `lib/services/` with mock fallbacks in `lib/mock/`.
Set the API key in `.env.local` — the service auto-switches.

### API route pattern
- All routes return `{ data, error }`.
- Zod validation before any DB operation.
- Env via `lib/env.ts`, never `process.env` directly.

### Dev auth bypass
`NEXT_PUBLIC_DEV_AUTH=1` enables the "Sign in as Test User" button. Skips `ClerkProvider`
entirely. `/api/dev/login` sets `dev-auth=1` cookie. Production forces this off via
`DEV_AUTH` in `lib/env.ts`. Restart `next dev` after toggling.

## Never build
- Ayrshare auto-publishing
- Intelligence panel UI (until 5+ published videos with metrics)
- A/B hook testing

## v1.1 backlog
- Per-platform hook scaffolding (`hooks: { youtube, instagram, linkedin, x }`).
- WordPress video publishing (stubbed today).
- Voice clone management UI in settings.
