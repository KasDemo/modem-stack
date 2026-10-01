---
name: design-first-ui
description: Use when a task adds a new screen or visibly changes existing UI — the owner says "design this page" / "ออกแบบหน้า", a brainstorming spec was just approved and includes new/changed screens (run this BEFORE writing-plans), an implementation plan contains UI work that has no chosen mockup yet, or docs/DESIGN_SYSTEM.md is missing/stub. Sizes the change first — small tweaks with existing components (e.g. swapping a button variant) skip mockups and get before/after screenshots; sections and new screens get competing HTML mockup variants, the owner's pick, and a locked visual target before any implementation code is written.
---

# Design-First UI

**The owner picks the UI from real variants BEFORE implementation.** He is tired of revamping AI-generated UI after the fact. Never implement a screen nobody chose. A plan that says "add a settings page" is not a design — it's a brief for this skill.

Two modes:

| Mode | When | Output |
|---|---|---|
| **SYSTEM** | Once per project: `docs/DESIGN_SYSTEM.md` missing or stub | 3 radically different full-style variants of one representative page → extract `docs/DESIGN_SYSTEM.md` |
| **FEATURE** | Default, per feature | 3 variants of the feature's **entire screen flow**, all obeying `DESIGN_SYSTEM.md` |

**Always 3 variants for Medium and Large changes — never ask how many** (owner rule 2026-10-01; Small changes get none, see Step 0). Build more or fewer only when the owner says so unprompted.

If `DESIGN_SYSTEM.md` is missing or a stub when FEATURE mode is requested, run SYSTEM mode first. The design system is the contract; features interpret it, they don't renegotiate it.

## Step 0 — Size the change (FEATURE mode)

Not every visible change deserves three mockups (owner rule 2026-10-01). Size it first:

| Size | Test | Examples | What to do |
|---|---|---|---|
| **Small** | Uses only components and tokens that already exist, and makes **no new layout decision** | swap a button variant (primary → secondary), change copy/labels, apply an existing color token, add a field to an existing form following its pattern, reorder two items | **No mockups.** Implement per `DESIGN_SYSTEM.md`, then show the owner before/after screenshots (desktop + 390px, via browser-verification) as clickable links. Approved → done. Rejected or "hmm" → re-size as Medium. |
| **Medium** | A new section/component inside an existing screen, or a layout change to part of a screen | add a filter bar, a summary card row, a new table column group with actions | **3 variants of that section only** — each mocked inside a faithful copy of its surrounding page (header + neighbors), not the whole flow. Steps 1–6 apply, scoped to the section. |
| **Large** | A new screen, or a change to how a flow works | new page, new multi-step flow, navigation change | **The full process below** — 3 variants of the entire flow. |

When the size is unclear, ask **one** AskUserQuestion with your recommended size first. Never size down to dodge the process: if a "small" change needs a layout decision, it is Medium. Owner comments on a Small change still go into `taste-profile.json`.

## Step 1 — Read context first (never skip)

Read, in order:

1. `docs/design/taste-profile.json` — the owner's accumulated taste. Variants start near it, they don't rediscover it.
2. `docs/DESIGN_SYSTEM.md` — tokens and rules every FEATURE variant must obey.
3. The feature's spec/plan in `docs/plans/` (older sessions may have saved it under `docs/superpowers/specs/` or `docs/superpowers/plans/`), and `docs/PRD.md` for product context.
4. Existing pages/components in the codebase — reuse established patterns unless a variant deliberately challenges one.

Then confirm the five dimensions of context (auto-gather what you can; ask for what's missing, **max two rounds of questions**):

1. **Who** — persona, expertise, familiarity with the product
2. **Job to be done** — what the user accomplishes on this flow
3. **What exists** — components, patterns, adjacent pages
4. **User flow** — how they arrive, where they go next
5. **Edge cases** — long Thai names, zero states, errors, mobile, first-time vs. power users

## Step 2 — Concepts before mockups

Before building anything, present exactly 3 text concepts — A, B, C — (3–5 lines each): layout approach, density, navigation pattern, component choices, and — in SYSTEM mode — palette + type direction. Concept first: confirm directions before spending generation effort.

**The three slots are fixed roles** (owner-approved 2026-10-01):

| Slot | Role | What it is |
|---|---|---|
| **A — Anchor** | the safe pick | Closest to `taste-profile.json` and the patterns already in the codebase. Choosing A is never a regret. |
| **B — Challenger 1** | bets on one priority | Deliberately trades something away to win on one axis (e.g. speed for power users: inline actions, bulk approve, dense). |
| **C — Challenger 2** | bets on a *different* priority | Wins on an axis B doesn't (e.g. overview/clarity: calendar view, guided steps). Two challengers betting on the same priority is convergence. |

Every concept states its trade in one line — **"ได้: X / เสีย: Y"** — so the owner chooses what this screen should prioritize, not which one looks nicer. Mixing ("A with B's bulk approve") is a normal answer. Challenger axes come from the persona and job-to-be-done in Step 1: speed vs. clarity vs. overview vs. guidance vs. mobile-first vs. error-prevention. SYSTEM mode uses the same slots on aesthetics: A = taste-anchored, B = opposite mood (e.g. editorial vs. utilitarian), C = wildcard from ui-ux-pro-max matched to the product type.

Confirm via **one AskUserQuestion**: build these three as-is, or swap/adjust which letter. Never ask about the count. Do not generate until the owner has approved the three concepts. This is the cheapest point to steer.

For SYSTEM mode, consult the **ui-ux-pro-max** skill for palette and font-pairing candidates matched to the product type, and apply **frontend-design** anti-generic principles. Hard bans: default-AI purple gradients, Inter-as-only-font, glassmorphism-by-reflex, three-feature-cards-with-emoji-icons. If a variant could be any SaaS landing page, it is not a direction.

## Step 3 — Build variants in parallel subagents

Dispatch one subagent per variant, in parallel. Each subagent receives: the approved concept (its letter only — not the siblings, so variants don't converge), the design system (FEATURE mode), a taste-profile summary, the flow spec, and the exact output path. Each writes exactly one self-contained HTML file (plus its own screenshots in `shots/`).

**Before dispatching, the orchestrator runs one real CLI screenshot itself** (`npx playwright screenshot about:blank "<abs dir>/shots/_smoke.png"`). If the browser is missing, run `npx playwright install chromium` once — never `playwright@latest`, which installs browsers for a different version than the project's `@playwright/test` — and never let three builders race a first-time install.

**Model allocation (owner policy 2026-08-14):** subagents inherit the orchestrator's model unless told otherwise — and the orchestrator usually runs the most expensive tier. Don't burn it on delegated work: dispatch variant builders and reviewer/QA agents on the **opus** tier, search/mechanical agents on **sonnet**. The orchestrator itself stays on the session's top model for concept framing, reconciliation, and anything solver/architecture-grade.

**Builders must SEE what they build — but never through the Playwright MCP browser.** All agents in a session share one Playwright MCP server — one browser, one "current tab" — so concurrent agents steal each other's page and the batch hangs (observed: files written, then agents hang for hours on browser calls; no completion ever fires). Instead each builder screenshots with the **Playwright CLI**, which launches its own browser process per call — safe in parallel (verified 2026-10-01):

```
npx playwright screenshot --viewport-size=1440,900 --full-page --wait-for-timeout=800 "file:///D:/work/<repo>/docs/design/mockups/<date-feature>/variant-a.html?clean#<screen-id>" "<abs dir>/shots/a-<screen-id>-desktop.png"
npx playwright screenshot --viewport-size=390,844  --full-page --wait-for-timeout=800 "file:///D:/work/<repo>/docs/design/mockups/<date-feature>/variant-a.html?clean#<screen-id>" "<abs dir>/shots/a-<screen-id>-mobile.png"
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

Subagent brief template:

```
Build ONE self-contained HTML mockup at <absolute output path>.
Concept: <the 3-5 line concept, this variant's only>
Flow: <screens + states to include, with link structure>
State labels (use verbatim): <canonical state names in product language>
Design system: <paste :root tokens + do/don't rules, FEATURE mode>
Taste: prefer <approved traits>; never <rejected traits>
Content: realistic data in <product language>; no lorem ipsum.
Mockup file rules: <paste the whole "Mockup file rules" checklist from this skill
verbatim — builders never see this skill, so ?clean, iframe-hiding, :target
screens, the reviewer chrome spec and the font rule must be IN the brief>.
Self-review: screenshot every state at 1440 and 390 with the Playwright CLI
(own process — NEVER the Playwright MCP browser tools), read the PNGs,
critique, fix, 2-3 rounds. Return a 3-line self-assessment.
```

Save under `docs/design/mockups/YYYY-MM-DD-<feature>/` (SYSTEM mode: `YYYY-MM-DD-design-system/`):

```
docs/design/mockups/2026-08-13-shift-swap/
  variant-a.html
  variant-b.html
  variant-c.html
  compare.html
  shots/           (builder + orchestrator screenshots)
  chosen.md        (written in Step 5)
```

### Mockup file rules (every variant, every mode)

- [ ] One self-contained `.html` file: **all CSS inline** in a `<style>` block, no CDNs or JS frameworks. **Exception: load the real fonts via a Google Fonts `<link>`** — otherwise every variant silently falls back to the same system font and the owner picks a typeface he never saw (critical in SYSTEM mode, where font pairing is a differentiator). Always keep a system fallback in the stack.
- [ ] **FEATURE mode: the entire flow in one file.** Every connected page/state is its own `<section id="screen-id">`, **one visible at a time via `:target`** (the first screen shows when there is no hash); screens link to each other with working `<a href="#screen-id">` anchors. Clicking through the mockup must feel like clicking through the feature.
- [ ] Loading, empty, and error states included as real screens, not footnotes.
- [ ] **Realistic data in the product's language.** Thai product → Thai names, Thai dates, Thai button labels. Never `Lorem ipsum`, never `User 1`. Realistic lengths: a Thai hospital ward name, a 32-character full name, a table with 12 rows not 3.
- [ ] Thai UI text → Thai-capable font stack (e.g. `"Noto Sans Thai", "Sarabun", "IBM Plex Sans Thai", sans-serif`) and line-height ≥ 1.6 — Thai ascenders/descenders clip at tight leading.
- [ ] FEATURE mode: use `DESIGN_SYSTEM.md` tokens verbatim (copy the `:root` custom properties into the file). Variants differ in **layout, density, navigation pattern, and component choices** — not in palette or type.
- [ ] Mobile-first sanity: 44px minimum touch targets, readable at 375px wide.
- [ ] **Reviewer chrome (owner-requested 2026-08-14 — always include):** every variant carries fixed overlay helpers for the reviewing owner, visually neutral (dark pill, corner-fixed) so they never read as part of the design:
  1. a **collapsible "Mockup states" panel** linking to every screen/state anchor in the file — a `<details open>` the owner can fold away ("บางทีมันบังจอ"); default open on desktop, collapsed under 480px,
  2. a **variant switcher** — small A/B/C buttons linking to the sibling `variant-*.html` files, current letter highlighted,
  3. a **desktop/mobile toggle** — mobile mode opens the SAME file in a ~390px-wide `<iframe>` overlay styled as a phone; an iframe is required because media queries track iframe width (a CSS class on `body` cannot re-trigger them).
  **State labels are canonical, not per-variant:** the orchestrator's brief lists the exact state names (in the product language) and every variant uses them verbatim — same flow, same words. Never let one variant number its screens while another uses prose; the owner flagged exactly this. Hide **all** reviewer chrome when the page is inside an iframe (`window.self !== window.top`) or the URL has `?clean` — so compare.html cells, the mobile overlay, and screenshots stay clean. While mobile mode is on, the states-panel links navigate the iframe (`iframe.contentWindow.location.hash`), not the parent page. Tiny vanilla JS for this chrome is allowed; product UI in the mockup stays JS-free.

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

Only a set that passes all three goes to the owner. Never present a variant you have not looked at.

## Step 4 — The owner chooses

Send the owner `compare.html` and the variant files as **clickable links, not paths** (owner rule 2026-09-24 — he reviews from the Claude Code VSCode extension and will not open files by hand): start a static server over the mockup folder in the background (`python -m http.server 8765 --bind 127.0.0.1 --directory docs/design/mockups/<date-feature>`; if `python` is the Windows Store stub use `py -m http.server …`, or `npx -y http-server -p 8765 -a 127.0.0.1 <dir>`; if 8765 is taken pick the next free port). Paste `http://127.0.0.1:8765/compare.html` plus one link per variant as markdown links; add the `file:///…/compare.html` URL as a fallback. Keep the server running through Step 4's merge-and-re-show and Step 6's mockup screenshots; **stop it when the feature's implementation is verified** (or at the end of the session — never leave orphan servers). Publish an Artifact only when the link must be shared with someone else. Ask for:

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
## Components
Conventions for buttons, forms, tables, cards, navigation, empty states — one line each.
## Rules (~8, concrete)
DO: dense tables in admin views. DON'T: modals for multi-step flows. …
```

Every future FEATURE run copies the `:root` tokens into its mockups verbatim. Changing the design system is its own deliberate task — never a side effect of one feature's mockup.

## Step 6 — The mockup is the visual target

The chosen mockup is not inspiration; it is the acceptance criterion. Add to the feature's plan (or tell the implementing session):

> Visual target: `docs/design/mockups/2026-08-13-shift-swap/variant-b.html` (see `chosen.md` for merged tweaks). Implementation is not done until screenshots match it.

Implementation tasks must verify with Playwright MCP browser tools:

1. `browser_navigate` to the mockup **over the local server** (`http://127.0.0.1:8765/variant-b.html?clean#<screen-id>` — restart the Step 4 server if it is gone; the Playwright MCP may refuse `file://` URLs), `browser_resize` to the target viewport, `browser_take_screenshot` → reference.
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
| Skipping the taste profile update | Next session rediscovers the same rejections from scratch |
| Implementation "close enough" after one screenshot round | The target is the mockup, not the vibe of the mockup |
