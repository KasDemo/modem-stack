# {Project}: PRD

> The requirements contract. Owns: the feature map, requirements (FR), business rules (R), release order, non-goals. Everything else links here.
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

## 3. Releases (or milestones / งวด)

The order things ship in. Most projects: releases with no dates. Client-signed milestones (งวด): add Due and Acceptance.

| Release / งวด | Scope (FR ids) | Depends on | Due *(งวด only)* | Acceptance *(งวด only)* | Status |
|---|---|---|---|---|---|
| R1 | {FR-001…} | {—} | | | {planned / building / shipped vX.Y / accepted YYYY-MM-DD} |

## 4. Functional requirements

One row per testable requirement. **AC** must be checkable by a machine or a browser walkthrough. The release column says which §3 row ships it; drop the TOR column when there is no TOR.

| ID | Requirement | Acceptance criteria | Release / งวด | TOR | Source |
|---|---|---|---|---|---|
| FR-001 | {what the system does} | {Given … when … then …} | {1} | {T3, or `extra — CR-…`} | {notes/2026-…md} |

## 5. Business rules

The single home of every rule. WORKFLOWS, OBJECTS, code and tests cite these ids.

| ID | Rule (with formula if any) | Applies to |
|---|---|---|
| R-001 | {e.g. no two confirmed bookings of one room overlap} | {FR-…} |

## 6. Non-functional requirements

NFRs that a TOR clause demands as testable requirements get an FR in §4; the bullet here then just cites it (`see FR-…`).

- Performance: {budget, or "performance-budget defaults"}
- Devices / viewports: {e.g. 70% desktop 1366, 30% mobile 390}
- Language: {Thai UI, Buddhist-era dates?}
- Personal data (PDPA): {what personal data, where stored, retention, who can see}
- Availability / backup expectation: {e.g. daily backup, restore within 1 day}

## 7. Not doing (and when we'd reconsider)

| Not doing | Why | Reconsider when |
|---|---|---|
| {item} | {reason} | {trigger} |
