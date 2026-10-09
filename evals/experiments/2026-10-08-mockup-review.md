# Experiment 2026-10-08 — pre-owner mockup review: 3-round critic loop vs one click-testing pass

**Question.** Mockup rounds took 30–106 min before the owner saw anything. Is the review work redundant, and does a faster process
lose quality?

**Forensics first** (real scipub rounds `2026-10-02-search-r3`, `2026-10-08-insights`, from session logs): the critic/fix loop was
~70% of agent time and 77–84% of tokens; the orchestrator check found 0 issues in 4 runs; critic round 1 found unique, important
problems (broken core interactions, data inconsistencies, slop); rounds 2+ oscillated (4 of 17 re-scores went *down*); variant
ranking changed every round and did not predict the owner's pick; ~71% of loop tokens went to variants the owner discarded; the
UX-score step had never run.

## Design

Same frozen inputs (insights BRIEF, design system, UX model, sample data, taste profile) and the same owner-approved concepts A/B/C,
using the original round's builder and critic prompts verbatim. **One build (S0), then two arms forked from the same files**, so
differences come from the process, not builder luck:

- **Arm C (current):** critic scores from screenshots (≥ 8.5 and no slop to pass) → fix everything + 2 self-review rounds → re-score,
  up to 3 rounds per variant.
- **Arm F (new):** one critic per variant in parallel that click-tests every key job and control, sorts findings into must_fix
  (broken · slop · figures · mobile) / build_notes / suggestions, may not undo approved trade-offs → one fix of must_fix only.

Two blind judges (sets randomly labelled P/Q; arm-revealing strings scrubbed) scored defects, concept fidelity, craft, owner
readiness, set distinctness, ranking and pairwise preference. Pass criteria were fixed before running.

## Results (P = arm F, Q = arm C)

| Measure | Arm F | Arm C |
|---|---|---|
| Wall clock, builders dispatched → ready for owner | ~31 min | ~47 min (−35%; review phase alone −54%) |
| Review-phase tokens | 0.73 M | 2.13 M (−65%) |
| Final critic scores | n/a (no threshold) | 7.9 / 8.3 / 8.0 — none reached 8.5 after 3 rounds |
| Broken controls reaching the owner (judge 1 / judge 2) | 0 / 3 | 2 / 5 (incl. a "Loading…" that never ends, a self-contradicting empty state) |
| Concept fidelity A,B,C (judge 1 / judge 2) | 5,5,5 / 5,5,5 | 4,2,4 / 4,3,4 |
| Set distinctness (judge 1 / judge 2) | 5 / 5 | 3 / 4 — B drifted into A |
| Ranking within set | a > c > b (both judges) | a > c > b (both judges) |
| Pairwise wins | 5 of 6 | 1 of 6 (judge 2 preferred arm C's A: "tighter, simpler") |

Oscillation observed in arm C: top-3 list removed → re-added → removed; trend moved down → up; orange heading bars "everywhere" →
"inconsistent"; a pane's chart removed → "pane is near-empty". Arm C's critics flagged the owner-approved "long page" trade-off of A
as their top must-fix in rounds 1 and 2, and removed B's defining type switch.

## Verdict

3 of 4 criteria passed (defects, fidelity, distinctness). The time criterion (≥ 40% end to end) was missed at 35%, though the review
phase was 54% faster. Adopted in design-first-ui v0.1.14: one click-testing critic pass before the owner, no score threshold,
approved trade-offs protected, a11y as build notes, measured job numbers in `review.md` for the owner, and polish + full UX rubric
only on the chosen variant (Step 4b) — because polish did improve the anchor variant, just not the decision.

**Not tested:** reducing builder self-review to one round (builders were ~15 of the 31 minutes); a priority guide step before
concepts (next experiment).

**Limits:** one round, one page, LLM judges, not the owner's taste.

Artifacts (scratchpad of the session, not committed): `exp-mockup/{s0,armF-final,armC-final,judge}/`, `log/durations.csv`,
`log/reviews/*.json`, `log/judge*-summary.json`, `log/blind-key.json`.
