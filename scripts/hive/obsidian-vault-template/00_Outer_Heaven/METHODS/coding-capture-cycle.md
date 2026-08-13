---
domain: coding
status: verified
correlationId: oh-bootstrap
survival_score: high
last_verified: 2026-08-11
apps_used: [cursor]
---

# Outer Heaven capture cycle

Keep the living library synced across Obsidian and git.

## Steps

```bash
cd ~/n8n-cursor
bash scripts/hive/outer-heaven/run-capture-cycle.sh
```

Or individually:

```bash
python3 scripts/hive/outer-heaven/mine-transcripts.py
python3 scripts/hive/outer-heaven/ingest-inbox.py
bash scripts/hive/outer-heaven/sync-vault-to-git.sh
```

## When to use

- End of coding session
- After pasting chats to INBOX from ChatGPT/Claude
- Every 15 min via launchd (optional)

Tag chronicle: `business-hours` when business-related
