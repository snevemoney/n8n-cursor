# n8n Learning Packet — Index

**Audience:** Watchdog · Forge · Librarian · agents with map rows  
**Role of n8n:** LEGACY FALLBACK — Grok-first; not the daily console.  
**Captured:** 2026-08-12 · Researcher + Watchdog

## Truth inventory

| Metric | Value |
|--------|-------|
| API total | **177** (incl **17 archived**) |
| UI non-archived | **160** |
| Active / inactive | **69** / **108** |
| Prod fail rate | **3.2%** (57 failed / 1759 exec) |

Pagination bug fixed (`limit=30` without cursor). Archived explains UI 160 vs API 177. Treat `[ARCHIVED]` as non-callable even if `active=true`.

Regenerate: `python3 scripts/hive/n8n-export-workflow-inventory.py --write`

## Files

| Path | Purpose |
|------|---------|
| [n8n-learning-packet.md](./n8n-learning-packet.md) | When to use n8n vs Grok |
| [agent-workflow-map.md](./agent-workflow-map.md) | Catalog→agent + Visual debug SOP |
| [full-estate-agent-map.md](./full-estate-agent-map.md) | Estate→agent map + fold metrics |
| [agent-playbooks.md](./agent-playbooks.md) | Per-agent node lessons + kits (deepened) |
| [one-pagers/INDEX.md](./one-pagers/INDEX.md) | JSON-deep per-agent one-pagers |
| [rest-full-177.md](./rest-full-177.md) | Full REST dump (177 rows) |
| [live-workflow-inventory.md](./live-workflow-inventory.md) / `.json` | Export inventory |
| [ui-workflow-inventory-160.md](./ui-workflow-inventory-160.md) | UI non-archived view (optional) |

## Librarian owns

- `hive-outer-heaven-report-notify` (ACTIVE)
- `hive-chronicle-ingest` (verify live alias)

Reads via `outer-heaven-brief.py`; n8n = ingest/notify glue only.

## Sacred

evenslouis.ca/n8n only · never n8ncloud · never wipe n8n_data · no greenfield without operator
