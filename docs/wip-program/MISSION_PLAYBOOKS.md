# Daily mission playbooks (Phase 8)

Five reusable Telegram / BigBoss playbooks for hive ops **without SSH**.  
Tools: `docs/patches/philanthropic-ai-agent/tools/TOOL_CONTRACTS.md`  
Hive: `https://evenslouis.ca/scorpion/api/hive/*` with `HIVE_MACHINE_TOKEN`  
Broker: n8n MCP ([phases/MCP_BROKER_DECISION.md](./phases/MCP_BROKER_DECISION.md))

Register each mission outcome: `POST /api/hive/register` (structured fields when available).

---

## 1. Last 10 CE actions

**Goal:** Operator sees recent Client Engine activity from Telegram.

1. From `#general` / BigBoss, ask for last 10 CE actions.  
2. Tool: `ce_list_actions` → `GET /scorpion/api/hive/ce/actions?limit=10`.  
3. Summarize id / type / summary / createdAt / source (no secrets).  
4. Log attempt to `#live-activity` (424).  
5. Register outcome to Scorpion (mission = `ce_last_actions`).

**Pass:** Readable list in Telegram; no SSH; no stack dumps.

---

## 2. Diagnose n8n execution

**Goal:** Explain failure for execution `X` without opening the VPS.

1. Operator provides execution id (or “latest failed”).  
2. Tool: `n8n_get_execution` → `GET /scorpion/api/hive/n8n/executions?id=`.  
3. Optionally `n8n_list_workflows` for name context via broker.  
4. Reply with status, failed node, and next retry hint.  
5. If prod failure needs humans: note `#alerts` (13); do not auto-redeploy.

**Pass:** Clear diagnosis in Telegram; secrets redacted.

---

## 3. Start lead pipeline

**Goal:** Begin CE money path from chat (safe acts only).

1. From `#scout` / `#crm` / `#business` per topic map — not from random topics.  
2. Lookup or create lead via hive/CE tools (`ce_lookup_lead`; create only if Phase 2+ write path live).  
3. `ce_create_note` on the lead/deal with source=`openclaw`.  
4. Any spend / client send / invoice → `ce_queue_action` (HITL), never silent.  
5. Register mission outcome `lead_pipeline_start`.

**Pass:** Lead visible in `/pro`; HITL queued if money touched.

---

## 4. Retry webhook until green

**Goal:** Recover a failed allowlisted webhook path.

1. Identify webhook from n8n catalog (Phase 5).  
2. Tool: `n8n_trigger_webhook` **allowlist only**.  
3. Poll execution via `n8n_get_execution` until success or max attempts.  
4. On repeated fail: escalate to `#alerts` (13); stop looping.  
5. Never `compose down -v`; never touch `n8n_data`.

**Pass:** Green execution **or** explicit escalate; no infinite retries.

---

## 5. Ops health digest (CE + n8n + Scorpion + OpenClaw)

**Goal:** One Telegram digest of hive health.

1. `scorpion_health` → `/scorpion/api/hive/health`.  
2. Include CE/n8n adapter status from health payload (or separate checks).  
3. Note OpenClaw gateway: expect loopback bind; hooks path must not be basic_auth.  
4. Post digest to `#live-activity` or operator topic; critical → `#alerts` (13).  
5. Register mission `ops_health_digest`.

**Pass:** Single readable digest; critical failures called out.

---

## Mission A/B/C suggestion (exit gate)

Use any three consecutive successful runs from the five playbooks (typically **1**, **2**, and **5**) with **no SSH**. File the Phase 8 exit report in [phases/08-daily-missions.md](./phases/08-daily-missions.md).
