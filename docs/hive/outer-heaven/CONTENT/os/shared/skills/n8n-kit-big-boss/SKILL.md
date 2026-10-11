---
name: n8n kit big-boss
description: >-
  Use this when Big Boss uses n8n digests, founder-signal, toolbox, or master
  orchestrator
---
# n8n kit — Big Boss

## Own (ACTIVE)
- hive-daily-operational-digest — cron → fetch missions/GP → build → register
- hive-founder-signal-ingest — webhook → register; may forward predictive (inactive draft)
- hive-execute-tool / toolbox-router — JSON-RPC → invoke (secret); failover → error-heal
- evens-master-orchestrator — HITL for paid/client paths
- hive-operator-digest — JSON digest feed (fallback; prefer Grok morning brief)

## Do
1. [n8n legacy ops](sand-workflow:n8n-legacy-ops). Morning = Grok brief first; n8n digest = fallback feed.
2. Pass correlationId on toolbox / founder-signal calls.
3. Master orchestrator paid/client → HITL Operator; never auto-execute Tier 3.
4. Failures → [n8n visual debug](sand-workflow:n8n-visual-debug).

Canon: CONTENT/n8n-learning/agent-playbooks.md
