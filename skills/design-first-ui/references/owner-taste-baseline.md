# Owner taste baseline — what Modem picked and rejected, and where it applies

> **Advisory, not a gate.** Evidence: a survey of 21 design rounds in OMITS v2/v3 and SciPub (Jul–Oct 2026), from his verbatim
> reactions and actual picks. **Scope of that evidence:** Thai university systems, mostly desktop back-office, plus two public pages
> (SciPub search and profile). **No evidence yet for:** mobile-first apps, consumer apps, landing/marketing pages, games, brand-led
> or emotional products.
>
> How it is used:
> - **Seeding:** a new project's `docs/design/taste-profile.json` takes only the rules whose **scope matches** the project (asked in
>   design-first-ui Step 1), with source `"baseline"`. The owner may choose full / partial / none.
> - **Concepts:** a concept may use a pattern this file lists as rejected — it must say so in its trade line with the reason
>   ("uses a side pane, which you rejected on back-office screens, because …"). The owner decides.
> - **Critic:** a baseline-only rejection is a **suggestion flagged "taste risk"**, never a must-fix. It becomes a must-fix only when
>   the project's own taste-profile rejects it.
> - A project's own entries always override this file. When a pattern holds in more projects, update the count here.

Legend — **Scope:** `back-office` (admin/staff/executive, desktop) · `public` (user-facing pages) · `all` (seen in both).
**Strength:** `strong` = decided ≥ 4 rounds · `medium` = 2–3 · `weak` = 1 or one project only.

## What "ดูง่าย" means — scope all · strong (his own words, 2026-10-09)
Easy to use and user-friendly; **he knows what to do next at a glance; the data sits balanced and aligned; nothing looks strange or
unfamiliar**. It does **not** mean minimal, fewer elements, or one big number. He accepted a long report page with the ranking below
the first view because it was familiar and balanced (SciPub Insights A).

## He picked
| Pattern | Scope | Strength | Evidence (examples) | Where it may not apply |
|---|---|---|---|---|
| Familiar, standard app anatomy over clever layouts | all | strong (6) | Insights A over the path-metric winner; search A ("ดูง่ายกว่า"); "อันอื่น ui ยังดูแปลกๆ การวาง element" | products that must stand out (marketing, consumer, brand-led) |
| One variant as the base, borrowing parts of the others | all | strong (7) | "A + C", "A + borrows from B" in most rounds | — (a way of choosing, not a look) |
| One job in one place | back-office | strong (4) | bills not on a separate tab; "จะแยกปิดยอดออกไปทำไม" | — (general UX) |
| Obvious next action; visible feedback after saving | all | strong (5) | chose D because "รู้ว่าต้องทำอะไร"; asked for a confirm after save | — (general UX) |
| Balance and alignment — rows line up, no lopsided or half-empty panels | all | strong (4) | "ข้อความไม่สมมาตร"; "row เรียงไม่ตรง ดูแย่…แปลกๆตา" | — |
| Colour with meaning, never loud | back-office | strong (4) | monochrome rejected ("ตาบอดสี"); saturated orange rejected ("แสบตา") | brand-led or consumer apps may want bold colour |
| Form size decides the container: small → centred popup; big → full page; first-time entry → stepped wizard; buttons inside the form card | back-office | strong (OMITS conf 9) | OMITS forms rule | mobile: popups behave differently — confirm per project |

## He rejected
| Pattern | Scope | Strength | Evidence | Where it may not apply |
|---|---|---|---|---|
| Side sheets, drawers, side panes, split views (desktop) | all (desktop) | strong (6) | OMITS side sheets ("ผมไม่ชอบเลย"), peek drawer, split view; SciPub pipeline drawer, Insights pane, search live pane | **mobile bottom sheets are a different pattern** — not covered; apps where list + detail side by side is the norm (mail-like tools) |
| AI slop: cards inside cards, borders everywhere, chip overload, initials avatars, filler or duplicated tiles, nothing marking the primary answer | all | medium (3+) | "ai slop มากๆ เละเทะสุดๆ"; "รก" | — |
| Oversized or crowded type; content squeezed into a narrow centre | back-office | medium (3) | "ui ใหญ่เกินไป รู้สึกแออัด"; "ใช้พื้นที่ไว้แค่ตรงกลาง รู้สึกขัดใจ" | public pages: a centred container was fine on SciPub |
| Logic-heavy mockups in a round that is about the look | all | weak (1, emphatic) | "เอาแค่ design โว้ย" | — |

**Balanced ≠ slop.** A row of equally sized cards is fine when every card means something; what he rejects is filler, duplicates,
and nothing marking the primary answer.

## Public vs back-office — weak (SciPub only)
| | Public pages | Back-office |
|---|---|---|
| Look | the product's own brand; centred container is fine | full width, sidebar shell, formal |
| Motion | wanted — hover details, light animation (Fastwork-like) | not asked for |
| How he decides | leans on references he likes (Fastwork, LinkedIn) — ask for references early | driven by the workflow; strict on forms and money |

## Mobile-heavy apps — no evidence
Nothing above was learned on a mobile-first screen. For an app whose users are mostly on phones, the first design round asks before
concepts: bottom navigation or top/side menu? bottom sheets for quick actions — OK? one-handed reach for the main action? how dense
may a list be? Record the answers in the project's taste-profile; don't carry desktop rules over by default.

## Watch-outs — his taste moved before; confirm, don't assume
Drag-and-drop (dropped → asked for → replaced by a batch table); "the system guesses for you" (yes → no when data is sparse); search
C → A a day later. When a concept leans on one of these, say so in its trade line.
