# Owner answer sheet — pilot "ระบบจองห้องประชุม"

The dry-run agent answers owner questions ONLY from this sheet. Anything not here: invent, and log as UNCOVERED.

## Client and contract
- Client: คณะวิทยาศาสตร์ มหาวิทยาลัยนเรศวร. App: ระบบจองห้องประชุม/ห้องเรียนพิเศษ (12 rooms).
- TOR exists, 15 clauses (T1–T15). Paraphrase the clauses from the rules below; T15 = "คู่มือการติดตั้งและสำรองข้อมูล".
- 6 weeks, 2 milestones: **งวด 1** (week 3) = book + approve + cancel + my bookings + building staff queue; **งวด 2** (week 6) =
  recurring bookings + maintenance closing + usage stats + admin (users, rooms, settings) + manuals.
- Sign-off: a 3-person faculty committee (กรรมการตรวจรับ) watches a demo against the TOR and signs a form.
- Smallest acceptable first version: งวด 1 scope.

## Users and rules
- อาจารย์และเจ้าหน้าที่ (ผู้จอง): book, cancel, see the schedule and their bookings.
- เจ้าหน้าที่อาคาร: approve/reject, close a room for maintenance, cancel a single booking with a reason.
- ผู้บริหาร: usage statistics. ผู้ดูแลระบบ: users, rooms, settings.
- Rooms > 30 seats need approval; others auto-confirm. No double booking. A pending request **does** hold the slot.
- A pending request not decided 2 hours before start expires automatically and the booker is notified.
- Recurring: weekly, up to one semester; each occurrence is its own booking.
- Cancellation by the booker up to 2 hours before start.
- Maintenance closing cancels affected bookings and notifies their bookers.
- Open hours 07:00–20:00, 30-minute slots, book up to 90 days ahead.

## Hosting, auth, data
- Faculty Linux VM with Docker, administered by faculty IT (คุณสมชาย). Nightly DB backup to the faculty NAS; IT wants a restore guide.
- Login: university LDAP, bind only. Roles assigned in the app by the admin; until งวด 2's admin screen exists, a seed script.
- Notifications: in-app + email via the faculty SMTP relay.
- Personal data: names, emails, phone extensions of bookers; keep bookings 2 years; only staff see who booked what.
- Thai UI, Buddhist-era dates with Thai digits off (Arabic digits). 70% desktop 1366, 30% mobile 390.

## Owner preferences
- Next.js + Postgres preferred, open to advice. shadcn/ui is fine.
- Wants to co-design each flow's walkthrough before any mockup; dislikes modals for multi-step tasks.
- Prefers dense tables for staff, a calendar/day view for bookers.
