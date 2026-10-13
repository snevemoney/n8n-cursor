# Jarvis (Mac + Hostinger)
**Where:** repo `~/jarvis-int` (pnpm monorepo: apps/agent-stack {brain, memory, face, hands}, mcp, workflows). Face UI/Orb at `127.0.0.1:4018` — **one owner at a time** (ACTIVE_TASKS; recently Grok Consultant). n8n at `https://evenslouis.ca/n8n` (Hostinger).
**Shared-context loader:** `apps/agent-stack/brain/shared_context.py` loads `JARVIS_CONTEXT.md` (+`AGENT_RULES.md`) from `JARVIS_SHARED_DIR` (default `~/.grok-shared` → brain mirror `docs/hive/outer-heaven/CONTENT/os/shared`). Retrieval over MAC_SHARED_MEMORY/SHARED_MEMORY/ACTIVE_TASKS; never reads CURRENT_STATE or SECURITY_TODO. **The atlas is wired by a pointer block in `JARVIS_CONTEXT.md`** (this PR); no loader code or Face change.
**Spec:** "One Jarvis, many temporary workers" (jarvis-one-mind-20261011): verified autonomous completion, explicit authority, independent verification, zero false success. PR 614 (One-Mind) is a draft.
**Routing:** `jev-route "<task>" jarvis`. **GitHub:** none; Jarvis doesn't push.
**Strengths:** voice conversation, mission controller, memory retrieval, single front door for Evens.
**Limits:** "talk wire dark" incidents; multiple Face starts from different trees caused conflicts *(recap)*; can't do creative/code work itself — it dispatches.
