---
name: catalog-demand-match
description: Match operator need to catalog SKU or operating lane — USE BUILD RESEARCH REFUSE ASK.
---

# Catalog demand match (Cursor)

Run:

```bash
python3 scripts/hive/catalog-demand-match.py --need "..."
python3 scripts/hive/catalog-demand-match.py --need "..." --format text
python3 scripts/hive/catalog-demand-match.py --self-test
```

Follow verdict per `scripts/hive/grok-skills/catalog-demand-match.md`. Handshake includes plugin/terminal/browser/writer. Upgrade only via `catalog-lane-upgrade.py --operator-yes` after pilot PASS.

## Verdicts

| Verdict | When |
|---------|------|
| USE | Operating lane (`lifecycle=operating` / active `lane_id`) |
| BUILD | Ready catalog SKU with a real path — handshake, not a live hunt |
| RESEARCH | Combinator / thin / `lane_id=null` without a ready path (`catalog-not-operating`), or no row |
| REFUSE | Kill list. `--format text` prints `NEXT:` and exits 0 |
| ASK | Too vague (who / outcome / channel) |

## Routing (do not steal the plumber SKU)

- `local-clinic` / dental / review-to-book → `review-to-book__local-clinic`
- `restaurant` book → `missed-call-book__restaurant`
- `owner-coach-fitness` → `private-book-install__owner-coach-fitness`
- `law-adj` → `private-book-install__law-adj`
- plumber / HVAC → `private-book-install__local-pro`
- Path C waitlist / our page / Stripe / paid-slice → `paid-slice__us` (never `list-anneal`)
- Combinator cross-ICP (e.g. review-to-book × dropship) → RESEARCH, not BUILD

## Kill (REFUSE)

OFM · IG farm · betting / Polymarket · auto-dial · “I do AI” · generic landing · Client Pack fork · “how I make $85K” / YouTube RPM proof · job-loss % as FACT · mass-DM / mass-DM seduction (even without OFM).
