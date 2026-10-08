---
name: ux-model
description: Use when a project has no docs/design/OBJECTS.md, WORKFLOWS.md or SCREENS.md yet (project-init, right after the PRD is approved), when design-first-ui or feature-update needs the whole-app picture, when a feature adds/changes an object, role, job, lifecycle state or screen, or when the owner says the UI "doesn't connect" / "ปุ่มควรอยู่ด้วยกัน" / "คลิกจากตรงนี้ควรไปตรงนั้น". Builds and maintains the app's UX model — objects and their actions, roles and key jobs, click flows, screen inventory, canonical sample data — so every design decision is made against the whole system, not one screen.
---

# UX Model

**Structure before pixels.** A screen designed alone looks fine and fits nowhere: the button lives on the wrong object, the same job is split across two pages, a to-do lands on a page that doesn't show the thing it was about. The fix is a written model of the whole app that every design and every change is checked against.

The model is four living files in `docs/design/`. Templates are in this skill's `templates/` folder — copy, then replace every `{placeholder}` and example from the PRD and the code (an unfilled placeholder left in the file reads as a stub).

| File | Answers | Method |
|---|---|---|
| `OBJECTS.md` | What things exist, how they relate, what each role can do to each, what they show | OOUX **ORCA**: Objects · Relationships · Calls-to-action · Attributes |
| `WORKFLOWS.md` | Who uses the app, which **key jobs** they do, object lifecycles, and for every step: who · where · click → what happens → where they end up | Task flows + state machines |
| `SCREENS.md` | Every screen: route, roles, states, which objects it shows, entry points, its one visual target | Screen inventory / IA |
| `sample-data.md` | The one canonical demo dataset every mockup and seed uses | Content-first design |

## When to build it

- **New project:** project-init runs it in two parts after the PRD and stack are approved — **key jobs** first (Step 5: roles + jobs, each with the FRs it covers and its งวด if the project has milestones), then the **system picture** (Step 6: objects, lifecycles, screen map, sample data) before design-first-ui SYSTEM mode. Per-flow **walkthroughs** (WORKFLOWS §5) come later, one flow at a time, in walkthrough sessions with the owner.
- **Existing project without it:** build it **slice first** — the objects, jobs and screens the next design round or change touches — from the code (routes, models, permission checks) + PRD. Grow it with every feature; build the whole-app model in one go only when the owner asks for it. Mark anything inferred as `(inferred — confirm)` and ask the owner once, in one batch.
- **Every feature:** feature-update's impact analysis and design-first-ui's Step 1 read it. The feature's change updates it **in the same branch** — the model is only useful while it is true.

## Building it — order matters

1. **Objects first** (`OBJECTS.md`). Nouns from the PRD and the client's own words — the user's mental model, not the database tables. Drop nouns with no attributes and no actions (they're attributes of something else).
2. **Relationships** — an object × object table: 1–1, 1–many, many–many, and the business rule. Every relationship is a navigation path: if A has many B, A's screen shows its B's and B's screen links back to A.
3. **CTAs per role** — object × role grid of verbs. A CTA with no role is dead; a role with no CTA on an object it can see is read-only (say so).
4. **Attributes** — what each object shows: in a list row (2–4 fields), in a card, in full. Mark computed values and their formula owner.
5. **Roles and key jobs** (`WORKFLOWS.md`). 2–4 key jobs per role, each written **who · starts where · ends when**, with an id (`J1`, `J2` …), the PRD FRs it covers, and its release (PRD §3). Key jobs are the unit everything is scored and tested by — mockup rubric, QA walkthrough, acceptance.
6. **Lifecycles** — a state machine per object that has states, with the transition, who triggers it, and what changes (money, notifications, access). Every lifecycle answers this checklist (first run during the PRD, project-init Step 3 — re-checked here). An answer that is a **rule** becomes a PRD amendment (R-id), never a line in WORKFLOWS; what nobody can answer goes to `docs/QUESTIONS.md`:
   - Does this state **hold** a resource (a slot, a budget, stock)? Does a pending one?
   - What happens if nobody acts — does it **expire**, and when?
   - **Who can cancel / reverse** it, until when, and what happens to dependent records?
   - Who is **notified** on each transition, through which channel?
   - What does an **outside event** do to it (a room closed, a sync changes the data, an account disabled)?
7. **Step-by-step flows (walkthroughs)** — written per flow in a walkthrough session with the owner (below), not all at once.
8. **Screens** (`SCREENS.md`) — derived from the above, not invented: one row per screen with route, roles, objects shown, states, entry points, target file.
9. **Sample data** — one dataset, realistic, in the product language, covering every state in the lifecycles and every edge case (long names, zero, negative, many-to-many). Mockups and seeds copy it; when they disagree, this file wins.

## Walkthrough session — one flow at a time, co-designed with the owner

Before any Medium/Large design round, the flow it touches gets a walkthrough in `WORKFLOWS.md` §5 that the **owner** has approved.
This is where "what should happen" is settled — mockups only decide how it looks.

1. **Draft** the flow for each key job in scope: a table `# · who · screen · does what → system result (state / data / money /
   notification) → where they are now`. Keep it **layout-neutral** — states and outcomes ("enters a reason; the request is
   rejected"), not containers ("in a popup") — choosing page vs. popup vs. inline is the design round's job, every entry point, and **the unhappy paths** (invalid input, no permission, conflict,
   nothing to show, external system down, timeouts). Use real records from `sample-data.md` so before/after values are concrete.
2. **Show it to the owner** as the table plus a short list of the decisions you had to guess. Ask until the guesses are settled —
   no question cap here; this is the cheapest place to find out what the client really needs. Unknowns the owner can't answer go to
   `QUESTIONS.md`; the flow proceeds on an explicit `assumed` answer only if the owner agrees.
3. **Revise and stamp** the flow's heading: `### J2 — {job} · ✅ owner-approved YYYY-MM-DD`. design-first-ui refuses a Medium/Large
   round whose key jobs lack this stamp. A decision that changes a rule → a PRD amendment; a decision made for the client that the
   steps themselves don't make obvious (e.g. "the head may not approve her own swap") → a `docs/QUESTIONS.md` row (`owner-answered`).
4. A later client change (feature-update) that alters the flow **removes the stamp** until the owner re-approves the revised steps.

## Placement rules (check every design against these)

These come straight from the model. A design that breaks one needs a stated reason.

1. **A CTA lives where its object is shown.** "Close activity" belongs on the activity, not in a separate card or page.
2. **One job = one place.** A key job's steps happen on one surface where possible; every extra surface is counted in the UX rubric.
3. **Related objects are reachable both ways.** If an activity shows its bills, a bill shows its activity.
4. **A child appears inside its parent's view** before it gets a page of its own.
5. **Entry points land in context.** A notification or to-do about object X opens the screen showing X, scrolled/expanded to X, with X's relevant CTA visible in the first view.
6. **Same object, same name, same actions everywhere.** Vocabulary comes from `OBJECTS.md`, not from whoever built the screen.
7. **Computed values have one formula owner** — a business rule `R-###` in `docs/PRD.md` §5, cited from `OBJECTS.md` §4 and `WORKFLOWS.md` §4 — so no two screens show different numbers for the same thing.

## Keeping it true

- Any change that adds or changes an object, relationship, CTA, role, job, state or screen updates the model in the same change. Code and model disagreeing is a bug in one of them — fix one, never leave both.
- Tag changes from a client round inline (`[CR-2026-10-05]` or `[FB-3]`) so the owner can see what moved.
- Open questions go in `docs/QUESTIONS.md` (the one register) and are cited here as `Q7` — never kept in these files.
- Ownership: rules live in the PRD (cite R-ids), state ids live in `SCREENS.md` (walkthroughs, BRIEFs and mockups use them verbatim), vocabulary lives in `OBJECTS.md` §5.
- The owner reads these in Thai; write owner-facing labels (roles, buttons, states) in the product language exactly as the UI shows them.

## Red flags

| Smell | Reality |
|---|---|
| Designing a screen before its objects and jobs are written | You'll place CTAs by layout instinct. That is the "doesn't connect" bug. |
| Objects named after tables (`activity_bill_link`) | The user's mental model is "บิลของกิจกรรม", not a join table |
| A key job with no start or end | Can't be measured, scored, or tested |
| All flows written in one go, never shown to the owner | The walkthrough is a co-design step. Unstamped flows block design |
| A rule restated in WORKFLOWS instead of cited | Two homes for one rule drift apart. Cite `R-###` |
| A screen in `SCREENS.md` no job uses | Either a missing job or a screen nobody needs |
| Two screens showing the same figure with different formulas | Rule 7 — name the formula owner |
| Model last touched three features ago | It's fiction now. Update before designing. |
