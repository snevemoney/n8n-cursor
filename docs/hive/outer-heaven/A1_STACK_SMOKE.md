# A1 stack smoke — Phase 0 checklist

**Date:** 2026-08-13  
**Stack:** Cursor + Grok Bot (17 agents). HITL on send/pay/deploy.

## Tier 0 — capture (autonomous)

| Check | Command / evidence | Status |
|-------|-------------------|--------|
| launchd plists installed | `ls ~/Library/LaunchAgents/com.hive.*.plist` | PASS |
| last-capture fresh | `docs/hive/outer-heaven/last-capture.json` | PASS (2026-08-13) |
| outer-heaven-sync | `launchctl kickstart gui/$UID/com.hive.outer-heaven-sync` | PASS |

## Tier 1 — brief + state

| Check | Command | Status |
|-------|---------|--------|
| Brief self-test | `python3 scripts/hive/os/outer-heaven-brief.py --self-test` | PASS |
| Product state | `python3 scripts/hive/product-state.py --list` | run weekly |
| Upgrade dry-run (test SKU) | `catalog-lane-upgrade.py --sku-id … --dry-run --operator-yes` | PASS (blocks until pilot PASS) |
| Lanes sync check | `catalog-lanes-sync-check.py` | PASS |
| Tool inventory | `agent-tool-inventory.py --check` | PASS |
| Capture cycle | `run-capture-cycle.sh` | run after hunt rows |
| Catalog SSOT | `docs/hive/outer-heaven/CONTENT/BUSINESS_CATALOG.json` (500 SKUs) | PASS |

## Tier 2 — Grok routines

| Check | Command | Status |
|-------|---------|--------|
| Routines build | `python3 scripts/hive/build-grok-agent-routines.py --write --validate` | PASS |
| Force-update Grok cloud | `python3 scripts/hive/grokbot-setup-routines.py --core --force-update` | PASS (17 routines) |
| Agent reprovision | `python3 scripts/hive/grokbot-setup-agents.py` | run after agent config edits |

## Tier 3 — operator hands (20hr/week)

| Check | Notes | Status |
|-------|-------|--------|
| OPERATOR_FOCUS | `local-pro` + Greater Montreal | PASS |
| HUNT_LOG stage column | 3 Montreal trade URLs | PASS |
| Pilot product-ad-from-photo | Higgsfield smoke | PENDING |
| STL public proof | PR #39 branch `cursor/speed-to-lead-demo-1592` — merge then Vercel | BLOCKED on merge |

## VPS watchdog

| Check | Notes | Status |
|-------|-------|--------|
| SSH brief | `outer-heaven-brief.py --source vps` | optional |
| Disk ~94% | Watchdog alert — cleanup when operator available | WARN |

## Demand match smoke

```bash
python3 scripts/hive/catalog-demand-match.py --need "dropship product ads from photos"
python3 scripts/hive/catalog-demand-match.py --need "plumber missed call booking montreal"
```

Expected: BUILD or USE — never invent lane from chat.
