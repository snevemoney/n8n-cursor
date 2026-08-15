# Communications Manager — n8n legacy one-pager
**Labels:** FACT = inventory names · UNVERIFIED nodes (no hive JSON for these)

## Role in estate
Operator email notify + inbound reply agent. Client-facing send always Tier 3. Support webhook inactive until HITL revive.

## Workflows you own (table)

| Live name | JSON file | Trigger | HITL | When to use | Status |
|-----------|-----------|---------|------|-------------|--------|
| Email Notification System | *(no hive JSON)* | catalog `/webhook/notifications/email` | no* | Operator notify fallback | ACTIVE **FACT** name |
| Evens Louis Email Reply Agent | *(no hive JSON)* | *(UI/API)* | caution | Inbound reply automation | ACTIVE **FACT** name; nodes **UNVERIFIED** |
| Support Agent Webhook | *(no hive JSON)* | catalog `/webhook/support-agent` | **yes** | Support; operatorConfirm | INACTIVE **FACT** |

\* Operator notify only — never client email without Tier 3. Inactive nearby (**FACT** names): Gmail AI Email Manager, 🤖Email Agent, GPT-5 Support Agent — revive only with HITL.

## How they work (nodes — from JSON)
**No `workflows/hive/*.json` for these.** Catalog schemas only:
- `evens-email-notify` input: `{ to?, subject, body, correlationId? }`
- `evens-support-agent` input: `{ query, category?, correlationId? }` → HITL
**INFERENCE:** Treat as email bus; screenshot canvas before any change.

## Call recipe
```bash
# Operator notify only
curl -sS -X POST "https://evenslouis.ca/webhook/notifications/email" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"correlationId":"mail-001","subject":"Ops notice","body":"Watchdog ping — operator only"}'
```
**Prefer:** Grok Gmail plugin for real inbox work.

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Client send / marketing blast via these flows without Tier 3.
- Activate Support Agent without HITL Operator.
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
