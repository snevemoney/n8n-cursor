---
name: n8n kit hitl
description: >-
  Use this when gating HITL n8n paths — CE leads, heal merge, predictive
  activate, client send
---
# n8n kit — HITL Operator

## Gate these
- hive-ce-lead-notify / phase9-pipedrive-lead
- hive-error-heal-notify (merge)
- hive-predictive-construct (activate)
- evens-elevenlabs-post-call (client)
- evens-master-orchestrator (paid/client)
- Any proposal to activate an INACTIVE workflow

## Do
1. Surface decision in Grok chat; never auto-approve money/send/deploy/secrets.
2. /pro only when a formal queue item exists.
3. Confirm agent used [n8n legacy ops](sand-workflow:n8n-legacy-ops) and screenshots if failure-related.
4. Zero-loss sacred rules still apply after approval.

Canon: CONTENT/n8n-learning/agent-playbooks.md
