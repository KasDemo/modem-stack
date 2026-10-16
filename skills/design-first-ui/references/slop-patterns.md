# Slop patterns — concrete, banned in every mockup

> One list, read by builders (via the BRIEF) and critics. Each entry says what it looks like, why it reads as AI-made, and what
> to do instead. **When the owner calls something slop, add it here the same day** with the project and date. A project may also
> keep its own extra list in `docs/design/taste-profile.json` → `rejected`.

| Pattern | Looks like | Do instead | Seen |
|---|---|---|---|
| **Icon-row list** | rows of icon + title + grey sub-line + chevron, repeated 6–12 times as the page's main content | a table or grouped list whose columns carry the real data; reserve icons for status or type | NurseSystem 2026-10-16 |
| **How-to text on every row** | each item carries a long "how to / what this does" line, so nothing stands out | say it once (page subtitle or an inline hint where it's needed); let labels be short | NurseSystem 2026-10-16 |
| **Repeated label or button per row** | "ค่าของ รพ." or an "แก้" button on every row | state shared context once in the header; make the value itself clickable/editable | NurseSystem 2026-10-16 |
| **White cards on a tinted page, everywhere** | every section is a rounded white card with shadow floating on a coloured background | flat page with hairline dividers and whitespace; use a surface only where grouping helps | NurseSystem 2026-10-16 |
| **Cards inside cards** | a panel holding panels holding cards | one level of surface; group with spacing and headings | SciPub 2026-10-02 |
| **Borders on everything** | every block, row and chip outlined | borders only where they separate things that would otherwise blur | SciPub 2026-10-02 |
| **Chip overload** | tags/pills for every attribute | plain text or one status pill; chips only for filters the user toggles | SciPub 2026-10-02 |
| **Initials avatars** | coloured circles with two letters | a neutral silhouette or the real photo | SciPub 2026-10-02 |
| **Filler or duplicated tiles** | a stat card that repeats a list below it, or exists to fill the row | every tile answers a question the job asks; cut the rest (equal-sized meaningful tiles are fine) | SciPub 2026-10-08, OMITS |
| **Nothing marks the primary answer** | every block has the same weight; the eye has nowhere to land | one primary answer per screen, from the BRIEF's screen focus table | SciPub 2026-10-08 |
| **Lopsided / half-empty panels, misaligned rows** | a short panel beside a tall one; row items not lining up | balance columns, align row edges; move the short item | OMITS 2026-10-07, SciPub 2026-10-08 |
| **Hero-metric template** | a giant number with a gradient accent and three small supporting stats | a plain figure in context, with its comparison | SciPub BRIEF ban |
| **Decorative charts** | sparklines or bars with no axis, values or job | a chart only when the trend answers the job, with readable axis and values | SciPub 2026-10-08 |
| **Default AI aesthetics** | purple gradients, glassmorphism, emoji-icon feature cards, Inter as the only font | the project's DESIGN_SYSTEM, or a direction justified by references | design-first-ui hard bans |
