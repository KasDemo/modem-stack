---
name: lesson
description: Use immediately after the owner corrects you, a bug's root cause is found, or a wrong assumption is discovered - appends a one-line rule to the project CLAUDE.md Lessons section so the mistake never repeats. The compounding habit; invoke proactively, do not wait to be asked.
---

# Lesson

Every correction is paid for once. This skill makes sure it is never paid for twice. ("The AI never forgets a rule I put there. I forget constantly." — the habit behind every documented long-running solo-dev success.)

## When to fire (proactively)

- The owner corrects your approach, style, or a decision ("no, we do X here").
- A bug's root cause turns out to be a wrong assumption that could recur.
- You discover a non-obvious project constraint (API quirk, data shape, environment gotcha).

NOT for: one-off facts, things the code already documents, or restating the diff.

## How

1. Distill to ONE line, imperative, specific enough to act on:
   - Good: `Firestore timestamps arrive as {seconds,nanos} objects from the export — always convert via toDate() before compare.`
   - Bad: `Be careful with dates.`
2. Append under `## Lessons` in the project CLAUDE.md (newest first).
3. If it needs more than a line (repro, reasoning, code), write `docs/solutions/<slug>.md` and link it: `- <one-liner> ([details](docs/solutions/<slug>.md))`
4. If Lessons exceeds ~30 lines: consolidate — merge duplicates, promote stable rules into the Rules section, move rest to docs/solutions/. A bloated CLAUDE.md gets ignored, which defeats the whole point.
5. Owner-taste corrections about UI belong in `docs/design/taste-profile.json` (via design-first-ui's taste update) rather than CLAUDE.md.

Tell the owner in one line what was recorded, then continue the interrupted work.
