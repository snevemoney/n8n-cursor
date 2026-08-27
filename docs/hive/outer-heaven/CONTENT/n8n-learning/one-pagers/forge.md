# Forge — n8n legacy one-pager
**Labels:** FACT = hive JSON · INFERENCE = ops · UNVERIFIED = non-hive

## Role in estate
Self-heal proposals + creative-pivot containment. Output = staging PR / operator merge — never silent prod. Watch SaaS scaffolds as archive candidates with Watchdog.

## Workflows you own (table)

| Live name | JSON file | Trigger | HITL | When to use | Status |
|-----------|-----------|---------|------|-------------|--------|
| Hive Error Heal Notify | `error-heal-notify.json` | POST `/webhook/hive-error-heal` (`onReceived`) | **yes** | Normalize failure → optional Scorpion audit + Grok Watchdog; propose PR | repo JSON **FACT** |
| Hive Creative Pivot Notify | `creative-pivot-notify.json` | POST `/webhook/hive-creative-pivot` (`onReceived`) | **yes** | fix_attempt≥3 or cost halt → pivot heuristic | ACTIVE **FACT** |

Secondary (**INFERENCE** estate): Advanced Features, Analytics, API Key Management, Asset Management API, Auth & User Mgmt, Compliance, Sustainability, Tenant Onboarding, Work Order Mgmt, Chat AI Agent - Asset Management, My Sub-Workflow 1, n8n hacks — **UNVERIFIED nodes**; document/archive, don’t grow.

## How they work (nodes — from JSON)

### error-heal-notify.json — *Hive Error Heal Notify*
**Shape FACT:** `Webhook` → `Normalize Error` (code) → `Register Scorpion` (optional audit, continueOnFail) → `Alert Grok Watchdog`. n8n notify sink = Grok Watchdog webhook env GROK_WATCHDOG_WEBHOOK_URL.
- **Code FACT:** cid `self-heal-${Date.now()}`; fields route/statusCode/error/stack/repo/service/fixAttempt/toolMethod/businessGoal; text tells Forge branch·patch·test·PR; at `fix_attempt>=3` escalate to `hive-creative-pivot`.
- job messaging: “Self-heal proposed (Tier 3 merge required)”.
- **Hosts:** `evenslouis.ca`, `api.telegram.org` · No respondToWebhook.

### creative-pivot-notify.json — *Hive Creative Pivot Notify*
**Shape FACT:** `Creative Pivot Webhook` → `Evaluate Pivot` → `Register Pivot` → `Alert Operator`.
- **Code FACT:** cid `pivot-*`; `costHalt = cost > maxCost (default 15)`; `attemptTrigger = fixAttempt >= maxAttempts (default 3)`; `status: need_hitl`; `jobType: ops.containment.halted | ops.creative_pivot.proposed`.
- Pivot steps in text are heuristic instructions, **not** auto aesthetic deploy (**FACT** from code strings).

## Call recipe
```bash
curl -sS -X POST "https://evenslouis.ca/webhook/hive-error-heal" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"correlationId":"heal-001","route":"/api/example","error":"500 boom","statusCode":500,"repo":"n8n-cursor","fix_attempt":1}'

# Only after ≥3 failed heals / cost pressure
curl -sS -X POST "https://evenslouis.ca/webhook/hive-creative-pivot" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"correlationId":"pivot-001","fix_attempt":3,"tool_method":"hive_catalog.error_heal","business_goal":"restore smoke","error":"repeated fail","estimated_loop_cost_usd":16}'
```
**Prefer:** Cursor/Forge PR workflow; n8n only notifies/registers.

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Merge main / activate workflows from heal or pivot paths without HITL Operator Tier 3.
- Treat pivot as Creative Studio auto-deploy.
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
