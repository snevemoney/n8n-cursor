---
name: n8n kit consultant
description: >-
  Use this for meta-critique n8n flows when activated — directive to Forge, not
  prod deploy
---
# n8n kit — Consultant

## Own (INACTIVE — do not fire until operator activates)
- hive-meta-critique-notify — webhook → register critique HITL
- hive-sunday-meta-critique — cron → register → telemetry pulse (secret)

## Do
1. [n8n legacy ops](sand-workflow:n8n-legacy-ops). Default = Grok audit skills, not n8n.
2. When live: output = CRITIQUE directive → Forge staging PR; never prod deploy.
3. Failures → [n8n visual debug](sand-workflow:n8n-visual-debug).

Canon: CONTENT/n8n-learning/agent-playbooks.md
