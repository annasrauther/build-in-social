# Build In Social — Product Audit

**Date:** 2026-04-18
**Reviewers:** @ux-critic, @ui-crafter, @security-auditor, @content-critic, @performance-guard + 3 cold-user personas (Sam/indie hacker, Priya/non-technical founder, Marcus/skeptical senior engineer)

## Wave 1 — completed 2026-04-18

- **1A Security:** S1 (SQL hardening via typed-allow-list helpers: escInt/escUuid/escEnum/escBool/escString), S2 (removed `DEV_SECRET` fallback), S3 (`outputUrl` restricted to `R2_PUBLIC_URL`), S4 (rate limits added to infer-product, waitlist/avatar, voice/preview, user/profile, videos, videos/[id]), M4 (voice preview now auth-required + VOICE_ID_MAP allowlist), M6 (stopped echoing err.message on billing/render/generate/pseo). 13 files touched. Follow-ups: migrate every `esc(userId)` to `escUuid` individually; extract VOICE_ID_MAP to `lib/constants/voices.ts`; fix pre-existing Node 18/20 vitest break.
- **1B Legal/trust:** Full privacy + terms rewrite with DRAFT banners, subprocessor table (Clerk, Stripe, Anthropic, ElevenLabs, R2, Resend, Upstash, NCB, Pexels), GDPR/CCPA/DPA/retention/breach clauses, content-ownership clause in Terms, self-serve delete commitment. T3 OAuth scope disclosures under each platform card. T4 domain .app → .com. T5 About page founder stubs. T8 empty trust-logo scaffold. T9 VAT clause. New file: `content/legal.ts`. **Counsel review required before launch.**
- **1C Copy sweep:** P1 Intelligence Panel stripped from changelog + pricing + onboarding. P2 HeyGen stripped from avatar teaser + waitlist. P3 Hook-variant/A/B testing removed. T2 fake testimonials → proof-of-mechanism (4 platforms / ~92 videos/mo / 14-day trial / 3 min to first plan). F3 hero rewritten to "Your domain presence, on autopilot." Partner-framing slips fixed on onboarding start, videos empty state, plan error, changelog. Features stats + headline + final CTA rewritten. Buried partner line ("You're not paying for a tool…") now above pricing. **Follow-ups:** remove fabricated testimonials in `lib/constants/onboarding.ts:172-176` (SOCIAL_PROOF_LINES) and orphaned `content/landing.ts` SOCIAL_PROOF.metrics; move hardcoded videos empty-state copy into `content/app.ts`.
- **1D Fonts:** Canonical Montserrat+Poppins enforced in `app/layout.tsx`, `tailwind.config.ts`, `app/globals.css`, `lib/clerk-appearance.ts`, `lib/email/templates.tsx`, `lib/services/claude.real.ts`, `CLAUDE.md`, `knowledge-center.md`, and the 3 agent md files (ui-crafter, implementer, performance-guard).

## Sprint decisions (2026-04-18)

- **Scope:** Everything, in recommended order. All 9 tracks greenlit; will ship in waves.
- **Testimonials (T2):** Replace with proof-of-mechanism stats (no personas until real beta users).
- **Legal (T1, T6):** Draft full templates with "DRAFT — NOT LEGALLY REVIEWED" banner at top; full subprocessor table (ElevenLabs, Anthropic, Clerk, Stripe, Cloudflare R2, Resend, Upstash, NoCodeBackend); GDPR + CCPA + DPA + retention + breach clauses; self-serve delete endpoint. User forwards to counsel before launch.
- **Fonts:** Canonical = **Montserrat (headings, `font-serif`) + Poppins (body, `font-sans`)**. Update CLAUDE.md line 26, `ui-crafter.md`, and any stale specs to match the tech-stack line + `app/layout.tsx`.

---

## Ship status: DO NOT SHIP

Three independent reviewers (ui-crafter, ux-critic, performance-guard) each returned "DO NOT SHIP". Security-auditor scored **6.5/10** against the "enterprise-grade, no one can break it" bar.

All 3 cold-user personas failed to convert:
- **Sam** bounced at pricing (no visible example output, fake-looking testimonials)
- **Priya** stalled at "domain" terminology confusion and jargon (pSEO, platform-native)
- **Marcus** closed the tab at the privacy policy (~300 words, no sub-processor disclosure)

---

## 🔴 BLOCKING — enterprise security

| # | Finding | File | Why it's P0 |
|---|---|---|---|
| S1 | **SQL string-interpolation on every NCB query** (hand-rolled `esc()` misses backticks, comments, UTF-8 quote variants, multi-byte charset tricks) | `lib/services/db.real.ts:92-105` | OWASP A03. Move to parameter binding. |
| S2 | **Static `DEV_SECRET = "dev-render-secret"` fallback** on internal render workers | `app/api/render/process/route.ts:19`, `app/api/render/faceless/route.ts:19` | If `INTERNAL_SECRET` ever unset at build time, worker is publicly callable. Remove fallback; refuse to boot. |
| S3 | **`/api/render/complete` accepts arbitrary `outputUrl`** — compromised worker can store attacker-controlled URLs as video outputs and serve them to users | `app/api/render/complete/route.ts:37,106` | Restrict `outputUrl` to configured R2 prefix. |
| S4 | **No rate limits** on `/api/infer-product`, `/api/waitlist/avatar`, `/api/voice/preview`, `/api/user/profile`, `/api/videos/*` | — | ElevenLabs credit burn + email enumeration. Add `checkRateLimit` everywhere. |

## 🔴 BLOCKING — trust & product integrity

| # | Finding | File |
|---|---|---|
| T1 | **Privacy policy is ~300 words** — no sub-processor disclosure (ElevenLabs, Claude/Anthropic, R2, Resend, Upstash all missing), no GDPR/CCPA, no DPA, no retention window, no breach notification, no self-serve deletion | `app/(auth-pages)/privacy/` |
| T2 | **Fabricated testimonials** ("Funnelkit" is a real WordPress plugin not associated with anyone named Priya; "12,400+ videos posted" on a pre-launch product) | `content/landing.ts:151-267`, `components/marketing/LogoCloud.tsx` |
| T3 | **No "do not train on my content" toggle** and **no OAuth scope preview** on the platforms onboarding step | `app/(onboarding)/onboarding/platforms/page.tsx` |
| T4 | **Domain mismatch**: contact emails use `buildinsocial.app` but canonical is `buildinsocial.com` | legal pages |

## 🔴 BLOCKING — Phase-2 leakage (violates CLAUDE.md §1, §8, §142)

| # | Finding | File |
|---|---|---|
| P1 | **"Intelligence Panel"** in public changelog and Studio pricing bullet | `app/(marketing)/changelog/page.mdx:1-21`, `content/landing.ts:311`, `lib/constants/onboarding.ts:220,236` |
| P2 | **"HeyGen-powered"** in Avatar teaser + waitlist | `content/app.ts:185,195` |
| P3 | **"Hook variant testing"** bullet leaks A/B testing | `lib/constants/onboarding.ts:220`, `content/landing.ts:297` |

## 🔴 BLOCKING — core flow broken

| # | Finding | File |
|---|---|---|
| F1 | **Plan-preview page is orphaned dead code** — `STEP_ROUTES` goes start → platforms → voice → pricing → activation; voice's `goToStep(4)` skips plan-preview entirely. The "see your first content week in 60 seconds" promise is never delivered. | `lib/constants/onboarding.ts:15-21`, `app/(onboarding)/onboarding/voice/page.tsx:408-412` |
| F2 | **No manual/autopilot mode choice in onboarding** — CLAUDE.md requires it; user only meets it post-activation. Contradicts "autopilot is first-class" rule. | onboarding flow |
| F3 | **Hero contradicts product thesis** — "Ship code. We handle the distribution" is ship-announcement framing; autopilot buried as "or zero" footnote | `content/landing.ts:143-145` |
| F4 | **Waitlist form on landing is a dead CTA** — `onSubmit={(e) => e.preventDefault()}` with no handler | `components/marketing/Cta.tsx:38` |

## 🔴 BLOCKING — Lighthouse >90 will fail

| # | Finding | File |
|---|---|---|
| L1 | **Hero LCP uses raw `<img>`, not `next/image`** — 509KB+583KB unoptimized PNGs, no WebP/AVIF, no responsive srcset | `components/marketing/ThemedImage.tsx:22-33` |
| L2 | **TeamGallery ships ~6.5MB of PNGs** on `/about` (7 images @ 700–940KB each) | `components/marketing/TeamGallery.tsx` |
| L3 | **CLS risk** on hero — dimension mismatch on dark-mode swap | `components/marketing/HeroImage.tsx:14-16` |

## 🟡 HIGH QUALITY — fix before launch

- **Design-system font conflict** — CLAUDE.md line 26 says Poppins+Lora; line 85 says Montserrat+Poppins; `app/layout.tsx:2` loads Poppins+Montserrat; `ui-crafter.md` says Geist. Pick one, update all.
- **~30 hardcoded UI strings** bypass `content/app.ts` (dashboard pages, sidebar, settings, videos, error boundaries).
- **Off-palette hex** in `Cta.tsx` (`bg-[#141413]` forces dark mode even in light), `videos/page.tsx` platform pill backgrounds.
- **`alert()` for destructive action** in `settings/profile/page.tsx:246`.
- **Partner-framing slips**: "What do you **create** content about?" on `onboarding/start/page.tsx:708`, "**Generate** your first week of content" on `videos/page.tsx:198`.
- **Niche chips are 100% dev/SaaS** — no match for wellness/lifestyle/non-tech founders.
- **"Platform-native" and "pSEO" jargon** — non-technical users bounce; technical users mock.
- **Strongest line in the codebase is buried**: `"You're not paying for a tool. You're hiring a distribution partner."` lives at `content/app.ts:244` inside step 6 — belongs on the landing hero.
- **"Domain" overloaded** on onboarding start page (website URL vs. content niche, same screen, same word).
- **Settings/voice page is a 28-line stub** — users land on a dead info-only screen.
- **Missing `loading.tsx`** for `settings/*`, `plan/[week-id]`, `videos/[id]`.
- **Dashboard waterfall** — fetches `/api/user/profile` and `/api/videos` in client `useEffect` instead of RSC prefetch.
- **No visible example output anywhere** — Sam's #1 bounce reason. Need a real rendered video on the landing page.

## 🟡 MEDIUM security

- **CSP allows `'unsafe-inline'` and `'unsafe-eval'`** in script-src — move to nonces
- **SSRF in `/api/infer-product`** misses IPv6 private ranges + DNS-rebinding
- **Unauthenticated `/api/voice/preview`** burns ElevenLabs credits
- **`lucide-react ^1.7.0`** in `package.json` — real package is ~0.x; verify this isn't a typosquatter
- **Error responses echo `err.message`** back to client across billing/render/generate/pseo routes

---

## Recommended next-step sequence

1. **Security sprint** → close S1–S4 (route to @implementer under @security-auditor sign-off)
2. **Legal/trust sprint** → rewrite privacy + terms with sub-processor table, self-serve delete, "don't train on my content" toggle, OAuth scope preview
3. **Phase-2 leakage sweep** → remove Intelligence Panel, HeyGen, Hook variant copy
4. **Flow fix** → wire plan-preview into STEP_ROUTES, add mode-choice card
5. **Hero rewrite + real example videos** → autopilot as headline, kill fabricated stats, embed actual rendered output
6. **Perf pass** → `next/image` migration, TeamGallery compression, globe sample reduction
7. **UX polish** → hardcoded strings → `content/app.ts`, font stack decision, niche chips expanded for non-dev ICPs

---

## Persona round 2 (2026-04-18) — 7 new personas, 0 signed up

| Persona | Verdict |
|---|---|
| Jen (marketing solopreneur, 12k LI followers) | Would try if — voice clone ≠ my voice, Mad Libs preview titles, no hook customization, testimonials unrecognized |
| Raj (YC W25 growth-hacker) | Bounced — pricing ceiling (~92/mo = regression), zero attribution tooling, no API, no content-IP language |
| Elena (Head of DevRel, Series B) | Cautious for pre-audience indie hackers; NOT for teams or serious creators — approve-only with no script editor is a dealbreaker |
| Tomás (Brazilian founder, Portuguese + English audience) | Waiting for multi-language — no content-language question, English-only voice previews, no BRL/Pix, no timezone selector |
| Kai (Gen-Z creator, 180k TikTok) | Immediate L — no TikTok (by spec) + Pexels b-roll + library voice = exactly the slop their audience mocks |
| Hiro (blind founder, a11y auditor) | Bounced at `/onboarding/start` — NicheChip is a non-keyboard-operable `motion.span`, no skip link, zero WebVTT captions generated |
| Mike (55, $3M ARR B2B CEO) | Closed the tab — About page has zero named founders, Terms missing DPA/GDPR/SOC2/subprocessors, no team plan, no VAT invoicing |

### NEW findings from round 2 (not in round-1 audit)

#### 🔴 BLOCKING — product depth (all personas converged)

| # | Finding | File |
|---|---|---|
| E1 | **No script editor / hook regeneration / variant forking** — plan page has Approve / Approve All only. Cannot edit script, swap CTA, rewrite hook. Approve-only is a dealbreaker for anyone with reputation. | `app/(dashboard)/plan/current/page.tsx`, `components/plan/*` |
| E2 | **Zero attribution tooling** — no UTM params on pSEO URLs, no analytics webhooks, no Segment / PostHog / Zapier integration. Cannot prove ROI. | product-wide |
| E3 | **No public API / programmatic plan trigger** — founders who ship can't wire "shipped feature → auto-generate plan" from their own webhooks. | — |
| E4 | **Usage ceiling is a regression for heavy users** — Studio caps at ~92/mo. No overage, no usage-based tier. | `content/landing.ts` pricing |
| E5 | **No content-IP / ownership language anywhere** — who owns generated scripts? Can user export if they cancel? Silent. | legal pages |
| E6 | **One script body per video, not platform-specific hook scaffolding** — "platform-native" claim is unverifiable from the UI; hook structure/pacing/CTA does not visibly differ by platform. | `app/(dashboard)/plan/current/page.tsx`, `lib/types/plan.ts` |

#### 🔴 BLOCKING — trust & growing-up gaps (Mike + Elena)

| # | Finding | File |
|---|---|---|
| T5 | **About page has ZERO named founders / bios / LinkedIn profiles** — signs off "– The Build In Social team". No company registration, no country of incorporation. | `app/(marketing)/about/` |
| T6 | **Terms is missing DPA, SLA, GDPR clause, SOC2 claim, subprocessor list, uptime commitment, breach-notification terms** — EU-selling dealbreaker. | `app/(auth-pages)/terms/` |
| T7 | **No team / multi-seat plan** — no shared voice library, no reviewer/approver role, no brand-safety controls. | pricing |
| T8 | **No customer logos / G2 / Capterra / "as seen in"** trust scaffold. | landing |
| T9 | **No VAT-compliant invoicing** story — Stripe default receipts ≠ what an accountant needs at $79+/mo. | billing |

#### 🔴 BLOCKING — internationalization (Tomás)

| # | Finding | File |
|---|---|---|
| I1 | **No content-language question in onboarding** — product assumes English output. ElevenLabs supports multilingual clones but product never says so. | `app/(onboarding)/onboarding/start/page.tsx`, `voice/page.tsx` |
| I2 | **All 6 library voices are English names + English preview text** (Alex, Morgan, Sam, Jordan, Casey, Riley) | `app/(onboarding)/onboarding/voice/page.tsx` |
| I3 | **No timezone selector anywhere** — autopilot posting cadence is a black box for non-US audiences. | `settings/*`, `dashboard/*` |
| I4 | **No local payment methods** — no BRL/Pix/boleto mention, no local-tax/IOF handling (Stripe Brazil supports Pix). | pricing |
| I5 | **All niche chips + testimonials English-only** — zero LATAM/EMEA signal. | `app/(onboarding)/onboarding/start/page.tsx`, `content/landing.ts` |

#### 🔴 BLOCKING — accessibility (Hiro, WCAG violations)

| # | Finding | File |
|---|---|---|
| A1 | **NicheChip is a `motion.span` with `onClick`** — no `role="button"`, no `tabIndex`, no keyboard handler. Entire niche-selection step is unreachable by keyboard. | `app/(onboarding)/onboarding/start/page.tsx:53-109` |
| A2 | **SelectionCard has no `aria-pressed` / `aria-selected`** — selected state communicated via color + checkmark only | `components/onboarding/SelectionCard.tsx:106-124` |
| A3 | **No skip-to-content link anywhere in the marketing layout** — forces full-chrome tab on every page load | grep confirms zero hits repo-wide |
| A4 | **Navbar hamburger has no `aria-label` or `aria-expanded`** — VoiceOver announces "button" with no state | `components/marketing/Navbar.tsx:73-83` |
| A5 | **Stale product name in hero alt** — `"A preview of the Video Auto Pilot dashboard"` — not renamed to Build In Social | `components/marketing/HeroImage.tsx:13` |
| A6 | **No `aria-live` regions anywhere** — profile/video fetches, toasts, voice playback are silent to screen readers (single hit is a Tremor Calendar, unrelated) | repo-wide |
| A7 | **Burned-in captions (FFmpeg overlay filters), zero WebVTT tracks** — videos shipped to 4 platforms have no machine-readable captions. Biggest single omission for a video product. | `lib/services/ffmpeg.ts:216-248` |

### 🟡 HIGH QUALITY — reinforced from round 1 + sharpened

- **Fake testimonials** flagged by Jen (follows the indie scene, recognizes none), Raj, Elena, Mike — universal bounce signal
- **Niche chips 100% dev/SaaS** — missing wellness, creator economy, real-estate, student/productivity (Kai, Tomás, Priya)
- **Voice library names (Alex, Morgan, Sam, Jordan, Casey, Riley) skew American** — reinforces i18n gap
- **Preview page titles look like Mad Libs** ("Why {niche} founders are rethinking distribution in 2026") — Jen called it out specifically
- **60-second voice clone ≠ the user's voice** — only timbre, not cadence (Jen)
- **"Price-lock" absent** — feels VC-subsidized, smells 3x bump at renewal (Mike)

### Updated next-step sequence

1. Security sprint → S1–S4 (unchanged)
2. Legal/trust sprint → privacy + **full DPA/GDPR/SOC2/subprocessor rewrite**, named founders on About, self-serve delete, OAuth scope preview (T1–T9)
3. Phase-2 leakage sweep (unchanged)
4. Flow fix + **add editorial controls** (F1–F4, E1, E6) — script editor, hook regenerate, per-platform hook scaffolding surfaced in UI
5. Hero rewrite + real example videos + **remove fake testimonials** (Jen/Raj/Elena/Mike all flagged)
6. Perf pass (unchanged)
7. UX polish + **a11y pass** (A1–A7) + font decision + niche chip expansion
8. **NEW — Product-depth sprint**: script editor (E1), attribution/UTM (E2), public API (E3), team/multi-seat tier (T7), content-IP clause (E5), VTT caption generation (A7)
9. **NEW — i18n sprint**: content-language selector (I1), multilingual voice copy (I2), timezone selector (I3), Pix/BRL payment (I4)

