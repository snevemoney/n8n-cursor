# Golden Paths — Severity & Lifecycle

Golden paths are operational health signals checked by the Watchdog heartbeat system.
Each path has a **severity** and a **lifecycle** that determines how it affects scoring.

## Scoring Rules

| Severity | Lifecycle | Counts toward hard pass? | Fails heartbeat? |
|----------|-----------|--------------------------|-------------------|
| hard     | active    | Yes                      | Yes               |
| soft     | active    | No                       | No (warning only) |
| hard     | legacy    | No                       | No                |
| soft     | legacy    | No                       | No                |
| *        | retired   | No (hidden)              | No                |

## Current Paths

| Path | Name | Severity | Lifecycle | Notes |
|------|------|----------|-----------|-------|
| G1   | Telegram daily report posted in 24h | **soft** | **legacy** | Operator decision: Telegram is a legacy tool lane. Reports may arrive via other channels. |
| G2   | Scorpion /healthz returns 200 | hard | active | |
| G3   | n8n instance reachable | hard | active | |
| G4   | CE service responds | hard | active | |
| G5   | Golden-path smoke webhook registers OK | hard | active | |

## G1 Demotion Rationale

As of 2025-06, Telegram is classified as a **legacy tool lane** by operator decision.
The daily Telegram report is no longer the canonical channel for operational health
confirmations. Missing a Telegram report within 24h does not indicate an operational
failure — it may simply mean the report was delivered via another channel or the
Telegram integration is intentionally deprioritized.

**Before**: G1 failure counted as a hard fail → Watchdog heartbeat failed → false alert.
**After**: G1 is soft/legacy → appears in reports as `⚠️` but does NOT fail heartbeats.

## Configuration

Path metadata is defined in:
```
scripts/hive/philanthropy-hive-tools/golden-paths.config.ts
```

The config is consumed by `formatGoldenPathReport()` in `hive.ts` which computes
`hardPassCount` (only hard+active paths) for Watchdog scoring.

## Adding or Changing Paths

1. Edit `golden-paths.config.ts` — add/modify the entry in `GOLDEN_PATHS_CONFIG`
2. Set `severity` and `lifecycle` appropriately
3. Deploy to `/opt/philanthropy` via the standard upgrade path
4. Verify via `hive_send_report` tool — the response now includes `softExcluded` array
