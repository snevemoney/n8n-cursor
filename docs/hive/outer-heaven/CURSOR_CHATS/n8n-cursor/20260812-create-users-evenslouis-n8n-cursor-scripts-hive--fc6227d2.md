---
chatId: fc6227d2-2425-45c2-99ec-92c73aec155e
workspace: n8n-cursor
source: cursor
title: "Create `/Users/evenslouis/n8n-cursor/scripts/hive/os_agents_config.py` \u2014 central config for the 17-agent EVENS AI Operat"
updated: 2026-08-12T05:47:39.894992+00:00
messageCount: 18
archived: false
projects: ["[[PROJECTS/n8n-cursor]]", "[[PROJECTS/philanthropic-ai-agent]]", "[[PROJECTS/proof-qc-assist]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Create `/Users/evenslouis/n8n-cursor/scripts/hive/os_agents_config.py` — central config for the 17-agent EVENS AI Operat

**Workspace:** `n8n-cursor`  
**Chat ID:** `fc6227d2-2425-45c2-99ec-92c73aec155e`  
**Messages:** 18  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/973a02a9-3aec-4321-8b8d-324edd0be723/subagents/fc6227d2-2425-45c2-99ec-92c73aec155e.jsonl`

## What you asked

- Create `/Users/evenslouis/n8n-cursor/scripts/hive/os_agents_config.py` — central config for the 17-agent EVENS AI Operating System.

Include:
1. CORE_AGENT_NAMES (17 agents)
2. RENAME_MAP dict: old Grok name → new name (Watchdog Ops→Watchdog, CE & Leads→Money Desk, Scout Lead Gen→Lead Hunter, Forge Builder→Forge, Web Intelligence Hunter→Researcher, ProofCheck GTM→Product GTM, AI Audit Partner→Consultant, Vault Librarian→Librarian)
3. RETIRED_AGENTS list (~35 names to delete from Grok) with fusedInto field pointing to new agent
4. AGENT_CARDS dict for each of 17 agents with: title, lane (strate

## Assistant (excerpts)

- [REDACTED]

---

- I have the full 17-agent spec and fusion map. Creating the central config file next.

[REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- Created `scripts/hive/os_agents_config.py` — the central SSOT for the 17-agent EVENS AI Operating System.

**Contents:**
- **`CORE_AGENT_NAMES`** — 17 agents in canonical order (Big Boss through Publishing Engine)
- **`RENAME_MAP`** — 8 Grok renames (e.g. Watchdog Ops→Watchdog, CE & Leads→Money Desk)
- **`RETIRED_AGENTS`** — 35 entries with `fusedInto` (5 old core + 30 roster agents)
- **`AGENT_CARDS`** — full card per agent: title, lane, job, runs_when, solves, handoff_to, hitl_level, suppression_note
- **`build_agent_spec(name)`** — returns `{name, title, description}` plus optional `rename_

## Files touched

- `scripts/hive/os_agents_config.py`
- `scripts/hive/grokbot-setup-agents.py`
- `scripts/hive/grokbot-setup-roster.py`
- `scripts/hive/grokbot-audit-agents.py`
- `scripts/hive/build-grok-agent-routines.py`
- `docs/hive/outer-heaven/AGENT_ROSTER.md`
- `scripts/hive/os/`
- `scripts/hive/os/should-run.py`
- `scripts/hive/product-state.py`
- `scripts/hive/sync-openclaw-workspace-hive.py`
- `scripts/hive/grok-partner-meta.py`
- `scripts/hive/agent-scenarios.py`
- `scripts/hive/agent-roster-registry.json`
- `docs/hive/outer-heaven/AI_PARTNER_PLAYBOOK.md`

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/n8n-cursor]]
- [[PROJECTS/philanthropic-ai-agent]]
- [[PROJECTS/proof-qc-assist]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260812-create-the-file-users-evenslouis-n8n-cursor-scri-4c99b197|Create the file `/Users/evenslouis/n8n-cursor/scri]]
- [[20260812-create-documentation-files-for-evens-ai-operatin-87b5d457|Create documentation files for EVENS AI Operating ]]
- [[20260812-read-only-exploration.-find-how-grok-agent-routi-22875895|Read-only exploration. Find how Grok agent routine]]
- [[20260814-evens-said-fix-them-all-don-t-stop.-re-verify-fo-8747bd03|Evens said fix them all / don\u2019t stop. Re-veri]]
- [[20260812-explore-users-evenslouis-n8n-cursor-scripts-hive-05164dbd|Explore /Users/evenslouis/n8n-cursor/scripts/hive/]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
