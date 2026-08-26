---
chatId: af0b2fc8-4ec7-4b70-aa5f-8f38a5f93825
workspace: n8n-cursor
source: cursor
title: "Explore /Users/evenslouis/n8n-cursor for 24/7 automation infrastructure related to Phase 0: launchd capture, grokbot-set"
updated: 2026-08-13T23:01:40.519238+00:00
messageCount: 17
archived: false
projects: ["[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/scorpion-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Explore /Users/evenslouis/n8n-cursor for 24/7 automation infrastructure related to Phase 0: launchd capture, grokbot-set

**Workspace:** `n8n-cursor`  
**Chat ID:** `af0b2fc8-4ec7-4b70-aa5f-8f38a5f93825`  
**Messages:** 17  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/c7f2f99c-2f1e-4dff-b245-29e61bad49df/subagents/af0b2fc8-4ec7-4b70-aa5f-8f38a5f93825.jsonl`

## What you asked

- Explore /Users/evenslouis/n8n-cursor for 24/7 automation infrastructure related to Phase 0: launchd capture, grokbot-setup-routines, VPS mirror, watchdog, AUTOPILOT_CONTRACT. Find exact script paths, install commands, and what's missing or not wired. Return: file paths, key commands, current state indicators, gaps.

## Assistant (excerpts)

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- ## 24/7 Automation Infrastructure Map

### Architecture (how it fits together)

```mermaid
flowchart LR
  subgraph Mac["Mac (awake)"]
    LD["com.hive.outer-heaven-sync\nlaunchd 15m"]
    CC["run-capture-cycle.sh"]
    Cache["~/.grokbot/outer-heaven"]
    Vault["Obsidian vault\n00_Outer_Heaven"]
    Git["docs/hive/outer-heaven/"]
    GrokLD["com.hive.grok-orchestrator\n+ biweekly/digest"]
  end
  subgraph VPS["VPS (always on)"]
    Mirror["/root/outer-heaven-mirror/"]
    WD["hive-watchdog.sh\ncron 10m"]
    GrokCloud["Grok cloud cron routines\n(--source vps)"]
  end
  LD --> CC --> Cache --> 

## Files touched

- `docs/hive/outer-heaven/AUTOPILOT_CONTRACT.md`
- `scripts/hive/outer-heaven/install-capture-launchd.sh`
- `scripts/hive/outer-heaven/run-capture-cycle.sh`
- `scripts/hive/grokbot-verify-agents.sh`
- `docs/hive/outer-heaven/IMPLEMENTATION_MAP.md`
- `docs/hive/outer-heaven/last-capture.json`
- `scripts/hive/grokbot-setup-routines.py`
- `scripts/hive/hive-watchdog.sh`
- `scripts/hive/install-hive-watchdog-cron.sh`
- `scripts/hive/outer-heaven/push-vault-mirror.sh`
- `scripts/hive/outer-heaven/com.hive.outer-heaven-sync.plist.template`
- `scripts/hive/expert-audit.sh`
- `scripts/hive/install-grok-orchestrator-launchd.sh`
- `scripts/hive/install-grok-schedulers.sh`
- `scripts/hive/outer-heaven/vps-outer-heaven-brief.sh`
- `docs/hive/outer-heaven/CONTENT/agent-outer-heaven-load-contract.md`
- `scripts/hive/outer-heaven/`
- `scripts/hive/grok-schedule-presets.json`
- `scripts/hive/business-lanes.json`
- `scripts/hive/core-work-ready-smoke.sh`
- `scripts/hive/build-grok-agent-routines.py`
- `scripts/hive/grok-biweekly-dispatch.sh`
- `scripts/hive/com.hive.grok-orchestrator.plist.template`
- `scripts/hive/grok-agent-routines.json`
- `docs/hive/outer-heaven/NOTIFICATION`

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/scorpion-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260812-explore-users-evenslouis-n8n-cursor-scripts-hive-05164dbd|Explore /Users/evenslouis/n8n-cursor/scripts/hive/]]
- [[20260813-investigate-grok-agent-performance-regression-in-d2b150b8|Investigate Grok agent performance/regression in /]]
- [[20260812-explore-the-n8n-cursor-monorepo-for-grok-bot-age-9b17084b|Explore the n8n-cursor monorepo for Grok Bot agent]]
- [[20260813-explore-users-evenslouis-n8n-cursor-for-icp-hunt-ef7b52b9|Explore /Users/evenslouis/n8n-cursor for ICP hunt ]]
- [[20260812-read-only-exploration.-search-the-n8n-cursor-rep-af5b988b|Read-only exploration. Search the n8n-cursor repo ]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
