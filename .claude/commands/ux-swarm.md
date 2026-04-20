Dispatch the 13 UX persona agents against a route and aggregate their findings into a single prioritized backlog.

## Usage

```
/ux-swarm [route-or-path]
```

- No argument → defaults to `/` (marketing landing).
- Argument is a route (`/pricing`, `/dashboard`, `/signup`) or a component path (`components/marketing/Hero.tsx`).

## Step 1 — Start dev server

Ensure the Next.js dev server is up. Use `preview_start` if no server is running. If one is already running, reuse it.

## Step 2 — Capture baseline

Capture two screenshots via `preview_screenshot`:
1. Desktop — resize to **1440×900** via `preview_resize`.
2. Mobile — resize to **390×844**.

Capture a DOM snapshot via `preview_snapshot` and console logs via `preview_console_logs`.

Save paths and snapshot content to reference in the persona briefs.

## Step 3 — Dispatch the 13 personas in parallel

**Send a single message with 13 `Agent` tool calls.** Do not dispatch sequentially — the personas must run in parallel.

For each persona, set `subagent_type` to the persona's `name` field (e.g. `persona-typography-purist`). Include in the prompt:
- The route being reviewed.
- Both screenshot paths.
- Relevant source file paths (for marketing routes: `content/landing.ts` + `components/marketing/*.tsx`; for dashboard: the route folder + `components/dashboard/*`).
- The DOM snapshot excerpt.
- Reminder to follow their rubric + output format.
- Instruction: anchor every complaint to a file:line OR a rendered element.

The 13 personas to dispatch:

1. `persona-typography-purist`
2. `persona-motion-designer`
3. `persona-systems-designer`
4. `persona-microinteraction-nerd`
5. `persona-a11y-advocate` ← findings auto-promote to Blocker/High
6. `persona-conversion-pm`
7. `persona-information-architect`
8. `persona-mobile-first`
9. `persona-dark-mode-connoisseur` ← capture a dark-mode screenshot before dispatching
10. `persona-first-time-visitor`
11. `persona-power-user`
12. `persona-brand-aesthete`
13. `persona-skeptic-churner`

For `persona-dark-mode-connoisseur`, capture an additional screenshot in dark mode first (toggle theme via `preview_eval` — e.g. `document.documentElement.classList.add('dark')` — or use the visible ThemeSwitch in the Footer).

## Step 4 — Aggregate

When all 13 reports return, merge them into a single prioritized backlog.

### Priority rules

- **Blocker** — any `persona-a11y-advocate` finding, OR any partner-framing violation (forbidden phrases from CLAUDE.md rule #6), OR any verdict of "Reject" from ≥ 2 personas on the same issue.
- **High** — issue cited by ≥ 3 personas (dedup by file:line or element anchor), OR consensus between `persona-typography-purist` + `persona-systems-designer` on the same element, OR any single-persona finding with file:line that cites a WCAG/CLAUDE.md rule.
- **Medium** — issue cited by 2 personas.
- **Low / taste** — single-persona finding without a hard rule reference.

### Dedup rule

Two findings are the same issue if they reference the same file:line OR the same rendered element anchor (text content + component). Merge them, list all citing personas.

## Step 5 — Write the report

Write to `.claude/swarm-reports/<YYYY-MM-DD>-<route-slug>.md`. Create the directory if it doesn't exist.

Report template:

```markdown
# UX Swarm Report — <route> — <date>

**Personas dispatched:** 13
**Verdicts:** X Ship / Y Needs polish / Z Reject

## Blockers
1. [file:line or element] — [issue] — cited by: [@persona-a, @persona-b] — fix: [one line]

## High
1. [file:line or element] — [issue] — cited by: [@persona-a, @persona-b, @persona-c] — fix: [one line]

## Medium
...

## Low / taste
...

## Per-persona verdicts
| Persona | Verdict | Top rubric weakness | Top rubric strength |
|---|---|---|---|

## Deltas from previous report (if applicable)
[List issues that were in previous report at this route but fixed now]
```

## Step 6 — Summarize to the user

After writing the report, respond with:
- Total counts per priority tier.
- Top 3 Blockers (if any).
- Path to the full report.
- One-line recommendation: "Ship" / "Hold for polish" / "Major rework needed".

## Notes

- If `preview_start` fails or the dev server won't boot, fall back to pure source-code review and mark the report `observation: source-only` — personas still work from the code but skip screenshot-based rubric items.
- If any persona returns malformed output, note it in the report under "Agent errors" but still aggregate what you can.
- Do not commit any changes from this command — its output is a report only.
