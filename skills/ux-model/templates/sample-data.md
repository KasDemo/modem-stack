# {Project}: Canonical sample data

> The single source of demo data. Mockups, seeds, screenshots and QA use these exact values; where a mockup shows a
> different figure, this file wins. A value not confirmed by the owner is tagged **(new — confirm)**. Updated {YYYY-MM-DD}.

## 1. "Today" in the demo

| Item | Value | Why it matters |
|---|---|---|
| Today | {date} | drives every "n days overdue" figure |

## 2. People (one per role, plus edge cases)

| Name (realistic, product language) | Position / unit | Role | Edge case it covers |
|---|---|---|---|
| {full name with title, 30+ characters for one of them} | {unit} | {role} | {e.g. long name} |

## 3. {Object} records

Cover **every lifecycle state** in WORKFLOWS §3 and every edge case: zero, negative, very long, many-to-many, empty collection.

| ID | {fields…} | State | Edge case it exercises |
|---|---|---|---|
| {id} | {…} | {state} | {edge case} |

## 4. Totals (verified)

Every total a screen shows, computed from the rows above, with its rule id (WORKFLOWS §4 R{n}). A mockup total that doesn't match is wrong.

## 5. Conflicts

| # | Where | Values seen | Canonical | Accepted by owner |
|---|---|---|---|---|
