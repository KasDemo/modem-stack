# modem-stack

Universal solo-dev workflow ของ Modem สำหรับ Claude Code — ออกแบบมาสำหรับการทำงานแบบ: **เจ้าของโปรเจกต์คุยกับลูกค้าเอง รู้ requirement ชัด → บอก requirement/feature/หน้าตา → agent ทำงานต่อ โดยมี gate ให้เลือกแบบ UI ก่อน implement, QA แบบ walkthrough พร้อม report ที่ลิงก์ถึงกันหมด, และ ship อย่างมีหลักฐาน**

สร้างจากการวิจัย workflow ของ solo dev ที่ ship จริง (Simon Willison, Mitchell Hashimoto, compound engineering ของ Every, `/qa` ของ gstack, skills ของ Addy Osmani, design-review ของ OneRedOak) — เอาเฉพาะส่วนที่มีหลักฐานว่าเวิร์ค ตัดส่วน marketing ทิ้ง

## ติดตั้ง (checklist สำหรับเครื่องใหม่)

รันใน Claude Code ตามลำดับ แล้ว restart Claude Code หนึ่งครั้งตอนจบ:

```
# 1) เพื่อนร่วมทีมจาก official marketplace (ถ้าเครื่องไม่รู้จัก ให้รันบรรทัดแรกก่อน)
/plugin marketplace add anthropics/claude-plugins-official
/plugin install superpowers@claude-plugins-official        # กระดูกสันหลัง process (จำเป็น)
/plugin install playwright@claude-plugins-official         # ตา+มือในเบราว์เซอร์ (จำเป็น)
/plugin install frontend-design@claude-plugins-official    # กันหน้าตา AI-generic (แนะนำ)

# 2) ui-ux-pro-max (แนะนำ — ฐานข้อมูล design ที่ design-first-ui ใช้)
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill

# 3) modem-stack
/plugin marketplace add KasDemo/modem-stack
/plugin install modem-stack@modem-stack
```

หมายเหตุ: ครั้งแรกที่ Playwright เปิดเบราว์เซอร์อาจมีดาวน์โหลด Chromium อัตโนมัติหนึ่งรอบ — ปล่อยให้มันจัดการ

```jsonc
// 4) ~/.claude/settings.json — ให้ไฟล์ของ Playwright MCP ไปลง report/tests/ แทนการกองใน root ของ repo
"env": { "PLAYWRIGHT_MCP_OUTPUT_DIR": "report/tests" }
```

**5) ตรวจว่า Playwright ใช้ได้จริง (ทำหลัง restart)** — เปิด Claude Code ในโปรเจกต์ไหนก็ได้ แล้วสั่ง:

> "Playwright smoke check: navigate ไป about:blank, screenshot แบบไม่ระบุชื่อไฟล์, แล้วบอกว่าไฟล์ไปอยู่ที่ไหน + ลอง CLI screenshot ตามข้อ (3)"

ผ่านเมื่อ: (1) browser tools ตอบสนอง — ถ้าขึ้น "Browser is already in use" แปลว่ามี Playwright MCP 2 ตัว (มักเป็น `playwright` ใน `.mcp.json` ของโปรเจกต์ซ้ำกับ plugin) ให้ลบตัวในโปรเจกต์ (2) ภาพที่ไม่ระบุชื่อ (`page-<เวลา>.png`) อยู่ใน `report/tests/` — **ถ้าไปโผล่ที่ `.playwright-mcp/` ใน root แปลว่า env ข้อ 4 ไม่ถึง MCP** (หมายเหตุ: ถ้าระบุชื่อเปล่า ๆ เช่น `smoke.png` MCP จะ resolve กับ root ของ workspace ไฟล์จึงไปลง root เสมอ — เวลาตั้งชื่อให้ใส่ path `report/tests/smoke.png`) (3) `npx playwright screenshot about:blank <path เต็ม>/report/tests/cli-smoke.png` ได้ไฟล์ภาพจริง (design-first-ui ใช้ CLI ตัวนี้ถ่าย mockup; แค่ `--version` ไม่พอ เพราะผ่านได้แม้ไม่มี browser) — ถ้าไม่มี browser ให้รัน `npx playwright install chromium` ไม่ผ่านข้อไหน แก้ก่อนใช้งานจริง แล้วลบไฟล์ smoke ทั้งสองทิ้ง

(ระหว่างพัฒนา plugin ในเครื่องหลัก จะ add จาก local path แทนก็ได้: `/plugin marketplace add d:\work\modem-stack`)

## อัปเดต plugin

เมื่อแก้ workflow ในเครื่องหลัก:

0. ครั้งแรกบนเครื่องที่แก้ plugin: `git config core.hooksPath .githooks` — pre-commit hook จะไม่ยอมให้ commit ถ้าแก้ `skills/` `agents/` `hooks/` แต่ลืม bump version
1. แก้ไฟล์ + **bump version ให้ตรงกัน 3 จุด**: `.claude-plugin/plugin.json`, `marketplace.json` → `metadata.version` และ `plugins[0].version` (เลขเวอร์ชันคือสิ่งที่บอกเครื่องอื่นว่ามีของใหม่)
2. commit + push (GitHub Desktop: Commit to main → Push origin)
3. **ทุกเครื่องรวมเครื่องหลัก**: `/plugin marketplace update modem-stack` แล้วอัปเดตผ่านเมนู `/plugin` แล้ว restart — Claude Code โหลด plugin จาก cache (`~/.claude/plugins/cache/modem-stack/modem-stack/<version>/`) ไม่ใช่จาก repo ตรงๆ แก้ใน repo อย่างเดียวจึงยังไม่มีผล

กฎการแบ่ง: บทเรียนเฉพาะโปรเจกต์ → CLAUDE.md ของโปรเจกต์นั้น · บทเรียนที่ใช้ทุกโปรเจกต์ → แก้ที่ plugin แล้ว push

**SessionStart hook ที่มากับ plugin** (`hooks/session-check.js`): ทุกครั้งที่เปิด session ในโปรเจกต์ modem-stack (มี `docs/PRD.md`, `docs/DESIGN_SYSTEM.md` หรือ `docs/qa/index.md`) จะย้ำกฎ routing (plan อยู่ `docs/plans/`, spec ที่มีหน้าจอต้องผ่าน design-first-ui ก่อน writing-plans) และเตือนถ้า DESIGN_SYSTEM ยังเป็น stub หรือมีไฟล์ Playwright ค้างใน root — โปรเจกต์อื่นจะไม่มีผลอะไร

## เริ่มโปรเจกต์ใหม่

```
/modem-stack:project-init
```

## Workflow ตั้งแต่เริ่มจนจบ

🧑 = คุณตัดสิน/อนุมัติ · 🤖 = AI ตรวจเอง

| # | ขั้น | ใช้อะไร | ได้อะไร |
|---|---|---|---|
| 1 | Kickoff | `project-init` Step 1–2 | สัมภาษณ์ (สัญญา/TOR/งวด ถ้ามี · hosting · login · PDPA · backup) → `notes/` คำพูดลูกค้าคำต่อคำ, `QUESTIONS.md`, `CHANGELOG.md` (+ `TOR.md` เฉพาะงานที่มี TOR) |
| 2 | PRD | Step 3 (brainstorming) → 🤖 `product-critic` → 🧑 อนุมัติ | `PRD.md`: **feature map** (โมดูล → feature → ใคร · 🤖 feature ที่ AI เสนอเพิ่มให้คุณยืนยันทีละแถว) → FR-### (AC · ที่มา · งวด/ข้อ TOR เฉพาะงานที่มี), กฎ R-###, NFR, สิ่งที่ไม่ทำ |
| 3 | Stack & architecture | Step 4 → 🧑 เลือก stack → 🤖 `doubt-check` schema/auth | `ARCHITECTURE.md` (stack ที่ตรวจเวอร์ชันแล้ว · การตัดสินใจ · runbook) + แอปที่รันได้ + quality gates + CLAUDE.md |
| 4 | Features | Step 5 (`ux-model`) → 🧑 อนุมัติรายการ | key jobs J0 (login/หน้าแรก) + J1… (งวด · ครอบคลุม FR ไหน) = backlog |
| 5 | ภาพระบบใหญ่ | Step 6 (`ux-model`) → 🧑 OK | `OBJECTS.md`, `WORKFLOWS.md` (วงจรสถานะ · การแจ้งเตือน), `SCREENS.md`, `sample-data.md` |
| 6 | Walkthrough ทีละ flow | `ux-model` walkthrough session — 🧑🤖 ออกแบบด้วยกัน → 🧑 ตราอนุมัติ | WORKFLOWS §5: ใคร · หน้า · กด → ระบบทำอะไร → ไปไหน + เส้นทางที่พัง |
| 7 | Design | `design-first-ui` (flow แรก = SYSTEM mode → ได้ `DESIGN_SYSTEM.md` ด้วย) → 🧑 concept → mock 3 แบบ → 🤖 critic 1 รอบ (คลิกทดสอบจริง, วัดจำนวนคลิกต่องาน) → 🧑 เลือก/ผสม (เห็นตัวเลข + ข้อเสนอแนะ) → 🤖 ขัดเกลา + ux-score เฉพาะแบบที่เลือก | `CONCEPTS.md`, `BRIEF.md`, mockups, `review.md`, `timeline.md`, `ux-score.md`, `chosen.md` (+ build notes), SCREENS อัปเดต |
| 8 | Implement | superpowers writing-plans → TDD + `browser-verification` | โค้ด + เทสต์ที่ตั้งชื่อตาม FR/J |
| 9 | Test | 🤖 `design-reviewer` → 🤖 `qa-clicker` (`qa-walkthrough`) | รายงาน design review + QA ที่อ้าง J/FR ใน `docs/qa/` |
| 10 | Release / ส่งงวด | `ship-check` (งานทั่วไป = release mode · งานที่ลูกค้าเซ็นรับเป็นงวด = โหมดงวด) | deploy ตาม runbook, CHANGELOG · โหมดงวด: ทดสอบ restore + `acceptance/งวด-N.md` (TOR → FR → J → หลักฐาน) ให้ลูกค้าเซ็น |
| ↺ | ลูกค้าขอแก้ | `feature-update` → 🧑 อนุมัติ brief | CR + PRD/TOR/QUESTIONS อัปเดต + walkthrough ที่โดนแก้ต้องอนุมัติใหม่ → กลับขั้น 7 |

ขั้น 6–9 วนทีละ flow ตามลำดับ release ใน PRD §3 · ระหว่างทาง: `security-hardening` (แตะ auth/ข้อมูลคน), `performance-budget` (ช้า), `doubt-check` (ตัดสินใจเสี่ยง), `lesson` (คุณแก้ผม 1 ครั้ง → กติกาถาวร)

## โครงสร้างเอกสาร — ข้อมูลแต่ละเรื่องมีบ้านเดียว

```
docs/
├── TOR.md                  # (เฉพาะงานที่มี TOR) ขอบเขตตามสัญญา (ข้อ T) ← ที่อื่นอ้าง T-id
├── PRD.md                  # feature map · FR · กฎ R · ลำดับ release (หรืองวด) · NFR · สิ่งที่ไม่ทำ ← ที่อื่นอ้าง FR/R
├── QUESTIONS.md            # คำถามค้าง + คำตอบ (ทะเบียนเดียว) ← ที่อื่นอ้าง Q-id
├── ARCHITECTURE.md         # stack · การตัดสินใจ D · runbook (deploy/rollback/backup/restore)
├── DESIGN_SYSTEM.md        # token · component inventory · กฎ
├── notes/                  # คำพูดลูกค้า + TOR ต้นฉบับ (คำต่อคำ)
├── plans/                  # แผน implement + change briefs (CR-*.md)
├── solutions/              # บทเรียนแบบยาว
├── acceptance/งวด-N.md     # (เฉพาะงานที่ลูกค้าเซ็นรับเป็นงวด) ตรวจรับงวด (ship-check)
├── design/
│   ├── OBJECTS.md          # object · ความสัมพันธ์ · ปุ่มต่อ role · คำศัพท์
│   ├── WORKFLOWS.md        # role · key jobs J · วงจรสถานะ · walkthrough ต่อ flow (มีตราอนุมัติ)
│   ├── SCREENS.md          # ทุกหน้า → route · state id (เจ้าของ id) · เป้า mockup
│   ├── sample-data.md      # ข้อมูลตัวอย่างชุดกลาง
│   ├── mockups/<date-flow>/  # CONCEPTS · BRIEF · variant-a/b/c · compare · critic-*.json · review · timeline · ux-score (แบบที่เลือก) · chosen
│   └── taste-profile.json  # รสนิยมของเจ้าของ (สะสม + จางตามเวลา)
└── qa/
    ├── index.md            # ตารางหลัก คลิกเข้า report ทุกอันได้
    ├── runs/<date-scope>/  # report.md + screenshots/ (หัวข้อละ key job)
    └── design-reviews/
CHANGELOG.md · CLAUDE.md (Rules + Lessons)
```

## หลักการที่ฝังอยู่ (มาจากหลักฐาน ไม่ใช่ความเชื่อ)

1. **ให้ agent มีเช็คที่รันเองได้** (test/typecheck/เบราว์เซอร์) — คุณภาพต่างกัน 2-3 เท่า
2. **Review ย้ายขึ้นต้นน้ำ**: คุณตัดสินที่ brief/plan/mockup/screenshot ไม่ใช่ไล่อ่าน diff
3. **งานชิ้นเล็ก context สด** — story ที่อธิบายไม่ได้ใน 2-3 ประโยค = ใหญ่เกิน ต้องซอย
4. **ทุกการแก้ไขกลายเป็นกฎถาวร** — ระบบฉลาดขึ้นสะสม (compound)
5. **Autonomy ตาม blast radius**: HITL ที่แผน/เลือกแบบ/รับงาน, ปล่อยอิสระเฉพาะงานที่ตรวจด้วยเครื่องได้
6. **หลักฐานก่อนคำอ้างเสมอ** — ไม่มี "เสร็จแล้วครับ" ที่ไม่มี output/ภาพประกอบ

MIT — ส่วนที่ดัดแปลงมา: agent-skills (Addy Osmani, MIT), gstack (Garry Tan, MIT — เฉพาะ methodology ไม่ใช้ binary), claude-code-workflows (OneRedOak, MIT)
