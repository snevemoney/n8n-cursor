---
chatId: 8d9fa8a2-7961-4eea-9013-24a4e474a1d8
workspace: n8n-cursor
source: cursor
title: "Explore the n8n-cursor monorepo at /Users/evenslouis/n8n-cursor to understand HOW agents are provisioned and where a lar"
updated: 2026-08-12T01:02:02.676996+00:00
messageCount: 3
archived: false
projects: ["[[PROJECTS/n8n-cursor]]", "[[PROJECTS/philanthropic-ai-agent]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Explore the n8n-cursor monorepo at /Users/evenslouis/n8n-cursor to understand HOW agents are provisioned and where a lar

**Workspace:** `n8n-cursor`  
**Chat ID:** `8d9fa8a2-7961-4eea-9013-24a4e474a1d8`  
**Messages:** 3  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/973a02a9-3aec-4321-8b8d-324edd0be723/subagents/8d9fa8a2-7961-4eea-9013-24a4e474a1d8.jsonl`

## What you asked

- Explore the n8n-cursor monorepo at /Users/evenslouis/n8n-cursor to understand HOW agents are provisioned and where a large roster (50 new agents) could live. Find:

1. scripts/hive/grokbot-setup-agents.py — how Grok Bot agents are created (AGENTS list structure, gateway API, automations)
2. scripts/hive/sync-openclaw-workspace-hive.py — how OpenClaw Telegram agents are defined/synced (workspace files, souls, topics)
3. scripts/hive/grokbot-agent-roles.py and scripts/hive/philanthropy-hive-tools/agent-roles.ts — role profile system
4. docs/hive/outer-heaven/AGENTS_LAB.md — promotion criteria re

## Assistant (excerpts)

- I'll explore the agent provisioning paths and registry patterns you listed, starting with the Grok Bot / OpenClaw scripts and hive docs.

---

- ## Verdict

Agents are provisioned on **two platforms** with **no unified machine SSOT** today. Grok Bot is created via gateway APIs from an in-script `AGENTS` list (13). OpenClaw’s 17 agents are **workspace/topic-bound**; the sync script only patches files — it does not create Telegram topics or `openclaw.json` entries. Role grants live in a third place (`agent-roles.ts` + Python mirror). No repo doc states a hard Grok limit of 50; the real blockers are **duplicated registries**, **sacred OpenClaw topics**, and **HITL on `openclaw.json`**.

---

## 1. Grok Bot — `scripts/hive/grokbot-setup-ag

## Files touched

- `scripts/hive/grokbot-setup-agents.py`
- `scripts/hive/sync-openclaw-workspace-hive.py`
- `scripts/hive/grokbot-agent-roles.py`
- `scripts/hive/philanthropy-hive-tools/agent-roles.ts`
- `docs/hive/outer-heaven/AGENTS_LAB.md`
- `docs/hive/outer-heaven/HIVEMIND_DNA.md`
- `docs/hive/outer-heaven`
- `docs/hive/outer-heaven/OUTER_HEAVEN_LIBRARY.md`
- `docs/hive/AGENT_TOOL_MATRIX.md`
- `docs/hive/GROKBOT_ACCESS.md`
- `docs/hive/INTEROP_CONTRACTS.md`
- `scripts/hive/grokbot-heal-dispatch.py`
- `scripts/hive/grokbot-tool-cookbook.py`
- `docs/hive/outer-heaven/SURVIVAL_CONTRACT.md`
- `scripts/hive/agent-roster.json`

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/n8n-cursor]]
- [[PROJECTS/philanthropic-ai-agent]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260812-explore-the-n8n-cursor-monorepo-at-users-evenslo-8c1d3e22|Explore the n8n-cursor monorepo at /Users/evenslou]]
- [[20260812-explore-the-n8n-cursor-monorepo-for-grok-bot-age-9b17084b|Explore the n8n-cursor monorepo for Grok Bot agent]]
- [[20260812-explore-users-evenslouis-n8n-cursor-scripts-hive-05164dbd|Explore /Users/evenslouis/n8n-cursor/scripts/hive/]]
- [[20260811-explore-users-evenslouis-n8n-cursor-scripts-hive-bbf3e43a|Explore /Users/evenslouis/n8n-cursor/scripts/hive/]]
- [[20260812-read-only-exploration.-search-the-n8n-cursor-rep-af5b988b|Read-only exploration. Search the n8n-cursor repo ]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
