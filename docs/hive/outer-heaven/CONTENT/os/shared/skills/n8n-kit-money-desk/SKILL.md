---
name: n8n kit money-desk
description: >-
  Use this for hive revenue-sensor hourly — prefer Python sensors; no autonomous
  treasury
---
# n8n kit — Money Desk

## Own (ACTIVE)
- hive-revenue-sensor-hourly — cron → fetch golden paths → code → register hypothesis (HITL-ish)

## Prefer
- `hive-revenue-sensors.py` when available over n8n cron

## Do
1. [n8n legacy ops](sand-workflow:n8n-legacy-ops).
2. No autonomous treasury / send / pricing changes — Tier 3.
3. CE lead money implications → HITL Operator + Lead Hunter.
4. Failures → [n8n visual debug](sand-workflow:n8n-visual-debug).

Canon: CONTENT/n8n-learning/agent-playbooks.md
