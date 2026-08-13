# INBOX — cross-app chat drop zone

Paste exports from **ChatGPT, Claude, or any AI app** here.

## Frontmatter (optional)

```yaml
---
source: chatgpt
domain: business
businessHours: true
tags: [lead-gen, ce]
---
Your pasted conversation...
```

## Flow

1. Drop `.md` file here (or use Mac Shortcut — see `docs/hive/runbooks/outer-heaven-mac-shortcut.md`)
2. Run `python3 scripts/hive/outer-heaven/ingest-inbox.py` or `watch-inbox.sh`
3. File moves to `INBOX/processed/` after chronicle append
4. Reusable workflows may draft `METHODS/draft-*.md`

**No secrets in inbox files.**
