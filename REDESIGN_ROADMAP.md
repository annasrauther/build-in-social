# Redesign Roadmap

Forward-looking work after the Linear-clone v2 pass. Snapshot as of
`redesign/v2-propagation` HEAD.

## What shipped (v1 + v2)

### v1 — seven-phase foundation (trunk + five branches)
| Phase | Branch | Summary |
|---|---|---|
| 0 | trunk | `chore: snapshot before redesign` (101 files) |
| 1 | trunk | `docs: design audit` — `DESIGN_AUDIT.md` |
| 2 | redesign/foundations | 9 commits: Radix grayDark + iris tokens, Geist, Lenis, shadcn/ui, cmdk palette, sonner undo, optimistic helper, five-states primitives, seen.ts, light-mode removed, `CLAUDE.md` rewritten |
| 3 | redesign/plan-core | `/dashboard` → 308 `/plan/current`, PlanShell + ModeChooser + DayCard + VideoDrawer + PublishStrip, `/plan/current` rewrite |
| 4 | redesign/onboarding | 3-step activation scaffold (Context → Preview → Voice) + OnboardingLayout + draft helper |
| 5 | redesign/marketing | MiniPlanner + Hero rebuild + Navbar restyle + UpgradeRail |
| 6 | redesign/propagation | `/settings` consolidated, `/guides` killed |

### v2 — Linear-clone pass (five branches on top of v1)
| Branch | Summary |
|---|---|
| **redesign/v2-foundations** | IBM Plex Sans + Plex Mono (Geist retired); `nuqs` installed + `NuqsAdapter`; View Transitions API enabled in `next.config.ts` with 180ms ease-out cross-fade CSS; Lucide upgraded to 1.8.0; 3 contrast spot fixes on new surfaces. |
| **redesign/v2-plan-core** | `?` shortcut overlay; `/` slash menu per row; inline title edit on `DayCard`; ⌘↵ approve on focused row; `MoreHorizontal` hover affordance; URL state via nuqs. (Keyboard bindings later removed in v3.) |
| **redesign/v2-onboarding** | `/onboarding/plan-preview` rebuilt on OnboardingLayout (streaming 7-card preview, regenerate all, five states); `/onboarding/voice` rebuilt (6-tile library-voice grid, Play/Pause preview, consent checkbox, exit to `/plan/current?firstRun=1`). Both files stripped framer-motion + OnboardingShell + Tremor entirely. |
| **redesign/v2-marketing** | Cta rebuilt on hairline-edged elevated panel (iris dot texture, no gradients); Footer restyled to tokens + tabular-nums copyright. |
| **redesign/v2-propagation** | DashboardClient + loading retired (route redirected since v1 Phase 3); Button asChild fixed for Radix Slot single-child contract. |

### v3 — Keyboard-shortcut removal + uniform buttons (two branches on v2)
| Branch | Summary |
|---|---|
| **redesign/v3-no-shortcuts** | Removed `⌘K` command palette, `?` overlay, `/` slash-menu key binding, per-row `E` / `⌘↵` bindings, all `Kbd` chip usage. Deleted `components/ui/CommandPalette.tsx`, `ShortcutOverlay.tsx`, `shadcn/command.tsx`, `shadcn/kbd.tsx`, `lib/actions-registry.ts`. Uninstalled `cmdk`. Simplified `Button` / `Tooltip` / `DropdownMenuItem` / `RowCommandMenu` to drop their `shortcut` prop. Double-click rename and visible `MoreHorizontal` button stay; a11y baseline (Tab order, focus rings, Enter/Space, Escape) unchanged. |
| **redesign/v3-raycast-buttons** | Uniform Raycast-style buttons everywhere. Five CSS utility classes in `app/globals.css @layer components` (`.btn-raycast-primary/secondary/outline/ghost/danger`) carry the full plate treatment: gradient + inset top highlight + hairline border + 1px bottom shadow + 0.5px active press. `components/ui/shadcn/button.tsx` rewired to use them. `components/tremor/Button.tsx` **replaced with a compat shim** that maps Tremor variants (primary/secondary/light/ghost/destructive) to shadcn variants and forwards — the 40+ legacy callers across settings/series/auth/marketing/dashboard inherit the Raycast look without a file-level migration. |

### v4 — Three parallel paths (three branches on v3)
| Branch | Summary |
|---|---|
| **redesign/v4-cleanup** | Codemod'd `from "framer-motion"` → `from "motion/react"` across 33 app/component files + 3 lib files (identical API, same version — motion@12 is the rebrand). `pnpm remove framer-motion`. Tailwind v4 `@theme` migration and `@remixicon/react` retirement remain blocked on per-file Lucide mapping / Tremor primitive retirement respectively — moved to the Medium roadmap bucket. |
| **redesign/v4-f4-streaming** | Client-side streaming illusion over the existing `/api/plan/generate` endpoint (the API backend is untouched per the ground rules). New `components/plan/ThemeInput.tsx` carries the F4 theme prompt — single line + primary button, 140-char cap matching the API. `/plan/current` now holds `lockedIds: Set<string>` + `lastTheme: string` state; `generate()` accepts `autopilotHint` and `preserveLocks`. When regenerating with locks, locked cards stay in their day slot and the fresh response backfills the unlocked ones in day order. Toast summarizes the split. `DayCard` gets `locked={...}` + `onToggleLock` wired through from the plan page's state. |
| **redesign/v4-f6-publish** | Real per-platform publish calls via `/api/videos/[id]/publish` replacing the 400ms fake-success stub. New `lib/publish.ts` returns a discriminated union `{ success \| not-implemented \| failed }`. The 501 the backend currently returns (platform OAuth is Sprint 9) is surfaced as a distinct `"not-implemented"` state on `PublishPlatformState` — iris-7 dot + "Soon" label — so users don't think publishing broke. `publishDrawer` is now async + parallel per platform; `retryPlatform` same. When real OAuth + publishing ship, deleting the 501 branch in `lib/publish.ts` makes the UI work end-to-end with no other changes. |

Every branch typechecks and builds cleanly.

## Typography (final)
- **Sans**: IBM Plex Sans, weights 400/500/600, `--font-sans` CSS var.
- **Mono**: IBM Plex Mono, weights 400/500, `--font-mono` CSS var.
- OpenType: `ss02` slashed zero, `calt`, `tnum`.
- Legacy `--font-heading`, `--font-serif` alias to `--font-sans`.

## Interaction grammar (final)
Keyboard shortcuts were removed in `redesign/v3-no-shortcuts`.
The product does not advertise or bind keyboard shortcuts.

- **Row context menu** — visible `MoreHorizontal` (·) button on hover/focus
  of each `DayCard` row opens a Radix dropdown with Rename / Approve /
  Regenerate / Publish / Lock / Reject. Keyboard-only users reach it via
  Tab + `Enter` (native DropdownMenu primitive behavior).
- **Inline rename** — double-click a row title; commits on Enter/blur,
  cancels on Escape.
- **Drawer** — click a row to open the right-side drawer; Escape closes.
- **URL state** (`nuqs`) — `?view=list|calendar`, `?day=<id>`. Survives
  refresh, back/forward, deep links. Still worth adding: `?week=`,
  `?filter=`, etc.
- **A11y baseline retained** — Tab order, `:focus-visible` rings,
  Enter/Space on role="button", Escape on modals.

## Still to do — by effort

### Small (≤ half a day)

- [ ] Remaining marketing sections (Audience/Modes/LogoCloud/SampleVideoGrid/GlobalDatabase/CodeExample/Features/Benefits/Testimonial/Pricing/Faqs/PartnerCallout). All render today via token aliases; the ~43 `dark:text-gray-*` variants carry no semantic harm in dark-only mode but should be swept for cleanliness.
- [ ] `/videos` demote restyle (filterable archive table).
- [ ] `/settings/*` sub-pages (profile, voice, billing, platforms, brand, automation, avatar, publishing, webhooks) — pure token swap.
- [ ] Auth pages (`/login`, `/signup`) chrome restyle; Clerk flow untouched.
- [ ] pSEO template (`/p/[slug]`, `/alternative/[slug]`).
- [ ] Legal pages (`/privacy`, `/terms`, `/dpa`, `/subprocessors`, `/changelog`).
- [ ] Drop `@remixicon/react` dep — replace each `Ri*` import with Lucide or local SVG.
- [ ] Drop `framer-motion` in favour of `motion/react` (identical API; just a rename across ~30 files).
- [ ] Final `dark:` variant sweep.

### Medium (1–2 days)

- [ ] `/series` list — F5 restyle + "+ New series" entry from plan header.
- [ ] `/series/create` — single-screen creator that materializes N upcoming cards into future weeks.
- [ ] `/series/[id]` — tune / pause / archive surface.
- [ ] Tailwind v4 `@theme` migration — unblocked once Tremor primitives are retired.
- [ ] `QualityGate` restyle — drop framer-motion + Tremor Button, straight shadcn swap.
- [ ] `WeekCalendar` rebuild — tokenize colors, 32–36px rows, Lucide, drop hardcoded platform hex.

### Large (structural)

- [ ] `/videos/[id]` — thin it down to a full-screen version of the drawer; keep for deep-linking, remove from primary nav.
- [ ] **F4 streaming plan generation** — wire `ThemeInput` / per-card Regenerate / Lock to `/api/plan/generate` via SSE or streaming JSON, with per-card `useOptimistic` mutations.
- [ ] **F6 real per-platform publish** — replace the 400ms visual stub with actual `/api/publishing/*` endpoints, lazy-OAuth popups, per-platform retry + live-post links.
- [ ] Analytics surface to replace `/dashboard` (future `/activity`).

### Very large (v1.1 backlog, per product rules)

- [ ] Per-platform hook scaffolding (schema change on `videos`).
- [ ] WordPress video publishing adapter.
- [ ] Voice clone management in settings.

## Shared patterns (propagate freely)

- `useOptimistic({ queryKey, applyOptimistic, errorMessage })` → `lib/optimistic.ts`.
- `toast.undo(message, onUndo, { duration })` → `components/providers/Toaster.tsx`.
- `<RowCommandMenu actions={...}>` → `components/ui/RowCommandMenu.tsx`
  (mouse-trigger only, via visible MoreHorizontal button per row).
- `FirstRunHint` backed by `hasSeen/markSeen` → `lib/seen.ts`.
- `EmptyState`, `ErrorState`, `SkeletonRows`, `PartialFailureChip` → `components/ui/states`.
- `Kbd` chip + `Button.shortcut`/`Tooltip.shortcut`/`DropdownMenuItem.shortcut`/`CommandItem.shortcut`.
- `.is-selected` utility — 2px accent left bar + iris@15% bg.
- `nuqs` — `useQueryState` for anything shareable.
- View Transitions — opt-in continuity via `style={{ viewTransitionName: "<unique>" }}` for per-element morphs on route changes.
- `MiniPlanner` + `UpgradeRail` — marketing F1 conversion primitives.
- `OnboardingLayout` + `lib/onboarding-draft.ts` — 3-step chrome + localStorage resume.
- Inline editing on `DayCard` — pattern: local draft state, commit on blur/Enter, cancel on Esc, optimistic mutation upstream.

## Bundle budget (pending)

| Target | Budget | Measured | Status |
|---|---|---|---|
| Marketing JS | ≤ 150 kb | — | Add `@next/bundle-analyzer` in next pass |
| App shell JS | ≤ 300 kb | — | Same |

## Verification harness (ready to enforce)

- [x] `pnpm typecheck` — zero errors
- [x] `pnpm build` — zero errors, all 42 routes compile
- [ ] `pnpm test` — existing suites still green (verify)
- [ ] `pnpm lint` + custom rule: no `text-text-tertiary` on body-sized text
- [ ] Lighthouse on `/` — perf ≥ 95, a11y ≥ 95
- [ ] Lighthouse on `/plan/current` — perf ≥ 90, a11y ≥ 95
- [ ] A11y walkthrough: Tab order follows reading order on every surface;
      every interactive element has a visible `:focus-visible` ring;
      Escape closes every modal/drawer/menu; Enter/Space activates any
      `role="button"`; focus returns to the trigger after dismissal.
- [ ] Reduced-motion: Lenis disables, View Transitions skip, reveals reduced, row-reveal stagger collapses.

## Suggested next session

Pick one:
1. **Token sweep + dep cleanup** — one systematic day to drop `@remixicon/react`, rename `framer-motion` → `motion/react`, strip the last `dark:` variants, and do the Tailwind v4 `@theme` migration. No design decisions; pure cleanup.
2. **F4 streaming** — wire real theme-to-week streaming on `/plan/current` via the existing `/api/plan/generate` + SSE. Highest product value, enables the Linear-grade per-card regenerate/lock loop that the UI already supports.
3. **F6 real publish** — wire `PublishStrip` to actual `/api/publishing/*` endpoints with lazy OAuth popup. Closes the loop F1 → F2 → F3 → F6 end-to-end for the first time.

Option 2 or 3 delivers the biggest user-visible leap; option 1 clears technical debt so future option-2/3 work goes faster.
