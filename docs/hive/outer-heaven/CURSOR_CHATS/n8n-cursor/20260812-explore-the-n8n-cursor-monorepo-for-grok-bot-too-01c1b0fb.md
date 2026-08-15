---
chatId: 01c1b0fb-9a9d-43a3-b409-d2e12ccbd8b0
workspace: n8n-cursor
source: cursor
title: "Explore the n8n-cursor monorepo for Grok Bot tools, MCP servers, and API integrations agents can use. Search for: 1. gro"
updated: 2026-08-12T00:47:43.580602+00:00
messageCount: 18
archived: false
projects: ["[[PROJECTS/n8n-cursor]]", "[[PROJECTS/philanthropic-ai-agent]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/scorpion-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Explore the n8n-cursor monorepo for Grok Bot tools, MCP servers, and API integrations agents can use. Search for: 1. gro

**Workspace:** `n8n-cursor`  
**Chat ID:** `01c1b0fb-9a9d-43a3-b409-d2e12ccbd8b0`  
**Messages:** 18  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/973a02a9-3aec-4321-8b8d-324edd0be723/subagents/01c1b0fb-9a9d-43a3-b409-d2e12ccbd8b0.jsonl`

## What you asked

- Explore the n8n-cursor monorepo for Grok Bot tools, MCP servers, and API integrations agents can use. Search for:
1. grokbot tool definitions, manifests, hive-toolbox
2. Scorpion /api/hive/* endpoints agents call
3. n8n workflows for grok/operator (hive-operator-digest, etc.)
4. Philanthropy/OpenClaw tool parity
5. Any broken imports, missing env vars, or stub implementations

Return: list of available tools/endpoints, what's wired vs stubbed, and gaps for full agent operation.

## Assistant (excerpts)

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- ## Executive summary

The monorepo has **three agent lanes** with uneven wiring:

| Lane | Tool surface | Status |
|------|----------------|--------|
| **OpenClaw / Philanthropy** | `POST http://127.0.0.1:3002/api/agent` | **Most complete** — 15 hive tools + role/Tier-3 gates |
| **Scorpion hive spine** | `https://evenslouis.ca/scorpion/api/hive/*` | **Implemented** — 12 routes; CE/n8n/Obsidian degrade to stubs without env |
| **Grok Bot** | Browser + Mac shell + SSH + gateway `sendPrompt` | **No `/api/agent` bridge** — docs/scripts only; MCP = custom instructions in `~/.grokbot/settings.json`

## Files touched

- `apps/scorpion/app/api/hive/`
- `apps/scorpion/manifest.json`
- `docs/hive/GROKBOT_ACCESS.md`
- `scripts/hive/philanthropy-hive-tools/hive.ts`
- `scripts/hive/n8n-catalog.json`
- `scripts/hive/philanthropy-hive-tools/`
- `scripts/hive/grokbot-setup-agents.py`
- `scripts/hive/philanthropy-hive-tools/route.ts`
- `scripts/hive/philanthropy-hive-tools/agent-roles.ts`
- `apps/scorpion/app/api/hive`
- `apps/scorpion/app/api/hive/register/route.ts`
- `apps/scorpion/app/api/hive/health/route.ts`
- `apps/scorpion/app/api/hive/missions/route.ts`
- `apps/scorpion/app/api/hive/golden-paths/route.ts`
- `apps/scorpion/app/api/hive/ce/queue/route.ts`
- `apps/scorpion/app/api/hive/ce/actions/route.ts`
- `apps/scorpion/app/api/hive/n8n/workflows/route.ts`
- `apps/scorpion/app/api/hive/n8n/executions/route.ts`
- `apps/scorpion/app/api/hive/obsidian/status/route.ts`
- `apps/scorpion/app/api/hive/outer-heaven/dna/route.ts`
- `apps/scorpion/lib/hive`
- `scripts/hive/grokbot-dispatch-missions.py`
- `apps/scorpion/lib/hive/ce-bridge.ts`
- `apps/scorpion/lib/hive/n8n-bridge.ts`
- `docs/hive/AGENT_TOOL_MATRIX.md`

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

- [[20260812-explore-the-n8n-cursor-monorepo-for-grok-bot-age-9b17084b|Explore the n8n-cursor monorepo for Grok Bot agent]]
- [[20260809-search-the-n8n-cursor-monorepo-for-how-client-en-178af42e|Search the n8n-cursor monorepo for how Client Engi]]
- [[20260809-search-the-n8n-cursor-monorepo-for-email-managem-579c6c89|Search the n8n-cursor monorepo for email managemen]]
- [[20260812-explore-users-evenslouis-n8n-cursor-scripts-hive-05164dbd|Explore /Users/evenslouis/n8n-cursor/scripts/hive/]]
- [[20260809-search-the-n8n-cursor-monorepo-for-twilio-eleven-5aa9f9d0|Search the n8n-cursor monorepo for Twilio, ElevenL]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
