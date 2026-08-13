# Automation Triggers (hot-folder)

Drop any `.md` file here to fire the hive meta-cognitive loop.

## Watcher

```bash
export HIVE_OBSIDIAN_VAULT=/path/to/vault
export HIVE_WEBHOOK_SECRET=...
bash scripts/hive/obsidian/watch-triggers.sh
```

## One-shot

```bash
bash scripts/hive/obsidian/ingest-trigger-file.sh ./my-strategy.md
```

Flow: file → `hive-founder-signal` → optional `hive-predictive-construct` (inactive n8n draft) → Telegram #alerts.

**No secrets in trigger files.**
