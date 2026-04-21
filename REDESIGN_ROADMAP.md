# Redesign Roadmap

Forward-looking work after the seven-phase Linear/Raycast redesign.
Snapshot as of branch `redesign/propagation` (HEAD: `6e3996b`).

## What shipped (phases 0–6)

| Phase | Branch | Summary |
|---|---|---|
| 0 | trunk | `chore: snapshot before redesign` (101 files) |
| 1 | trunk | `docs: design audit` — `DESIGN_AUDIT.md` |
| 2 | redesign/foundations | 9 commits: Radix grayDark + iris tokens, Geist, Lenis, shadcn/ui, cmdk palette, sonner undo, optimistic helper, five-states primitives, seen.ts, light-mode removed, CLAUDE.md rewritten |
| 3 | redesign/plan-core | 4 commits: `/dashboard` → 308 `/plan/current`, PlanShell + ModeChooser + DayCard + VideoDrawer + PublishStrip + platform-icons, `/plan/current` rewritten with optimistic mutations + command palette actions + all five states |
| 4 | redesign/onboarding | 1 commit: 3-step activation (Context → Preview → Voice) ending on `/plan/current?firstRun=1`; `/onboarding/start` → 308; signup + dashboard redirect targets updated; OnboardingLayout + draft helper |
| 5 | redesign/marketing | 1 commit: MiniPlanner inline CTA, Hero rewritten with one pinned scroll moment, Navbar restyled to tokens, UpgradeRail for free tools |
| 6 | redesign/propagation | 1 commit: `/settings` consolidated to 4 cards, `/guides` killed |

Every branch typechecks and builds cleanly (42 routes).

## Still to do — by effort

### Small (≤ half a day)

- [ ] **`/videos` demote.** Restyle to a filterable archive (cards → 36px rows, tabular-nums dates, Lucide icons). Primary entry comes from ⌘K "Go to videos" or a "See all" link on `/plan/current`.
- [ ] **`/settings/*` sub-pages restyle.** Tremor → shadcn/ui + tokens for: `profile`, `voice`, `billing`, `platforms`, `brand`, `automation`, `avatar`, `publishing`, `webhooks`. None need structural change; pure token/primitive swap.
- [ ] **Auth pages (`/login`, `/signup`) restyle.** Clerk flow untouched. Swap container chrome to tokens. Dark Clerk appearance already forced in Phase 2.
- [ ] **pSEO templates.** `/p/[slug]` and `/alternative/[slug]` use shared layout; restyle once, apply everywhere.
- [ ] **Legal pages (`/privacy`, `/terms`, `/dpa`, `/subprocessors`, `/changelog`).** Text-first restyle, inherit hero-less PlanShell or marketing-shell typography.
- [ ] **Delete lingering `dark:` variants.** 269 occurrences at Phase 1 audit; reduced as screens rebuilt. Final sweep once all Tremor screens migrate.
- [ ] **Remove `@remixicon/react` dependency.** Every import migrates to Lucide or local inline SVG. Drop the dep.
- [ ] **Remove `framer-motion` in favour of `motion/react`.** Same API, one package name.
- [ ] **`DashboardClient.tsx` cleanup.** Now unreachable (`/dashboard` redirects). Delete file + any imports.

### Medium (1–2 days)

- [ ] **`/series` list** — F5 restyle + intro the "+ New series" entry from plan header.
- [ ] **`/series/create`** — Single-screen creator per flow redesign: name / cadence / template / tone (inherits voice). On submit materialize N upcoming cards into future weeks immediately, no separate activate step.
- [ ] **`/series/[id]`** — becomes a tune / pause / archive surface rather than the creation path. Chip-link from plan cards back to here.
- [ ] **`/onboarding/plan-preview` deep restyle.** Currently inherits legacy OnboardingShell. Wrap with the new `OnboardingLayout`, swap Tremor primitives for shadcn, reuse `DayCard` for the streamed preview rows.
- [ ] **`/onboarding/voice` deep restyle.** Same — 6-tile voice grid per approved plan, preview-on-hover, defaults preselected.
- [ ] **Marketing section components.** `Audience`, `Modes`, `LogoCloud`, `Features`, `Benefits`, `Testimonial`, `Pricing`, `Faqs`, `PartnerCallout`, `Cta`. Each needs token migration + Geist typography + hairline borders. Cap at one scroll moment total (already used on Hero) — no additional `useScroll` effects.
- [ ] **Tools pages** (`/tools`, `/tools/hook-generator`, `/tools/content-plan-preview`, `/tools/thread-splitter`). Add `UpgradeRail` to each tool output surface.
- [ ] **`QualityGate` restyle.** 290 lines. Works under new tokens via aliases but still uses framer-motion + Tremor Button. Straight primitive swap + Geist pass.

### Large (structural)

- [ ] **`/videos/[id]` retire.** 664 lines. Most of its value now lives in the drawer; keep the route for deep-linking but strip it down to a thin "full page" version of the drawer. Remove from primary nav.
- [ ] **F4 streaming plan generation.** Current "Plan from theme" is a navigation stub (`?action=plan-from-theme`). Wire it into `/api/plan/generate` with Server-Sent Events or streaming JSON. Per-card Regenerate / Lock / Delete hooks already exist on `DayCard`; wire them to real mutations via `useOptimistic`.
- [ ] **F6 real per-platform publish.** Current `PublishStrip` is a visual stub (400ms fake success). Wire to actual `/api/publishing/*` endpoints, lazy-OAuth popup flow for disconnected platforms, per-platform retry and success links. This is the single largest remaining piece of the redesign.
- [ ] **`WeekCalendar.tsx` rebuild.** 375 lines, hardcoded platform hex (`#FF0000` etc), inline brand assumptions. Rebuild against tokens + Lucide + 32–36px rows.
- [ ] **Analytics surface to replace `/dashboard`.** A minimal `/activity` that surfaces plan + publish metrics. Defer until there's real multi-week data for most accounts.

### Very large (v1.1 backlog, per product rules)

- [ ] Per-platform hook scaffolding (schema change on `videos`).
- [ ] WordPress video publishing adapter.
- [ ] Voice clone management in settings.

## Shared patterns extracted (propagate freely)

- `useOptimistic({ queryKey, applyOptimistic, errorMessage })` → `lib/optimistic.ts`. Use on every user-initiated mutation.
- `toast.undo(message, onUndo, { duration })` → `components/providers/Toaster.tsx`. Replaces every confirm dialog for reversible actions.
- `useRegisterActions([...])` + `Action` contract → `lib/actions-registry.ts`. Every screen exposes its primary actions to ⌘K contextually.
- `FirstRunHint` backed by `hasSeen/markSeen` → `lib/seen.ts`. Per-capability inline hint rows, never coach-marks.
- `EmptyState`, `ErrorState`, `SkeletonRows`, `PartialFailureChip` → `components/ui/states`. Every screen gets all five.
- `Kbd` chip → `components/ui/shadcn/kbd.tsx`. Consumed by `Button.shortcut`, `Tooltip.shortcut`, `DropdownMenuItem.shortcut`, `CommandItem.shortcut`.
- `.is-selected` utility → 2px accent left-edge bar + iris@15% background for selected rows.
- `MiniPlanner` + `UpgradeRail` — marketing F1 conversion primitives.
- `OnboardingLayout` + `lib/onboarding-draft.ts` — 3-step chrome + localStorage resume.

## Tremor → shadcn migration ledger

| Tremor component | Replacement | Screens still using Tremor |
|---|---|---|
| `Button` | `components/ui/shadcn/button.tsx` | settings/*, onboarding plan-preview+voice, QualityGate, auth pages |
| `Card` | `components/ui/shadcn/card.tsx` | settings/*, onboarding legacy, dashboard legacy |
| `Dialog` | `components/ui/shadcn/dialog.tsx` | QuotaExhaustedDialog, various settings modals |
| `Drawer` | `components/ui/shadcn/drawer.tsx` | — (new surface only) |
| `Dropdown` | `components/ui/shadcn/dropdown-menu.tsx` | `components/dashboard/navigation/DropdownUserProfile.tsx` |
| `Input`, `Label` | `components/ui/shadcn/input.tsx` | onboarding legacy, settings/*, forms in marketing |
| `Tooltip` | `components/ui/shadcn/tooltip.tsx` | Tremor internal uses |
| `Badge`, `Switch`, `Checkbox`, `Select`, `Tabs`, `Table`, `Accordion`, `LineChart`, `ProgressBar`, `Popover`, `RadioCard`, `Searchbar`, `DatePicker`, `Calendar`, `TabNavigation`, `Divider`, `Arrow` | Add shadcn equivalents as needed | Various |
| `CommandBar` (bulk-edit action bar — NOT ⌘K) | Keep or rewrite if DataTableBulkEditor is rebuilt | `components/dashboard/data-table/DataTableBulkEditor.tsx` |

The Phase 2 tokens + aliases let Tremor coexist cleanly. Every migration is a screen-local PR.

## Bundle budget

| Target | Budget | Measured | Status |
|---|---|---|---|
| Marketing JS | ≤ 150 kb | not yet measured | `@next/bundle-analyzer` run planned |
| App shell JS | ≤ 300 kb | not yet measured | same |

Add `@next/bundle-analyzer` and run against `/` and `/plan/current` first. If over, cut order: scroll effect → section component lazy-loads → reduce cmdk fuzzy-match overhead.

## Retrospective — what deviated from the approved plan

1. **Tailwind v4 deferred.** Approved plan had `@theme` migration in Phase 2; executed v3-with-CSS-vars instead. Rationale: v4 compound-effects with 269 `dark:` strips would have blown up blast radius. Migration happens screen-by-screen as each rebuilds.
2. **269 `dark:` variants not mass-stripped.** With `<html class="dark">` always on, existing `dark:` rules just always apply. Stripping them blindly would regress live Tremor screens. Deferred per-screen.
3. **`components/tremor/CommandBar.tsx` kept.** Audit flagged for deletion, but it's a bulk-action bar for `DataTableBulkEditor`, not a ⌘K palette. The new palette lives at `components/ui/CommandPalette.tsx` alongside it.
4. **`lucide-react@1.7.0` lacks brand icons.** YouTube/Instagram/LinkedIn/X inline in `components/video/platform-icons.tsx`. Upgrading lucide across the app is its own cleanup task.
5. **Marketing deep rebuild scoped to Hero + Nav + MiniPlanner + UpgradeRail.** The other 11 marketing section components inherit iris via token aliases but still use Tremor / framer-motion internally. Full restyle moved to Medium bucket above.
6. **QualityGate and WeekCalendar light restyle only.** Both live inside `/plan/current` and pick up iris via var aliases but retain Tremor + framer-motion imports. Full restyle queued.
7. **F4 streaming and F6 real publish are visual stubs.** The UI surfaces are correct; the wire-up to streaming `/api/plan/generate` and per-platform publish APIs is the next structural commit.
8. **Phase 5 scroll budget respected.** One pinned moment on Home's Hero; no other marketing surface has one yet. Other pages can add exactly one each as they rebuild.

## Verification harness (to run before shipping)

- [ ] `pnpm typecheck` — zero errors (currently passes)
- [ ] `pnpm build` — zero errors, all 42 routes compile (currently passes)
- [ ] `pnpm test` — ensure existing Jest/Vitest suites are green
- [ ] `pnpm lint` — add lint gate for `text-text-tertiary` on body copy (regression guard for contrast rule)
- [ ] Lighthouse on `/` — perf ≥ 95, a11y ≥ 95
- [ ] Lighthouse on `/plan/current` — perf ≥ 90, a11y ≥ 95
- [ ] Keyboard-only walkthrough: ⌘K opens palette, every seeded action reachable, ⌘⇧A approves all, Escape closes drawer
- [ ] Reduced-motion: Lenis disables, scroll moment on Home capped, reveals reduced
- [ ] `grep -r "prefers-color-scheme\|next-themes" app components` → zero (Phase 2 verified, guard with lint)

## Suggested next session

Start with: cleanup dead `DashboardClient.tsx` + delete `@remixicon/react` dep + drop `framer-motion` in favour of `motion/react` (same API rename). Those three unblock the per-screen `dark:`-strip and shadcn migration without further structural design work.
