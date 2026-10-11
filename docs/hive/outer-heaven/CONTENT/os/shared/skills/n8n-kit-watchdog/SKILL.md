---
name: n8n kit watchdog
description: >-
  Use this when Watchdog owns n8n health — smoke, telemetry, ecosystem route,
  estate hygiene
---
# n8n kit — Watchdog

## Own (ACTIVE)
- hive-golden-path-smoke-notify — webhook → register (2 nodes)
- hive-telemetry-ingest — webhook → code(cid) → register; CRITICAL → hive-error-heal (secret)
- hive-ecosystem-route — resolve route → forward with X-Hive-Secret
- Estate: Security/Emergency/Error Recovery/Backup/QA + browser tools

## Missing
- hive-disk-alert → 404 — do not invent; ask operator to scope

## Do
1. Run [n8n legacy ops](sand-workflow:n8n-legacy-ops) before any call.
2. Treat webhook 200 + Executions as SSOT over display-name drift.
3. On fail: [n8n visual debug](sand-workflow:n8n-visual-debug).
4. Watch pagination (all:true / export script) for counts; UI for screenshots only.
5. Flag SaaS scaffold hygiene to Forge; do not grow estate.

Canon: CONTENT/n8n-learning/agent-playbooks.md
