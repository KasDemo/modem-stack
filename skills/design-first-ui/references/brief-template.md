# Brief: {feature / round} — shared by variant builders

> Saved as `docs/design/mockups/{YYYY-MM-DD-feature}/BRIEF.md`. Each builder gets this file **plus its own concept letter only**.
> Builders never see the design-first-ui skill — everything they must obey is in here.
> **Refresh / Change taste round:** keep every section; Size = Large; the Taste mode line says which layers are open — propose them.

- **Taste mode:** {Keep / Refresh / Change taste} — locked: {layers}; open: {layers}. {Probe round: build ONLY `{screen}` at {viewports}, no other states, no wiring — see design-first-ui Step 2b.} {Full build after a probe: chosen probe `{probe-x.html}` + merge notes — the visual anchor; keep its look.}
- **Size:** {Medium / Large} (design-first-ui Step 0). Medium: redesign ONLY {area}; copy `{chosen file}` as the shell and keep everything outside {area} unchanged.
- **Primary viewport per role:** {e.g. ward head 1366×768 · nurse 390×844} — scroll and "first view" are measured per job at its role's viewport.

## Owner feedback (verbatim — why this round exists)

- "{quote}"

## Key jobs

Scored by the UX rubric (Medium: 1–2 jobs that touch {area}; Large: 2–4). Every step must be clickable in the mockup — see "Wiring".

| Job | Who | Starts at (`#state`) | Ends when (`#state` + what is visible) |
|---|---|---|---|
| J{n} {job} | {role} | `#{start-state}` ({entry point, e.g. the to-do}) | `#{end-state}` — {observable end} |

Fewer clicks, fewer surfaces and less scrolling — with no lost clarity — is the goal.

## Skills — load them yourself, first

Load `ui-ux-pro-max` and `frontend-design` with the Skill tool (not a summary). Search ui-ux-pro-max for: {product type} · {screen archetypes, e.g. data table, form, dashboard, mobile bottom navigation, notifications}. {Keep: ignore its palette and font suggestions — the DESIGN_SYSTEM decides. / Refresh, Change taste: its styles, palettes and font pairings are candidates for the open layers.} Your return lists **at least 5 guidelines you applied, each with where**.

## Screen focus (the contract — each screen's one primary answer and one primary action)

| Screen | Primary answer (seen first) | Primary action (one) | Secondary | Cut / never here |
|---|---|---|---|---|
| {screen} | {…} | {…} | {…} | {…} |

## Banned patterns

Read `{absolute path to design-first-ui/references/slop-patterns.md}` — none of them may appear, plus this project's rejected list: {from taste-profile}.

## Model slice (by reference — read these, don't expect them copied here)

- Walkthroughs to implement visually: WORKFLOWS.md §5 J{n}, J{n} (owner-approved {date}) — the steps, results and unhappy paths are fixed; you decide layout
- Objects, relationships and CTAs in scope: OBJECTS.md §2–3 rows for {objects}
- Rules that must not change: R-{nnn} (read them in `docs/PRD.md` §5 — cite, don't copy)
- Entry points that must land in context: {to-do / notification} → this screen, {object} in focus, its header in the first view at the primary viewport

## Hard requirements (every variant)

- {one job = one place, no separate X tab, …}
- Owner rules: {from CLAUDE.md Lessons + taste-profile}

## Screens and states (ids and labels exactly as in `docs/design/SCREENS.md`)

{list the state ids in scope, e.g. `#day` · `#book` · `#pending` · `#empty` · `#error` — never invent new ones here; add them to SCREENS.md first}

## Canonical data

From `docs/design/sample-data.md` §{n}: {the exact records this round uses}. No other numbers.

## Wiring — every key-job step must be clickable

Each step of each key job is an `<a href="#next-state">` (or a `<label>` / small vanilla-JS handler for ticks, typed amounts and
splits) that leads to the state after that step. **An independent critic will click-test every key job and every control**
(filters, period buttons, "try …" links, toggles, retry): a control that changes a label but not the figures, a link that lands in
a state contradicting itself, or a "loading…" that never ends is a must-fix. Make each one really work.

## Mockup file rules

Read `{absolute path to design-first-ui/references/mockup-rules.md}` — every rule applies.

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

Return: a 3-line self-assessment (strongest, weakest, what you fixed), the applied-guidelines list (≥ 5, each with where), and, per key job, your click path (`label → #state` per click).
