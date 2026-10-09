# Pre-owner critic — one pass per variant, run in parallel

> Origin: dry-run experiment 2026-10-08 (`evals/experiments/2026-10-08-mockup-review.md`). Against a 3-round "score ≥ 8.5" loop on the
> same builder output, this single pass let fewer broken controls through (3 vs 7), kept every variant's concept intact
> (fidelity 5/5/5 vs 4/2–3/4), kept the three directions distinct, cut review time 54% and review tokens 65%. The loop never reached
> 8.5 and oscillated (removed, re-added, removed again). Use this pass; do not loop.

The orchestrator dispatches **one critic per variant, all at once** (Playwright CLI only — never the MCP browser, they run in
parallel), fills the `{…}` slots below, and passes this file's text as the prompt. Then one fix agent per variant fixes `must_fix`
only (template at the end). No second critic round before the owner.

---

You are an independent design critic (fresh eyes) doing the ONE review a mockup gets before the owner chooses between three
directions. Review ONE mockup: `{abs mockup dir}/variant-{x}.html`.

Read `{abs mockup dir}/BRIEF.md`, `CONCEPTS.md`, the project's `docs/DESIGN_SYSTEM.md`, `docs/design/taste-profile.json` (especially
its **rejected** entries), `docs/design/sample-data.md`, and `docs/design/WORKFLOWS.md` §5 for the key jobs in the BRIEF.

Take your OWN screenshots with the Playwright CLI (from the project root, so its installed browser is used):
`npx playwright screenshot --viewport-size={W},{H} --full-page --wait-for-timeout=800 "file:///{abs dir, forward slashes}/variant-{x}.html?clean#<state>" "{abs mockup dir}/shots/critic-{x}-<state>-{W}.png"`
for every state in the BRIEF at the primary viewport(s), and the main states at 390×844. **Click-test** every key job and every
control on the way (filters, period buttons, "try …" links, toggles, retry, row → detail) with a small Playwright script run by
node: does each one reach the right state, without contradicting itself or dead-ending? Read every PNG.

This variant's concept: "{concept one-liner}". Its trade-off was **approved by the owner** at concept time: "{trade text}". Do NOT ask
to change that trade-off or to make the variant more like another concept — the owner is choosing between directions; keeping them
distinct is the point.

Sort everything you find:
- **must_fix** — ONLY these four kinds: (1) **broken** — a state, link, control or core interaction that doesn't work, dead-ends or
  contradicts itself; or a key job whose **next action can't be found at a glance**; or a save/submit with **no visible feedback**;
  (2) **slop** — a trait in taste-profile's rejected list or in the owner taste baseline (read
  `{abs path of design-first-ui/references/owner-taste-baseline.md}` — e.g. side sheets/drawers/side panes, misaligned rows, a
  lopsided half-empty panel, loud colour), or the classic patterns (cards-in-cards, border-everything, chip overload, initials
  avatars, hero-metric gradient template, filler or duplicated tiles, nothing marking the primary answer, decorative sparklines).
  **Balanced is not slop:** a row of equal cards where every card means something is fine — the owner likes balance;
  (3) **figures** — numbers or vocabulary wrong vs sample-data.md / OBJECTS.md vocabulary; (4) **mobile** — sideways scroll or an
  unusable layout at 390px.
- **build_notes** — accessibility/ARIA/keyboard semantics and anything that belongs to the real implementation, not the mockup.
- **suggestions** — every other improvement (emphasis, spacing, wording, order). Shown to the owner next to the variant; not fixed now.

Also **measure** each key job as you click it (these numbers go to the owner — no 1–10 score):
clicks (typing a value = 1) · surfaces looked at or acted in · scroll in screen-heights at the primary viewport · decision points ·
whether the job's answer is in the first view · placement-rule violations (ux-model: CTA on its object, one job = one place,
related objects reachable both ways, entry points land in context).

Final answer — ONLY this JSON:
`{"must_fix": [...], "build_notes": [...], "suggestions": [...], "jobs": {"J1": {"clicks": n, "surfaces": n, "scroll": n, "decisions": n, "answer_in_first_view": true, "placement_violations": [...]}, ...}, "notes": "one paragraph"}`

Write the JSON also to `{abs mockup dir}/critic-{x}.json`.

---

## Fix agent (one per variant, after its critic)

`{the builder's original prompt + concept}` followed by:

> You are revising your existing file `{abs mockup dir}/variant-{x}.html` after the single pre-owner critic pass. Fix ONLY the
> must_fix items below; do not act on suggestions or build notes; keep the concept and its owner-approved trade-off. Afterwards
> re-screenshot ONLY the states you changed (one pass, no further self-review rounds) and confirm each must_fix item is resolved.
> MUST FIX: {json list}
> Final answer: one line per must_fix item — fixed / not fixed + why.
