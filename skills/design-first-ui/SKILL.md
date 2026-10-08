---
name: design-first-ui
description: Use when a task adds a new screen or visibly changes existing UI — the owner says "design this page" / "ออกแบบหน้า", a brainstorming spec was just approved and includes new/changed screens (run this BEFORE writing-plans), an implementation plan contains UI work that has no chosen mockup yet, or docs/DESIGN_SYSTEM.md is missing/stub. Sizes the change first — small tweaks with existing components (e.g. swapping a button variant) skip mockups and get before/after screenshots; sections and new screens get competing HTML mockup variants, the owner's pick, and a locked visual target before any implementation code is written.
---

# Design-First UI

**The owner picks the UI from real variants BEFORE implementation.** He is tired of revamping AI-generated UI after the fact. Never implement a screen nobody chose. A plan that says "add a settings page" is not a design — it's a brief for this skill.

Two modes:

| Mode | When | Output |
|---|---|---|
| **SYSTEM** | Once per project: `docs/DESIGN_SYSTEM.md` missing or stub — run as the **first flow's** round, after its walkthrough | 3 variants of that flow, different in style **and** structure → the winner becomes `docs/DESIGN_SYSTEM.md` **and** the flow's visual target (key jobs and UX scoring apply as in FEATURE mode) |
| **FEATURE** | Default, per feature | 3 variants of the feature's **entire screen flow**, all obeying `DESIGN_SYSTEM.md` |

**Always 3 variants for Medium and Large changes — never ask how many** (owner rule 2026-10-01; Small changes get none, see Step 0). Build more or fewer only when the owner says so unprompted.

If `DESIGN_SYSTEM.md` is missing or a stub when FEATURE mode is requested, this round **is** the SYSTEM round. **SYSTEM round = a
FEATURE round** (walkthrough gate, key jobs, model slice, click paths, UX score) **plus** freedom in palette and type **plus**
extracting `DESIGN_SYSTEM.md` from the winner. Before its concepts, ask the owner **one** question — known likes and dislikes (layouts,
patterns like modals, apps they like) — and seed `docs/design/taste-profile.json` with the answer. The design system is the contract; features interpret it, they don't renegotiate it.

## Step 0 — Size the change (FEATURE mode)

Not every visible change deserves three mockups (owner rule 2026-10-01). Size it first:

| Size | Test | Examples | What to do |
|---|---|---|---|
| **Small** | Uses only components and tokens that already exist, and makes **no new layout decision** | swap a button variant (primary → secondary), change copy/labels, apply an existing color token, add a field to an existing form following its pattern, reorder two items | **No mockups.** Implement per `DESIGN_SYSTEM.md`, check the control sits on the right object (`docs/design/OBJECTS.md` CTAs), then show the owner before/after screenshots (desktop + 390px, via browser-verification) as clickable links. Approved → done. Rejected or "hmm" → re-size as Medium. |
| **Medium** | A new section/component inside an existing screen, or a layout change to part of a screen | add a filter bar, a summary card row, a new table column group with actions | **3 variants of that section only** — each mocked inside a faithful copy of its surrounding page (header + neighbors), not the whole flow. Steps 1–6 apply, scoped to the section. |
| **Large** | A new screen, or a change to how a flow works | new page, new multi-step flow, navigation change | **The full process below** — 3 variants of the entire flow. |

When the size is unclear, ask **one** AskUserQuestion with your recommended size first. Never size down to dodge the process: if a "small" change needs a layout decision, it is Medium. Owner comments on a Small change still go into `taste-profile.json`.

## Step 1 — Read context first (never skip)

Read, in order:

**Gate (FEATURE mode Medium/Large, and the first-flow SYSTEM round):** every key job in scope has an **owner-approved walkthrough** in `WORKFLOWS.md` §5 (heading
stamped `✅ owner-approved YYYY-MM-DD`). Missing or unstamped → run the `ux-model` walkthrough session with the owner first. The
walkthrough settles *what happens*; this skill only decides *how it looks*.

0. **The UX model** — `docs/design/OBJECTS.md`, `WORKFLOWS.md`, `SCREENS.md`, `sample-data.md` (the `ux-model` skill). This is the whole-app picture: which objects this screen shows, which CTAs belong on them, which key jobs pass through it, where users arrive from. Missing or stale → run `ux-model` first — **slice first**: build or fix only the objects, jobs and screens this round touches (a whole-app model on an existing app is its own task, done when the owner wants it, not before a filter bar). Designing without it is how buttons end up on the wrong object.
1. `docs/design/taste-profile.json` — the owner's accumulated taste. Variants start near it, they don't rediscover it.
2. `docs/DESIGN_SYSTEM.md` — tokens and rules every FEATURE variant must obey.
3. The feature's spec/plan in `docs/plans/` (older sessions may have saved it under `docs/superpowers/specs/` or `docs/superpowers/plans/`), and `docs/PRD.md` for product context.
4. Existing pages/components in the codebase — reuse established patterns unless a variant deliberately challenges one.

Then confirm the five dimensions of context (auto-gather what you can; ask for what's missing, **max two rounds of questions**):

1. **Who** — persona, expertise, familiarity with the product
2. **Key jobs** — from `WORKFLOWS.md` §2 (ids `J1`…), each "who · starts where · ends when": Large 2–4, Medium the 1–2 that pass through the section. New job → add it to WORKFLOWS first.
3. **What exists** — components, patterns, adjacent pages, and the objects/CTAs in scope from `OBJECTS.md`
4. **User flow** — every entry point into these jobs (menu, notification, to-do, deep link) and where each must land — already in the approved walkthrough; state ids come from `SCREENS.md` (add new ones there first)
5. **Edge cases** — long Thai names, zero states, errors, mobile, first-time vs. power users

## Step 2 — Concepts before mockups

Before building anything, present exactly 3 text concepts — A, B, C — (3–5 lines each): layout approach, density, navigation pattern, component choices, and — in SYSTEM mode — palette + type direction. Concept first: confirm directions before spending generation effort.

**The three slots are fixed roles** (owner-approved 2026-10-01):

| Slot | Role | What it is |
|---|---|---|
| **A — Anchor** | the safe pick | Closest to `taste-profile.json` and the patterns already in the codebase. Choosing A is never a regret. |
| **B — Challenger 1** | bets on one priority | Deliberately trades something away to win on one axis (e.g. speed for power users: inline actions, bulk approve, dense). |
| **C — Challenger 2** | bets on a *different* priority | Wins on an axis B doesn't (e.g. overview/clarity: calendar view, guided steps). Two challengers betting on the same priority is convergence. |

Concepts design the **approved** walkthrough: if a concept needs to change its steps (merge two steps, move a decision elsewhere), it
says so in one line — choosing that concept means the owner re-stamps the walkthrough with the change.

Every concept (FEATURE mode and the first-flow SYSTEM round) also states **its click path for each key job** — e.g. "J1: to-do → กิจกรรมกางออก → ติ๊กบิล → ปิดยอด = 4 คลิก, 1 จุด" — and where each in-scope CTA sits. The owner sees the UX cost of each direction before any pixels exist, and a concept that puts a CTA away from its object is caught here, cheaply.

Every concept states its trade in one line — **"ได้: X / เสีย: Y"** — so the owner chooses what this screen should prioritize, not which one looks nicer. Mixing ("A with B's bulk approve") is a normal answer. Challenger axes come from the persona and job-to-be-done in Step 1: speed vs. clarity vs. overview vs. guidance vs. mobile-first vs. error-prevention. SYSTEM mode uses the same slots on aesthetics: A = taste-anchored, B = opposite mood (e.g. editorial vs. utilitarian), C = wildcard from ui-ux-pro-max matched to the product type.

**Save the concepts** to `CONCEPTS.md` in the round's mockup folder (date, the three concepts, click paths, trades, then the owner's
answer verbatim) and write any taste the answer reveals ("no modals", "dense tables for staff") into `taste-profile.json` right away — chat scrolls away; the folder is the record. **First project, no taste profile or codebase yet:** the Anchor is the
most conventional pattern for this product type (ui-ux-pro-max), not a guess at taste.

Confirm via **one AskUserQuestion**: build these three as-is, or swap/adjust which letter. Never ask about the count. Do not generate until the owner has approved the three concepts. This is the cheapest point to steer.

For SYSTEM mode, consult the **ui-ux-pro-max** skill for palette and font-pairing candidates matched to the product type, and apply **frontend-design** anti-generic principles. Hard bans: default-AI purple gradients, Inter-as-only-font, glassmorphism-by-reflex, three-feature-cards-with-emoji-icons. If a variant could be any SaaS landing page, it is not a direction.

## Step 3 — Build variants in parallel subagents

Dispatch one subagent per variant, in parallel. Each subagent receives: the approved concept (its letter only — not the siblings, so variants don't converge), the design system (FEATURE mode), a taste-profile summary, the flow spec, and the exact output path. Each writes exactly one self-contained HTML file (plus its own screenshots in `shots/`).

**Before dispatching, the orchestrator runs one real CLI screenshot itself** (`npx playwright screenshot about:blank "<abs dir>/shots/_smoke.png"`). If the browser is missing, run `npx playwright install chromium` once — never `playwright@latest`, which installs browsers for a different version than the project's `@playwright/test` — and never let three builders race a first-time install.

**Model allocation (owner policy 2026-08-14):** subagents inherit the orchestrator's model unless told otherwise — and the orchestrator usually runs the most expensive tier. Don't burn it on delegated work: dispatch variant builders and reviewer/QA agents on the **opus** tier, search/mechanical agents on **sonnet**. The orchestrator itself stays on the session's top model for concept framing, reconciliation, and anything solver/architecture-grade.

**Builders must SEE what they build — but never through the Playwright MCP browser.** All agents in a session share one Playwright MCP server — one browser, one "current tab" — so concurrent agents steal each other's page and the batch hangs (observed: files written, then agents hang for hours on browser calls; no completion ever fires). Instead each builder screenshots with the **Playwright CLI**, which launches its own browser process per call — safe in parallel (verified 2026-10-01):

```
npx playwright screenshot --viewport-size=1440,900 --full-page --wait-for-timeout=800 "file:///D:/work/<repo>/docs/design/mockups/<date-feature>/variant-a.html?clean#<screen-id>" "<abs dir>/shots/a-<screen-id>-1440.png"
npx playwright screenshot --viewport-size=390,844  --full-page --wait-for-timeout=800 "file:///D:/work/<repo>/docs/design/mockups/<date-feature>/variant-a.html?clean#<screen-id>" "<abs dir>/shots/a-<screen-id>-390.png"
```

File URLs use **forward slashes** (`file:///D:/work/...`, never `D:\work\...`). Output paths are always **absolute** into the mockup folder's `shots/` — a relative path lands in the repo root (see browser-verification's artifact table). `#screen-id` isolates one screen only because screens are `:target`-toggled (mockup file rules) — with stacked sections `--full-page` would capture the whole file every time.

Then **Read the PNGs** and critique like a senior product designer before returning — a mockup written blind is a guess:

- Hierarchy: is the primary action obvious in one glance? Does the eye land where the job-to-be-done starts?
- Rhythm: consistent spacing scale, aligned edges, no orphaned elements, no accidental double borders.
- Thai text: no clipped vowels/tone marks, no awkward line breaks in buttons or table headers, long names don't break layout.
- Density fits the persona (admin = dense, consumer = airy); 12-row tables actually look like 12 rows.
- Empty/loading/error states look designed, not like placeholders.
- Mobile 390px: no horizontal scroll, 44px targets, nothing overlapping.
- Concept fidelity: does it still read as THIS concept, or did it drift toward a generic dashboard?

Fix what the screenshots reveal and re-shoot: **2–3 rounds**, then return with a 3-line self-assessment (strongest point, weakest point, what was fixed).

**The brief is a file:** write `BRIEF.md` into the mockup folder from [references/brief-template.md](references/brief-template.md) — size, owner feedback verbatim, key jobs with their start/end `#state`s, the model slice **by reference** (J-ids, R-ids, OBJECTS sections, state ids from SCREENS — the builder reads those files; copying them is how ids drift), hard requirements, and the exact records from `sample-data.md`. Each builder's prompt is then: the absolute output path, its concept letter and text only, the `:root` tokens + DESIGN_SYSTEM do/don't rules, a taste summary, the absolute paths of `BRIEF.md`, the project's `docs/design/` folder and [references/mockup-rules.md](references/mockup-rules.md). Builders return their click path per key job along with the self-assessment.

Save under `docs/design/mockups/YYYY-MM-DD-<flow>/` (the SYSTEM round is named after its flow too — it is that flow's target):

```
docs/design/mockups/2026-08-13-shift-swap/
  variant-a.html
  variant-b.html
  variant-c.html
  CONCEPTS.md      (written in Step 2: the three concepts + the owner's answer)
  BRIEF.md         (written in Step 3, from references/brief-template.md)
  compare.html
  ux-score.md      (written in Step 3b, from references/ux-rubric.md)
  shots/           (builder + orchestrator screenshots)
  chosen.md        (written in Step 5)
```

### Mockup file rules

The full checklist is [references/mockup-rules.md](references/mockup-rules.md) — one self-contained HTML file per variant, the whole
flow in one file with `:target`-toggled screens, real data in the product language, design-system tokens verbatim, key-job steps
clickable end to end, and the reviewer chrome (collapsible states panel, A/B/C switcher, desktop/mobile toggle, hidden under
`?clean` and inside iframes). Builders get that file's **absolute path** and read it themselves — never paste it into a brief.

### The anti-convergence rule

**If someone could swap the headline text between two variants without noticing, they're too similar.** If two variants look like siblings — same typographic feel, overlapping color temperature, comparable layout rhythm — one of them failed. Variants should feel like they came from three different design teams, not the same team at three different coffee levels.

SYSTEM mode: different font pairing, different palette, different layout skeleton per variant. FEATURE mode: palette/type are fixed by the design system, so the divergence must come from structure — e.g. variant A = table + slide-over detail, B = card grid + dedicated detail page, C = master-detail split view. Judge convergence from the screenshots in Step 3b, not from the code; if two converged, rebuild one.

### compare.html

A simple page, no dependencies: one column per variant with a heading ("Variant A — <concept one-liner>"), an `<iframe src="variant-a.html">` sized ~420×720 (mobile) or ~1200×800 (desktop, `transform: scale(0.5)` to fit side by side), and an "open full" link. Side-by-side beats sequential — the owner compares, not recalls.

## Step 3b — Orchestrator checks the set before the owner sees it

After all builders return, and **sequentially** (now the Playwright MCP browser is safe), the orchestrator:

1. Starts the mockup server (see Step 4) and opens each variant: every states-panel link lands on a real screen, the A/B/C switcher and mobile toggle work, `browser_console_messages` is clean.
2. Screenshots the same key screen of all three side by side (desktop + 390px) and applies the anti-convergence rule to the pictures.
3. Reads the builders' self-assessments; anything a builder flagged as weak gets fixed or the builder is re-briefed via SendMessage.
4. **UX score (every Medium/Large FEATURE round and the first-flow SYSTEM round — owner rule 2026-10-06):** dispatch the `design-reviewer` agent in **mockup mode**, in the foreground, with the mockup folder, the server URL and the **absolute path** of this skill's [references/ux-rubric.md](references/ux-rubric.md) (it can't resolve plugin paths itself). It scores every variant by actually clicking each key job and writes `ux-score.md`. **Medium rounds use the short form** (path metrics, walkthrough failures, placement); Nielsen and the ui-ux-pro-max check are for Large rounds. It scores; it never picks.

Only a set that passes all four goes to the owner. Never present a variant you have not looked at.

## Step 4 — The owner chooses

Send the owner `compare.html` and the variant files as **clickable links, not paths** (owner rule 2026-09-24 — he reviews from the Claude Code VSCode extension and will not open files by hand): start a static server over **`docs/design/mockups`** (one root for every round, so SCREENS.md targets and old rounds resolve too) in the background (`python -m http.server 8765 --bind 127.0.0.1 --directory docs/design/mockups`; if `python` is the Windows Store stub use `py -m http.server …`, or `npx -y http-server -p 8765 -a 127.0.0.1 docs/design/mockups`; if 8765 is already serving that folder, reuse it; if it's taken by something else pick the next free port). Paste `http://127.0.0.1:8765/<date-feature>/compare.html` plus one link per variant as markdown links; add the `file:///…/compare.html` URL as a fallback. Keep the server running through Step 4's merge-and-re-show and Step 6's mockup screenshots; **stop it when the feature's implementation is verified** (or at the end of the session — never leave orphan servers). Publish an Artifact only when the link must be shared with someone else. Put the `ux-score.md` summary table in the same message, under the links — the owner compares looks and job cost side by side. Ask for:

- **Choice** — A, B, or C
- **Free-form comments** — "B but with A's sidebar" is a normal answer, not an edge case. Merge accordingly: apply the requested elements into the chosen variant's file and re-show once.
- If everything is rejected, treat the comments as a new brief: log every rejected trait to the taste profile, then return to Step 2 with fresh concepts. Never quietly tweak and re-present the same three.

Before recording, restate what you understood ("Going with B; sidebar from A; primary button larger") and confirm — prevents accidental approvals.

## Step 5 — Record the decision

**`chosen.md`** in the same mockup folder:

```markdown
# Chosen: variant-b (merged)
Date: 2026-08-13
Feature: shift-swap flow

## Merged tweaks
- Sidebar navigation taken from variant-a
- Confirm dialog: single primary action, per owner comment

## Owner comments (verbatim)
> "B ดีสุด แต่เอา sidebar ของ A มาใส่ ปุ่มยืนยันใหญ่กว่านี้หน่อย"

## Visual target
variant-b.html (post-merge) — implementation must match this file.
```

**Update `docs/design/taste-profile.json`** on every selection — bump chosen traits, log rejected ones:

```json
{
  "fonts":      { "approved": [{ "value": "IBM Plex Sans Thai", "confidence": 8, "note": "chosen 3x", "date": "2026-08-13" }],
                  "rejected": [{ "value": "Prompt", "confidence": 6, "note": "too rounded for admin UI", "date": "2026-07-02" }] },
  "colors":     { "approved": [], "rejected": [{ "value": "purple gradients", "confidence": 10, "note": "hard ban", "date": "2026-06-01" }] },
  "layout":     { "approved": [{ "value": "sidebar navigation", "confidence": 7, "note": "picked A's sidebar into B", "date": "2026-08-13" }], "rejected": [] },
  "density":    { "approved": [{ "value": "dense tables for admin views", "confidence": 6, "note": "", "date": "2026-08-13" }], "rejected": [] },
  "components": { "approved": [], "rejected": [{ "value": "modal-heavy flows", "confidence": 5, "note": "prefers dedicated pages", "date": "2026-08-13" }] }
}
```

Maintenance, applied whenever you touch the file: entries not reinforced in ~8 weeks lose confidence (drop by 2, delete at 0); when approved and rejected contradict, keep the newest and delete the older. Recent feedback outweighs old taste. Future SYSTEM and FEATURE runs read this file so variants start near the owner's taste instead of rediscovering it.

**Update the UX model in the same change** (the `ux-model` skill): `SCREENS.md` gets the chosen target (`file#state`) and status for every screen in this round; `OBJECTS.md` and `WORKFLOWS.md` change wherever the chosen design moved a CTA, merged or split a job, or added an entry point. A pick that isn't reflected in the model gets designed against stale facts next round.

### SYSTEM mode only: extract docs/DESIGN_SYSTEM.md

From the winning variant, write the project design contract:

```markdown
# Design System — <project>
## Tokens
:root { --color-primary: …; --color-surface: …; --space-1: 4px; … }   (CSS custom properties, copy-pasteable)
## Palette
Each color with a ROLE — primary / surface / border / text / success / warning / danger. Not a hex list.
## Typography
Families (Thai UI → Thai-capable stack, line-height ≥ 1.6), scale, weights, where each level is used.
## Spacing
The scale (4/8/12/16/24/32…) and what each step is for.
## Components (inventory)
| Component | Use when | Don't use when | Used on (screens) |
One row per component the app actually has — buttons (and which variant is primary), popup vs. full page, cards with in-card
actions, tables, tabs, empty states, toasts. Designers pick from this list before inventing; a new component is added here in the
same change that introduces it.
## Rules (~8, concrete)
DO: dense tables in admin views. DON'T: modals for multi-step flows. …
```

Every future FEATURE run copies the `:root` tokens into its mockups verbatim. Changing the design system is its own deliberate task — never a side effect of one feature's mockup.

## Step 6 — The mockup is the visual target

The chosen mockup is not inspiration; it is the acceptance criterion. Add to the feature's plan (or tell the implementing session):

> Visual target: `docs/design/mockups/2026-08-13-shift-swap/variant-b.html` (see `chosen.md` for merged tweaks). Implementation is not done until screenshots match it.

Implementation tasks must verify with Playwright MCP browser tools:

1. `browser_navigate` to the mockup **over the local server** (`http://127.0.0.1:8765/<date-feature>/variant-b.html?clean#<screen-id>` — restart the Step 4 server if it is gone; the Playwright MCP may refuse `file://` URLs), `browser_resize` to the target viewport, `browser_take_screenshot` → reference.
2. `browser_navigate` to the running app, same `browser_resize`, `browser_take_screenshot` → actual.
3. Compare side by side. List concrete deltas: spacing, hierarchy, missing states, wrong component. Fix. Re-screenshot.
4. Iterate **2–3 rounds** until it matches. Screenshot every screen in the flow, including loading/empty/error states — those are the ones that silently drift.
5. For a second pair of eyes, hand both screenshots to the **design-reviewer** agent; final visual sweep belongs to **qa-walkthrough** / **ship-check**.

## Red flags

| Smell | Reality |
|---|---|
| "I'll just implement it and we can adjust" | The exact revamp loop this skill exists to kill. Mockups first. |
| Variants generated without concept confirmation | Wasted work; the owner steers cheapest at the concept stage |
| "How many variants do you want?" | Always 3. Don't ask. |
| Three full-flow mockups for a button swap | Size it first (Step 0). Small = before/after screenshots |
| "It's small" — but it needs a new layout decision | That's Medium. Don't size down to skip the owner's pick |
| A builder returned without screenshotting its own work | Designed blind. Send it back for the self-review rounds |
| A builder calls `browser_*` MCP tools | Shared-browser deadlock. Builders use the Playwright CLI only |
| Presenting variants the orchestrator never looked at | Step 3b exists so the owner never debugs a broken mockup |
| Two variants that could swap headlines unnoticed | One failed — rebuild it before presenting |
| English placeholder data in a Thai product | The owner can't judge a design wearing the wrong content |
| Happy-path-only mockup | Empty/error states designed later = designed never |
| Concepts with no click path per key job | The owner can't see the UX cost until it's built. Every concept states its paths |
| A CTA placed away from the object it acts on | Check OBJECTS.md — that's the "ปุ่มควรอยู่ด้วยกัน" bug |
| Variants scored by the builder who made them | Self-grading. The rubric is scored by a fresh design-reviewer, by clicking |
| Chosen design not reflected in SCREENS/WORKFLOWS | Next round designs against fiction |
| Skipping the taste profile update | Next session rediscovers the same rejections from scratch |
| Implementation "close enough" after one screenshot round | The target is the mockup, not the vibe of the mockup |
