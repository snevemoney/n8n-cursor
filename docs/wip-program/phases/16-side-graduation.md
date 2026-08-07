# Phase 16 — Side WIP graduation board

**Macro:** Explicit promote / keep side / archive for every side surface.

**Refs:** `packages/shared-config/src/repo-registry.ts`, `product-registry.ts`, `/work` catalog, [PROMOTION_CHECKLIST.md](../PROMOTION_CHECKLIST.md), side repos: `autoflow-finance`, `book-reimagined`, `quick-list-hub-42`, Lovable harness

**Exit:** No undecided side WIP; registry matches reality.

## Explicit decisions (locked for this phase)

| Surface | Repo | Decision | Notes |
|---------|------|----------|-------|
| AutoFlow | `autoflow-finance` | **`keep_side`** | Remains side_wip; not CE money OS |
| Bookflix | `book-reimagined` | **`keep_side`** | Remains side_wip; ≠ ClipEngine |
| QuickMarket | `quick-list-hub-42` | **`keep_side`** | Remains side_wip; payments demo-only |
| Lovable | harness / leftover | **`keep_harness_no_path`** | `NO_PATH`; no apex route; not a product |

### Graduation criteria (must all be true to promote later)

**AutoFlow → promote only if:** OCR demo reproducible; clear non-overlap with CE (`/pro`) money OS; HITL for any bank/move; registry PR to `product_candidate` or `hive_capability`; own-domain plan if public.

**Bookflix → promote only if:** scenes pipeline demo; IP/rights notes filed; proven ≠ ClipEngine and ≠ `#creator`; registry PR + `/work` update.

**QuickMarket → promote only if:** listing/messaging demo; payments stay demo until HITL policy written; registry PR; own-domain if public.

**Lovable → promote only if:** explicit product brief + registry PR removing `NO_PATH`; until then keep harness, no path on `evenslouis.ca`.

## Micro-tasks

- [ ] AutoFlow: OCR demo status written (pass/fail + date)
- [ ] AutoFlow: graduation criteria vs CE money OS reviewed; decision **`keep_side`** recorded
- [ ] AutoFlow: decision written into `repo-registry.ts` (lane `side_wip`, maturity note)
- [ ] Bookflix: scenes pipeline demo status written
- [ ] Bookflix: IP/rights notes + decision **`keep_side`** in registry
- [ ] QuickMarket: listing/messaging demo status written
- [ ] QuickMarket: payments remain demo until HITL policy — decision **`keep_side`** in registry
- [ ] Lovable harness: record **`keep_harness_no_path`** (`NO_PATH`); do not add apex route
- [ ] Optional only: reopen secret-scrub if operator explicitly wants history purge + key rotation
- [ ] `/work` copy updated for each decision
- [ ] README headers updated if lane/maturity text changes (`docs/patches/github-hygiene/headers/`)
- [ ] Promotion checklist for future repos added ([PROMOTION_CHECKLIST.md](../PROMOTION_CHECKLIST.md))
