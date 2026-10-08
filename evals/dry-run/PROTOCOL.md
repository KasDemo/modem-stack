# Dry-run protocol — does the documentation workflow hold end to end?

Run this after any change to project-init, ux-model, design-first-ui, feature-update, qa-walkthrough or ship-check.
One fresh-context agent plays **the AI following the plugin** and **the owner** (answering only from the answer sheet). It works in a
throwaway repo, never in this one. Expensive steps (HTML mockups, real code) are simulated on paper — the test is whether the
**documents** carry every fact each phase needs.

## Setup

- Plugin under test: this repo (read `README.md`, then follow `skills/*/SKILL.md`, their `templates/` and `references/`).
- superpowers skills it hands off to: `brainstorming`, `writing-plans` (from the installed plugin cache).
- Answer sheets: `owner-answers-roombook.md` (scenario A: TOR + milestones) and `owner-answers-nurseshift.md` (scenario B: no TOR,
  no milestones, no deadline — the owner's more common case). Both must pass before a workflow change ships; run them as two
  independent agents. A finding that only exists because of a
  scenario's invented constraints (deadlines, budgets) is reported as scenario-specific, never as a plugin rule. A question the sheet doesn't cover → invent a plausible answer and log it as
  **UNCOVERED** (that is a finding about the interview, not about the sheet).
- Pilot repo: a new folder in the scratchpad, `git init`, one commit per phase.
- **Elicitation check:** the sheet holds more facts than the owner volunteers. Reveal a fact only when a skill's instruction makes
  you ask for it; at the end, list every sheet fact the workflow never asked about (each one is a GAP in the interview or checklists).

## Phases and checkpoints

| # | Phase (follow the skill as written) | Checkpoint — must be true at the end of the phase |
|---|---|---|
| P1 | project-init Steps 1–2: kickoff + scaffold | notes/ verbatim; TOR.md clauses T…; QUESTIONS.md has every unanswered item; CHANGELOG.md; no stubs of step-3+ files |
| P2 | Step 3: PRD (feature map, brainstorming, product-critic, owner approval) | feature map confirmed row by row, 🤖 rows proposed from the checklist; every FR has AC · source (+ งวด · T only if the project has them); every T covered; rules only here as R-ids; status "approved {date}" |
| P3 | Step 4: architecture, scaffold, gates (write commands, don't install) | ARCHITECTURE.md stack + D-ids + runbook skeleton; doubt-check run on schema/auth; CLAUDE.md links to it, no stack duplicated |
| P4 | Step 5: key jobs | every FR covered by a J or marked "no UI"; each J has งวด; owner approved the list |
| P5 | Step 6: system picture (no design round here) | OBJECTS/WORKFLOWS §1–4,6/SCREENS/sample-data filled; lifecycle checklist answered or → QUESTIONS; rules cited not restated |
| P6 | Walkthrough session for the first งวด-1 flow (2 key jobs) | §5 tables with unhappy paths; owner asked about each guess; stamp `✅ owner-approved`; state ids exist in SCREENS |
| P7 | design-first-ui for the first flow = SYSTEM round (FEATURE rules + style freedom), to the BRIEF + concepts (no HTML) | gate checked the stamp; CONCEPTS.md saved; BRIEF cites ids (no copied rules/flows); state ids = SCREENS |
| P8 | *Paper:* writing-plans outline for the flow | plan tasks cite FR/J; test names follow `fr-…`/`j…`; nothing had to be invented |
| P9 | *Paper:* QA plan for the flow | each QA flow = a J with its §5 steps incl. unhappy paths, labelled J/FR |
| P10 | *Paper:* ship-check — milestone mode for งวด 1 (scenario A) / release mode (scenario B) | A: acceptance/งวด-1.md with every งวด-1 T → FR → J → evidence slot and owner-answered + assumed Qs; B: release report, CHANGELOG, runbook — and **no** TOR/งวด/acceptance artefacts created |

## Log (the deliverable)

For every step: skill + step, files produced (path + lines), owner questions asked (count), and findings typed
**GAP · AMBIGUITY · CONFLICT · DUPLICATION · DRIFT · ORDER · FRICTION · UNCOVERED**, each citing skill file + line.

## Scoring (1–5 each; anchors below) — /35

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| **Completeness** — each phase produced its documents | ≥3 phases missing a required doc | 1–2 missing | all checkpoints met |
| **Traceability** — T → FR → J → walkthrough → state ids → tests → acceptance | chain broken at ≥3 links | 1–2 broken links | unbroken; acceptance rows resolvable |
| **Single source** — each fact has one home | ≥4 duplications/drifts | 1–3 | none |
| **Owner involvement** — gates at the right moments, questions worth asking | owner never consulted on flows, or asked trivia | some gates missing or noisy | every gate hit, every question decision-relevant |
| **Instruction clarity** — the skills agree and are executable | ≥4 conflicts/ambiguities | 1–3 | none |
| **Weight** — documents earn their lines; no busywork | most docs restate others | some padding | every doc used downstream |
| **Downstream readiness** — implement/QA/ship need no invented facts | ship or QA must invent core facts | minor inventions | none |

For scenario B also report **feature-map recall**: how many of the sheet's "never mentioned but would want" items the feature map surfaced as 🤖 rows.

Report: per-dimension score with one line of evidence, total /35, the comparison with the previous run's score, the
top 5 findings, and per phase: owner minutes (estimate), AI effort, documents produced.

## History

| Date | Plugin version | Score | Notes |
|---|---|---|---|
| 2026-10-07 | 0.1.10 | 9/35 (scored retroactively in run 2) | stopped at the BRIEF; no TOR/QUESTIONS/ARCHITECTURE/acceptance, routing contradictory |
| 2026-10-07 | 0.1.11 (pre-fix) | 24/35 | all 10 phases ran; ~119 owner-minutes, ~1,035 doc lines before code. 12 findings fixed in the same 0.1.11 commit: lifecycle checklist moved into the PRD, layout-neutral walkthroughs/SCREENS, J0 sign-in job, explicit QA anchors, owner-answered decisions to acceptance, doubt-check after the first schema, SYSTEM round merged into flow 1 |
| 2026-10-08 | a36674a | A 28/35 · B 25/35 | first run of both scenarios; B: feature-map recall 9/9, no TOR artefacts leaked into files but milestone wording leaked into ~10 lines, release mode under-specified; A: 10/12 run-2 findings fixed. Fixed after: SYSTEM round = FEATURE rules, release order in PRD §3, release-mode QA scope + decisions-to-confirm + restore drill, two-tier feature map, client-rules question, doubt-check on the shape before the schema, one PRD approval, No-UI FRs 'built with' |
