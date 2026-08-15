---
chatId: 05164dbd-d79a-41c2-a5c7-0590bfac98ba
workspace: n8n-cursor
source: cursor
title: "Explore /Users/evenslouis/n8n-cursor/scripts/hive/ to answer: how do Grok Bot agents coordinate with each other today?  "
updated: 2026-08-12T02:00:49.865583+00:00
messageCount: 3
archived: false
projects: ["[[PROJECTS/n8n-cursor]]", "[[PROJECTS/philanthropic-ai-agent]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]", "[[THEMES/scorpion-ops]]"]
tags: [hive]
---

# Explore /Users/evenslouis/n8n-cursor/scripts/hive/ to answer: how do Grok Bot agents coordinate with each other today?  

**Workspace:** `n8n-cursor`  
**Chat ID:** `05164dbd-d79a-41c2-a5c7-0590bfac98ba`  
**Messages:** 3  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/973a02a9-3aec-4321-8b8d-324edd0be723/subagents/05164dbd-d79a-41c2-a5c7-0590bfac98ba.jsonl`

## What you asked

- Explore /Users/evenslouis/n8n-cursor/scripts/hive/ to answer: how do Grok Bot agents coordinate with each other today?

Specifically report:
1. In grokbot-dispatch-missions.py: what does --event do? What is LANE_AGENT used for? What triggers dispatches (who calls this script — cron, launchd, other scripts)?
2. In outer-heaven/emit-operator-event.sh (or similar emit-*.sh): what events exist, who emits them, and where do they route?
3. In grokbot-setup-routines.py + grok-agent-routines.json: are routines independent cron timers per agent, or do any routines reference/trigger other agents?
4. Is 

## Assistant (excerpts)

- I'll map Grok Bot agent coordination from `scripts/hive/` — starting with dispatch, emit, routines, and orchestrator scripts.

---

- ## Coordination map (today)

### (a) What exists and works

**1. `grokbot-dispatch-missions.py` — `--event` and `LANE_AGENT`**

| Piece | Behavior | Lines |
|-------|----------|-------|
| `--event` | Severity (`WARN\|CRITICAL\|INFO`) → one mission via `build_event_mission()` → Grok gateway `/api/sendPrompt` | 297–313, 344–347, 381–384, 418–419 |
| `LANE_AGENT` | Maps `--lane` → agent (`ops`→Big Boss, `business`→CE & Leads, `health`→Watchdog Ops, …). **CRITICAL always overrides to Big Boss** | 258–279, 297–300 |
| Default (no flags) | Fan-out: every agent in `build_missions()` gets its own prom

## Files touched

- `scripts/hive/.`
- `scripts/hive/grokbot-dispatch-missions.py`
- `scripts/hive/outer-heaven/emit-operator-event.sh`
- `scripts/hive/grokbot-setup-routines.py`
- `scripts/hive/grok-agent-routines.json`
- `scripts/hive/grok-biweekly-dispatch.sh`
- `scripts/hive/install-grok-digest-launchd.sh`
- `scripts/hive/com.hive.grok-digest.plist.template`
- `scripts/hive/grok-digest-dispatch.sh`
- `scripts/hive/outer-heaven/install-capture-launchd.sh`
- `scripts/hive/grok-hive-tool.py`
- `scripts/hive/grok-schedule-presets.json`
- `scripts/hive/obsidian-vault-template/00_Outer_Heaven/NOTIFICATION_MATRIX.md`
- `scripts/hive/grokbot-heal-dispatch.py`
- `scripts/hive/grokbot-setup-agents.py`
- `apps/scorpion/lib/hive/mission-store.ts`
- `scripts/hive/grokbot-agent-roles.py`
- `scripts/hive/obsidian-vault-template/00_Outer_Heaven/AUTOPILOT_CONTRACT.md`
- `scripts/hive/philanthropy-hive-tools/hive.ts`
- `scripts/hive/agent-roster-registry.json`
- `apps/scorpion/app/api/hive/register/route.ts`

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/n8n-cursor]]
- [[PROJECTS/philanthropic-ai-agent]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]
- [[THEMES/scorpion-ops]]

## Related chats

- [[20260812-explore-the-n8n-cursor-monorepo-for-grok-bot-age-9b17084b|Explore the n8n-cursor monorepo for Grok Bot agent]]
- [[20260812-explore-the-n8n-cursor-monorepo-for-grok-bot-too-01c1b0fb|Explore the n8n-cursor monorepo for Grok Bot tools]]
- [[20260812-explore-the-n8n-cursor-monorepo-at-users-evenslo-8d9fa8a2|Explore the n8n-cursor monorepo at /Users/evenslou]]
- [[20260813-explore-users-evenslouis-n8n-cursor-for-24-7-aut-af0b2fc8|Explore /Users/evenslouis/n8n-cursor for 24/7 auto]]
- [[20260812-read-only-exploration.-search-the-n8n-cursor-rep-af5b988b|Read-only exploration. Search the n8n-cursor repo ]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
