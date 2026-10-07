---
name: ship-check
description: Use before any release, deploy, or client delivery ("ship it", "release", "deploy to production", "send to client", "ส่งงวด", "ตรวจรับ") - runs the full pre-ship gate (every claim backed by command output, screenshots, or a report link), deploys from the runbook, and in milestone mode writes the ตรวจรับงวด acceptance record tracing TOR → FR → key job → evidence for the client to sign.
---

# Ship Check

The pre-release gate. Its one rule: **evidence before assertions**. "Tests pass" means you ran them in this session and show the output. A skipped check is reported as skipped, never papered over.

**Two modes.** A **release** ships whatever is on the branch. **Milestone mode** (a งวด delivery — "ส่งงวด 1", "ตรวจรับ") scopes the
gate to that งวด: its FRs and key jobs come from `docs/PRD.md` §3 and `docs/design/WORKFLOWS.md` §2 (this งวด and earlier ones —
later งวด's jobs are not built yet and are out of scope), and it ends with the acceptance record below.

## The gate (in order)

1. **Clean tree & branch sanity** — no uncommitted changes; on the intended release branch; synced with main.
2. **Static gates** — typecheck + lint, full output shown. Zero errors.
3. **Full test suite** — unit + E2E, not diff-scoped. Skipped tests count as failures (grep for skip/todo markers and justify each or unskip).
4. **Full QA walkthrough** — run `qa-walkthrough` in FULL mode (not diff-aware), **scoped to the milestone's key jobs** in milestone mode: every key job from each entry point, all target viewports. Blockers = no ship. Highs = owner decides explicitly.
   - **Design reviews (run these BEFORE the walkthrough, same order as feature-update)** — scope: every feature whose `docs/design/mockups/<feature>/chosen.md` was added or changed since the last `ship:` row in `docs/qa/index.md`. Each needs a `design-review:<scope>` row; the **newest** row per scope is the one that counts, and it must have 0 Blockers. Missing or blocked → dispatch the `design-reviewer` agent in the foreground (it shares the one browser with the walkthrough). UI without a `chosen.md` is out of scope here.
5. **Security pass** — run the built-in `/security-review` on the pending changes AND the `security-hardening` checklist against release-relevant items (secrets in bundle? debug endpoints? permissive CORS? auth on new routes?).
6. **Performance spot-check** — `performance-budget` quick pass on the 2-3 heaviest pages (initial load + the known-heavy interaction). Regressions beyond budget = flag to owner.
7. **Production build** — actually build the production artifact; boot it once; smoke-test the main page against the prod build (dev-mode-only bugs are real).
8. **Docs truthfulness** — PRD.md matches shipped behavior (milestone table status updated); ARCHITECTURE.md §4 "real vs. mock" is current; CHANGELOG.md moves "Unreleased" under the new version in plain language the client could read; version bumped consistently.
9. **Runbook** — `docs/ARCHITECTURE.md` §5 has exact deploy, rollback, backup and restore steps. **Milestone mode:** the restore was drilled within the last 30 days (date + evidence in the runbook) — a backup that has never been restored does not count. No runbook → write it now from what you actually do in step 10; deploying from memory is a NO-SHIP.

## Ship report

Write `docs/qa/runs/YYYY-MM-DD-ship-<version>/report.md`:

```markdown
# Ship Report — v<version> — <date>
**Verdict:** SHIP / NO-SHIP (reason)

| Gate | Result | Evidence |
|------|--------|----------|
| Typecheck/Lint | pass | <output snippet> |
| Tests | 142/142 pass | <output snippet> |
| QA walkthrough | health 92 — 0 blockers | [report](../<qa-run>/report.md) |
| Design reviews | 3/3 approved | [a](../../design-reviews/<scope-a>.md) · [b](../../design-reviews/<scope-b>.md) · … |
| Security | pass / N findings | <link or summary> |
| Performance | within budget | <numbers> — Lighthouse JSON copied into this run folder |
| Prod build | boots, smoke ok | <screenshot> |

## Known issues shipped (owner-approved)
- <High/Medium items the owner explicitly accepted, with links>
```

Add the row to `docs/qa/index.md` (same five columns as every other run):

```markdown
| YYYY-MM-DD | ship:v<version> | <SHIP/NO-SHIP> — health NN | <n blockers> | [report](runs/YYYY-MM-DD-ship-<version>/report.md) |
```

Then, and only then:

10. **Deploy from the runbook** — run its steps literally; anything you had to do that isn't in it goes into it now. Smoke-test production (health URL + main page) and note the result in the ship report.
11. **Milestone mode — acceptance record.** Write `docs/acceptance/งวด-N.md` from this skill's `templates/acceptance.md`: one row per TOR clause in the งวด → its FRs → the key jobs that exercise them → evidence links (the QA run's job sections, the tests named after the FR/J, screenshots) → result. A clause with no evidence is ❌, never blank. List the deliverables the TOR requires, known issues the owner accepted, TOR changes (CR links), and every `assumed` **and** `owner-answered` row in `docs/QUESTIONS.md` for the client to confirm in writing. The owner sends it to the client for sign-off; when signed, set the PRD milestone status to `accepted YYYY-MM-DD`.

## Failure handling

Any gate fails → stop, report exactly what failed with output, fix or escalate to the owner. Never rerun a flaky gate until it passes and call that green — flakiness is itself a finding.
