# Owner taste baseline — what Modem picks and rejects, across projects

> Evidence: a survey of 21 design rounds in OMITS v2/v3 and SciPub (Jul–Oct 2026), from his verbatim reactions and actual picks.
> Use it to **seed** a new project's `docs/design/taste-profile.json` (source `"baseline"`, confidence as listed) and as a check for
> concepts and critics. A project's own taste-profile entries **override** this file; when a round contradicts a baseline rule, record
> it in the project and say so to the owner. Update this file when a pattern holds across projects.

## What "ดูง่าย" means (his words, clarified 2026-10-09)
Easy to use and user-friendly; **he knows what to do next at a glance; the data sits balanced and aligned; nothing looks strange or
unfamiliar**. It does **not** mean minimal, fewer elements, or one big number. He accepted a long report page with the ranking below
the first view because it was familiar and balanced (SciPub Insights A).

## He picks (count = rounds where it decided the pick)
| Pattern | n | Evidence (examples) |
|---|---|---|
| Familiar, standard app anatomy over clever layouts | 6 | Insights A over the path-metric winner; search A ("ดูง่ายกว่า") over critic winners; "อันอื่น ui ยังดูแปลกๆ การวาง element" |
| One variant as the base, borrowing the best parts of the others | 7 | "A + C", "A + borrows from B" in most rounds — give challengers borrowable parts |
| One job in one place | 4 | bills not on a separate tab; "จะแยกปิดยอดออกไปทำไม"; quick actions don't open another page |
| The next action is obvious, and saving gives visible feedback | 5 | chose D because "รู้ว่าต้องทำอะไร"; "ไม่รู้ว่าจะต้องทำอะไร คลิกอะไร" rejected; asked for a confirm after save |
| Balance and alignment — no lopsided panels, rows line up, space used evenly | 4 | "ข้อความไม่สมมาตร"; "row เรียงไม่ตรง ดูแย่…แปลกๆตา"; unused row space → put amounts on the right |
| Colour with meaning, never loud | 4 | monochrome rejected ("ตาบอดสี"); saturated orange rejected ("แสบตา"); "ใส่สี ทำให้มีจุดเด่น" |
| Form size decides the container | conf 9 | small form → centred popup; big form → full page; first-time entry → stepped wizard; buttons inside the form card |

## He rejects
| Pattern | n | Evidence |
|---|---|---|
| **Side sheets, drawers, side panes, split views** | 6 | OMITS side sheets ("ผมไม่ชอบเลย"), peek drawer, split view, pipeline drawer, Insights ranking + pane, search live pane |
| AI slop: cards inside cards, borders everywhere, chip overload, initials avatars, filler or duplicated tiles, generic boxed SaaS | 3+ | "ai slop มากๆ เละเทะสุดๆ"; "รก" |
| Oversized or crowded type; content squeezed into a narrow centre on back-office screens | 3 | "ui ใหญ่เกินไป รู้สึกแออัด"; "ใช้พื้นที่ไว้แค่ตรงกลาง รู้สึกขัดใจ" |
| Logic-heavy mockups when the round is about look | 1 (emphatic) | "เอาแค่ design โว้ย" |

**Balanced ≠ slop.** A row of equally sized cards is fine when every card means something; what he rejects is filler, duplicates,
and nothing marking the primary answer.

## Front-of-house vs back-office
| | Public pages (users) | Back-office (admin, staff, executives) |
|---|---|---|
| Look | the product's own brand; centred container is fine | full width, sidebar shell, formal |
| Motion | wanted — hover details, light animation (Fastwork-like) | not asked for |
| How he decides | leans on external references he likes (Fastwork, LinkedIn) — ask for references early | driven by the workflow; strict on forms and money |

## Watch-outs (his taste moved before — confirm, don't assume)
Drag-and-drop (dropped → asked for → replaced by a batch table); "system guesses for you" (yes → no when data is sparse); search C → A
a day later. When a concept leans on one of these, say so in its trade line.
