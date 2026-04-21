# Design Audit — Build In Social

Read-only audit. Phase 1 of the Linear/Raycast-tier redesign. See `/Users/annasrauther/.claude/plans/manager-product-redesign-kind-pascal.md` for the full plan.

## 1. Stack snapshot

| Area | Current | Target |
|---|---|---|
| Framework | Next.js 16 (App Router) | unchanged |
| Runtime | React 19 | unchanged |
| Language | TypeScript 5 (strict) | unchanged |
| Package manager | pnpm (lockfile present) | unchanged |
| Styling | Tailwind v3.4.19 + `@tailwindcss/forms` | **Tailwind v4 + `@theme` in globals.css** |
| Primitive layer | Tremor Raw (custom, in `components/tremor/`) | **shadcn/ui in `components/ui/shadcn/`** (coexist, migrate screen-by-screen) |
| Animation | `framer-motion@^12.38.0` | **`motion/react`** (same API) |
| Icons | `@remixicon/react@^4.9.0` + `lucide-react@^1.7.0` (mixed) | **Lucide only**, 16px stroke 1.5 |
| Fonts | Montserrat + Poppins via `next/font/google` | **Geist + Geist Mono** via `geist/font` |
| Theme | `next-themes@^0.4.6`, `darkMode: "selector"`, dark+light scaffolded | **Dark only**, no `next-themes`, no `prefers-color-scheme` |
| Palette | Anthropic warm (`#D97757` brand-500) | **Radix `grayDark` + `irisDark`** via CSS vars |
| Command palette | Custom `components/tremor/CommandBar.tsx` + manual keydown in `components/marketing/Navbar.tsx` | **`cmdk`** via `components/ui/CommandPalette.tsx` |
| Toasts | `@radix-ui/react-toast@^1.2.6` | **`sonner`** with `toast.undo()` helper |
| Data fetching | Raw `fetch()` in client components | **Activate `@tanstack/react-query` (installed, unused)** for mutations |
| Auth | Clerk (`@clerk/nextjs@^6.39.1`) | unchanged |
| Smooth scroll | none | **Lenis** (marketing only, gated on reduced-motion) |

Other notable deps kept: `zod`, `date-fns`, `clsx`, `tailwind-merge`, `tailwind-variants`, `@tanstack/react-table`, `recharts`, `stripe`, `resend`, `@react-email/components`, `@anthropic-ai/sdk`, `@ffmpeg/ffmpeg`, `@aws-sdk/client-s3`, `@atlaskit/pragmatic-drag-and-drop`, `@dnd-kit/core`.

## 2. Route inventory

### Marketing (`app/(marketing)/`)
| Route | Tag | Fate |
|---|---|---|
| `/` | Marketing | **Rebuild (Phase 5)** — primary CTA becomes `MiniPlanner` |
| `/pricing` | Marketing | Rebuild (Phase 5) |
| `/about` | Marketing | Rebuild (Phase 5) |
| `/developers` | Marketing | Rebuild (Phase 5) |
| `/waitlist` | Marketing | Rebuild (Phase 5) |
| `/tools`, `/tools/hook-generator`, `/tools/content-plan-preview`, `/tools/thread-splitter` | Marketing (lead) | Rebuild + `UpgradeRail` (Phase 5) |
| `/alternative/[slug]` | pSEO | Restyle (Phase 5) |
| `/p/[slug]` | pSEO | Restyle (Phase 5) |
| `/changelog` | Marketing | Light restyle (text-first) |
| `/dpa`, `/subprocessors` | Legal | Light restyle |

### Auth (`app/(auth-pages)/`)
| Route | Tag | Fate |
|---|---|---|
| `/login/[[...rest]]`, `/login/sso-callback` | Auth | Restyle only (Phase 6) — Clerk flow untouched |
| `/signup/[[...rest]]` | Auth | Restyle (Phase 6) |
| `/privacy`, `/terms` | Legal | Light restyle |

### Onboarding (`app/(onboarding)/`)
| Route | Tag | Fate |
|---|---|---|
| `/onboarding` | Onboarding | **Rebuild step 1: Context** (Phase 4) |
| `/onboarding/start` | Onboarding | **Merge into `/onboarding`, delete** (Phase 4) |
| `/onboarding/plan-preview` | Onboarding | **Rebuild step 2: Preview** (Phase 4) |
| `/onboarding/voice` | Onboarding | **Rebuild step 3: Voice** (Phase 4) |

### Product (`app/(dashboard)/`)
| Route | Tag | Fate |
|---|---|---|
| `/dashboard` | Product | **Kill — redirect 308 → `/plan/current`** (Phase 3) |
| `/plan`, `/plan/current`, `/plan/[week-id]` | Product | **Rebuild (Phase 3)** — daily loop hub |
| `/videos/[id]` | Product | **Demoted — primary access via drawer in `/plan/current`** (Phase 3) |
| `/videos` | Product | Demote to filterable archive (Phase 6) |
| `/series`, `/series/create`, `/series/[id]` | Product | Restructure (Phase 6) |
| `/guides` | Product | **Kill — content migrates into ⌘K results** (Phase 6) |
| `/settings` | Product | **Consolidate 10 sub-pages → 4 cards (Account / Brand / Connections / Automation)** (Phase 6) |
| `/settings/{profile,voice,billing,platforms,brand,automation,avatar,publishing,webhooks}` | Product | Pure restyle to shadcn + tokens (Phase 6); sub-routes kept for deep-linking |

**Net**: ~42 user-facing routes today → ~35 post-redesign, with daily loop collapsed onto `/plan/current` + ⌘K.

## 3. Component inventory

```
components/
├── tremor/              # custom Tremor Raw primitives — 28 files; retire screen-by-screen
│   ├── Button, Card, Dialog, Drawer, Input, Popover, Select, Switch,
│   ├── Badge, Tooltip, Tabs, Calendar, DatePicker, LineChart,
│   ├── CommandBar.tsx   # ⚠ replaced by cmdk in Phase 2
│   └── ThemeSwitch.tsx  # ⚠ deleted in Phase 2
├── ui/                  # product-specific non-primitive UI
│   ├── ConfirmDialog.tsx   # ⚠ reserve only for irreversible actions
│   ├── PageHeader, StatusCard, StickyBar, Wordmark
├── plan/                # Phase 3 rebuild targets
│   ├── WeekCalendar, InlineScriptEditor, ThreadPreview,
│   ├── CaptionStylePicker, QualityGate
├── onboarding/          # Phase 4 rebuild targets
│   ├── OnboardingProvider, OnboardingShell, OnboardingHeading,
│   ├── StepProgressBar, SourceIngestPanel, DomainPreviewCard,
│   ├── SelectionCard, PlanVideoCard, AvatarPicker, PremiumInput,
│   ├── PremiumTextarea, TrustLine, WeekCalendarView,
│   └── illustrations/   # custom SVG illustrations
├── marketing/           # Phase 5 rebuild targets (22 files)
│   ├── Hero, Navbar, Cta, Footer, Pricing, Faqs, Features,
│   ├── Benefits, Testimonial, LogoCloud, ArrowAnimated,
│   ├── PartnerCallout, TeamGallery, CodeExample, GlobalDatabase,
│   ├── HeroImage, InstaxImage, ThemedImage, Modes, Audience,
│   └── SampleVideoGrid
├── dashboard/
│   └── navigation/      # Sidebar, MobileSidebar, DropdownUserProfile
├── providers.tsx        # ⚠ next-themes ThemeProvider here
└── shared/
```

shadcn/ui is **absent**. Phase 2 scaffolds it into `components/ui/shadcn/`.

## 4. Flow audit — F1–F6 today vs target

| Flow | Today (click count) | Target (click count) | Biggest gap |
|---|---|---|---|
| **F1 Discovery → Signup** | ≥3 clicks: read marketing → CTA → `/signup` → verify → `/onboarding` | 2 clicks: inline `MiniPlanner` → Google OAuth | No inline demo; signup is a leap of faith |
| **F2 Signup → First video** | 4 steps dumping to `/dashboard` (dead drop) | 3 steps ending on `/plan/current` with day-1 drawer open | Voice asked before value shown; dashboard dead-drop |
| **F3 Daily loop** | `/dashboard` → `/plan` → `/plan/current` → click day → `/videos/[id]` | Direct land on `/plan/current`, drawer opens in place | `/dashboard` is vestigial; video opens as a route |
| **F4 Plan-a-week** | Per-day modal loop, no theme input, no batch ops | Theme input → 7-card streaming, locks, bulk approve | Planning is per-day, not per-week |
| **F5 Series** | `/series/create` form → separate `/series/[id]` — unclear relationship to plan | Create materializes future weeks immediately, chips link back | Series floats disconnected |
| **F6 Publish** | Unclear single commit action | One button + per-platform dots, partial success first-class | Publish is atomic, failures ambiguous |

## 5. Anti-patterns (with file:line)

### Hardcoded hex (must migrate to CSS vars)
- `app/layout.tsx:77` — `bg-[#FAF9F5] dark:bg-[#141413]` on `<body>`
- `app/globals.css:27–170, 300, 307` — `#FAF9F5`, `#141413`, `#D97757`, gradient stops
- `components/marketing/Navbar.tsx:101` — `dark:bg-[#141413]/70`
- `components/marketing/Hero.tsx:78` — `dark:from-[#141413] dark:via-[#141413]`
- `lib/clerk-appearance.ts:22–33` — Clerk theme hex values
- `tailwind.config.ts:15–141` — entire brand palette + gradients hardcoded
- `lib/constants/onboarding.ts:126` — `#D97757`
- `lib/mock/brand.mock.ts:12`, `lib/services/brand.real.ts:49`, `lib/types/brand.ts:8` — brand primary color seed (keep as data, not visual token)
- Count of `#fff` / `#000` / `#FFFFFF`: ~13 across 11 files (mostly `public/*.svg` and email templates — acceptable context)

### Light-mode scaffolding (delete in Phase 2 #13)
- `components/providers.tsx:5` — `ThemeProvider` from `next-themes`
- `components/tremor/ThemeSwitch.tsx:6,19` — delete file
- `components/dashboard/navigation/DropdownUserProfile.tsx:23,60` — theme toggle in menu
- `components/marketing/ThemedImage.tsx:4,28` — theme-dependent image loader
- `app/(auth-pages)/login/[[...rest]]/LoginView.tsx:5,19` — Clerk theme switch
- `app/(auth-pages)/signup/[[...rest]]/page.tsx:5,14` — Clerk theme switch
- `package.json:73` — remove `next-themes` dep
- `app/globals.css:96–170` — full `.dark` block (becomes base, not conditional)
- **269 `dark:` variant occurrences across 30 files** — migrate base styles to the `.dark` values, strip the `dark:` prefix

### Font migration
- `app/layout.tsx:2,6,13` — Poppins + Montserrat imports → Geist + Geist Mono
- `lib/email/templates.tsx:23` — email templates retain Poppins (acceptable; emails render in third-party clients)
- `lib/clerk-appearance.ts:26` — Clerk font stack

### Icon library consolidation
- `@remixicon/react` appears in **46 files across 30 paths** (including Tremor primitives `Button.tsx`, `CommandBar.tsx`, `Popover.tsx`, all Tremor icons)
- `lucide-react` already installed
- Migration: replace each `Ri*` with Lucide equivalent during owning phase; remove `@remixicon/react` at end of Phase 6

### Motion migration
- `framer-motion` imports in `lib/motion.ts`, `lib/hooks/useSafeMotion.ts`, onboarding components, illustrations
- Rename package to `motion/react` — API is identical

### Spinners on mutations (violates rule: optimistic + toast, never spinner)
- `components/tremor/Button.tsx:127–128` — `RiLoader2Fill animate-spin` in Tremor Button loading state → **replace with optimistic UI; Button `loading` prop becomes a no-op disable**
- `app/(dashboard)/settings/platforms/page.tsx:293` — `RiLoader4Line animate-spin` on OAuth connect → acceptable for OAuth handshake only; relabel state rather than spin

### Confirm dialogs on reversible actions (violates rule: toast.undo instead)
- `app/(dashboard)/series/[id]/page.tsx:72` — `window.confirm(APP.SERIES.detail.deleteConfirm)` → **`toast.undo("Deleted series", onRestore)`**
- `app/(dashboard)/settings/voice/page.tsx:75` — `window.confirm(...)` for remove voice clone → **`toast.undo("Removed voice clone", onRestore)`**
- `components/ui/ConfirmDialog.tsx` — retain for genuinely irreversible actions (e.g., delete workspace, cancel subscription)

### Copy
- No matches for `Success!` / `Oops!` / `Woohoo!` / `Great!` — **clean**. Preserve in rebuild.
- Spot-check needed: `Save successful`, `Error occurred`, generic "New X" buttons (verb-first pass during rebuilds).

### Command palette (current implementation)
- `components/tremor/CommandBar.tsx:141` — manual `keydown` listener
- `components/marketing/Navbar.tsx:91–92` — second manual keydown for palette trigger
- Neither uses `cmdk` package
- No `?` help overlay, no registered action index

### Numerics
- Audit pending: Tremor `Table`, charts, dashboard stats, plan dates. Phase 3 enforces `tabular-nums` globally via Tailwind variant.

## 6. Keyboard shortcut map

| Shortcut | Today | Target |
|---|---|---|
| ⌘K / Ctrl+K | Opens custom CommandBar (navigation only) | Opens `cmdk` palette with full action registry |
| Esc | Closes Radix Dialogs | unchanged + closes palette |
| — | — | ⌘T — Go to today |
| — | — | ⌘⇧P — Plan week from theme |
| — | — | ⌘⇧R — Regenerate all |
| — | — | ⌘⇧A — Approve all unlocked |
| — | — | ⌘[ / ⌘] / ⌘. — prev / next / current week |
| — | — | ⌘⇧↵ — Publish today |
| — | — | ⌘⇧N — New series |
| — | — | ⌘N — New video for day |
| — | — | ⌘R — Regenerate script |
| — | — | ⌘↵ — Approve script |

All target shortcuts are visible in tooltips + palette rows. Full registry lives in `lib/actions-registry.ts` (new, Phase 2).

## 7. Top 3 redesign targets

1. **`/plan/current` + `/plan/[week-id]`** — daily loop hub (F3) and weekly canvas (F4). Every returning user lives here; every new user lands here post-onboarding. Highest impact × highest surface area.
2. **Onboarding 3-step rebuild** (F2) — owns activation. 4 steps dumping to `/dashboard` is the single biggest conversion leak. Handled as its own Phase 4.
3. **Video drawer + publish strip** (F6) — rides along with Phase 3. Replaces route change to `/videos/[id]` from the plan. Highest-density content UI; defines the publish UX for all platforms.

## 8. Known-good patterns to preserve

- `cn()` helper in `lib/utils.ts` (clsx + tailwind-merge)
- `tailwind-variants` for component variants
- Clerk auth flow (untouched by redesign)
- API route `{ data, error }` shape with Zod validation
- Pragmatic drag-and-drop + dnd-kit (for WeekCalendar reorder)
- `date-fns` date formatting
- Existing tests under `lib/**/*.test.ts`, `app/api/**/*.test.ts` — don't break

## 9. Out-of-scope / deferred

- Analytics surface to replace killed `/dashboard` → Phase 7 roadmap.
- Clerk-rendered auth pages: only the Clerk appearance object migrates to dark tokens; flow stays as-is.
- Email templates (`lib/email/templates.tsx`) keep their existing fonts and hex values — different rendering context.
- Public SVGs (`public/next.svg`, `public/vercel.svg`) — separate assets.

---

**Phase 1 status**: complete. Awaiting approval before Phase 2 (Foundations).
