# ตรวจรับงวด {N} — {Project} — {YYYY-MM-DD}

> Milestone acceptance record: every TOR clause in this งวด traced to its requirements, the key jobs that exercise them, and the
> evidence. Written by ship-check in milestone mode; signed by the client. Release: v{version} · Ship report: [link]({…}).

## 1. Scope of this งวด

From `docs/PRD.md` §3: FR {…}. TOR clauses: T{…}. Key jobs: J{…}.

## 2. Traceability

| TOR | FR | Key job | Evidence | Result |
|---|---|---|---|---|
| T1 | FR-001 | J1 | [QA run](../qa/runs/{…}/report.md#j1) · `tests/{file}` · ![](../qa/runs/{…}/screenshots/{…}.png) | ✅ pass / ⚠️ accepted issue / ❌ |

Every clause of this งวด has a row. A clause with no evidence is ❌ — never left blank.

## 3. Deliverables

| Deliverable (TOR) | Where | Done |
|---|---|---|
| {e.g. installation + backup manual} | `docs/ARCHITECTURE.md` §5 | ✅ |

## 4. Known issues accepted by the client

| Issue | Severity | Agreed fix date |
|---|---|---|

## 5. Changes from the TOR in this งวด

{CR links, or "none"}

## 6. Decisions for the client to confirm

{every `docs/QUESTIONS.md` row with status `assumed` or `owner-answered` — the client confirms or corrects each here.}

## 7. Sign-off

| Role | Name | Date | Signature |
|---|---|---|---|
| ผู้ตรวจรับ (client) | | | |
| ผู้พัฒนา | | | |
