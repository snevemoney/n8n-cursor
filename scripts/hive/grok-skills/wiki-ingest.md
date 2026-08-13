---
name: wiki-ingest
description: Turn a pile of sources into Outer Heaven pages an agent can query. Raw, wiki, index, log, lint. Use when adding videos, packets, or client judgment. Cursor writes. Grok Librarian queries. No second wiki app.
---

# Wiki ingest (funnel)

**Stack:** Outer Heaven in this repo + `~/.grokbot/research-packets/`. Cursor writes. Grok Librarian queries.

## When
New batch of sources, or “add this to the wiki.”

## Architecture
```
docs/hive/outer-heaven/     # wiki + CONTENT
~/.grokbot/research-packets/  # raw transcripts / packets
OPERATOR_MEMORY.md            # LESSONS / FACTS / don'ts
```

## Steps
1. Open the canon folder in **Cursor** (not a new vault app).
2. Dump sources into the packet / CONTENT path.
3. Prompt: purpose + “be thorough” + keep thoughts related.
4. Write pages + index + log + what changed.
5. Each new item: “add this to the wiki” → log grows.
6. Lint: Librarian asks for missing articles if confused.
7. Q&A: Grok Librarian / Cursor Agent read index + OPERATOR_MEMORY.

## Stop
Do not stand up Claude Code, Cowork, or a second Obsidian vault for hive canon.

## Anti-patterns
- Chat-only memory with no file
- Cloning the YouTuber’s wiki tool
- Promoting UNVERIFIED income as FACT
