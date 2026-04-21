# Build In Social — Ralph Prompt

## What This Project Is
Build In Social is a social media distribution SaaS for indie developers and SaaS founders.
It generates platform-native content (YouTube Shorts, Instagram Reels, LinkedIn, X), assembles
faceless videos via FFmpeg WASM, auto-posts to platforms, and creates pSEO pages per video.
Full product spec: `knowledge-center.md` (672 lines). Read it when you need product context.

## Master Specification
`CLAUDE.md` at the project root is the authoritative source of truth. Read it completely before
every iteration. It contains: design system rules, component conventions, route structure,
tech stack, product rules, and the 14-phase build order.

## Agent System — Non-Negotiable
This project has 22 specialist agents in `.claude/agents/`. Routing rules:
- Always invoke `@manager` first — it routes to the correct specialists
- `@architect` must run before `@implementer` on any new feature
- `@tester` must run after `@implementer`
- `@security-auditor` must run on any auth, billing, or user-data change
- `@ui-crafter` + `@ux-critic` must run on every user-facing feature

See `.ralph/specs/agents.md` for the full agent roster and responsibilities.

## Current Mission — Persona Swarm Fix Plan
All 14 original phases are complete. The current mission is to fix 13 issues identified
by a paid user persona swarm (15 personas, $19–$149/mo, 3 days to 6 months tenure).
See `fix_plan.md` → section `## Persona Swarm Fix Plan — 2026-04-21` for the full list.

Work through the unchecked tasks in priority order:
1. CRITICAL first — Avatar Mode sidebar bug (product spec violation from CLAUDE.md rule #1)
2. HIGH second — mode memory, nav rename, subtitle differentiation, metrics pipeline
3. MEDIUM third — copy exclusion fix, script preview, repurposing textarea
4. LOWER last — progress card, upgrade copy, bottom nav audit, language config

### Task routing guidance
For each task, follow the agent chain listed in its `— agents:` annotation:
- Tasks marked `@architect` first: write an architect brief before touching code
- Tasks marked `@copywriter` first: update content/app.ts strings before any component changes
- Tasks marked `@implementer` only: proceed directly to code changes
- Tasks with `@security-auditor`: do not mark complete until security review is done

### Critical fix — do this first
**Avatar Mode sidebar bug** (CLAUDE.md rule #1 violation):
- `components/dashboard/navigation/Sidebar.tsx` lines 71–86: change `href="/waitlist"` to `href="/videos"`, remove the `<span>Soon</span>` badge
- `components/dashboard/navigation/MobileSidebar.tsx`: same fix
- `app/(marketing)/waitlist/page.tsx`: add redirect to /videos
- After fixing: mark both Avatar Mode sidebar tasks as `[x]` in fix_plan.md

## Phase Sequencing — Complete
All 14 original phases are verified. Do NOT re-run phase verification tasks.
Jump directly to unchecked tasks in `## Persona Swarm Fix Plan — 2026-04-21`.

## Never Build
- Ayrshare auto-publishing
- Intelligence panel UI (until 5+ published videos with metrics)
- A/B hook testing

## Quality Gate Before EXIT_SIGNAL
All three must pass before signalling completion:
```
pnpm typecheck   → 0 errors
pnpm test        → 0 failures
pnpm lint        → 0 errors
```

## EXIT_SIGNAL Format
When ALL fix_plan.md Persona Swarm items are checked AND all quality gates pass, emit:
```json
{
  "RALPH_STATUS": {
    "EXIT_SIGNAL": true,
    "reason": "All 13 persona swarm issues fixed. typecheck, test, and lint pass with 0 errors."
  }
}
```
