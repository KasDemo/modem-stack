# Owner answer sheet — scenario B: "แอปจัดเวรพยาบาล" (no TOR, no milestones, no deadline)

The dry-run agent answers owner questions ONLY from this sheet. Anything not here: invent, and log as UNCOVERED.

> **Fictional test scenario** for the owner's most common case: an informal client, no TOR, no signed milestones, no rush.
> Never turn constraints from this sheet into plugin rules.

## What the owner says at kickoff (volunteered — say this unprompted, nothing more)
"ลูกค้าเป็นฝ่ายการพยาบาล โรงพยาบาลชุมชนแห่งหนึ่ง อยากได้แอปจัดเวรพยาบาล หัวหน้าหอผู้ป่วยจัดเวร พยาบาลดูเวรของตัวเองได้ แล้วก็ขอแลกเวรกันได้"

## Facts revealed only when a skill's question asks for them
- Contract: no TOR, no written scope, no milestones. "ทำไปเรื่อยๆ ปล่อยใช้ทีละส่วนได้ ไม่รีบ". Payment is a monthly retainer.
- Users: หัวหน้าหอผู้ป่วย (4 wards), พยาบาลวิชาชีพ ~60, ผู้ช่วยพยาบาล ~20, หัวหน้าฝ่ายการพยาบาล (sees all wards).
- Shifts: เช้า 08–16, บ่าย 16–24, ดึก 00–08. A month's roster is made by the 25th of the previous month.
- Rules: minimum staff per shift per ward (e.g. ICU: 3 RN on nights), at least 1 senior RN per shift, no ดึก followed by เช้า,
  max 6 consecutive shifts, fairness of nights/weekends/holidays across a quarter.
- Swap: two nurses agree, then the ward head approves; a swap must not break the rules above.
- Leave: annual leave and sick leave requests; the ward head approves; sick leave on the day needs a replacement.
- OT: shifts beyond contract hours count as OT; the nursing director wants a monthly OT/hours report per person for payroll.
- Today they use Excel + a LINE group. They want a one-time import of next month's Excel roster.
- Notifications: LINE is what nurses read; email nobody reads.
- Login: the hospital has no LDAP; local accounts, the nursing director's office creates them; nurses mostly on phones.
- Hosting: the hospital's own server (Windows Server + Docker allowed), IT person part-time.
- Personal data: names, phone numbers, license numbers; only heads and the director see others' leave reasons.
- Holidays: Thai public holidays, Buddhist-era dates.
- Device split: nurses 90% mobile 390; heads 60% desktop 1366.
- Owner preferences: Next.js + Postgres; wants a solver for auto-rostering later (not first); dislikes modals for multi-step tasks;
  wants to co-design each flow's walkthrough.

## Things the client never mentioned but would want (a good feature map should surface them as 🤖 suggestions)
leave/sick handling, fairness report, OT/hours report, audit of who changed the roster, Excel import, LINE notifications, publishing/
locking a roster, mobile-first nurse view, admin for wards/shift types/holidays.
