# {Project}: PRD

> The requirements contract. Owns: requirements (FR), business rules (R), milestones (งวด), non-goals. Everything else links here.
> Roles and step-by-step flows live in `docs/design/WORKFLOWS.md`; open questions in `docs/QUESTIONS.md`; stack in
> `docs/ARCHITECTURE.md`. Status: {draft / approved YYYY-MM-DD · amended YYYY-MM-DD: R-011 (owner OK)}. Updated {YYYY-MM-DD}.

## 1. Problem and goal

{2–4 sentences: who has what problem today, what changes when this ships, how the client will judge success.}

## 2. Users and feature map

Roles: {role names only — who they are and what they do live in WORKFLOWS §1}.

**Feature map** — the whole system on one screen; the first thing the owner confirms, before any FR detail.

| Module | Feature | For whom | Source | Status | FRs |
|---|---|---|---|---|---|
| {e.g. Scheduling} | {e.g. auto-generate next month's roster} | {role} | {owner · notes/… · 🤖 AI suggests} | {✅ confirmed · ❓ to confirm · ⏭ later · ✗ dropped} | {FR-001…} |

🤖 rows are features the owner didn't mention but systems like this usually need — each one is confirmed, deferred or dropped by
the owner, never silently kept. ✗ dropped rows move to §7 "Not doing"; ⏭ later rows stay here without FRs.

## 3. Milestones (งวด)

Only when the client signs off in milestones. Otherwise delete this section — the project ships in releases.

| งวด | Scope (FR ids) | Due | Acceptance (how the client signs off) | Status |
|---|---|---|---|---|
| 1 | {FR-001…} | {date} | {e.g. demo + กรรมการตรวจรับ} | {planned / building / delivered / accepted YYYY-MM-DD} |

## 4. Functional requirements

One row per testable requirement. **AC** must be checkable by a machine or a browser walkthrough. Drop the งวด / TOR columns when the project has no milestones / no TOR.

| ID | Requirement | Acceptance criteria | งวด | TOR | Source |
|---|---|---|---|---|---|
| FR-001 | {what the system does} | {Given … when … then …} | {1} | {T3, or `extra — CR-…`} | {notes/2026-…md} |

## 5. Business rules

The single home of every rule. WORKFLOWS, OBJECTS, code and tests cite these ids.

| ID | Rule (with formula if any) | Applies to |
|---|---|---|
| R-001 | {e.g. no two confirmed bookings of one room overlap} | {FR-…} |

## 6. Non-functional requirements

- Performance: {budget, or "performance-budget defaults"}
- Devices / viewports: {e.g. 70% desktop 1366, 30% mobile 390}
- Language: {Thai UI, Buddhist-era dates?}
- Personal data (PDPA): {what personal data, where stored, retention, who can see}
- Availability / backup expectation: {e.g. daily backup, restore within 1 day}

## 7. Not doing (and when we'd reconsider)

| Not doing | Why | Reconsider when |
|---|---|---|
| {item} | {reason} | {trigger} |
