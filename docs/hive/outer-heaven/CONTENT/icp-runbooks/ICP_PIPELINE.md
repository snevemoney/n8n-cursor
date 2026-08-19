# ICP pipeline — stage mapping

**SSOT:** `CONTENT/watch-later/business-types.json` · `HUNT_LOG.md` · `BUSINESS_CATALOG.json` · `business-lanes.json` (operating only).

**Workflow spine (stages 1–10):** [WORKFLOWS.md](../ai-partner-scoring-prototype-ladder/WORKFLOWS.md)

| HUNT_LOG `stage` | WORKFLOWS stage | Enter when | Exit when |
|------------------|-----------------|------------|-----------|
| `discovered` | 1 Find | Today append (URL + leak) | MUST stub done |
| `qualified` | 2–5 Pack/POSITION/Economics | MUST = PASS or HOLD decided | margin + four-blank drafted |
| `ready` | 6 Draft approve | Warm draft in HITL queue | operator approves send |
| `delivering` | 7–8 Send/Delivery | Send approved / install started | proof live + case study stub |
| `parked` | — | MUST HOLD or disqualify | manual revive |

**Session focus:** `OPERATOR_FOCUS.json` — operator tags when ready. Lead Hunter hunts only when `icp_id` set.

## Catalog lifecycle

| state | meaning |
|-------|---------|
| `catalog` | SKU in registry |
| `researching` | Researcher packet in flight |
| `building` | Forge/Cursor building pilot |
| `operating` | lane in `business-lanes.json` + `product-state/{lane_id}.json` |

**Upgrade:** `catalog-lane-upgrade.py` — pilot PASS + `--operator-yes`. Only writer for new operating lanes.

```bash
python3 scripts/hive/catalog-lane-upgrade.py --sku-id <id> --dry-run
python3 scripts/hive/catalog-lane-upgrade.py --parent-model clip-factory --dry-run
python3 scripts/hive/catalog-lanes-sync-check.py
```

## Demand match (before website-offer-funnel)

```bash
python3 scripts/hive/catalog-demand-match.py --need "..."
```

Verdicts: USE · BUILD · RESEARCH · REFUSE · ASK. Handshake card includes plugin / terminal / browser / writer.

## SKU scaling

1. `catalog-combinator.py --write` (compatibility-filtered)
2. Winners → pilot → upgrade
3. Equal lanes — no priority field
4. Watch Later → steal sheet → catalog rows

## Register missing lanes

| Planned | Parent model | Pilot |
|---------|--------------|-------|
| `dropship` | `product-ad-from-photo` | `pilots/product-ad-from-photo/` |

Grandfathered: `ai-partner-websites`, `amazon-own-store`, `hive-os` (`pilot.status: grandfathered`).

## Stats

```bash
python3 scripts/hive/hunt-log-stats.py
python3 scripts/hive/os/outer-heaven-brief.py --agent "Big Boss" --hunt-stats
```
