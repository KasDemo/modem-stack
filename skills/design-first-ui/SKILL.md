---
name: design-first-ui
description: Use when a task adds a new screen or visibly changes existing UI — the owner says "design this page" / "ออกแบบหน้า", an implementation plan contains UI work that has no chosen mockup yet, or docs/DESIGN_SYSTEM.md is missing/stub. Generates competing HTML mockup variants, gets the owner's pick, and locks it as the visual target before any implementation code is written.
---

# Design-First UI

**The owner picks the UI from real variants BEFORE implementation.** He is tired of revamping AI-generated UI after the fact. Never implement a screen nobody chose. A plan that says "add a settings page" is not a design — it's a brief for this skill.

Two modes:

| Mode | When | Output |
|---|---|---|
| **SYSTEM** | Once per project: `docs/DESIGN_SYSTEM.md` missing or stub | 3–5 radically different full-style variants of one representative page → extract `docs/DESIGN_SYSTEM.md` |
| **FEATURE** | Default, per feature | 3 variants of the feature's **entire screen flow**, all obeying `DESIGN_SYSTEM.md` |

If `DESIGN_SYSTEM.md` is missing when FEATURE mode is requested, run SYSTEM mode first. The design system is the contract; features interpret it, they don't renegotiate it.

## Step 1 — Read context first (never skip)

Read, in order:

1. `docs/design/taste-profile.json` — the owner's accumulated taste. Variants start near it, they don't rediscover it.
2. `docs/DESIGN_SYSTEM.md` — tokens and rules every FEATURE variant must obey.
3. The feature's plan in `docs/plans/` (and `docs/PRD.md` for product context).
4. Existing pages/components in the codebase — reuse established patterns unless a variant deliberately challenges one.

Then confirm the five dimensions of context (auto-gather what you can; ask for what's missing, **max two rounds of questions**):

1. **Who** — persona, expertise, familiarity with the product
2. **Job to be done** — what the user accomplishes on this flow
3. **What exists** — components, patterns, adjacent pages
4. **User flow** — how they arrive, where they go next
5. **Edge cases** — long Thai names, zero states, errors, mobile, first-time vs. power users

## Step 2 — Concepts before mockups

Before building anything, present N text concepts (3–5 lines each) as a lettered list: layout approach, density, navigation pattern, component choices, and — in SYSTEM mode — palette + type direction. Concept first: confirm directions before spending generation effort.

Confirm via **AskUserQuestion**: which concepts to build, anything to swap, anything missing. Do not generate until the owner has approved the concept list. This is the cheapest point to steer.

For SYSTEM mode, consult the **ui-ux-pro-max** skill for palette and font-pairing candidates matched to the product type, and apply **frontend-design** anti-generic principles. Hard bans: default-AI purple gradients, Inter-as-only-font, glassmorphism-by-reflex, three-feature-cards-with-emoji-icons. If a variant could be any SaaS landing page, it is not a direction.

## Step 3 — Build variants in parallel subagents

Dispatch one subagent per variant, in parallel. Each subagent receives: the approved concept (its letter only — not the siblings, so variants don't converge), the design system (FEATURE mode), a taste-profile summary, the flow spec, and the exact output path. Each writes exactly one self-contained HTML file.

Subagent brief template:

```
Build ONE self-contained HTML mockup at <absolute output path>.
Concept: <the 3-5 line concept, this variant's only>
Flow: <screens + states to include, with link structure>
Design system: <paste :root tokens + do/don't rules, FEATURE mode>
Taste: prefer <approved traits>; never <rejected traits>
Content: realistic data in <product language>; no lorem ipsum.
Rules: inline CSS only, no CDNs, all states, links between screens work.
```

Save under `docs/design/mockups/YYYY-MM-DD-<feature>/` (SYSTEM mode: `YYYY-MM-DD-design-system/`):

```
docs/design/mockups/2026-08-13-shift-swap/
  variant-a.html
  variant-b.html
  variant-c.html
  compare.html
  chosen.md        (written in Step 5)
```

### Mockup file rules (every variant, every mode)

- [ ] One self-contained `.html` file: **all CSS inline** in a `<style>` block, no external fonts/CDNs/JS frameworks. System font stacks or `@font-face`-free Google-font names the implementation can add later.
- [ ] **FEATURE mode: the entire flow in one file.** Every connected page/state is a full-page section; screens link to each other with working `<a href="#screen-id">` anchors (or separate `<div>` pages toggled by `:target`). Clicking through the mockup must feel like clicking through the feature.
- [ ] Loading, empty, and error states included as real screens, not footnotes.
- [ ] **Realistic data in the product's language.** Thai product → Thai names, Thai dates, Thai button labels. Never `Lorem ipsum`, never `User 1`. Realistic lengths: a Thai hospital ward name, a 32-character full name, a table with 12 rows not 3.
- [ ] Thai UI text → Thai-capable font stack (e.g. `"Noto Sans Thai", "Sarabun", "IBM Plex Sans Thai", sans-serif`) and line-height ≥ 1.6 — Thai ascenders/descenders clip at tight leading.
- [ ] FEATURE mode: use `DESIGN_SYSTEM.md` tokens verbatim (copy the `:root` custom properties into the file). Variants differ in **layout, density, navigation pattern, and component choices** — not in palette or type.
- [ ] Mobile-first sanity: 44px minimum touch targets, readable at 375px wide.

### The anti-convergence rule

**If someone could swap the headline text between two variants without noticing, they're too similar.** If two variants look like siblings — same typographic feel, overlapping color temperature, comparable layout rhythm — one of them failed. Variants should feel like they came from three different design teams, not the same team at three different coffee levels.

SYSTEM mode: different font pairing, different palette, different layout skeleton per variant. FEATURE mode: palette/type are fixed by the design system, so the divergence must come from structure — e.g. variant A = table + slide-over detail, B = card grid + dedicated detail page, C = master-detail split view. Check the set before presenting; if two converged, rebuild one.

### compare.html

A simple page, no dependencies: one column per variant with a heading ("Variant A — <concept one-liner>"), an `<iframe src="variant-a.html">` sized ~420×720 (mobile) or ~1200×800 (desktop, `transform: scale(0.5)` to fit side by side), and an "open full" link. Side-by-side beats sequential — the owner compares, not recalls.

## Step 4 — The owner chooses

Send the owner `compare.html` and the variant files (SendUserFile if available; otherwise give the paths — on Windows: `start docs\design\mockups\2026-08-13-shift-swap\compare.html`). Ask for:

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

1. `browser_navigate` to the mockup (`file:///D:/work/<repo>/docs/design/mockups/.../variant-b.html`), `browser_resize` to the target viewport, `browser_take_screenshot` → reference.
2. `browser_navigate` to the running app, same `browser_resize`, `browser_take_screenshot` → actual.
3. Compare side by side. List concrete deltas: spacing, hierarchy, missing states, wrong component. Fix. Re-screenshot.
4. Iterate **2–3 rounds** until it matches. Screenshot every screen in the flow, including loading/empty/error states — those are the ones that silently drift.
5. For a second pair of eyes, hand both screenshots to the **design-reviewer** agent; final visual sweep belongs to **qa-walkthrough** / **ship-check**.

## Red flags

| Smell | Reality |
|---|---|
| "I'll just implement it and we can adjust" | The exact revamp loop this skill exists to kill. Mockups first. |
| Variants generated without concept confirmation | Wasted work; the owner steers cheapest at the concept stage |
| Two variants that could swap headlines unnoticed | One failed — rebuild it before presenting |
| English placeholder data in a Thai product | The owner can't judge a design wearing the wrong content |
| Happy-path-only mockup | Empty/error states designed later = designed never |
| Skipping the taste profile update | Next session rediscovers the same rejections from scratch |
| Implementation "close enough" after one screenshot round | The target is the mockup, not the vibe of the mockup |
