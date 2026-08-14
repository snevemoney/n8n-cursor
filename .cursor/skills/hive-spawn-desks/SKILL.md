---
name: hive-spawn-desks
description: >-
  Spawn the 17 hive desks as Cursor Task subagents in this chat. Use when
  the operator says spawn the desks, cowork here, tape walk in Cursor, or
  don’t use Grok Bot. Never call the Grok gateway or /api/sendPrompt.
---

# Spawn desks in Cursor

**Engine:** this chat’s `Task` tool. **Never** Grok Bot, `grokbot-dispatch-tape-self-teach.py`, or `/api/sendPrompt`.

Evens is the visionary. Each desk coworks. Parent does not write 17 hats.

## When

Operator says spawn the desks · cowork here · tape walk in Cursor · don’t use Grok Bot.

## Steps

1. `python3 scripts/hive/cursor-spawn-desks.py --job <job> --write`  
   First job: `tape-self-teach` → `docs/hive/outer-heaven/CONTENT/job-cards/takes/_prompts/{slug}.md`
2. In **one** message, launch 17 `Task` calls:
   - `subagent_type`: `generalPurpose`
   - `run_in_background`: `true`
   - `model`: inherit
   - `description`: desk name
   - `prompt`: that file’s mission + workspace `/Users/evenslouis/n8n-cursor` + write **only** `takes/{slug}.md`
3. If the harness caps parallelism: wave 6 / 6 / 5. Same prompts. Still no Grok.
4. Parent reports who is running (link each desk). Do not fill take files yourself.
5. Evens keeps or kills before anyone merges `LESSONS-FROM-TAPE.md`.

## Never

Grok gateway · `/api/sendPrompt` · parent writing 17 hats · an 18th agent · send / pay / deploy / book / publish · new `icp_id` · Normand send
