---
domain: business
status: verified
correlationId: oh-bootstrap
survival_score: high
last_verified: 2026-08-11
apps_used: [grok, cursor]
---

# Life & business ops smoke (8/8)

Verify hive automation health on VPS without Tier 3 actions.

## Steps

1. SSH read-only: `ssh -o BatchMode=yes root@69.62.66.78`
2. Run: `cd /root/domain-paths/n8n-cursor && bash scripts/hive/smoke-life-business-ops.sh`
3. Expect **8/8 PASS**
4. Golden paths: `curl -sS https://evenslouis.ca/scorpion/api/hive/golden-paths`

## When to use

- After n8n/CE/Philanthropy changes
- Watchdog or Life & Business Ops missions
- Before claiming "hive is healthy"

Tag chronicle: `business-hours`, `ops`
