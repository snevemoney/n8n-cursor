---
name: sanitize-in-check-out
description: >-
  No-AI sanitize before the model; check after. Pass ≠ send. Use when
  text goes into a model or out to a human/DB, inbox-to-task-routing,
  or a draft leaves Comms/HITL. Cursor plus Grok Bot.
---

# Sanitize in / check out (Cursor)

Load `scripts/hive/grok-skills/sanitize-in-check-out.md` and follow it.

**Card:** inbound redact → model → outbound check → fail halt. Pass still HITL.  
**Wired job:** `inbox-to-task-routing` + Comms/HITL drafts.  
**CLI:** `python3 scripts/hive/sanitize-check.py --fixture` (password line required).

Stock secret-keys miss passwords. Pass ≠ send.  
Hard step: send / pay / deploy / book / publish stay Evens.

Grok `/` copy: `~/.grokbot/skills/sanitize-in-check-out/SKILL.md`.
