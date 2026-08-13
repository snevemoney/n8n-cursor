# Obsidian command center (Scorpion context engine)

**Obsidian is not a diary.** It is the hive's **relational context database** — plain Markdown on disk that Claude Code, OpenClaw, and n8n read/write without cloud API friction.

Tier 3 unchanged: vault triggers **propose** on staging; prod activate = operator. See [HARD_RULES.md](../wip-program/HARD_RULES.md).

## Vault layout (mogul standard)

Bootstrap:

```bash
export HIVE_OBSIDIAN_VAULT=~/My_Billion_Dollar_Vault
bash scripts/hive/obsidian-vault-bootstrap.sh
```

```
My_Billion_Dollar_Vault/
├── 01_Strategic_Intent/     # Brain dumps, [[wikilink]] graph, business logic
├── 02_System_Manifests/     # Live mirrors of manifest.json (sync script)
├── 03_Telemetry_Logs/       # n8n / scripts append daily health rows
├── 04_Automation_Triggers/  # Hot-folder — drop .md → hive-founder-signal
└── Canvas/                  # .canvas JSON blueprints → n8n draft sketches
```

## 1. Graph matrix → code generator

- Use `[[Note Name]]` links between concepts (e.g. `[[User Billing System]]` → `[[Stripe API]]`).
- Agents read the vault folder directly — no Notion API.

```bash
# Build wikilink index for agents (JSON adjacency list)
node scripts/hive/obsidian/build-graph-index.mjs "$HIVE_OBSIDIAN_VAULT"
# → .hive/graph-index.json in vault
```

Point Cursor / OpenClaw at vault + `.hive/graph-index.json` for full mental model in seconds.

## 2. Frontmatter + Dataview dashboards

Every app/workflow gets a **tracking note** in `02_System_Manifests/`:

```yaml
---
app_id: billing_service
status: operational
last_test_run: 2026-08-08T00:05:00Z
health_rating: 98
current_bottleneck: "Stripe API rate limit threshold near 85%"
correlationId: ""
---
```

n8n or CI updates frontmatter after tests/failures:

```bash
bash scripts/hive/obsidian/update-frontmatter.sh \
  "$HIVE_OBSIDIAN_VAULT/02_System_Manifests/n8n-cursor.md" \
  health_rating=95 last_test_run="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

Install [Dataview](https://github.com/blacksmithgu/obsidian-dataview) in Obsidian — query `TABLE status, health_rating FROM "02_System_Manifests"`.

## 3. Canvas → programmatic blueprint

Obsidian Canvas saves as JSON (`.canvas`). Parse to flow edges:

```bash
node scripts/hive/obsidian/parse-canvas.mjs \
  "$HIVE_OBSIDIAN_VAULT/Canvas/billing-flow.canvas" \
  --emit founder-signal | bash scripts/hive/obsidian/post-founder-signal.sh
```

Maps visual cards → `hive-predictive-construct` thesis + node list (staging draft only).

## 4. Hot-folder trigger protocol

**Mogul action:** Drop strategy text into `04_Automation_Triggers/`.

**Automation:**

```bash
# Mac (fswatch) or Linux (inotifywait) — runs on operator machine
export HIVE_OBSIDIAN_VAULT=~/My_Billion_Dollar_Vault
export HIVE_WEBHOOK_SECRET=...
bash scripts/hive/obsidian/watch-triggers.sh
```

Each new/changed `.md` in triggers → `hive-founder-signal` → meta-cognitive loop → optional predictive draft.

Manual one-shot:

```bash
bash scripts/hive/obsidian/ingest-trigger-file.sh \
  "$HIVE_OBSIDIAN_VAULT/04_Automation_Triggers/launch-campaign.md"
```

## 5. Manifest sync (02_System_Manifests)

Keep vault mirrors of repo manifests:

```bash
bash scripts/hive/obsidian/sync-manifests-to-vault.sh
```

Runs from hub repo; writes Markdown + YAML frontmatter from `manifest.json` + `manifests/external/*`.

## Wiring to meta-cognitive loop

| Vault action | Hive webhook | Register jobType |
|--------------|--------------|------------------|
| Trigger file dropped | `hive-founder-signal` | `founder.signal.ingested` |
| Canvas parsed | `hive-predictive-construct` | `product.predictive_infrastructure.proposed` |
| Telemetry frontmatter update | local only (+ optional register via script) | `telemetry.obsidian.updated` |

See [META_COGNITIVE_LOOP.md](./META_COGNITIVE_LOOP.md) · [META_COGNITIVE_MANDATE.md](./META_COGNITIVE_MANDATE.md)

## Operator setup checklist

- [ ] Bootstrap vault path (`HIVE_OBSIDIAN_VAULT`)
- [ ] Dataview plugin in Obsidian
- [ ] `watch-triggers.sh` in tmux/systemd on machine with vault
- [ ] Weekly `sync-manifests-to-vault.sh` cron
- [ ] OpenClaw workspace pointer to vault (read-only paths in TOOLS.md)

## Forbidden

- Storing secrets/API keys in vault notes (use env + broker)
- Auto-activate prod n8n from canvas parse
- Chat agents merging to `main` from vault triggers
