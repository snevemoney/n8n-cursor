---
name: n8n kit comms
description: >-
  Use this for operator email notify/reply n8n flows — never client send without
  Tier 3
---
# n8n kit — Communications Manager

## Own
- Email Notification System (ACTIVE) — operator notify fallback only
- Evens Louis Email Reply Agent (ACTIVE)
- Support Agent Webhook (INACTIVE) — revive only with HITL

## Do
1. Prefer Grok Gmail plugin (read/draft). n8n = fallback.
2. [n8n legacy ops](sand-workflow:n8n-legacy-ops).
3. Never send client email/SMS without Tier 3 HITL.
4. Failures → [n8n visual debug](sand-workflow:n8n-visual-debug).

Canon: CONTENT/n8n-learning/agent-playbooks.md
