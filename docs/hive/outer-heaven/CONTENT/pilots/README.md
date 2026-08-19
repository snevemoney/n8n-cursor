# Pilots — proof before lane upgrade

**Gate:** `scripts/hive/catalog-lane-upgrade.py` checks pilot status on **`parent_model_id`** (inherits across SKU variants).

## Layout

```
CONTENT/pilots/{parent_model_id}/
  PILOT.md          # status, scope, evidence links
  evidence/         # screenshots, logs (public-safe only)
```

## PILOT.md template

```markdown
# Pilot — {parent_model_id}

status: PENDING | PASS | FAIL
operator: Evens Louis
started: YYYY-MM-DD
parent_model_id: {id}

## Scope
One end-to-end loop proving the machine works with our stack (Cursor + Grok).

## Evidence
- [ ] Tool/plugin used (Higgsfield, browser, etc.)
- [ ] Artifact path or URL (no localhost in client drafts)
- [ ] Operator sign-off line

## Sign-off
Operator yes required for upgrade regardless of automated PASS.
```

## Status values

| status | meaning |
|--------|---------|
| `PENDING` | in progress |
| `PASS` | evidence complete — eligible for upgrade with operator yes |
| `FAIL` | do not upgrade — fix or kill SKU |
| `grandfathered` | pre-catalog lanes (ai-partner-websites, amazon-own-store, hive-os) |

## Existing pilots

| parent_model_id | path | status |
|-----------------|------|--------|
| product-ad-from-photo | `product-ad-from-photo/` | PENDING — Higgsfield smoke |
| private-book-install | *(use speed-to-lead demo)* | grandfathered via ai-partner lane |

## Commands

```bash
# Dry-run upgrade
python3 scripts/hive/catalog-lane-upgrade.py --sku-id product-ad-from-photo__dropship__remote --dry-run

# After pilot PASS + operator yes
python3 scripts/hive/catalog-lane-upgrade.py --sku-id <id> --operator-yes
```
