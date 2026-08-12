---
name: ship-check
description: Use before any release, deploy, or client delivery ("ship it", "release", "deploy to production", "send to client") - runs the full pre-ship gate; every claim must be backed by command output, screenshots, or a report link. Nothing ships on assertion alone.
---

# Ship Check

The pre-release gate. Its one rule: **evidence before assertions**. "Tests pass" means you ran them in this session and show the output. A skipped check is reported as skipped, never papered over.

## The gate (in order)

1. **Clean tree & branch sanity** — no uncommitted changes; on the intended release branch; synced with main.
2. **Static gates** — typecheck + lint, full output shown. Zero errors.
3. **Full test suite** — unit + E2E, not diff-scoped. Skipped tests count as failures (grep for skip/todo markers and justify each or unskip).
4. **Full QA walkthrough** — run `qa-walkthrough` in FULL mode (not diff-aware): every primary user flow, all target viewports. Blockers = no ship. Highs = owner decides explicitly.
5. **Security pass** — run the built-in `/security-review` on the pending changes AND the `security-hardening` checklist against release-relevant items (secrets in bundle? debug endpoints? permissive CORS? auth on new routes?).
6. **Performance spot-check** — `performance-budget` quick pass on the 2-3 heaviest pages (initial load + the known-heavy interaction). Regressions beyond budget = flag to owner.
7. **Production build** — actually build the production artifact; boot it once; smoke-test the main page against the prod build (dev-mode-only bugs are real).
8. **Docs truthfulness** — PRD.md matches shipped behavior; CHANGELOG.md updated (plain language the client could read); version bumped consistently.

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
| Security | pass / N findings | <link or summary> |
| Performance | within budget | <numbers> |
| Prod build | boots, smoke ok | <screenshot> |

## Known issues shipped (owner-approved)
- <High/Medium items the owner explicitly accepted, with links>
```

Add the row to `docs/qa/index.md`. Then, and only then, tag/merge/deploy per the project's CLAUDE.md instructions.

## Failure handling

Any gate fails → stop, report exactly what failed with output, fix or escalate to the owner. Never rerun a flaky gate until it passes and call that green — flakiness is itself a finding.
