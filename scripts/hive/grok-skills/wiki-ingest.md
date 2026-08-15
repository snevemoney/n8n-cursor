---
name: wiki-ingest
description: >-
  Turn a pile of sources into Outer Heaven pages an agent can query.
  Raw, pages, index, log, provenance. Tape takes stay in
  CONTENT/job-cards/takes/. Evens skipped merge 2026-08-14. No second wiki app.
---

# Wiki ingest (funnel)

**Stack:** Outer Heaven in this repo + `~/.grokbot/research-packets/`. Cursor writes. Librarian persists what Evens keeps.

## When
New batch of sources, or “add this to the wiki.” Not a LESSONS merge.

## Architecture
Two-vault split (same wiki, two write paths):

```
docs/hive/outer-heaven/CONTENT/job-cards/takes/{slug}.md   # tape takes — SSOT
docs/hive/outer-heaven/CHRONICLE/                         # operator chronicle
docs/hive/outer-heaven/CONTENT/watch-later/OPERATOR_MEMORY.md
~/.grokbot/research-packets/                              # raw transcripts / packets
hot.md                                                    # optional short working set only
```

Load first for any desk = `CONTENT/job-cards/takes/{slug}.md`. Do not Load `LESSONS-FROM-TAPE.cursor-draft.md`.

## Steps
1. Open the canon folder in **Cursor** (not a new vault app).
2. Dump sources into the packet / CONTENT path.
3. Prompt: purpose + “be thorough” + keep thoughts related.
4. Write pages + index + log + **provenance** (where it came from).
5. Each new item: “add this to the wiki” → log grows.
6. Lint: Librarian asks for missing articles if confused.
7. Q&A: Cursor Agent / Librarian read index + OPERATOR_MEMORY + the desk’s take.

## Stop
Do not stand up Claude Code, Cowork, or a second Obsidian vault for hive canon.

## Never
- Merge `LESSONS-FROM-TAPE.md`. Evens skipped merge 2026-08-14. Do not ask again.
- Chat-only memory with no file
- Cloning the YouTuber’s wiki tool / 8k-node Obsidian theater
- Promoting UNVERIFIED income as FACT
- Using n8n as the reader (notify only)
