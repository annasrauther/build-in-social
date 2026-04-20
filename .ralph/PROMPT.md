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

## Phase Sequencing — Strict
Implement phases in order. Never start Phase N+1 until Phase N is verified complete and
all checks pass. See `fix_plan.md` for the task breakdown. Phase 14 (Clerk auth) is ALWAYS last.

## Never Build in Phase 1
- HeyGen / Avatar Mode (any code at all — not even a stub)
- Ayrshare auto-publishing
- Intelligence panel UI
- A/B hook testing

## Quality Gate Before EXIT_SIGNAL
All three must pass before signalling completion:
```
pnpm typecheck   → 0 errors
pnpm test        → 0 failures
pnpm lint        → 0 errors
```

## EXIT_SIGNAL Format
When ALL fix_plan.md items are checked AND all quality gates pass, emit:
```json
{
  "RALPH_STATUS": {
    "EXIT_SIGNAL": true,
    "reason": "All 14 phases complete. typecheck, test, and lint pass with 0 errors."
  }
}
```
