# Fix Plan — Build In Social

## Priority 1: Foundation (Phases 1–5) — Verify & Complete
- [ ] Task: Verify Tailwind token system — brand-500 (#D97757), full 50–950 scale, light bg #FAF9F5, dark bg #141413 wired in tailwind.config.ts
- [ ] Task: Verify Montserrat (font-serif) + Poppins (font-sans) loaded via next/font/google, applied globally
- [ ] Task: Verify Tremor Raw primitives in components/tremor/ are unmodified copies from official template
- [ ] Task: Verify base layout — (marketing) uses Navbar+Footer shell, (dashboard) uses Sidebar shell, (onboarding) uses clean layout
- [ ] Task: Verify dark/light mode via next-themes — system preference auto-detected, ThemeSwitch component works
- [ ] Task: Verify landing page — all sections present: Hero, Features, Benefits, Pricing, Faqs, Testimonial, LogoCloud, PartnerCallout, Footer — domain-presence copy (not ship-announcements)
- [ ] Task: Verify onboarding flow — 5 steps: domain/niche → platforms → voice → plan-preview (with mode choice) → pricing/activation
- [ ] Task: Verify quality gate component (QualityGate.tsx) — runs 3 specific questions, non-skippable, only in manual mode
- [ ] Task: Verify autopilot mode in plan-preview — bypasses quality gate, shows "Build In Social is creating" framing
- [ ] Task: Verify dashboard shell — Sidebar, BottomNav (mobile), overview cards, weekly plan view
- [ ] Task: Verify weekly plan generator — manual mode + autopilot mode both functional
- [ ] Task: Verify video library page (/videos) — list view with status, platform icons, pSEO link
- [ ] Task: Verify individual video page (/videos/[id]) — script, renders, publish status, pSEO status

## Priority 2: Service Pipeline (Phases 6–10)
- [ ] Task: Verify faceless render pipeline — ElevenLabs voice synthesis → Pexels b-roll fetch → FFmpeg WASM assembly → R2 upload. All real services switch on when API keys set in .env.local
- [ ] Task: Verify mock fallbacks work for all services when API keys absent — lib/mock/ pattern complete
- [ ] Task: Verify pSEO generation triggers automatically on render complete (api/pseo route + post-render hook)
- [ ] Task: Verify pSEO page renders at /p/[slug] with video embed + article content
- [ ] Task: Verify Stripe billing — 4 tiers: Starter $19 / Solo $39 / Creator $79 / Studio $149
- [ ] Task: Verify hard video caps per tier are enforced — hard-pause on overage with QuotaExhaustedDialog
- [ ] Task: Verify Starter tier blocks: pSEO generation, voice clone, autopilot scheduling
- [ ] Task: Verify Studio tier unlocks: all 4 platforms + priority rendering
- [ ] Task: Verify Stripe webhook handler (api/webhooks) processes subscription events correctly
- [ ] Task: Verify platform OAuth connections for all 4 platforms: YouTube, Instagram, LinkedIn, X — settings/platforms page
- [ ] Task: Verify Resend email — all 6 templates wired: welcome, weekly-plan-ready, render-complete, publish-success, quota-warning, billing-event
- [ ] Task: Verify rate limiting on all API routes via Upstash Redis

## Priority 3: Final Phases (11–14)
- [ ] Task: Verify intelligence data collection (Phase 11) — silent background ingest, no UI, api/ingest route collecting metrics
- [ ] Task: Verify intelligence panel is hidden until user has 5+ published videos with metrics
- [ ] Task: Verify Avatar waitlist page — visible everywhere with "Coming soon" badge + waitlist CTA, no HeyGen code anywhere
- [ ] Task: Verify all settings pages complete — profile, voice, platforms, billing, brand, publishing, automation, webhooks
- [ ] Task: Verify voice settings — ElevenLabs clone set once during onboarding, no re-record UI (v1.1 backlog)
- [ ] Task: Verify Clerk auth integration (Phase 14) — ClerkProvider wrapping app, clerkMiddleware in proxy.ts, getAuthUserId() in all protected routes
- [ ] Task: Verify dev auth bypass — NEXT_PUBLIC_DEV_AUTH=1 enables one-click sign-in, DEV_AUTH gates on NODE_ENV=development, /api/dev/* returns 404 in production
- [ ] Task: Verify all app strings live in content/app.ts — no hardcoded strings in components

## Priority 4: Quality & Polish
- [ ] Task: Run pnpm typecheck — fix all TypeScript errors to 0
- [ ] Task: Run pnpm test — fix all failing tests to 0
- [ ] Task: Run pnpm lint — fix all ESLint errors to 0
- [ ] Task: Verify mobile-first — all touch targets ≥ 44px, responsive layouts work on 375px viewport
- [ ] Task: Verify all 4 platform-specific video durations set correctly by Build In Social (user cannot choose)
- [ ] Task: Verify partner framing throughout — "Build In Social is creating" never "generate video"
- [ ] Task: Verify env.ts validates all required environment variables — no direct process.env usage
- [ ] Task: Verify all API routes return { data, error } shape with Zod input validation

## Discovered
<!-- Ralph appends newly identified tasks here during development -->
