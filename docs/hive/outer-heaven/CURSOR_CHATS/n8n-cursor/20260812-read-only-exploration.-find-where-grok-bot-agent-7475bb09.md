---
chatId: 7475bb09-dac1-40fd-b3c6-d5e052a73f6e
workspace: n8n-cursor
source: cursor
title: "Read-only exploration. Find where Grok Bot agents are defined: agent-roster-registry.json, agent-roster-registry.py, gro"
updated: 2026-08-12T02:57:29.399802+00:00
messageCount: 7
archived: false
projects: ["[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Read-only exploration. Find where Grok Bot agents are defined: agent-roster-registry.json, agent-roster-registry.py, gro

**Workspace:** `n8n-cursor`  
**Chat ID:** `7475bb09-dac1-40fd-b3c6-d5e052a73f6e`  
**Messages:** 7  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/973a02a9-3aec-4321-8b8d-324edd0be723/subagents/7475bb09-dac1-40fd-b3c6-d5e052a73f6e.jsonl`

## What you asked

- Read-only exploration. Find where Grok Bot agents are defined: agent-roster-registry.json, agent-roster-registry.py, grokbot-setup-agents.py, grokbot-setup-roster.py, grokbot-agent-roles.py. Summarize: total agent count, how descriptions/prompts/identity are stored, fields available per agent (displayName, description, fusedFrom, profile, etc.), and 3-5 example current descriptions that feel weak or generic. Return file paths and key schema fields.

## Assistant (excerpts)

- [REDACTED]

---

- Checking the JSON schema and wave counts for completeness.

[REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- ## Grok Bot Agent Definition Map

### File paths (all under `/Users/evenslouis/n8n-cursor/scripts/hive/`)

| File | Role |
|------|------|
| `agent-roster-registry.py` | **SSOT generator** — builds 31 fused roster agents from Python; writes JSON + docs |
| `agent-roster-registry.json` | **Generated registry** — persisted roster (31 agents) |
| `grokbot-setup-agents.py` | **Core 13** — hardcoded `AGENTS` list; provisions via Grok gateway API |
| `grokbot-setup-roster.py` | **Roster provisioner** — reads JSON, builds Grok `description`, creates/updates agents |
| `grokbot-agent-roles.py` | **Too

## Files touched

- `scripts/hive/agent-roster-registry.json`
- `scripts/hive/agent-roster-registry.py`
- `scripts/hive/grokbot-setup-agents.py`
- `scripts/hive/grokbot-setup-roster.py`
- `scripts/hive/grokbot-agent-roles.py`

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260812-read-only-exploration.-find-how-grok-agent-routi-22875895|Read-only exploration. Find how Grok agent routine]]
- [[20260812-explore-the-n8n-cursor-monorepo-at-users-evenslo-8d9fa8a2|Explore the n8n-cursor monorepo at /Users/evenslou]]
- [[20260812-explore-the-n8n-cursor-monorepo-for-grok-bot-age-9b17084b|Explore the n8n-cursor monorepo for Grok Bot agent]]
- [[20260812-read-only-exploration.-search-the-n8n-cursor-rep-af5b988b|Read-only exploration. Search the n8n-cursor repo ]]
- [[20260812-create-users-evenslouis-n8n-cursor-scripts-hive--fc6227d2|Create `/Users/evenslouis/n8n-cursor/scripts/hive/]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
