# Trendspotter paper pipeline (Phase 14)

**Repo:** `trendspotter-ai`  
**Lane:** `product_candidate`  
**Mode:** **paper only** — no live orders, no CE invoices, no Scout sessions as trade DB.

## Flow

```text
Source ingest → ticker extract → Kalshi overlap score → Trendspotter DB → paper ledger
                     ↓
              optional #trend (419) digest
```

## Components

| Piece | Requirement |
|-------|-------------|
| Source ingest | Scheduled job with retry/backoff |
| Ticker extraction | Persist tickers separately from CE leads |
| Overlap scoring | Kalshi-related scores; paper-only |
| Paper ledger | Virtual PnL; never calls spend/HITL money tools |
| Digest | Optional Telegram `#trend` (419) |
| Caps | Compose/CPU/disk caps so scraper cannot starve hive |

## HITL note

Live trading is **out of scope**. If ever considered:

1. Explicit registry + product-map PR  
2. HITL for any spend / exchange keys via n8n MCP broker  
3. Never silent-act from `#trend`

## Anti-overlap

| System | Relationship |
|--------|--------------|
| CE (`/pro`) | Not a lead/deal store |
| Scout topics | Not trade persistence |
| SENTINEL / Clearfield | Unrelated |
| LightningFlow | Parked; do not reuse as money path |

## Checklist

- [ ] Ingest job documented + failure/retry
- [ ] Scores land in Trendspotter DB daily
- [ ] Paper ledger has no live broker keys
- [ ] Resource caps verified on VPS
- [ ] README anti-overlap header current
- [ ] `/work` status updated via registry
- [ ] Optional `#trend` digest smoke (non-blocking)
