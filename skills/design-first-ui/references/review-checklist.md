# Review hand-over: the case checklist and in-page comments

Used twice per round: when the owner reviews the **design** (mockups) and again when he reviews the **built app** (QA round —
section "After the build" below). Owner rule 2026-11-18 ("ผมชอบรายการตรวจแบบนี้มาก … เวลาออกแบบให้ผมไล่ตรวจ ให้ทำแบบนี้" + "comment ใน component หรือหน้านั้นๆ
ให้นายได้ด้วย"). The owner checks a design by going down one list, opening each case, and writing on the thing he wants changed.
He does not collect links from chat, and he does not retype what he saw.

**Use it in every round that shows the owner mockup HTML** — probes, three variants, a full build, a fix round, a re-skin
("ทุกการ design first ui ต้องทำแบบนี้"). Only Small changes (before/after screenshots, no mockup) go without.

**Pick rounds (probes, three variants):** one group per variant, one row per key screen (`id` "A.1", "B.1" …), plus a row
for the side-by-side page; `look` says what that direction bets on; manifest `"labels": {"p": "ชอบ", "f": "แก้"}`. The pick
itself (A / B / C / mix) is still asked in chat — the rows and comments tell you what to carry over.

## One kit, the same in every project

Owner rule 2026-11-18: "ให้เหมือนกันทุกโปรเจคเลย … เวลาใช้ในแต่ละ project มันจะได้ไปในรูปแบบเดียวกัน". The review kit is
`assets/review/` in this skill — `cases.html`, `comment.js`, `review_server.py`, `VERSION` — and a project only ever holds
byte-for-byte copies.

- **Install and update with the script, never by hand:**
  `python <skill>/assets/review/install.py --mockups docs/design/mockups --round <round>`
- **Check before every hand-over** (exit 1 = drift, a missing file, or a linked page without the comment tool):
  `python <skill>/assets/review/install.py --mockups docs/design/mockups --check`
- **Per project you write data only:** `cases/manifest.json`, `cases/base.json`, `cases/<part>.json`. The checklist page looks
  and works the same everywhere; the comment bar keeps its layout and takes only font and two colours from the page.
- **Never edit, restyle, translate or re-implement a kit file in a project**, and never ask a builder to. The kit's wording is
  Thai in every project — it is the owner's tool, whatever the product's language.
- **A change to the kit** (the owner asks for one, or a bug) is made in `assets/review/`, `VERSION` is bumped, and each project
  gets it by running the install script again. Check drift first so a project-side edit is not silently lost.

## What the owner gets

One link: `http://127.0.0.1:<port>/<round>/cases.html`.

| Piece | File | Who writes it |
|---|---|---|
| Checklist page | `<round>/cases.html` — copy of `assets/review/cases.html`, unchanged | install script |
| Case list | `<round>/cases/base.json` | orchestrator, **before** the build — it is the build's scope |
| Links, what to try, test counts | `<round>/cases/<part>.json`, one per builder | each builder |
| Which files to read | `<round>/cases/manifest.json` | install script writes a starter; orchestrator fills it |
| Comment tool + server | `docs/design/mockups/_review/comment.js`, `review_server.py`, `VERSION` — copies of `assets/review/` | install script |
| The owner's answers | `<round>/review/inbox.json` | written by the server; the agent reads it |

```jsonc
// cases/base.json — groups in the order the owner should check them; "no": 0 marks a group of shared pieces
[{ "no": 1, "title": "คำขอและใบลาของพยาบาล",
   "cases": [{ "id": "1.1", "title": "ปฏิทินเดือนที่เปิดรับคำขอ", "proves": "FR-E1 · J2 step 1" }] }]

// cases/<part>.json — a builder's rows; ids match base.json (a "no": 0 piece may have sub-ids "K3.1", "K3.2")
[{ "id": "1.1", "title": "ปฏิทินเดือนที่เปิดรับคำขอ พร้อมจำนวนที่ขอหยุดได้และวันปิดรับ",
   "links": [{ "label": "เปิดรับ ธ.ค.", "href": "cal.html#open" }],
   "look": "ดูตัวนับที่คอลัมน์ซ้าย แล้วลองสลับ เดือน | สัปดาห์",
   "tests": { "pass": 2, "total": 2 }, "testData": "วอร์ด 80 คน" }]

// cases/manifest.json
{ "title": "รายการตรวจแบบเต็มรอบ 2", "storageKey": "<project>.<round>.cases", "base": "base.json",
  "parts": ["h1.json", "h2.json"], "links": [{ "label": "หน้ารวมแบบ", "href": "index.html" }],
  "labels": { "p": "ผ่าน", "f": "แก้" } }                       // optional; these are the defaults
```

- `title` and `look` are written for the owner: product language, what a person does and sees. No state ids, no file names, no
  system terms. `look` is one thing to try, not a description of the screen.
- `testData` names invented data the case needed (so the owner does not mistake it for a real number).
- Every page of the round carries, as its last script: `<script src="../_review/comment.js" data-cases="cases.html"></script>`.
  It adds a small bar (reviewer chrome: nothing under `?clean`, nothing in compare cells; in the phone preview iframe it
  follows the parent page). The owner can fold it to one button and drag it anywhere; both are remembered. It takes the page's
  font, and its accent and ink from the page's `:root` tokens (`--review-accent` | `--color-primary` | `--primary` | `--blue`,
  `--review-ink` | `--color-text` | `--navy` | `--ink`) or from `data-accent` / `data-ink` on the tag — so it sits in the
  product's tone without being restyled. A scripted browser (tests, screenshots) never writes to the inbox.
- Serve the mockups with the review server instead of a plain static server — same links, plus the inbox:
  `python docs/design/mockups/_review/review_server.py --root docs/design/mockups --port <the mockup port of Step 4>`
  (a plain static server already holds that port and the owner has pages open on it: leave it, start the review server on
  **that port + 2** — the pages find it there).
- A single full build has no sibling variants: its reviewer chrome is the states panel, the desktop/mobile toggle and the comment
  tool — no A/B/C switcher.

**What the checklist shows per row:** the case, its links, the test count, a **ความเห็น** cell (count + the first note, two lines)
and the pass / fix answer. Clicking the cell opens a popup with every comment of that case in full — the control it points at, page
and state, screen size, time, status and the agent's reply — and **ไปที่จุดนี้**, which opens that page with the comment open on its
control (`?rvc=<comment id>`, handled by `comment.js`). Comments that match no case are listed at the bottom the same way.

## Before the link goes out (orchestrator — 1–3 by script, 4–5 in a browser)

0. `install.py --check` exits 0.
1. Every case in `base.json` has at least one link; every link names an existing file and a state that file really has.
2. No title or `look` contains a `#state`, a file name or a system term.
3. Test counts are from a run **you** made after the last change, not from the builder's return.
4. `cases.html` opens at the desktop viewport and at the mobile width; the status dot says the inbox is reachable.
5. On one page: switch "เขียนความเห็น" on, click a control, save. The comment appears in `review/inbox.json` and under its case
   in the checklist. Delete it.

The message to the owner leads with the checklist link, then only what he cannot see from the list: what differs from what he
approved, what you decided for him, known weak spots. This replaces Step 4's links-plus-`review.md` message, which is for
choosing between variants.

## After the build: the owner's review of the real app (QA round)

Owner rule 2026-11-18: after a round is built he reviews it in full again — "ต้องมีทั้ง workflow และแยกเป็นแต่ละ case". Same
kit, same checklist page, same comment bar; the bar now sits on the running app and a page is a route.

- **Where:** the run folder of the QA walkthrough, `docs/qa/runs/<run>/` (next to `report.md`). Install with
  `install.py --mockups docs/design/mockups --where docs/qa/runs --round <run>`; serve both folders with one server:
  `review_server.py --root docs/design/mockups --root docs/qa/runs --port <port>`. The checklist link is
  `http://127.0.0.1:<port>/<run>/cases.html`; answers land in `docs/qa/runs/<run>/review/inbox.json`.
- **Two kinds of group in `base.json`, workflows first:**
  ```jsonc
  [{ "no": 1, "kind": "flow", "title": "ขั้นตอนงาน: ส่งคำขอเดือนหน้าและยื่นลา", "who": "พยาบาล (nurse1@…)",
     "sub": "ทำตามลำดับ · จบเมื่อคำขอขึ้นในปฏิทินพร้อมตัวนับ",
     "cases": [{ "id": "J2.1", "title": "เปิดการ์ดส่งคำขอบนหน้าแรก", "expect": "ไปหน้าคำขอของเดือนที่เปิดรับ" }] },
   { "no": 2, "title": "กรณีแยก: คำขอและใบลา", "who": "พยาบาล (nurse1@…)",
     "cases": [{ "id": "2.1", "title": "ขอหยุดครบจำนวนที่ขอได้", "expect": "ปุ่มขอหยุดกดไม่ได้พร้อมเหตุผล" }] }]
  ```
  A flow is one key job from `WORKFLOWS.md` §2 with its approved walkthrough steps, in order, each with what the owner should
  see (`expect`); every key job of the round gets a flow. The case groups are the round's case list (the same ids the design
  round used) — every state, limit and error, each reachable by one link. `who` names the account to sign in with (never a
  password). `tests` on a row is the automated test count for that case.
- **Links are absolute URLs of the running app** (`http://localhost:5173/requests?month=…`). The checklist adds `rvround` and
  `rvcase` itself, so a comment knows its run and its row. A case that needs prepared data says so in `testData` and the seed
  provides it — the owner must be able to open the link and see the case, not build it by hand.
- **The app loads the kit in development only** — a few lines in the app's entry, added once per project, that do nothing unless
  the URL (or the tab's session) carries `rvround`, and nothing under automation, so e2e runs never see the bar:
  ```ts
  // dev only — the owner's review tool (modem-stack review kit); appears when a QA checklist link carries ?rvround=
  if (import.meta.env.DEV && !navigator.webdriver) {
    const round = new URLSearchParams(location.search).get('rvround') ?? sessionStorage.getItem('rvround')
    if (round && /^[\w.-]+$/.test(round)) {
      sessionStorage.setItem('rvround', round)
      const tag = document.createElement('script')
      tag.src = 'http://127.0.0.1:<review port>/_review/comment.js'   // a constant — never taken from the URL
      tag.dataset.round = round; tag.dataset.app = '1'
      document.body.appendChild(tag)
    }
  }
  ```
  Other stacks: the same tag, rendered only in the development build. It must never reach a production bundle or a shared server.
- **Reading a comment from the app:** `page` is the route (`/admin/accounts`), `url` the full address, `app: 1`; there is no
  mockup state, so `trail` (the last clicks) and `case` (the row it was opened from, which names the account) are how you get
  to the same screen. Sign in as that row's account before reproducing.
- **Before the link goes out:** `install.py --check` (with `--where`) exits 0; every flow step and case has a link that opens
  for the named account; the bar appears on one app page opened from the checklist and a test comment reaches the inbox.
- The owner's pass / fix answers and comments are the owner half of the QA record: copy them verbatim into the run's
  `report.md` under "Owner review", and fix through the normal loop (failing test first).

## Reading the answers

Read `<round>/review/inbox.json` at the start of **every** turn while a round is in review, before answering anything else.

```jsonc
{ "updated": "2026-11-18T09:14:02",
  "cases": { "1.1": { "v": "p" }, "1.4": { "v": "f", "n": "ปุ่มลบควรอยู่ซ้าย" } },          // p = pass, f = fix + note
  "comments": [{ "id": "c…", "page": "sched.html", "state": "submit", "url": "sched.html#submit", "vw": 1920,
                 "what": "ปุ่ม \"ส่งลงนาม\"", "comp": "กล่อง \"ส่งตาราง\"", "text": "ส่งลงนาม", "sel": "#dlg > footer > button.pri",
                 "rect": [1310, 770, 68, 40], "trail": ["ปุ่ม \"ส่งตาราง\""], "case": "2.16", "note": "ปุ่มนี้อยากให้เล็กลง" }] }
```

- **Find the same element before fixing.** Open `url` at width `vw`, replay `trail` (the owner's last clicks in that state) when
  the state was reached by clicking, resolve `sel`, and check its text against `text` / `what`. If it does not match, say you
  have not found it yet — do not fix a neighbour.
- A comment with an empty `sel` is about the whole page in that state. A case marked `f` is a fix request for that case even
  with no comment; its note `n` is handled like a comment.
- The owner says he has answered but the inbox is empty or older than his message: the browser could not reach the server.
  Say so and ask him to press "คัดลอกผล" and paste — never guess the fixes.
- Before a fix round, list the fixes as you understood them in one short reply, then fix. Ask only about a note you cannot place.
- Copy every note **verbatim** into the round's record (`CONCEPTS.md` / `chosen.md` "Owner comments") and taste into
  `taste-profile.json`. The inbox is working state, not the record.
- After a fix is verified, set that comment's `"status": "done"` and a one-line `"reply"` in the product language in
  `inbox.json`. The page shows a green pin and the reply; the browser never overwrites those two fields.
- No inbox (server down, other device): the owner presses "คัดลอกผล" and pastes — the same content as text.
