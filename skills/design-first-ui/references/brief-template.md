# Brief: {feature / round} — shared by variant builders

> Saved as `docs/design/mockups/{YYYY-MM-DD-feature}/BRIEF.md`. Each builder gets this file **plus its own concept letter only**.
> Builders never see the design-first-ui skill — everything they must obey is in here.
> **SYSTEM mode:** omit Size, Key jobs and Model slice; keep the rest.

- **Size:** {Medium / Large} (design-first-ui Step 0). Medium: redesign ONLY {area}; copy `{chosen file}` as the shell and keep everything outside {area} unchanged.
- **Primary viewport:** {e.g. 1366×768 desktop} — scroll and "first view" are measured here. Also check 390×844.

## Owner feedback (verbatim — why this round exists)

- "{quote}"

## Key jobs

Scored by the UX rubric (Medium: 1–2 jobs that touch {area}; Large: 2–4). Every step must be clickable in the mockup — see "Wiring".

| Job | Who | Starts at (`#state`) | Ends when (`#state` + what is visible) |
|---|---|---|---|
| J{n} {job} | {role} | `#{start-state}` ({entry point, e.g. the to-do}) | `#{end-state}` — {observable end} |

Fewer clicks, fewer surfaces and less scrolling — with no lost clarity — is the goal.

## Model slice (from `docs/design/`)

- Objects + relationships in scope (OBJECTS.md): {object} 1–many {object}; {object} many–many {object} ({rule})
- CTAs in scope per role, and the primary CTA per state: {…}
- Rules that must not change (WORKFLOWS.md §4): R{n} {rule}
- Entry points that must land in context: {to-do / notification} → this screen, {object} in focus, its header in the first view at the primary viewport

## Hard requirements (every variant)

- {one job = one place, no separate X tab, …}
- Owner rules: {from CLAUDE.md Lessons + taste-profile}

## Screens and states (labels verbatim in the reviewer chrome)

1. `#{screen-id}` {label} — {what it must show}
2. {…} plus `#empty`, `#loading`, `#error`

## Canonical data

From `docs/design/sample-data.md` §{n}: {the exact records this round uses}. No other numbers.

## Wiring — every key-job step must be clickable

Each step of each key job is an `<a href="#next-state">` (or a `<label>` / small vanilla-JS handler for ticks, typed amounts and
splits) that leads to the state after that step. The reviewer scores by clicking; a step it cannot click is reported as **unwired**
and sent back to you.

## Mockup file rules

{paste design-first-ui's "Mockup file rules" checklist verbatim}

## Self-review (2–3 rounds before returning)

Screenshot every state with the Playwright CLI — **never** the Playwright MCP browser tools (one shared browser; parallel builders hang it):

```
npx playwright screenshot --viewport-size={W},{H} --wait-for-timeout=800 "file:///{D:/abs/forward/slashes}/variant-{x}.html?clean#{screen-id}" "{abs mockup dir}/shots/{x}-{screen-id}-{W}.png"
```

- Forward slashes in the file URL; absolute output path; `#screen-id` works because screens are `:target`-toggled.
- First-view shots (no `--full-page`) at the primary viewport for landing screens — that is what "first view" means; add `--full-page` for long states.
- Read every PNG and critique: hierarchy (primary action obvious at a glance) · spacing rhythm and alignment · Thai text (no clipped
  marks, no awkward breaks, long names) · density fits the persona · empty/loading/error look designed · 390px: no sideways scroll,
  44px targets · still reads as YOUR concept, not a generic dashboard.

Return: a 3-line self-assessment (strongest, weakest, what you fixed) and, per key job, your click path (`label → #state` per click).
