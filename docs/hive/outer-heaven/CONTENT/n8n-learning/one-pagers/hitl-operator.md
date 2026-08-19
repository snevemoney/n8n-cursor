# HITL Operator — n8n gate one-pager
**Labels:** FACT = catalog hitl flags + code `need_hitl` · INFERENCE = gate policy

## Role in estate
Gate every `HITL=true` path and any proposal to activate inactive workflows. Surfaces `/pro` and Grok Tier 3. Never auto-approve money/send/deploy/activate.

## Workflows you gate (not “own” as builder)

| Live / catalog name | JSON / source | Trigger | HITL signal FACT | Gate action |
|---------------------|---------------|---------|------------------|-------------|
| Hive CE Lead Notify | `ce-lead-notify.json` | `/webhook/hive-ce-lead-notify` | text → /pro Tier 3 | Approve/send only on /pro |
| Hive Error Heal Notify | `error-heal-notify.json` | `/webhook/hive-error-heal` | “Tier 3 merge required” | Merge staging PR only |
| Hive Creative Pivot Notify | `creative-pivot-notify.json` | `/webhook/hive-creative-pivot` | `status: need_hitl` | Approve pivot / halt |
| Hive Predictive Construct | `predictive-construct.json` | `/webhook/hive-predictive-construct` | Respond `status: need_hitl`; inactive draft | Never auto-activate draft |
| Hive Meta Critique Notify | `meta-critique-notify.json` | `/webhook/hive-meta-critique` | Respond `need_hitl` | Allow Forge staging only |
| Hive Sunday Meta Critique | `sunday-meta-critique.json` | cron | HITL critique loop | Same |
| Phase 9 Pipedrive | catalog | `/webhook/phase9-pipedrive-lead` | catalog hitl=true | Lead mutate gate |
| Master Orchestration | catalog/inventory ACTIVE | `/webhook/master-orchestrator` | catalog hitl | Paid/client gate |
| elevenlabs post call | catalog/inventory ACTIVE | uuid webhook | catalog hitl | Client audio gate |
| Support Agent Webhook | catalog INACTIVE | `/webhook/support-agent` | catalog hitl | Activate + reply gate |
| Email client send | any | — | policy | Tier 3 |

## How they work
You do not run a dedicated hive JSON. You **intercept** outputs that set `need_hitl`, Telegram directives, or catalog `hitl:true`. Daily digests list `tier3Open` / `tier3Items` (**FACT** operator-digest + daily digest code).

## Call recipe
No webhook of your own. Checklist:
1. Read mission `status=need_hitl|blocked` from digest /pro.
2. Screenshot relevant n8n execution if disputed.
3. Approve only via operator /pro or explicit Tier 3 chat — never agent self-approve.

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Auto-approve. Rubber-stamp activate. Skip /pro for CE leads.
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
