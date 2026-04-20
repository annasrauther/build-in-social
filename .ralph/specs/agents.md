# Agent Roster — Build In Social

All agents live in `.claude/agents/`. Always invoke `@manager` first — it routes to the
right specialists in the right order. Never skip the routing step.

## Mandatory Sequencing Rules
1. `@architect` → `@implementer` → `@tester` (always, for every feature)
2. `@security-auditor` → any auth, billing, or user-data change
3. `@ui-crafter` + `@ux-critic` → every user-facing feature (run both, not one)

## Core Development Agents

| Agent | Invoke When |
|-------|-------------|
| `@manager` | ALWAYS FIRST — orchestrates everything |
| `@architect` | Designing any new feature, API, or data model |
| `@implementer` | Writing code (after @architect approves design) |
| `@tester` | Writing/running tests (after @implementer) |
| `@security-auditor` | Auth changes, billing, user data, API keys, webhooks |
| `@devops` | CI/CD, deployment, environment config |
| `@cost-optimizer` | Claude API usage, Upstash/R2 costs, render pipeline costs |
| `@performance-guard` | Render pipeline, FFmpeg WASM, TanStack Query caching |

## UI/UX Agents (run BOTH on every user-facing feature)

| Agent | Invoke When |
|-------|-------------|
| `@ui-crafter` | Every UI component or page |
| `@ux-critic` | Every user flow or interaction |

## Content Agents

| Agent | Invoke When |
|-------|-------------|
| `@copywriter` | Any user-facing copy, CTAs, empty states, error messages |
| `@content-critic` | Reviewing generated scripts, quality gate copy, autopilot output |
| `@hook-specialist` | Video hook writing, per-platform opening lines |
| `@platform-expert` | Platform-specific requirements (YouTube, Instagram, LinkedIn, X) |

## Persona Agents (use for design review and edge-case validation)

| Agent | Use For |
|-------|---------|
| `@persona-a11y-advocate` | Accessibility audit — keyboard nav, ARIA, contrast |
| `@persona-brand-aesthete` | Brand consistency — palette, typography, spacing |
| `@persona-conversion-pm` | CTA placement, pricing page, upgrade prompts |
| `@persona-dark-mode-connoisseur` | Dark mode correctness |
| `@persona-first-time-visitor` | Landing page clarity, onboarding first impression |
| `@persona-information-architect` | Navigation structure, content hierarchy |
| `@persona-microinteraction-nerd` | Hover states, transitions, feedback animations |
| `@persona-mobile-first` | Mobile layout, touch targets ≥ 44px |
| `@persona-motion-designer` | Framer Motion animations, page transitions |
| `@persona-power-user` | Dashboard efficiency, keyboard shortcuts |
| `@persona-skeptic-churner` | Retention risk — friction points, confusing copy |
| `@persona-systems-designer` | Component reuse, design token consistency |
| `@persona-typography-purist` | Font pairing, line-height, type hierarchy |
