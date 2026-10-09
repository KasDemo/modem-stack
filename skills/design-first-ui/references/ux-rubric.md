# UX rubric — the chosen variant's checklist (Step 4b)

Origin: owner rule 2026-10-06 ("ใช้ทุกรอบ"). Since 2026-10-08 the owner gets **measured** job numbers for every variant at choice time from the
pre-owner critic (references/critic.md); this full rubric runs on the **chosen** variant in Step 4b, and its findings are a checklist
to fix before it becomes the visual target — not a ranking. **Medium rounds: sections 1–4 (short form); Large: all.** The checklist goes into Step 4b's fix round.
Visual/rule compliance (DESIGN_SYSTEM, Lessons, owner rules) is checked separately; this rubric measures **how easy the user's job is**.

**Who scores:** a fresh-context agent (the `design-reviewer` agent in mockup mode), never the builder — builders only self-check their
own click paths. **The scorer never picks the winner;** the owner does.

**Known bias to correct:** LLM walkthroughs follow the optimal path and find *fewer* failure points than real users (Synthetic Cognitive
Walkthrough, arXiv 2512.03568). So: play the BRIEF's persona **using this screen for the first time**, and at every step name the most
likely wrong move — or say explicitly why there is none.

## 1. Key jobs
From the BRIEF (2–4 jobs, ids from `WORKFLOWS.md`), each "who · starts where · ends when". Organise by job, never by data type.

## 2. Path metrics — measured by clicking the mockup, not by reading its code
Drive each job in the browser (sequentially, one browser) at the BRIEF's primary viewport. A step with no link/control to the next state: navigate to its `#state`, count the intended clicks, mark it **unwired**. Per job and variant:

| Metric | How |
|---|---|
| คลิก (clicks) | clicks/taps from start to end; typing one value = 1 |
| จุดที่ต้องมอง (surfaces) | separate surfaces read or acted in: cards, popups, tabs, page regions |
| เลื่อน (scroll) | scroll distance in screen-heights at the primary viewport (0 = all in first view) |
| ตัดสินใจ (decisions) | points where the user must choose between options or stop to think — KLM's mental operator; costs more than a click |
| ต้องจำข้ามจุด (carry-over) | facts the user must remember from one surface to use on another |
| ทางผิด (wrong turns) | plausible wrong clicks that leave the job: dead ends, look-alike buttons |
| สะดุด (worst friction) | one line: the worst moment |

## 3. Cognitive walkthrough — every step of every key job
Ask the four questions (Wharton et al.; NN/g). Record **only failures**, with the step and why:
1. Will the user try to do this step at all? (do they know it's needed)
2. Will they **notice** the control? (judge from the screenshot, not the DOM — hidden/hover-only/low-contrast = fail)
3. Will they **connect** the control with their goal? (label, icon, placement on the right object)
4. After acting, will they **see progress**? (feedback, state change, where they are now)

## 4. Placement rules (from the `ux-model` skill)
✓ / ✗ per variant with one line of evidence: CTA on its object · one job = one place · related objects reachable both ways ·
child inside parent · entry points land in context · same names everywhere (OBJECTS.md vocabulary) · one formula owner per figure.

## 5. Nielsen's 10 heuristics — 1 to 5, each with one line of evidence
Anchors (use them; without anchors every variant drifts to 4):
- **1** — violation blocks or misleads a key job (wrong money shown, no way back, action not findable)
- **3** — real issue, user recovers with effort or a second look
- **5** — checked and no issue found; cite the positive evidence

1. Visibility of system status (เห็นสถานะของระบบ) · 2. Match with the real world (ภาษาตรงกับโลกผู้ใช้) · 3. User control & freedom
(ย้อน/ยกเลิกได้) · 4. Consistency (สม่ำเสมอ) · 5. Error prevention (ป้องกันความผิดพลาด — especially money) · 6. Recognition over recall
(เห็นแล้วรู้) · 7. Flexibility & efficiency (ใช้เร็วได้) · 8. Aesthetic & minimalist (ไม่รก, one primary) · 9. Error recovery messages
(บอกวิธีแก้) · 10. Help in context (อธิบายในจุด)

## 6. ui-ux-pro-max guideline check (if installed)
Search its UX domain for the topics these screens touch (form, table, feedback, error, navigation, accessibility; chart domain for
charts) — see that skill for the command. List up to 8 that apply, each ✓ / ✗ / n/a per variant.

## 7. Output — `ux-score.md` in the mockup folder (chosen variant)
```
| Key job | คลิก / มอง / เลื่อน / ตัดสินใจ | Walkthrough failures | Placement ✗ |
|---|---|---|---|
| J1 | 4 / 1 / 0.5 / 1 | step 3 Q2 (button not noticed) | none |

Nielsen (Large only): per heuristic score + one line of evidence · ui-ux-pro-max ✓ / ✗ (Large only)
สะดุดที่สุด: …
```
Then the **fix checklist**: every failure above as a concrete, ordered fix item for the Step 4b polish round.
