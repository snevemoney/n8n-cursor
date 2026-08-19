---
name: catalog-demand-match
description: Match operator need to catalog SKU or operating lane — USE BUILD RESEARCH REFUSE ASK.
---

# Catalog demand match

**When:** Operator asks for a capability, business idea, or "can we do X?" that may not map to an existing lane.

## Command

```bash
python3 scripts/hive/catalog-demand-match.py --need "operator need in natural language"
```

## Verdicts

| Verdict | Action |
|---------|--------|
| USE | Run existing operating lane — no duplicate business |
| BUILD | Catalog SKU exists — pilot → `catalog-lane-upgrade.py` after PASS + operator yes |
| RESEARCH | Researcher packet + catalog `lifecycle=researching` |
| REFUSE | Kill list — stop |
| ASK | One clarifying question (ask-principal) |

## SSOT

- `docs/hive/outer-heaven/CONTENT/BUSINESS_CATALOG.json`
- `scripts/hive/business-lanes.json` (operating only)
- `docs/hive/outer-heaven/CONTENT/pilots/README.md`

## Handshake card (BUILD path)

Script output includes:
- **plugin** — ok | missing | check Higgsfield authorized
- **terminal** — commands to run (upgrade dry-run, dev server)
- **browser** — fallback URLs
- **writer** — Cursor/Mac local-exec commits; Grok cloud recommends only

Run demand-match **before** `website-offer-funnel` on unmapped needs.

## Never

Add `business-lanes.json` row from chat · invent lane without catalog entry · skip pilot gate.
