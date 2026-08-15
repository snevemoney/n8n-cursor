---
chatId: 9b17084b-0871-45a6-9a85-670811a30937
workspace: n8n-cursor
source: cursor
title: "Explore the n8n-cursor monorepo for Grok Bot agent configuration and implementation. Find: 1. grokbot-setup-agents.py, g"
updated: 2026-08-12T00:47:31.527013+00:00
messageCount: 12
archived: false
projects: ["[[PROJECTS/n8n-cursor]]", "[[PROJECTS/philanthropic-ai-agent]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/scorpion-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Explore the n8n-cursor monorepo for Grok Bot agent configuration and implementation. Find: 1. grokbot-setup-agents.py, g

**Workspace:** `n8n-cursor`  
**Chat ID:** `9b17084b-0871-45a6-9a85-670811a30937`  
**Messages:** 12  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/973a02a9-3aec-4321-8b8d-324edd0be723/subagents/9b17084b-0871-45a6-9a85-670811a30937.jsonl`

## What you asked

- Explore the n8n-cursor monorepo for Grok Bot agent configuration and implementation. Find:
1. grokbot-setup-agents.py, grokbot-dispatch-missions.py and related scripts
2. Agent definitions (9 agents mentioned: Big Boss, Watchdog Ops, etc.)
3. ~/.grokbot/ references or templates
4. GROK_CURSOR_TEAM.md, AUTOPILOT_CONTRACT.md
5. What each agent is supposed to do vs what's implemented

Return: file paths, agent roster with roles, current tool/MCP capabilities per agent, known gaps/TODOs/stubs, and dispatch flow.

## Assistant (excerpts)

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- ## Grok Bot exploration report

### 1. Core scripts (absolute paths)

| Script | Path | Role |
|--------|------|------|
| **Setup** | `/Users/evenslouis/n8n-cursor/scripts/hive/grokbot-setup-agents.py` | Creates/updates 9 agents via Sand gateway; registers 3 cron automations |
| **Dispatch** | `/Users/evenslouis/n8n-cursor/scripts/hive/grokbot-dispatch-missions.py` | Sends missions via `sendPrompt`; supports `--agent`, `--event`, `--digest`, `--dry-run` |
| **Grant access** | `/Users/evenslouis/n8n-cursor/scripts/hive/grokbot-grant-access.py` | Patches `~/.grokbot/settings.json`, remote `setHo

## Files touched

- `scripts/hive/grokbot-setup-agents.py`
- `scripts/hive/grokbot-dispatch-missions.py`
- `scripts/hive/grokbot-heal-dispatch.py`
- `scripts/hive/grokbot-grant-access.py`
- `docs/hive/outer-heaven/GROK_CURSOR_TEAM.md`
- `docs/hive/outer-heaven/AUTOPILOT_CONTRACT.md`
- `docs/hive/GROKBOT_ACCESS.md`
- `scripts/hive/outer-heaven/emit-operator-event.sh`
- `docs/hive/outer-heaven/AGENTS_LAB.md`
- `scripts/hive/philanthropy-hive-tools/agent-roles.ts`
- `docs/hive/outer-heaven/NOTIFICATION_MATRIX.md`
- `docs/hive/outer-heaven/CHRONICLE/2026-08.md`
- `docs/hive/outer-heaven/CURSOR_CHATS/n8n-cursor/20260811-search-the-extracted-grok-bot-app-at-tmp-grok-bo-216fbda5.md`
- `scripts/hive/outer-heaven/capture-sources.yaml`
- `docs/hive/outer-heaven/OUTER_HEAVEN_LIBRARY.md`
- `docs/hive/DAY_IN_THE_LIFE.md`
- `docs/hive/outer-heaven/`
- `scripts/hive/obsidian-vault-template/00_Outer_Heaven/GROK_CURSOR_TEAM.md`
- `scripts/hive/smoke-`
- `scripts/hive/hive-watchdog.sh`
- `scripts/hive/life-business-ops-fix.sh`
- `scripts/hive/n8n-activate-all-hive-workflows.sh`

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/n8n-cursor]]
- [[PROJECTS/philanthropic-ai-agent]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/scorpion-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260812-explore-users-evenslouis-n8n-cursor-scripts-hive-05164dbd|Explore /Users/evenslouis/n8n-cursor/scripts/hive/]]
- [[20260812-read-only-exploration.-search-the-n8n-cursor-rep-af5b988b|Read-only exploration. Search the n8n-cursor repo ]]
- [[20260812-explore-the-n8n-cursor-monorepo-for-grok-bot-too-01c1b0fb|Explore the n8n-cursor monorepo for Grok Bot tools]]
- [[20260811-explore-users-evenslouis-n8n-cursor-scripts-hive-bbf3e43a|Explore /Users/evenslouis/n8n-cursor/scripts/hive/]]
- [[20260812-explore-the-n8n-cursor-monorepo-at-users-evenslo-8d9fa8a2|Explore the n8n-cursor monorepo at /Users/evenslou]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
