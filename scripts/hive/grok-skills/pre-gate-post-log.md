---
name: pre-gate-post-log
description: >-
  Every workflow, tool, and skill pairs a PRE-GATE (can block, exit 2)
  with a POST-LOG (never blocks, exit 0). Use when running a tool, skill,
  workflow, PreToolUse, UserPromptSubmit, Stop, PostToolUse, Notification,
  or SessionStart. Cursor plus Grok Bot. Owner Watchdog.
---

# Pre-gate / post-log

**Owner:** Watchdog. **Stack:** Cursor + Grok Bot.  
**Cursor copy:** `.cursor/skills/pre-gate-post-log/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/pre-gate-post-log/SKILL.md`  
**Status:** WIRED 2026-08-27 operator rule. Not accepted forever.

**Notify:** Grok Watchdog / Grok chat. Telegram and Scorpion are **legacy**, not the sink.

**How-to:** pre before tool, post after.

## When

Any tool, skill, or workflow is about to run — or just ran. Same pair on Claude-style hook names (repo-local only if a hooks pattern already exists; do not install Claude).

## Card

```
PRE:  python3 scripts/hive/os/pre-gate.py --can-act AGENT PROJECT
POST: python3 scripts/hive/os/post-log.py --agent AGENT --action NAME --outcome WHAT --correlation-id ID
```

PRE can block. POST cannot.

## PRE (can block)

Maps to PreToolUse, UserPromptSubmit, Stop. Script must return **exit 2** to stop the action.

Hive equivalent: `product-state.py --can-act AGENT PROJECT` via `scripts/hive/os/pre-gate.py` (wraps can-act / should-run). **Not RUN = block.**

- Exit **0** on `decision == RUN`
- Exit **2** on IGNORE / QUEUE / WAIT_FOR_STATE / WAIT_FOR_HUMAN / unknown project / load failure
- Local product-state only. No network.

```
python3 scripts/hive/os/pre-gate.py --can-act "Watchdog" hive-os
python3 scripts/hive/os/pre-gate.py --self-test
```

When blocked: tell the operator why and ask one question. Do not silent-skip.

## POST (cannot block)

Maps to PostToolUse, Notification, SessionStart. **Always exit 0.** Log what actually ran.

`SessionStart` cannot prevent the session.

```
python3 scripts/hive/os/post-log.py --agent "Watchdog" --action "pre-gate" --outcome "RUN" --correlation-id <id>
```

One JSON line: `agent`, `action`, `outcome`, `correlationId`. Sink = `event-bus.py` if present, else `~/.grokbot/os-audit.jsonl`. Log write failure → warning on stderr, still exit 0.

## Stop

Send / pay / deploy / book / publish = operator. This skill never closes a hard step. POST never pages Telegram or Scorpion.

## Never

Run a tool without PRE · skip POST after a run · treat POST as a gate · let SessionStart block · use Telegram / Scorpion as the audit sink · activate n8n / wipe `n8n_data` / call n8ncloud · overwrite `~/.claude` · install Claude Code/Cowork, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
