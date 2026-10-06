# {Project}: Object map (OOUX / ORCA)

> What exists in the user's world, how the things relate, who can do what to each, and what each shows.
> Every design is checked against this file (placement rules in the `ux-model` skill). Updated {YYYY-MM-DD}.
> Rows marked `example` show the shape — replace them, never keep them.

## 1. Objects

| Object (UI name) | What it is, in the user's words | States? | Lives at (screen) |
|---|---|---|---|
| {object} *(example: "Project — a funded piece of work with a budget and a team")* | {…} | {yes → WORKFLOWS §3.1 / no} | {route} |

## 2. Relationships

Every relationship is a navigation path: if A has many B, A's view shows its B's and each B links back to A.

| From | To | Cardinality | Rule | Navigation it implies |
|---|---|---|---|---|
| {object} | {object} | {1–1 / 1–many / many–many} | {business rule, e.g. "a payment can be split across items; Σ ≤ payment"} | {where each side shows the other} |

## 3. Calls-to-action (object × role)

| Object | {role 1} | {role 2} | {role 3} |
|---|---|---|---|
| {object} | {verbs} | {verbs, or "view"} | {"—" = cannot see} |

Primary CTA per object per state (the one button that gets the primary style):

| Object | State | Primary CTA (UI label) |
|---|---|---|
| {object} | {state} | {label} |

## 4. Attributes

| Object | In a list row (2–4) | In a card | Full view only | Computed values → formula (WORKFLOWS §4 R{n}) |
|---|---|---|---|---|
| {object} | {fields} | {fields} | {fields} | {value = formula — R{n}} |

## 5. Glossary and vocabulary

One name per thing, used verbatim on every screen; maps the UI word to the code so agents and the owner mean the same thing.

| UI word (product language) | In code / DB | Meaning | Never say |
|---|---|---|---|
| {UI word} | {identifier} | {one line} | {banned synonyms} |

## Open questions

| # | Question | Owner | Since |
|---|---|---|---|
