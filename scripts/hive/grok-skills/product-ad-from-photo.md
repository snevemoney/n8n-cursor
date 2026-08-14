---
name: product-ad-from-photo
description: UGC product ad from one photo via Higgsfield plugin. Dropship and Amazon lanes. HITL on spend and publish.
---

# Product ad from photo

**Machine:** `product-ad-from-photo` · **Pilot:** `CONTENT/pilots/product-ad-from-photo/`

## When
Operator needs ads/UGC for dropship or Amazon SKU without an ads business lane yet.

## Handshake
1. `python3 scripts/hive/catalog-demand-match.py --need "product ads from photo"`
2. **Plugin:** Higgsfield authorized on Grok bot (HITL OAuth) — else browser https://higgsfield.ai
3. **Writer:** Cursor commits assets to `CONTENT/creative/`

## Steps
1. Operator provides product photo (or catalog sample).
2. Creative Studio: Higgsfield still + 6s clip.
3. Save output to evidence folder; update PILOT.md checklist.
4. Watchdog: open asset path (not localhost in client drafts).

## Upgrade (after pilot PASS + operator yes)
```bash
python3 scripts/hive/catalog-lane-upgrade.py --parent-model product-ad-from-photo --operator-yes
```

## HITL (never autonomous)
- Ad spend · Meta/TikTok connect · publish to paid channels

## Never
New portfolio lane from chat · fake revenue claims · skip pilot gate
