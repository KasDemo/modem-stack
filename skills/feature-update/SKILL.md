---
name: feature-update
description: Use when the owner brings a feature change or addition after a client conversation ("client wants...", "change how X works", "add feature to existing system") - runs impact analysis against the existing codebase and PRD BEFORE implementing, produces a change brief, keeps the PRD truthful. The brownfield-aware entry point for all feature changes.
---

# Feature Update (Change Request)

Client conversations change requirements — that is normal and expected. What kills brownfield work is implementing the change as if the system were greenfield: duplicated logic, broken adjacent features, a PRD that no longer matches reality. This skill makes impact analysis a mandatory gate.

## Step 1 — Capture the request

Record what the owner said VERBATIM in `docs/notes/YYYY-MM-DD-<topic>.md` (their words, not your paraphrase), plus the why if given (client context changes design decisions later).

Ask clarifying questions ONLY for genuine ambiguity — the owner talks to the client directly and usually knows the requirement precisely. Do not re-interrogate settled decisions.

## Step 2 — Impact analysis (before promising anything)

Investigate with subagents (keeps main context clean):

1. **Code impact:** which modules/components/routes touch this behavior today? Search — do not assume something is unimplemented; agents that assume duplicate existing code.
2. **Data impact:** schema changes? Existing records that need migration? Backwards compatibility with data already in production?
3. **Behavior impact:** which existing user flows change as a side effect? Which tests will break (breaking tests may be correct — flag, don't silently "fix")?
4. **PRD impact:** does this contradict an existing requirement? Surface the contradiction to the owner instead of quietly picking a side.
5. **UI impact:** which screens are new or visibly changed? These MUST go through `design-first-ui` before implementation.

## Step 3 — Change brief

Write `docs/plans/CR-YYYY-MM-DD-<slug>.md`:

```markdown
# CR: <title>
**Requested:** <date> — <client context, one line>
**Request (verbatim):** <link to notes file>

## What changes
<2-5 bullet summary of behavior change>

## Impact
- Code: <files/modules affected>
- Data: <schema/migration needs, or "none">
- Existing behavior: <flows that change as side effects>
- PRD: <sections to update; contradictions found>
- UI: <screens needing design-first-ui, or "none">

## Risks
<what could break; what we deliberately do NOT change>

## Tasks
<small verifiable tasks, each with its check — same sizing rules as any plan>
```

**Gate: owner approves the brief before implementation.** This is a 2-minute read that prevents thousand-line mistakes. If scope smells inflated, dispatch the `product-critic` agent on the brief first.

## Step 4 — Implement

- Update `docs/PRD.md` in the same branch — PRD stays the single source of truth.
- New/changed screens: `design-first-ui` (feature mode) → owner picks → implement to match.
- Normal discipline: TDD, browser-verification on UI tasks, respect existing code conventions (read neighboring code first, follow its patterns).
- Migration code gets its own task with its own test.

## Step 5 — Verify scoped to the blast radius

Run `qa-walkthrough` in diff-aware mode: walk the changed flows AND the adjacent flows identified in Step 2.3 (side-effect candidates). Regression on neighbors is the #1 brownfield failure.

## Step 6 — Close the loop

If the change revealed a wrong earlier assumption, log it via the `lesson` skill so the next change brief starts smarter.
