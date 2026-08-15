---
chatId: 216fbda5-f4c3-4684-b5d5-16f173d5dbcd
workspace: n8n-cursor
source: cursor
title: "Search the extracted Grok Bot app at /tmp/grok-bot-asar and user data at \"/Users/evenslouis/Library/Application Support/"
updated: 2026-08-11T20:13:40.195120+00:00
messageCount: 24
archived: false
projects: ["[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Search the extracted Grok Bot app at /tmp/grok-bot-asar and user data at "/Users/evenslouis/Library/Application Support/

**Workspace:** `n8n-cursor`  
**Chat ID:** `216fbda5-f4c3-4684-b5d5-16f173d5dbcd`  
**Messages:** 24  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/973a02a9-3aec-4321-8b8d-324edd0be723/subagents/216fbda5-f4c3-4684-b5d5-16f173d5dbcd.jsonl`

## What you asked

- Search the extracted Grok Bot app at /tmp/grok-bot-asar and user data at "/Users/evenslouis/Library/Application Support/Grok Bot" to understand:
1. How agents are created/configured (file paths, JSON schema, SQLite)
2. Whether there's CLI or API for setup
3. What "sand" URL scheme does
4. Any docs or default agent templates

Return: exact file paths for agent config, schema fields, and step-by-step setup instructions you find in the code.

## Assistant (excerpts)

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- ## Grok Bot / Sand architecture (from `/tmp/grok-bot-asar` v0.16.0)

Internal codename is **sand**; product name is **Grok Bot**. Agent data lives primarily under `~/.grokbot`, not under Electron’s Application Support folder.

---

## 1. How agents are created and configured

### Data root layout

| Purpose | Exact path |
|--------|------------|
| Production data root | `/Users/evenslouis/.grokbot/` |
| Data-root marker | `/Users/evenslouis/.grokbot/.grokbot-data-root-v1` |
| Host-wide settings | `/Users/evenslouis/.grokbot/settings.json` |
| Gateway discovery | `/Users/evenslouis/.grokbot/gat

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260812-explore-the-n8n-cursor-monorepo-for-grok-bot-age-9b17084b|Explore the n8n-cursor monorepo for Grok Bot agent]]
- [[20260812-read-only-exploration.-search-the-n8n-cursor-rep-af5b988b|Read-only exploration. Search the n8n-cursor repo ]]
- [[20260812-read-only-exploration.-find-where-grok-bot-agent-7475bb09|Read-only exploration. Find where Grok Bot agents ]]
- [[20260812-explore-the-n8n-cursor-monorepo-at-users-evenslo-8d9fa8a2|Explore the n8n-cursor monorepo at /Users/evenslou]]
- [[20260809-search-the-n8n-cursor-monorepo-for-how-client-en-178af42e|Search the n8n-cursor monorepo for how Client Engi]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
