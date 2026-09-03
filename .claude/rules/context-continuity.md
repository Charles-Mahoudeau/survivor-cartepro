# Context Continuity

## Rule

Keep `.context/context.md` current **all the time**, not only at the end of a conversation. It is the always-live resume point: at any moment it must reflect where the work actually is. Update it **as you go** — after each atomic commit or logical unit of work, at every architectural / product decision, whenever you discover how a subsystem works, on opening / merging a PR, and on fixing a bug (plus, of course, when the user asks to stop / pause).

**Why:** the next conversation — or a context reset that happens mid-session — must resume without re-reading and re-exploring the same files. Every re-discovery is a cost paid twice. A `.context` written only at the very end is lost the moment a session is interrupted before that point.

Do not batch it to the end. Cadence: whenever you'd think "that was a meaningful step," reflect it in `.context/context.md` **before moving on**.

## What to include

- **Where we are**: current branch, current phase/step, status
- **What was done**: summary of completed work this session (commits, files changed, decisions made)
- **Next step**: the exact command or action to resume
- **Key files**: files relevant to the current work
- **Pending items**: anything unfinished or awaiting user action
- **Important decisions**: any decisions made during the session that affect future work

## Compaction

When `.context/context.md` exceeds ~150 lines:

1. Archive completed phases/milestones into a single "History" section (2-3 lines per phase max)
2. Keep only the current phase details fully expanded
3. Keep all pending items and next steps intact
4. Never delete decisions that affect future work — summarize them

## Format

Keep it scannable: tables for file lists, bullet points for decisions, code blocks for commands. No prose paragraphs.
