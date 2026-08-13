---
name: project-init
description: Use when starting a new project with the modem-stack workflow, or retrofitting it onto an existing repo - scaffolds docs structure (PRD, DESIGN_SYSTEM, plans, QA reports), CLAUDE.md with a Lessons ledger, and quality gates, then guides through requirements and design-direction phases. Trigger with /project-init or "set up this project".
---

# Project Init

Bootstrap a project so every later phase (design-first UI, feature changes, QA, shipping) has a place to put its artifacts and a contract to check against. Run ONCE per project.

**Core principle:** no feature work before (1) a written PRD, (2) a design contract, (3) machine-runnable quality gates. Every agent-loop failure mode documented in the wild traces back to skipping one of these.

## Step 1 — Interview the owner (short)

Ask only what you cannot infer, one question at a time:

1. Project name + one-line purpose. Who is the actual end user? (Name a concrete person/role, not "everyone".)
2. New build or existing codebase?
   - **New build:** stack (or "you choose" — then propose one and get approval).
   - **Existing codebase / rebuild:** do NOT ask about or lock the stack here. Read the existing code and docs first — they are the baseline that tells you what the system really does. Requirements come before architecture: stack and architecture get proposed AFTER the PRD is approved (Step 4), as their own approval gate.
3. UI language (Thai/English/other) — mockups and test data must use it.
4. What is the smallest version the client would accept this month?

If the owner has client requirements already, collect them raw — do NOT paraphrase-and-lose details. Store verbatim notes in `docs/notes/`.

## Step 2 — Scaffold the structure

Create (skip anything that exists — never overwrite):

```
docs/
├── PRD.md                  # living requirements contract (stub now, filled in Step 4)
├── DESIGN_SYSTEM.md        # design contract (stub now, filled by design-first-ui system mode)
├── notes/                  # raw client-meeting notes, verbatim
├── plans/                  # per-feature implementation plans + change briefs (CR-*.md)
├── solutions/              # lessons that need more than one line (linked from CLAUDE.md)
├── design/
│   ├── mockups/            # design-first-ui output, one folder per feature
│   └── taste-profile.json  # learned owner taste (created by design-first-ui)
└── qa/
    ├── index.md            # master QA index — every run links from here
    ├── runs/               # walkthrough QA reports (one folder per run)
    └── design-reviews/     # design-reviewer agent reports
```

Seed `docs/qa/index.md`:

```markdown
# QA Reports

| Date | Scope | Health | Blockers | Report |
|------|-------|--------|----------|--------|
```

## Step 3 — CLAUDE.md

Create or extend the project CLAUDE.md. Keep it SHORT — for every line ask "would removing this cause mistakes?" Bloated CLAUDE.md files get ignored by the model. Template:

```markdown
# <Project>

<One paragraph: what this is, who uses it, stack.>

## Rules
- PRD is the contract: docs/PRD.md. If reality diverges, update the PRD in the same change.
- UI work: read docs/DESIGN_SYSTEM.md first. New/changed screens go through the design-first-ui skill (mockups -> owner picks) BEFORE implementation.
- UI task is not done until verified in a real browser (browser-verification skill). Console must be clean.
- Feature changes after client meetings go through the feature-update skill (impact analysis first).
- QA reports live in docs/qa/runs/ and MUST be linked from docs/qa/index.md.
- Commands: <typecheck> / <lint> / <test> / <dev server + port>

## Lessons
<!-- One line per lesson, newest first. Consolidate into docs/solutions/ when >30 lines. -->
```

Fill in the real commands discovered in Step 5.

## Step 4 — Requirements phase

Hand off to `superpowers:brainstorming` to interrogate the owner and produce `docs/PRD.md`. Push past polished first answers — the second answer usually reveals the truth. PRD stories need acceptance criteria a machine can check (typecheck passes, test passes, "verify in browser: <concrete behavior>"). End by having the owner approve the PRD explicitly.

**Rebuild of an existing system:** the legacy system's real behavior (code, data, docs) feeds the PRD — mine it so nothing silently drops, and mark explicitly what the rebuild keeps, changes, and kills. After the PRD is approved, propose stack + architecture against it (with reasons, as options) and get owner approval — this is the gate that was deliberately deferred from Step 1.

**Any stack proposal (new build or rebuild) must be verified, not remembered:**
1. Check current stable versions of every proposed piece via web search — model memory is stale by months and WILL name outdated versions.
2. Verify the pieces are known to work together (e.g., the UI component library supports the chosen CSS framework major version) — cite what you checked.
3. Name the UI component layer explicitly (shadcn/ui or equivalent) as part of the stack — production-grade design work depends on it, and the design-first-ui contract will build on it.

## Step 5 — Quality gates (backpressure)

Before any feature work:

1. Ensure typecheck, lint, and test commands exist and run green (create minimal configs if missing).
2. Scaffold the smallest honest test harness for the stack: one real unit test + Playwright E2E setup with one smoke test that boots the app and loads the main page. If the backend has isolated logic (solvers, calculators), a unit-test file for it too.
3. Record all commands in CLAUDE.md.
4. Windows note: prefer npm scripts / cross-platform runners over bash-only scripts.

Loops without these gates compound broken code — this step is not skippable.

## Step 6 — Design direction

Run the `design-first-ui` skill in **system mode**: 3-5 radically different full-page style variants → owner picks → extract `docs/DESIGN_SYSTEM.md` (tokens, palette, typography incl. Thai font handling if applicable, spacing, ~8 do/don't rules). This contract is why the UI stays coherent across months of sessions.

## Done

Report what was created, then start the first feature through the normal loop: plan → design-first-ui (feature mode) → implement (TDD + browser-verification) → qa-walkthrough → ship-check when releasing.
