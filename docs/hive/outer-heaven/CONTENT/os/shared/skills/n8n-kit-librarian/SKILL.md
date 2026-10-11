---
name: n8n kit librarian
description: >-
  Use this when Librarian runs Outer Heaven report notify or chronicle glue —
  prefer brief.py reads; chronicle webhook unverified
---
# n8n kit — Librarian

## Own
- **ACTIVE FACT:** hive-outer-heaven-report-notify — POST `/webhook/hive-outer-heaven-report` + cron `0 14 * * 1` (Mon 14:00 UTC) → Fetch Golden Paths → Format Report → Telegram → Register Scorpion. cid `hive-report-*` or body.correlationId.
- **Repo JSON / UNVERIFIED live:** hive-chronicle-ingest — file `active:false`, not in live hive name list. Prefer `append-chronicle.sh` / `mine-transcripts.py` until Watchdog confirms alias. Shape: Normalize → Register → highSignal? → founder-signal (secret).

## Do
1. **Reads:** outer-heaven-brief.py + vault/cache — never Scorpion HTTP for memory; n8n = ingest/notify glue only.
2. [n8n legacy ops](sand-workflow:n8n-legacy-ops); on fail [n8n visual debug](sand-workflow:n8n-visual-debug).
3. Deep one-pager: CONTENT/n8n-learning/one-pagers/librarian.md
4. Never delete CHRONICLE entries; never paste X-Hive-Secret / Telegram tokens.

Canon: CONTENT/n8n-learning/agent-playbooks.md · one-pagers/librarian.md
