---
name: project-init
description: Use when starting a new project with the modem-stack workflow, or retrofitting it onto an existing repo - runs kickoff (incl. contract, milestones, hosting, auth), scaffolds docs (TOR, PRD, QUESTIONS, ARCHITECTURE + runbook, CHANGELOG, QA index), writes the PRD with the owner, gets the stack chosen and the app scaffolded with quality gates, then builds the key-job list and the system picture (UX model + design system) before the first feature. Trigger with /project-init or "set up this project".
---

# Project Init

Bootstrap a project so every later phase has a place to put its artifacts and a contract to check against. Run ONCE per project.

**Core principle:** no feature work before (1) an approved PRD tied to the contract, (2) a chosen stack with a running, gated app,
(3) the key jobs and the system picture, (4) a design contract. Every agent-loop failure mode documented in the wild traces back to
skipping one of these.

**The whole loop this sets up** (repeat this line verbatim wherever routing is described):

> **Feature in the PRD:** walkthrough (ux-model, WORKFLOWS §5, owner-approved) → design-first-ui → writing-plans → implement (TDD + browser-verification) → design-reviewer → qa-walkthrough. **Client change:** feature-update first. **New idea not in the PRD:** brainstorming → update PRD (+ TOR check) → same loop. **End of a งวด:** ship-check in milestone mode.

Templates for this skill's documents are in its `templates/` folder.

## Step 1 — Kickoff interview

Ask only what you cannot infer from what the owner already gave you, one question at a time. Collect client material raw — do NOT
paraphrase-and-lose details: verbatim notes go in `docs/notes/YYYY-MM-DD-<topic>.md`, the TOR file (if any) in `docs/notes/` too.

1. Project name, one-line purpose, the client, and the actual end users (concrete roles, not "everyone").
2. New build or existing codebase? **Existing / rebuild:** read the code and docs first — they are the baseline of what the system
   really does. Never lock the stack here; it is proposed in Step 4.
3. **Contract:** is there a TOR? Milestones (งวด) — what is due when, and how does the client sign off each one?
4. What is the smallest version the client would accept first?
5. **Where it runs:** hosting (client VM, cloud, …), who administers it, backup expectations.
6. **Login and integrations:** where accounts come from (LDAP/SSO/local), external systems, notification channels (in-app, email, LINE…).
7. **Personal data:** what personal data the app holds, who may see it, retention (PDPA).
8. UI language, date format (Buddhist era?), and the device split (desktop vs. mobile — the mobile width becomes QA's mobile viewport).
9. Who maintains it after delivery, and what they know (decides the stack as much as taste).

Anything the owner can't answer yet goes into `docs/QUESTIONS.md` with whom to ask — not into your head.

## Step 2 — Scaffold the docs

Create (skip anything that exists — never overwrite). Files marked *(step N)* are created by that step, never stubbed here.

```
docs/
├── TOR.md                  # contract scope as clauses T1… (templates/TOR.md) — from the TOR or the agreed scope
├── QUESTIONS.md            # the ONE open-questions/decisions register (templates/QUESTIONS.md)
├── PRD.md                  # (step 3) requirements contract (templates/PRD.md)
├── ARCHITECTURE.md         # (step 4) stack, decisions, runbook (templates/ARCHITECTURE.md)
├── DESIGN_SYSTEM.md        # design contract — set by the first flow's design round (SYSTEM mode)
├── notes/                  # raw client notes + TOR original, verbatim
├── plans/                  # implementation plans + change briefs (CR-*.md)
├── solutions/              # lessons that need more than one line
├── acceptance/             # (ship-check) ตรวจรับงวด records
├── design/
│   ├── OBJECTS.md · WORKFLOWS.md · SCREENS.md · sample-data.md   # (steps 5–6) UX model — ux-model skill
│   ├── mockups/            # design-first-ui output, one folder per round
│   └── taste-profile.json  # (design-first-ui) learned owner taste
└── qa/
    ├── index.md            # master QA index
    ├── runs/
    └── design-reviews/
CHANGELOG.md                # Keep-a-Changelog style, client-readable language; "Unreleased" section now
```

Append to `.gitignore` (create if missing): `report/` and `.playwright-mcp/` (see browser-verification's artifact table).

Seed `docs/qa/index.md` with `| Date | Scope | Health | Blockers | Report |` and its separator row.

Write a **skeleton CLAUDE.md** now (Rules + empty Lessons, template in Step 4 item 6); the stack line and commands are filled in Step 4.

## Step 3 — PRD

Hand off to `superpowers:brainstorming` to interrogate the owner — push past polished first answers; the second answer usually
reveals the truth. **Override its terminal state here:** the output is `docs/PRD.md` written from `templates/PRD.md`, and when it is
approved you come back to this skill's Step 4 — no design doc in `docs/superpowers/`, no writing-plans yet. Where brainstorming
says "propose approaches", the approaches here are **scope cuts per งวด**; where it says "present architecture/components", stop —
architecture is Step 4.

- Every FR has an id, acceptance criteria a machine or browser walkthrough can check, its งวด, the TOR clause(s) it serves (or
  `extra — CR-…` when it is outside the contract), and its source note. The PRD's TOR column is the only T↔FR map; a TOR clause no
  FR cites is a finding.
- **Run the lifecycle checklist now** (ux-model, "Lifecycles") on every stateful thing in the PRD — hold, expire, who cancels,
  who is notified, outside events. Rules like "a pending request expires 2 hours before start" belong in the approved PRD, not in a
  later amendment.
- Every answer the owner gives on a client matter during this interview becomes a `docs/QUESTIONS.md` row with status
  `owner-answered` — the client confirms those at the first milestone.
- Business rules get R-ids in the PRD **only** — every other doc cites them.
- Not-doing list with "reconsider when".
- **Rebuild:** the legacy system's real behavior feeds the PRD — mark what the rebuild keeps, changes, and kills.

Before asking for approval, dispatch the `product-critic` agent on the draft and fold in what survives. Then the owner approves the
PRD explicitly; record the date in its status line. **Later amendments** (a rule found by doubt-check, a walkthrough decision)
are added to the status line as `amended YYYY-MM-DD: R-011, FR-022 (owner OK)` — never silently.

## Step 4 — Architecture, app scaffold, quality gates

1. **Propose 2–3 stack options** against the approved PRD (hosting, auth source and team skills from Step 1 decide more than taste),
   with reasons and trade-offs. **Verify, don't remember:** current stable versions via web search, and that the pieces work together
   (e.g. the component library supports the CSS framework's major version) — cite what you checked. Name the UI component layer
   explicitly (shadcn/ui or equivalent). The owner chooses or adjusts.
2. Write `docs/ARCHITECTURE.md` from `templates/ARCHITECTURE.md`: stack with verified versions, overview, external systems and their
   test doubles, decisions D-01…, and the runbook skeleton (deploy/rollback/backup/restore filled as soon as they exist — at the latest
   by the first ship-check).
3. **Scaffold the app:** the stack's official generator; the database via a compose file with the **first schema file** for the
   PRD's objects; test doubles or seed accounts for each external system (LDAP, SMTP, …) so dev never needs the real ones; a health
   route. Commit.
4. Run `doubt-check` on that schema file and the auth/permission design before anything is built on them — **one cycle** here
   unless a finding is Blocker-class. Accepted findings become D-ids, PRD amendments, or QUESTIONS rows.
5. **Quality gates (not skippable):**
   - typecheck, lint and test commands exist and run green;
   - one real unit test, plus Playwright E2E with one smoke test that boots the app and loads the main page (and a unit-test file for
     any isolated logic such as solvers or calculators);
   - **Playwright smoke check** — MCP: `browser_navigate` to `about:blank`, `browser_take_screenshot` **without a filename**; it must
     land in `report/tests/` (in `.playwright-mcp/` at the root → `PLAYWRIGHT_MCP_OUTPUT_DIR` isn't reaching the MCP; tell the owner,
     README install step 4). CLI: `npx playwright screenshot about:blank "<abs repo path>/report/tests/cli-smoke.png"` must produce the
     file (`--version` alone succeeds with no browser; missing browser → `npx playwright install chromium`, no `@latest`). Delete both
     smoke files.
   - Windows: npm scripts / cross-platform runners, no bash-only scripts.
6. **Fill CLAUDE.md** (template below): the one-paragraph description with a link to ARCHITECTURE.md for the stack, and the real commands.

```markdown
# <Project>

<One paragraph: what this is, who uses it. Stack: see docs/ARCHITECTURE.md.>

## Rules
- Contract: docs/TOR.md → docs/PRD.md (FR, R, งวด). If reality diverges, update the PRD in the same change.
- Open questions and decisions: docs/QUESTIONS.md only. Stack, decisions, runbook: docs/ARCHITECTURE.md.
- Specs and plans live in docs/plans/ — this overrides the superpowers default (docs/superpowers/specs|plans).
- Routing: Feature in the PRD: walkthrough (ux-model, WORKFLOWS §5, owner-approved) → design-first-ui → writing-plans → implement (TDD + browser-verification) → design-reviewer → qa-walkthrough. Client change: feature-update first. New idea not in the PRD: brainstorming → update PRD (+ TOR check) → same loop. End of a งวด: ship-check in milestone mode.
- brainstorming never jumps straight to writing-plans when screens are involved — design-first-ui comes first (overrides its terminal state).
- UX model: docs/design/OBJECTS.md, WORKFLOWS.md, SCREENS.md, sample-data.md. Read before UI work; update in the same change.
- UI work reads docs/DESIGN_SYSTEM.md; a UI task is done only when verified in a real browser with a clean console.
- Plans cite FR/R/J ids; where writing-plans wants constraints "copied verbatim", list the R-ids with a one-line gist and the note "PRD §5 wins".
- Tests are named after the FR / key job they prove (e.g. `fr-012-overlap.test.ts`, `j1-book-room.spec.ts`).
- QA reports live in docs/qa/runs/ and MUST be linked from docs/qa/index.md.
- Commands: <typecheck> / <lint> / <test> / <e2e> / <dev server + port>

## Lessons
<!-- One line per lesson, newest first. Consolidate into docs/solutions/ when >30 lines. -->
```

Keep it SHORT — for every line ask "would removing this cause mistakes?" Bloated CLAUDE.md files get ignored.

## Step 5 — Features → key jobs

Run the `ux-model` skill's **key jobs** part: roles (WORKFLOWS §1) and key jobs (WORKFLOWS §2), each with its งวด and the FRs it
covers. Every FR is covered by a key job or listed under "No-UI FRs" in WORKFLOWS §2 (batch job, sync, scheduled expiry…). Always
include **J0 — sign in and land** (login, the landing screen per role, no-permission page, notification bell, the app shell): every
other job starts there, and without it nobody designs those screens. This list is the feature backlog: each job will get its own
walkthrough, design round, implementation and QA. The owner approves the list.

## Step 6 — System picture

1. Run `ux-model` for the rest of the model: OBJECTS.md, lifecycles (WORKFLOWS §3, answering the lifecycle checklist), rule
   citations (§4), notifications (§6), the screen map (§7), the SCREENS.md skeleton, and sample-data.md. Unanswerable checklist items → QUESTIONS.md.
   The owner OKs the object map and lifecycles.
2. **No separate SYSTEM round.** The design system is set by the **first flow's** design round (design-first-ui SYSTEM mode, run
   after that flow's walkthrough): its three variants differ in style *and* structure, the winner becomes `docs/DESIGN_SYSTEM.md`
   **and** that flow's visual target. Designing the same page twice wastes a round.

**Retrofit onto an existing repo:** build the model slice first (the jobs the next work touches) instead of the whole app.

**Pacing (solo dev, short contracts):** only the first flow is a full Large round; later flows that reuse its shell and patterns are
Medium rounds (the changed sections only). Budget about one design round per flow per week.

## Done

Report what was created (one line per file) and the open questions that block the first flow, then start the first flow of งวด 1
(J0 plus the most important job) through the loop at the top of this skill — beginning with its walkthrough session; its design round
runs in SYSTEM mode.
