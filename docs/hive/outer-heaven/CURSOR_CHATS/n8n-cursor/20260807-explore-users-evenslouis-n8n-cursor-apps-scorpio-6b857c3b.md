---
chatId: 6b857c3b-408d-495a-b0a8-567eafe8369c
workspace: n8n-cursor
source: cursor
title: "Explore /Users/evenslouis/n8n-cursor/apps/scorpion for AI/LLM model configuration: env vars, provider selection, fallbac"
updated: 2026-08-07T23:41:59.989453+00:00
messageCount: 12
archived: false
projects: ["[[PROJECTS/n8n-cursor]]"]
themes: ["[[THEMES/hive-mind]]", "[[THEMES/n8n-ops]]", "[[THEMES/scorpion-ops]]", "[[THEMES/client-engine-money]]"]
tags: [hive]
---

# Explore /Users/evenslouis/n8n-cursor/apps/scorpion for AI/LLM model configuration: env vars, provider selection, fallbac

**Workspace:** `n8n-cursor`  
**Chat ID:** `6b857c3b-408d-495a-b0a8-567eafe8369c`  
**Messages:** 12  
**Path:** `/Users/evenslouis/.cursor/projects/Users-evenslouis-n8n-cursor/agent-transcripts/973a02a9-3aec-4321-8b8d-324edd0be723/subagents/6b857c3b-408d-495a-b0a8-567eafe8369c.jsonl`

## What you asked

- Explore /Users/evenslouis/n8n-cursor/apps/scorpion for AI/LLM model configuration: env vars, provider selection, fallback logic, default models. Search for ANTHROPIC, OPENAI, claude, gpt, model names, fallback. Return: key files, current defaults, how to set primary=fallback, any existing multi-provider pattern.

## Assistant (excerpts)

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- [REDACTED]

---

- ## LLM Configuration in Scorpion

Scorpion has a **hybrid multi-provider stack** for chat/inference, plus a simpler **binary switch** in `@scorpion/core`. Anthropic/Claude is **not** part of the main inference path.

---

### Key files

| Role | Path |
|------|------|
| Central env config | `/Users/evenslouis/n8n-cursor/apps/scorpion/lib/config/llm-config.ts` |
| Health-based provider picker | `/Users/evenslouis/n8n-cursor/apps/scorpion/lib/utils/providerSelector.ts` |
| Cascading fallback runner | `/Users/evenslouis/n8n-cursor/apps/scorpion/lib/chat/modelRunner.ts` |
| Unified LLM wrapper | `

## Files touched

- `apps/scorpion`
- `apps/scorpion/lib/config/llm-config.ts`
- `apps/scorpion/lib/utils/providerSelector.ts`
- `apps/scorpion/lib/llm/unified-client.ts`
- `apps/scorpion/.env.example`
- `apps/scorpion/lib/chat/modelRunner.ts`
- `apps/scorpion/app/api/chat/stream/processStreamStart.ts`
- `apps/scorpion/lib/env-validation.ts`
- `apps/scorpion/server/orchestrator/plannerModel.ts`
- `apps/scorpion/docs/HYBRID_AI_STACK.md`
- `apps/scorpion/app/api/chat/route.ts`
- `apps/scorpion/lib/chat/types.ts`
- `apps/scorpion/lib/integrations/saas-connectors.ts`
- `apps/scorpion/README.md`
- `apps/scorpion/app/`
- `apps/scorpion/lib/utils/modelSelector.ts`
- `apps/scorpion/server/system/preflight.ts`
- `apps/scorpion/lib/chat/chatStore.ts`
- `apps/scorpion/app/api/llm/providers/route.ts`
- `apps/scorpion/scripts/test-providers.ts`
- `apps/scorpion/app/api/chat/stream/helpers/orchestratorSetup.ts`
- `apps/scorpion/app/api/ops/pipeline/_adapters.ts`
- `apps/scorpion/k8s/README.md`

<!-- link-cursor-chats:managed -->
## Related projects

- [[PROJECTS/n8n-cursor]]

## Related themes

- [[THEMES/hive-mind]]
- [[THEMES/n8n-ops]]
- [[THEMES/scorpion-ops]]
- [[THEMES/client-engine-money]]

## Related chats

- [[20260809-search-the-n8n-cursor-monorepo-for-twilio-eleven-5aa9f9d0|Search the n8n-cursor monorepo for Twilio, ElevenL]]
- [[20260807-search-for-ai-model-configuration-in-1.-users-ev-0d699541|Search for AI model configuration in: 1. /Users/ev]]
- [[20260809-search-the-n8n-cursor-monorepo-for-how-client-en-178af42e|Search the n8n-cursor monorepo for how Client Engi]]
- [[20260811-explore-users-evenslouis-n8n-cursor-for-existing-51ed4b66|Explore /Users/evenslouis/n8n-cursor for existing ]]
- [[20260812-explore-the-n8n-cursor-monorepo-for-grok-bot-too-01c1b0fb|Explore the n8n-cursor monorepo for Grok Bot tools]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
- [[HIVEMIND_DNA]]
<!-- /link-cursor-chats:managed -->
