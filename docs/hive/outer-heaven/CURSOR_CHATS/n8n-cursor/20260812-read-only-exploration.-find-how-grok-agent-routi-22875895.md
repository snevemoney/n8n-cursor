---
chatId: 22875895-3e2e-45b3-8e3d-ad145dd37dd1
workspace: n8n-cursor
source: cursor
title: "Read-only exploration. Find how Grok agent routines and core 13 agents are defined: build-grok-agent-routines.py, grok-a"
updated: 2026-08-12T02:57:08.764967+00:00
messageCount: 8
archived: false
projects: ["[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/scorpion-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Read-only exploration. Find how Grok agent routines and core 13 agents are defined: build-grok-agent-routines.py, grok-a

**Workspace:** `n8n-cursor`  
**Chat ID:** `22875895-3e2e-45b3-8e3d-ad145dd37dd1`  
**Messages:** 8  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/973a02a9-3aec-4321-8b8d-324edd0be723/subagents/22875895-3e2e-45b3-8e3d-ad145dd37dd1.jsonl`

## What you asked

- Read-only exploration. Find how Grok agent routines and core 13 agents are defined: build-grok-agent-routines.py, grok-agent-routines.json (sample), grokbot-setup-routines.py, any CORE agent definitions. Summarize routine prompt structure, schedule presets, and whether agents reference business outcomes vs task lists. Return paths and examples of routine prompts.

## Assistant (excerpts)

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- ## Architecture overview

The Grok routine system has three layers:

1. **Agent identity** — core 13 in `grokbot-setup-agents.py`; roster 31 in `agent-roster-registry.py`
2. **Routine generation** — `build-grok-agent-routines.py` merges both into `grok-agent-routines.json`
3. **Provisioning** — `grokbot-setup-routines.py` pushes cron automations to the Grok gateway (launchd presets go to `~/.grokbot/grok-launchd-routines.json`)

---

## Key paths

| Purpose | Path |
|---------|------|
| Core 13 agent profiles | `/Users/evenslouis/n8n-cursor/scripts/hive/grokbot-setup-agents.py` |
| Core 13 rou

## Files touched

- `scripts/hive/build-grok-agent-routines.py`
- `scripts/hive/grok-agent-routines.json`
- `scripts/hive/grokbot-setup-routines.py`
- `scripts/hive/agent-roster-registry.py`
- `docs/hive/outer-heaven/AGENT_ROSTER.md`
- `scripts/hive/grok-schedule-presets.py`
- `scripts/hive/grokbot-setup-agents.py`
- `scripts/hive/grok-schedule-presets.json`
- `docs/hive/outer-heaven/GROK_AGENT_ROUTINES.md`
- `scripts/hive/grokbot-agent-roles.py`
- `scripts/hive/grokbot-setup-roster.py`
- `scripts/hive/grok-hive-tool.py`
- `scripts/hive/smoke-`
- `docs/hive/outer-heaven/WEEKLY_SCOREBOARD.md`
- `scripts/hive/smoke-life-business-ops.sh`

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/scorpion-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260812-read-only-exploration.-search-the-n8n-cursor-rep-af5b988b|Read-only exploration. Search the n8n-cursor repo ]]
- [[20260812-read-only-exploration.-find-where-grok-bot-agent-7475bb09|Read-only exploration. Find where Grok Bot agents ]]
- [[20260812-explore-users-evenslouis-n8n-cursor-scripts-hive-05164dbd|Explore /Users/evenslouis/n8n-cursor/scripts/hive/]]
- [[20260812-explore-the-n8n-cursor-monorepo-for-grok-bot-age-9b17084b|Explore the n8n-cursor monorepo for Grok Bot agent]]
- [[20260812-create-users-evenslouis-n8n-cursor-scripts-hive--fc6227d2|Create `/Users/evenslouis/n8n-cursor/scripts/hive/]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
