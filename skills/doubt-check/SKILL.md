---
name: doubt-check
description: Use when the user says "doubt-check this" or when a high-stakes decision is about to stand — a constraint-solver formulation, a penalty-weight change, a schema or migration choice, auth/permission logic, anything expensive to discover wrong later. Spawns a fresh-context adversarial subagent to disprove the decision before it ships. Not for debugging failures or reviewing finished branches — those belong to superpowers.
---

# Doubt-Check

## Overview

A confident answer is not a correct one. Long sessions accumulate context that quietly turns assumptions into "facts" without anyone noticing. Doubt-check is the discipline of materializing a fresh-context reviewer — biased to **disprove**, not approve — before a non-trivial decision stands.

This is not code review. Code review (superpowers:requesting-code-review) is a verdict on a finished artifact. Doubt-check is an in-flight posture: a single decision gets cross-examined while course-correction is still cheap. By PR time it's too late.

The core mechanism: the doubter sees **only the artifact and its contract** — never the author's reasoning. If you hand over conclusions, you get back validation of your conclusions.

## When It Pays Off

Doubt-check earns its cost on decisions where "looks right" and "is right" diverge late:

- **Constraint-solver formulations and penalty weights.** A wrong CP-SAT constraint or a mistuned `PENALTY_*` weight compiles, solves, and produces a plausible-looking schedule — the error surfaces a month later as nurses complaining. Doubt the formulation before generating.
- **Schema and migration decisions.** Firestore-to-SQL mappings, doc-ID conventions, denormalization choices. Migrations are one-way doors; a wrong shape costs a second migration.
- **Auth and permission logic.** Role gates, `isAdmin` checks, who-can-see-what. Wrong here is a security incident, not a bug.
- **Irreversible operations.** Data backfills, destructive scripts, public API shapes, anything a client will build on top of.
- **Claims the compiler can't check.** "This is idempotent", "this handles the month boundary", "this matches the spec" — assertions with no type system behind them.

**When NOT to use:**

- Mechanical operations (renames, formatting, file moves)
- Following a clear, unambiguous user instruction
- One-line changes with obvious correctness
- Debugging a failure that already happened — that is superpowers:systematic-debugging territory, not doubt-check
- Reviewing a finished branch — that is superpowers:requesting-code-review

If you doubt every keystroke, you ship nothing. The skill applies only to decisions in the list above, or when the user explicitly says "doubt-check this."

## The Loop

Copy this checklist when applying the skill:

```
Doubt cycle:
- [ ] Step 1: CLAIM — wrote the claim + why-it-matters
- [ ] Step 2: EXTRACT — isolated artifact + contract, stripped reasoning
- [ ] Step 3: DOUBT — spawned fresh subagent with adversarial prompt
- [ ] Step 4: RECONCILE — classified every finding against the artifact text
- [ ] Step 5: STOP — met stop condition (trivial findings, 3 cycles, or user override)
```

### Step 1: CLAIM — Surface what stands

Name the decision in two or three lines:

```
CLAIM: "The night-shift staffing constraint allows exactly the
        minimum required nurses and never over-assigns seniors."
WHY THIS MATTERS: an over-constrained model returns INFEASIBLE
                  with no explanation; an under-constrained one
                  ships an unsafe roster.
```

If you can't write the claim that compactly, you have a vibe, not a decision. Surface it before scrutinizing it.

### Step 2: EXTRACT — Smallest reviewable unit

A fresh-context reviewer needs the **artifact** and the **contract**, not the journey.

- Code: the diff or the function — not the whole file
- Decision: the proposal in 3–5 sentences plus the constraints it must satisfy
- Assertion: the claim plus the evidence that supposedly supports it

Strip your reasoning. The unit must be small enough that a reviewer can hold it in mind in one read — if it's a 500-line diff, decompose first.

### Step 3: DOUBT — Spawn the fresh-context doubter

Dispatch a **fresh subagent** via the Task tool (general-purpose agent). Subagents start with empty context — that is the entire point. Never run the doubt step inside your own context: you carry your reasoning with you, and reasoning biases agreement.

The subagent prompt **must be adversarial**. Framing decides the answer. Use this verbatim:

```
Adversarial review. Find what is wrong with this artifact.
Assume the author is overconfident. Look for:
- Unstated assumptions
- Edge cases not handled
- Hidden coupling or shared state
- Ways the contract could be violated
- Existing conventions this might break
- Failure modes under unexpected input

Do NOT validate. Do NOT summarize. Find issues, or state
explicitly that you cannot find any after thorough examination.

ARTIFACT: <paste artifact>
CONTRACT: <paste contract>
```

**Pass ARTIFACT + CONTRACT only. Do NOT pass the CLAIM.** Handing the reviewer your conclusion biases it toward agreement. The reviewer must independently determine whether the artifact satisfies the contract.

Rules of dispatch:

- The subagent may Read files named in the artifact (to check conventions the diff touches), but the prompt must not include your session narrative, your plan, or your justifications.
- For product/scope doubts ("should this feature exist in this shape?"), use the `product-critic` agent instead — doubt-check is for technical-correctness claims.
- If you are already inside a subagent and cannot spawn another: surface that to the user and let the main session run the cycle. As a last resort, rewrite ARTIFACT + CONTRACT as a fresh self-prompt with a hard mental separator from your prior reasoning — but flag the result as degraded, because self-doubt from inside the author's context is not fresh-context review.
- Optionally, the user can paste ARTIFACT + CONTRACT + the adversarial prompt into a different model for a cross-model second opinion. Offer it for the highest-stakes decisions; never invoke external tools for this without the user asking.

### Step 4: RECONCILE — Fold findings back

The doubter's output is data, not verdict. **You are still the orchestrator.** Re-read the artifact text against each finding before classifying — rubber-stamping the reviewer is the same failure mode as ignoring it.

For each finding, classify in this **precedence order** (first matching class wins):

1. **Contract misread** — the reviewer flagged something because your CONTRACT was unclear or incomplete. Fix the contract first, re-classify next cycle.
2. **Valid + actionable** — real issue requiring a change to the artifact. Change it, re-loop.
3. **Valid trade-off** — issue is real but the cost of fixing exceeds the cost of accepting. Document it explicitly so the user sees it.
4. **Noise** — the reviewer flagged something that's actually correct under context it didn't have. Note it, and ask: would adding that context to the contract have prevented the false flag?

A fresh reviewer can be wrong because it lacks context. Don't defer just because it's "fresh."

**Record what survived.** Accepted trade-offs (class 3) go into the active plan in `docs/plans/` or, if the decision resolves a recurring problem, a short entry in `docs/solutions/`. Future sessions must be able to see why the "wrong-looking" choice was deliberate.

### Step 5: STOP — Bounded loop, not recursion

Stop when:

- The next iteration returns only trivial or already-considered findings, **or**
- 3 cycles completed (escalate to the user, don't grind a fourth alone), **or**
- The user explicitly says "ship it"

If after 3 cycles the doubter still surfaces substantive issues, the artifact may not be ready. Three unresolved cycles is information about the artifact, not a reason to keep looping.

If 3 cycles seems "obviously insufficient" because the artifact is large: the artifact is too big — return to Step 2 and decompose. Do not lift the bound.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'm confident, skip the doubt step" | Confidence correlates poorly with correctness on novel problems. Moments of certainty are exactly when blind spots hide. |
| "Spawning a subagent is expensive" | Debugging a wrong migration in production is more expensive. The check is bounded; the bug isn't. |
| "The reviewer will just nitpick" | Only if unscoped. Constrain the prompt to issues that would make the artifact fail under the contract. |
| "I'll doubt it at code-review time" | Code review is a final gate. Doubt-check catches wrong directions early, when course-correction is cheap. |
| "If I doubt every step I'll never ship" | The skill applies to the high-stakes list, not every keystroke. Re-read "When NOT to use." |
| "The reviewer disagreed, so I was wrong" | The reviewer lacks your context — disagreement is information, not verdict. Re-read the artifact, classify, then decide. |
| "I'll just include my reasoning so the reviewer understands" | That is the one thing you must never do. Reasoning biases agreement; the artifact and contract must stand alone. |

## Red Flags

- Spawning a doubter for a rename or a formatting change
- Treating doubter output as authoritative without re-reading the artifact text
- Looping past 3 cycles without escalating to the user
- Prompting the doubter with "is this good?" instead of "find what is wrong"
- Skipping doubt under time pressure on exactly the decisions in the "When It Pays Off" list
- Re-spawning on an unchanged artifact — you'll get the same findings; you're stalling
- **Doubt theater**: across 2+ cycles with substantive findings, zero were classified actionable. You are validating, not doubting. Stop and escalate.
- Doubting only after committing — that's code review, not doubt-check
- Passing the CLAIM, your plan, or your session narrative to the doubter
- Stripping the contract from the doubter's input

## Interaction with Other Skills

- **superpowers:requesting-code-review** — complementary. Code review is the post-hoc gate on a finished branch; doubt-check is in-flight, per-decision, pre-commit. Use both.
- **superpowers:test-driven-development** — TDD's RED step is doubt made concrete: a failing test is a disproof attempt. When a claim is behavioral and testable, the failing test *is* the doubt step; reserve doubt-check for claims tests can't reach (formulations, schemas, permissions models).
- **superpowers:systematic-debugging** — when the doubter surfaces a real failure mode in existing behavior, hand off there to localize and fix. Doubt-check never owns debugging.
- **superpowers:brainstorming / writing-plans** — doubt-check reviews a decision those processes produced; it does not replace them. A plan section that names a risky choice is a natural CLAIM.
- **product-critic agent** — for "is this the right product decision?" doubts; doubt-check stays on technical correctness.
- **ship-check** — the pre-release sweep may trigger a doubt cycle on any decision it can't verify mechanically.
