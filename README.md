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

(ระหว่างพัฒนา plugin ในเครื่องหลัก จะ add จาก local path แทนก็ได้: `/plugin marketplace add d:\work\modem-stack`)

## อัปเดต plugin

เมื่อแก้ workflow ในเครื่องหลัก:

1. แก้ไฟล์ + **bump version ให้ตรงกัน 3 จุด**: `.claude-plugin/plugin.json`, `marketplace.json` → `metadata.version` และ `plugins[0].version` (เลขเวอร์ชันคือสิ่งที่บอกเครื่องอื่นว่ามีของใหม่)
2. commit + push (GitHub Desktop: Commit to main → Push origin)
3. เครื่องอื่น: `/plugin marketplace update modem-stack` แล้วอัปเดตผ่านเมนู `/plugin`

กฎการแบ่ง: บทเรียนเฉพาะโปรเจกต์ → CLAUDE.md ของโปรเจกต์นั้น · บทเรียนที่ใช้ทุกโปรเจกต์ → แก้ที่ plugin แล้ว push

## เริ่มโปรเจกต์ใหม่

```
/modem-stack:project-init
```

สิ่งที่จะเกิด: สัมภาษณ์สั้นๆ → สร้างโครง `docs/` (PRD, DESIGN_SYSTEM, plans, qa, design/mockups) + CLAUDE.md พร้อมช่อง Lessons → ตั้ง quality gates (typecheck/lint/test/Playwright) → เข้า brainstorming ทำ PRD → เลือกทิศทาง design ทั้งระบบ (variants ให้เลือก) → ได้ `DESIGN_SYSTEM.md` เป็นสัญญา design ที่ทุก session ต้องทำตาม จะได้ไม่หลงทางเมื่อระบบโตขึ้น

## Workflow ประจำวัน

| จังหวะ | ใช้อะไร | ได้อะไร |
|---|---|---|
| ลูกค้าขอเพิ่ม/แก้ feature | `feature-update` | impact analysis กับระบบเดิมก่อนเสมอ → change brief ให้อนุมัติ → PRD ถูกอัปเดตให้ตรงความจริง |
| ก่อนทำ UI ทุกหน้า | `design-first-ui` | mockup ทั้ง flow 3 แบบ (HTML คลิกดูได้) → คุณเลือก/สั่งผสม → แบบที่เลือกเป็น "เป้า" ที่โค้ดต้อง screenshot เทียบให้ตรง + ระบบจำรสนิยมคุณสะสมใน taste-profile |
| ระหว่าง implement | `browser-verification` (+ superpowers TDD) | ทุก UI task ถูกเปิดดูในเบราว์เซอร์จริง console สะอาด ก่อนถือว่าเสร็จ |
| ตัดสินใจเสี่ยงสูง (schema, สูตร solver, auth) | `doubt-check` | ผู้ตรวจ context สดพยายามหักล้างก่อน commit |
| จบ feature | `qa-clicker` agent (ใช้ `qa-walkthrough`) | เดินเทสตามบท user จริง → report ใน `docs/qa/runs/` พร้อม screenshot ทุก step + แถวใหม่ใน `docs/qa/index.md` |
| UI ชิ้นใหญ่เสร็จ | `design-reviewer` agent | ตรวจ 7 เฟส (flow/responsive/WCAG/ตรง mockup ไหม) → report ใน `docs/qa/design-reviews/` |
| งานช้า/หนัก | `performance-budget` | วัดก่อนแก้ งบ Core Web Vitals |
| แตะ auth/ข้อมูลคน | `security-hardening` | วินัย security ตอนสร้าง (คู่กับ `/security-review` ตอนตรวจ) |
| จะส่งงาน/deploy | `ship-check` | gate ครบชุด — ทุกข้อมีหลักฐาน (output/screenshot/ลิงก์ report) ไม่มีคำว่า "น่าจะผ่าน" |
| คุณแก้อะไรผม 1 ครั้ง | `lesson` (อัตโนมัติ) | กติกาเข้า CLAUDE.md ทันที — ผิดซ้ำไม่ได้ |

## โครงสร้างที่ปลั๊กอินสร้างในแต่ละโปรเจกต์

```
docs/
├── PRD.md                  # สัญญา requirement (มีชีวิต — อัปเดตทุกครั้งที่ของจริงเปลี่ยน)
├── DESIGN_SYSTEM.md        # สัญญา design
├── notes/                  # โน้ตดิบจากการคุยลูกค้า
├── plans/                  # แผนรายฟีเจอร์ + change briefs (CR-*.md)
├── solutions/              # บทเรียนแบบยาว
├── design/
│   ├── mockups/<feature>/  # variant-a/b/c.html + compare.html + chosen.md
│   └── taste-profile.json  # รสนิยมของเจ้าของ (สะสม + จางตามเวลา)
└── qa/
    ├── index.md            # ตารางหลัก คลิกเข้า report ทุกอันได้
    ├── runs/<date-scope>/  # report.md + screenshots/
    └── design-reviews/
```

## หลักการที่ฝังอยู่ (มาจากหลักฐาน ไม่ใช่ความเชื่อ)

1. **ให้ agent มีเช็คที่รันเองได้** (test/typecheck/เบราว์เซอร์) — คุณภาพต่างกัน 2-3 เท่า
2. **Review ย้ายขึ้นต้นน้ำ**: คุณตัดสินที่ brief/plan/mockup/screenshot ไม่ใช่ไล่อ่าน diff
3. **งานชิ้นเล็ก context สด** — story ที่อธิบายไม่ได้ใน 2-3 ประโยค = ใหญ่เกิน ต้องซอย
4. **ทุกการแก้ไขกลายเป็นกฎถาวร** — ระบบฉลาดขึ้นสะสม (compound)
5. **Autonomy ตาม blast radius**: HITL ที่แผน/เลือกแบบ/รับงาน, ปล่อยอิสระเฉพาะงานที่ตรวจด้วยเครื่องได้
6. **หลักฐานก่อนคำอ้างเสมอ** — ไม่มี "เสร็จแล้วครับ" ที่ไม่มี output/ภาพประกอบ

MIT — ส่วนที่ดัดแปลงมา: agent-skills (Addy Osmani, MIT), gstack (Garry Tan, MIT — เฉพาะ methodology ไม่ใช้ binary), claude-code-workflows (OneRedOak, MIT)
