# Consultant — n8n legacy one-pager
**Labels:** FACT = hive JSON + inactive inventory

## Role in estate
Meta-critique loop → directives for Forge staging PRs. **Do not fire while inactive.** Output ≠ prod deploy.

## Workflows you own (table)

| Live name | JSON file | Trigger | HITL | When to use | Status |
|-----------|-----------|---------|------|-------------|--------|
| Hive Meta Critique Notify | `meta-critique-notify.json` | POST `/webhook/hive-meta-critique` | **yes** | On-demand critique directive | INACTIVE **FACT** |
| Hive Sunday Meta Critique | `sunday-meta-critique.json` | cron `0 3 * * 1` (node: Sunday Night) | **yes** | Weekly critique + telemetry pulse | INACTIVE **FACT** |

## How they work (nodes — from JSON)

### meta-critique-notify.json
**Shape FACT:** Webhook → `Prepare Critique` → `Register Critique` → `Telegram Directive` → `Respond OK` (`status: need_hitl`).
- **Code FACT:** default repos `n8n-cursor`, `client-engine`, `philanthropy`; directive references `.hiverules` + `META_COGNITIVE_MANDATE.md`; CRITIQUE.md + `agent/meta-critique/${date}` staging PR.

### sunday-meta-critique.json
**Shape FACT:** Cron → `Prepare Critique` → Register → Telegram → `Telemetry Pulse` POST `/webhook/hive-telemetry-ingest` + secret.
- Extra FACT vs webhook variant: mogul-gate “delete 50% before code” in directive text; repos fixed list.

## Call recipe
**Do not call while inactive.** When operator activates:
```bash
curl -sS -X POST "https://evenslouis.ca/webhook/hive-meta-critique" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"correlationId":"critique-001","repos":["n8n-cursor","client-engine","philanthropy"]}'
```
Then Forge opens staging PR only — HITL Operator gates merge.

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Fire inactive critique webhooks “to test” without Tier 3 activate.
- Merge critique fixes to main from agents.
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
