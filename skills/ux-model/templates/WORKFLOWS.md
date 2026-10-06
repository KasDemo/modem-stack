# {Project}: Workflows (who · where · click → what happens → where next)

> Read the section for a flow before changing any screen in it. If code and this file disagree, fix one in the same change.
> Objects and their CTAs: `OBJECTS.md`. Screens: `SCREENS.md`. Sample data: `sample-data.md`. Updated {YYYY-MM-DD}.

## 1. Roles

| Role (UI name) | Menu they see | Home after login | Can do (summary) | Device / viewport |
|---|---|---|---|---|
| {role} | {menu items} | {route} | {summary} | {e.g. 95% desktop 1366×768} |

## 2. Key jobs

The unit every mockup is scored on (UX rubric), every QA walkthrough walks, and every acceptance check verifies.
2–4 per role. "Ends when" must be observable on screen.

| ID | Role | Job | Starts where | Ends when | How often |
|---|---|---|---|---|---|
| J1 | {role} | {job} *(example: "close an activity's budget")* | {entry point, e.g. a to-do on the home screen} | {observable end state} | {daily / weekly / monthly} |

## 3. Lifecycles

### 3.1 {Object} states

```
[{state A}] ──{action} by {role}──▶ [{state B}] ──{action}──▶ [{state C}]
```

| State | Condition | Effect (money / access / notifications) |
|---|---|---|
| {state} | {condition} | {effect} |

## 4. Rules that cross screens

Money, permissions, sync — anything a screen must not reinvent. Each rule has an id so screens, OBJECTS.md and tests can cite it.

- **R1** — {rule, with its formula}

## 5. Step-by-step flows (one per key job)

Include the unhappy paths: what the user sees when a step fails, and how they recover.

### J1 — {job}

Entry points: {every way into this job — menu, notification, to-do, deep link — and where each lands}.

1. `{role}` · `{screen}` · clicks **"{label}"** → {what happens: state / money / notification} → {where they are now}.
2. {…}

Done when: {the J1 end condition}.

## 6. Screen map per role

### {role}

- `{route}` — {what they do here} → links to: {routes}

## Open questions

| # | Question | Owner | Since |
|---|---|---|---|
