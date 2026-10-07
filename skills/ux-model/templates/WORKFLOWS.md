# {Project}: Workflows (who · where · click → what happens → where next)

> Read the section for a flow before changing any screen in it. If code and this file disagree, fix one in the same change.
> Objects and their CTAs: `OBJECTS.md`. Screens: `SCREENS.md`. Sample data: `sample-data.md`. Updated {YYYY-MM-DD}.

## 1. Roles

| Role (UI name) | Menu they see | Home after login | Can do (summary) | Device / viewport |
|---|---|---|---|---|
| {role} | {menu items} | {route} | {summary} | {e.g. 95% desktop 1366×768} |

## 2. Key jobs

The unit every mockup is scored on (UX rubric), every QA walkthrough walks, and every acceptance check verifies.
2–4 per role. "Ends when" must be observable on screen. Drop the งวด column when the project has no milestones.

| ID | Role | Job | Starts where | Ends when | How often | งวด | Covers FR |
|---|---|---|---|---|---|---|---|
| J0 | every role | sign in and land | login page | the role's home is shown, with its notifications | daily | {1} | {FR-…} |
| J1 | {role} | {job} *(example: "close an activity's budget")* | {entry point, e.g. a to-do on the home screen} | {observable end state} | {daily / weekly} | {1} | {FR-001, FR-004} |

No-UI FRs (no key job; verified by tests only): {FR-… scheduled expiry, FR-… nightly sync, or "none"}

## 3. Lifecycles

### 3.1 {Object} states

```
[{state A}] ──{action} by {role}──▶ [{state B}] ──{action}──▶ [{state C}]
```

| State | Condition | Effect (money / access / notifications) |
|---|---|---|
| {state} | {condition} | {effect} |

## 4. Rules in play

Rules live in `docs/PRD.md` §5 — cite them here, never restate them. Add only the screen-level consequence.

- **R-{nnn}** → {where it shows up across screens, e.g. "every total of X uses it; the confirm dialog explains it"}

## 5. Walkthroughs (one per key job, co-designed with the owner)

Written in a walkthrough session (ux-model skill). The heading carries the owner's approval stamp; design-first-ui won't start a
Medium/Large round on an unstamped flow. Use records from `sample-data.md` so before/after values are concrete.

### J1 — {job} · ⏳ draft

When approved the heading becomes `### J1 — {job} · ✅ owner-approved YYYY-MM-DD`.

Entry points: {every way into this job — menu, notification, to-do, deep link — and where each lands}.

| # | Who | Screen (`#state` from SCREENS) | Does | System result (state / data / money / notification) | Now at |
|---|---|---|---|---|---|
| 1 | {role} | `{route}` `#{state}` | clicks **"{label}"** | {result} | `#{state}` |

Unhappy paths:

| When | User sees | Recovers by |
|---|---|---|
| {invalid input / no permission / conflict / empty / external system down / timeout} | {message or state} | {action} |

Done when: {the J1 end condition}. Assumed answers: {Q-ids, or "none"}.

## 6. Notifications

| Event | Who | Channel | Message (product language) |
|---|---|---|---|
| {e.g. request approved} | {booker} | {in-app + email} | {exact text, with placeholders} |

## 7. Screen map per role

### {role}

- `{route}` — {what they do here} → links to: {routes}

Open questions: `docs/QUESTIONS.md` (cite Q-ids above).
