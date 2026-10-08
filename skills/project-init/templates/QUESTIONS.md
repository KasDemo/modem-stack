# {Project}: Questions and decisions

> The ONE register for open questions and the answers that settle them — client, client IT, and owner. Other docs link
> here (`Q7`) instead of keeping their own lists. An answer is only "done" when it has been applied where it belongs.

| ID | Question | Ask whom | Status | Answer | Date | Applied in |
|---|---|---|---|---|---|---|
| Q1 | {question} | {client / IT / owner} | {open / owner-answered / client-confirmed / assumed} | {answer} | {date} | {PRD R-003, WORKFLOWS §5 J2} |

Status meanings: **owner-answered** — the owner decided; may still need the client. **client-confirmed** — the client said so
(link the note). **assumed** — we proceed on a default until told otherwise; list these to the owner at every release.

Record here every decision the owner makes **for the client** (who may do what, rules, data) that the client's own words don't
already state — wherever it came up: kickoff, PRD, doubt-check, a walkthrough. Not here: internal engineering choices
(ARCHITECTURE D-ids), feature-map statuses, walkthrough steps (cite the Q-id there only if a decision was needed). The `owner-answered`
and `assumed` rows are what the client confirms: in the milestone acceptance record, or the release report's "decisions to confirm".
