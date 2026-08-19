# Product GTM — n8n legacy one-pager
**Labels:** FACT = hive JSON inactive · INFERENCE = suppress loud GTM

## Role in estate
Predictive draft injector only — **inactive**. Suppress loud GTM until offer validated. Planned `hive-feature-priority-rank` — prefer scripts.

## Workflows you own (table)

| Live name | JSON file | Trigger | HITL | When to use | Status |
|-----------|-----------|---------|------|-------------|--------|
| Hive Predictive Construct | `predictive-construct.json` | POST `/webhook/hive-predictive-construct` | **yes** | Draft-only n8n workflow inject | INACTIVE **FACT** |
| hive-feature-priority-rank | *(planned)* | `/webhook/hive-feature-rank` | no | Planned | NOT live **FACT** |

Inactive content/social pipelines (estate **INFERENCE** → Publishing Engine when scoped): auto post, YouTube trend, Ads to video, viral ads — do not treat as Product GTM daily tools. AI Automation Agency onboarding/delivery inactive → Consultant + GTM templates only.

## How they work (nodes — from JSON)

### predictive-construct.json — *Hive Predictive Construct*
**Shape FACT:** `Predictive Webhook` → `Build Draft` → `Inject n8n Draft` (POST `$env.N8N_API_URL || https://evenslouis.ca/n8n/api/v1` + `/workflows`) → `Register HITL` → `Telegram Propose` → `Respond OK` (`status: need_hitl`).
- **Code FACT:** builds inactive draft workflow with sticky note + stub webhook `hive-draft-${slug}`; draftName `DRAFT_PENDING_REVIEW: …`; text says “Never auto prod deploy”; Forge branch `agent/predictive/${cid}`.
- Upstream: founder-signal may forward when `predict` true (**FACT**).

## Call recipe
**Draft/inactive — do not call in prod loops.** If operator scopes review:
```bash
curl -sS -X POST "https://evenslouis.ca/webhook/hive-predictive-construct" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"correlationId":"predict-001","thesis":"Automate onboarding emails","confidence":0.7,"keywordHits":["onboarding"]}'
```
Prefer scripts for feature ranking; HITL before any activate.

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Auto-activate injected drafts.
- Loud GTM campaigns until offer validated (north star).
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
