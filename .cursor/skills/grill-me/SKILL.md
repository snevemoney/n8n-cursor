---
name: grill-me
description: >-
  Extraction interview: grill Evens one question at a time with a
  recommended answer each, checkpoint every answer to a brainstorm doc,
  flag unknowns to their owners, close with labeled merge offers.
  Use when the operator says grill me, extract my brain, interview me
  relentlessly, or before a new skill / client scope / process the OS
  knows less about than Evens. Cursor plus Grok Bot.
---

# Grill me (Cursor)

Load `scripts/hive/grok-skills/grill-me.md` and follow it.

**Card:** `TOPIC` · `CAPTURE`-before-question-one · `LOOP` (question + recommended answer → checkpoint) · `STOP` (shared understanding / Evens / cap 30) · `FLAGS` → owner, Evens sends · `CLOSE` = labeled merges, minting HITL.
**Capture:** `CONTENT/brainstorms/{YYYY-MM-DD}-{slug}.md` — vault `00_Outer_Heaven/` + repo mirror, per `obsidian-format-rules.md` (flags = `> [!question]` callouts).
**CLI (use it):** `python3 scripts/hive/os/grill-me.py new --topic "…"` then `checkpoint --topic … --q … --a … [--decision …] [--flag "Owner — what"] [--summary …]`. Docs join the spine graph + OS-MAP.canvas automatically.
**Wired jobs:** precedes `skill-from-session` · complements `session-bootstrap` (dump-first) · generalizes `interview-to-desk`.

Explore disk before asking. The doc is the artifact, not the chat.
Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/grill-me/SKILL.md`.
