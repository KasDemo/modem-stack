---
name: qa-walkthrough
description: Use when asked to QA, click-test, or walk through a running web app — "QA this", "click through the new feature", "test it in the browser", when a feature branch feels done, or when ship-check needs a full pass. Drives Playwright MCP browser tools through real user flows and writes a scored, screenshot-linked report under docs/qa/. Not code review, not unit testing.
---

# QA Walkthrough

Systematic browser click-testing with evidence. Walk the app the way its real user would, break things on purpose, score the result, and leave behind a report that renders standalone in VSCode or GitHub. Default is **report-only**; fixing is a separate mode that runs only on explicit request.

Non-negotiable: qa-walkthrough means **browser**, not unit tests. Even a backend-only diff gets a browser pass — backend changes affect app behavior. Never refuse to open the browser because the diff "looks UI-less".

## Modes

| Mode | Trigger | Coverage |
|------|---------|----------|
| `--quick` | Fast smoke check | Homepage + top 5 nav targets; console + links only |
| **diff-aware** (default) | On a feature branch, no scope given | Only routes/flows affected by the branch diff |
| **full** | Explicit request, or invoked by `ship-check` | Every route, every flow, full health score |

For verifying one small change ("did my fix work?"), use the lighter `browser-verification` skill instead — this skill is for structured passes that produce a report.

## Phase 1 — Scope

**Diff-aware scoping (default):**

1. Run `git diff main...HEAD --name-only` (fall back to `master` if no `main`).
2. Map changed files to routes/flows:
   - `pages/foo/bar.js`, `app/foo/page.tsx` → route `/foo/bar`, `/foo`
   - Changed component → every route that imports it (grep for the import)
   - Changed API route / backend endpoint → every page that calls it
   - Changed shared lib/config/styles → treat as full-mode candidate; say so and ask
3. Cross-reference commit messages on the branch for intent — test that the change *works as intended*, not just that pages load.
4. List the affected flows before starting. That list is the test plan.

**Persona rule:** Read `docs/PRD.md` first. Walk every flow as the PRD's target user — their language, their goals, their level of patience — not as the developer who knows where the buttons are. If the PRD says the user is a Thai head nurse on a hospital PC, you type Thai names, use realistic ward data, and get lost the way she would. Type realistic data, never `asdf`. Never include real credentials in the report — write `[REDACTED]`.

## Phase 2 — Find the app

1. Check `package.json` scripts (and `docker-compose.yml`) for the dev command and port.
2. Probe with `browser_navigate`: `http://localhost:3000`, then `5173`, `4000`, `8080`, `5000`.
3. Nothing responds → start the dev server yourself in the background (`npm run dev` or the project's equivalent, cross-platform, no bash-isms), wait for it with `browser_wait_for`, or ask for the URL.
4. Record the URL, framework, branch, and short commit SHA for the report header.

Create the run folder before testing starts:

```
docs/qa/runs/YYYY-MM-DD-<scope-slug>/
├── report.md
└── screenshots/
```

`<scope-slug>` is a kebab-case name for what you're testing (`schedule-create`, `full-app`, `login-smoke`).

## Phase 3 — Walkthrough loop

For **each flow** in the scope, repeat this cycle:

1. `browser_navigate` to the flow's entry point.
2. `browser_snapshot` — the accessibility snapshot with element refs is your map. Read it; don't guess selectors.
3. Interact with **every control** in the flow: `browser_click` buttons and links, `browser_type` into inputs, `browser_fill_form` for whole forms, `browser_select_option` for dropdowns. Test forms three ways: empty submit, invalid data, realistic happy path.
4. After **each step**, check `browser_console_messages`. A new error or warning is a finding — file it now with the step that caused it.
5. `browser_take_screenshot` at every meaningful state (landing, filled form, result, error). Copy each capture into the run's `screenshots/` folder immediately, named `NN-flow-step.png`, and reference it by **relative path** (`screenshots/01-login-landing.png`) so the report renders standalone.
6. Check `browser_network_requests` after any submit or data load — failed or 4xx/5xx requests are findings even when the UI hides them.
7. `browser_resize` to 375×812 once per flow and re-snapshot — broken mobile layout is a finding.
8. Use `browser_wait_for` instead of assuming; a race you papered over is a race the user will hit. `browser_evaluate` only when the snapshot can't answer the question.

**Document issues as you find them — never batch.** Each issue gets an ID (`ISSUE-001`, sequential within the run), a severity, a category, repro steps, and at least one screenshot. **Screenshots are evidence: an issue without one does not exist.** Depth beats breadth — 5–10 well-evidenced issues are worth more than 20 vague descriptions.

## Phase 4 — Health score

Eight categories. Each starts at 100; deduct per finding: **Blocker −25, High −15, Medium −8, Nitpick −3** (floor at 0). Final score = Σ(category score × weight).

| Category | Weight | What it measures |
|----------|--------|------------------|
| Console | 15% | Errors/warnings in `browser_console_messages` |
| Functional | 20% | Features do what the PRD says they do |
| UX | 15% | Flow friction, confusing states, dead ends, missing feedback |
| Accessibility | 15% | Snapshot semantics: labels, roles, focus, contrast |
| Links | 10% | Broken links, 404s, dead nav targets |
| Visual | 10% | Layout breakage, overflow, responsive failures |
| Performance | 10% | Slow loads, spinners that never resolve, huge payloads |
| Content | 5% | Typos, wrong language, placeholder text left in |

Deep visual/design critique belongs to the `design-reviewer` agent — here, Visual means "not broken", not "beautiful".

**Severity triage:**

- **Blocker** — app broken, data loss, security hole, white screen, target user cannot complete a core flow
- **High** — core feature broken or flow badly degraded; user completes it only by luck
- **Medium** — feature partially broken, console error, noticeable visual defect
- **Nitpick** — typo, cosmetic issue, edge case polish

## Phase 5 — Report

Write `docs/qa/runs/YYYY-MM-DD-<scope-slug>/report.md`:

```markdown
# QA Walkthrough — <scope>

- **Date:** YYYY-MM-DD  ·  **Mode:** quick | diff-aware | full
- **Branch/commit:** <branch> @ <short-sha>  ·  **App:** <url> (<framework>)
- **Persona:** <one line from docs/PRD.md>

## Health Score: NN/100

| Category | Weight | Score | Notes |
|----------|--------|-------|-------|
| Console | 15% | 100 | clean |
| Functional | 20% | 75 | ISSUE-002 |
| ... | | | |

## Flows Tested

### Flow: <name>
| # | Action | Expected | Actual | Evidence |
|---|--------|----------|--------|----------|
| 1 | Open /login | Login form | OK | [01](screenshots/01-login-landing.png) |
| 2 | Submit empty form | Validation msg | Silent fail → ISSUE-001 | [02](screenshots/02-login-empty.png) |

## Findings

### Blockers
#### ISSUE-001 — <title>
- **Category:** Functional  ·  **Flow:** Login
- **Repro:** 1. … 2. … 3. …
- **Expected / Actual:** … / …
- **Evidence:** ![empty submit](screenshots/issue-001.png)

### High / Medium / Nitpicks
(same format; omit empty sections)

## Regression Tests Written
None — report-only run.  (or a table: ISSUE | test file | result)

## Verdict
One paragraph. **Ship** (≥90, zero Blockers/Highs) · **Ship with follow-ups** (≥80, zero Blockers) · **Fix first** (any Blocker, or <80).
```

**Then append one row to `docs/qa/index.md`** (create it with this header if missing), newest row directly under the header:

```markdown
| Date | Scope | Health | Blockers | Report |
|------|-------|--------|----------|--------|
| 2026-08-13 | schedule-create | 84/100 | 0 | [report](runs/2026-08-13-schedule-create/report.md) |
```

**A report not linked from the index does not exist.** The index is also your regression baseline: compare this run's health to the previous run of the same scope and call out the delta in the verdict. If a run taught you something structural about the app, capture it with the `lesson` skill.

## Fix mode — explicit request only

Never enter fix mode from "QA this". Only from "QA and fix", "fix what you find", or similar. Then:

**Preconditions:** clean working tree (dirty → ask to commit/stash/abort first). Complete the full report *before* the first fix — triage from the report, Blockers first.

**Per-issue fix loop:**

1. **Locate** the responsible source. Minimal fix only — never refactor unrelated code while fixing.
2. **Commit atomically**, one commit per fix, never bundled: `fix(qa): ISSUE-NNN — <desc>`
3. **Re-test in the browser**: repeat the exact repro steps, capture `issue-NNN-before.png` / `issue-NNN-after.png` into the run's `screenshots/`, re-check `browser_console_messages`.
4. **Classify:** verified · best-effort · reverted · deferred. If the fix made anything worse, `git revert HEAD` immediately — revert on regression, no debate.
5. **Verified + logic changed** → write a regression test (recipe below).
6. Update the report's findings and Regression Tests sections as you go.

**WTF-likelihood stop heuristic** — recompute after every 5 fixes. Start at 0%:
- +15% per reverted fix
- +5% per fix touching >3 files
- +20% if a fix required touching files unrelated to the issue
- +10% once only Nitpicks remain
- +1% per fix beyond fix 15

**If WTF > 20%: STOP**, write up where you are, and ask the user. Hard cap: **50 fixes per run** — in practice the meter stops you long before.

## Regression test recipe

For each *verified* fix that changed logic (skip pure CSS/visual fixes, and skip entirely if no test framework exists and the user declines a bootstrap — offer Vitest for Node, pytest for Python, nothing else):

1. **Read 2–3 existing test files** in the same directory first. Copy their naming, imports, setup, and assertion style exactly — the test should look native, not transplanted.
2. **Reproduce the bug's precondition** in the test: the state/input that triggered it, the action that exposed it, then assert the *correct behavior* — not merely "renders".
3. **Name:** `{name}.regression-{N}.test.{ext}`, auto-incrementing N to avoid collisions.
4. **Attribution comment** at the top:
   ```js
   // Regression: ISSUE-NNN — <what broke>
   // Found by qa-walkthrough on YYYY-MM-DD
   // Report: docs/qa/runs/YYYY-MM-DD-<scope-slug>/report.md
   ```
5. **Run it in isolation** before committing (`npx vitest run <file>` / `python -m pytest <file>`). It must pass on fixed code — and it must be the kind of test that would have failed before the fix.
6. Commit separately: `test(qa): regression test for ISSUE-NNN — <desc>`

Test type: console error / JS exception → unit or integration; form or API failure → integration; visual + JS behavior → component test; pure CSS → skip.

## Hard rules

- [ ] Browser always — never substitute source reading for clicking
- [ ] Test as the PRD's persona, with realistic data, in their language
- [ ] Every issue has an ID, repro steps, and at least one screenshot
- [ ] Screenshots live in the run folder, linked by relative path
- [ ] Document incrementally; never batch findings at the end
- [ ] Report-only by default; fix mode only on explicit request
- [ ] One commit per fix; revert immediately on regression
- [ ] Every run appends its row to `docs/qa/index.md` — unlinked reports don't exist
