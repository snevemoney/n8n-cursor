---
name: assume-it-will-touch
description: >-
  Permissions are tools, not vibes. If it can read it, assume it will.
  Bypass / allow-all on the lead flows downhill. Use when spawning
  desks, assigning MCP/tools, or writing “don’t” in a prompt.
  Cursor plus Grok Bot.
---

# Assume it will touch

**Stack:** Cursor + Grok Bot. Prompt “don’t” is not a lock.

**Upgrade:** `UPG-nate82-assume-it-will-touch`  
**Sources:** `e18sdZLwP7o` · `vDVSGVpB2vc` · `5p5cV0yVDvQ` · `gb5TlGw6Uks` (timestamps UNKNOWN, caption-only)  
**Cursor copy:** `.cursor/skills/assume-it-will-touch/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/assume-it-will-touch/SKILL.md`  
**Allow-list SSOT:** `docs/hive/outer-heaven/CONTENT/AGENT_TOOL_INVENTORY.json`

**Contradiction (keep labeled):** “It can never send data” is a caption. He prefers main-as-approver; hive keeps Evens on hard steps. Do not flatten.

## When

`hive-spawn-desks`, a new tool/MCP, a specialist wrap, or any prompt that says “don’t send / don’t touch.”

## Card (required at spawn)

```
ALLOW: <tools this desk may use — from AGENT_TOOL_INVENTORY>
DENY: send / pay / deploy / book / publish + anything not listed
TERRITORY: <files this desk may write>
MAX-TURNS: <n>
BYPASS: none
```

Description-tune is the trigger API. Inherited bypass is a fail.

## Steps

1. Read the desk’s `use` / `never` in `AGENT_TOOL_INVENTORY.json`. That is the lock.
2. Spawn writes only its take file (tape-self-teach) or the named territory. No borrowed agent markdown.
3. If a Send/Execute tool is on the list, assume it will fire → strip it (`send-removed`).
4. Instance-wide execute MCP stays NEVER. Do not enable.
5. Evens stays on hard steps. Main-as-approver is on-tape, not ours.

## Spawn job (the wired instance)

`hive-spawn-desks` / `tape-self-teach-mission.py`:

```
ALLOW: skill.deep-video-learning · write takes/{video_id}/{slug}.md
DENY: send / pay / deploy / book / publish · other desks' takes · LESSONS merge
TERRITORY: that one take file
MAX-TURNS: one tape
BYPASS: none
```

## Stop

Send / pay / deploy / book / publish = operator.

## Never

Allow-all · inherited bypass · “don’t” as the only lock · borrowed agent md · instance-MCP execute · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
