# Research Packet: n8n Legacy Fallback (Watchdog + Forge)

**Agent:** Researcher  
**Date:** 2026-08-12 (America/Toronto)  
**Question:** How should Watchdog + Forge run/fix existing https://evenslouis.ca/n8n automations under Grok-first OS?  
**Tier:** standard · labels: FACT / INFERENCE / OPINION / UNVERIFIED  
**Greenfield:** forbidden unless operator approves

---

## A) When to use n8n vs Grok (decision table)

| Need | Use | Label |
|------|-----|-------|
| Read/draft Gmail, Calendar, GitHub in-chat | **Grok plugins** | FACT (GROKBOT_PLUGINS / OPERATOR_MEMORY) |
| Browser demos, research, UI login handoff | **Grok browser/computer** | FACT |
| Agent chat, day plan, research packets | **Grok agents** | FACT |
| Durable cron that must fire with Mac asleep | **n8n** (or VPS cron scripts) | FACT / INFERENCE |
| Production webhook bus already cataloged | **n8n** `https://evenslouis.ca/webhook/*` | FACT (n8n-catalog.json) |
| OAuth-heavy SaaS glue already wired in n8n | **n8n** (don’t re-OAuth in Grok unless migrating) | OPINION + N8N_DOCTRINE |
| Cross-system notify (error → Telegram / register) | **n8n** if workflow exists | FACT (catalog) |
| Money / leads / approvals truth | **Client Engine /pro** — not n8n | FACT (N8N_DOCTRINE) |
| Agent personality / Telegram topics | **OpenClaw (legacy face)** — not n8n | FACT |
| New daily operator habit | **Do not invent n8n** — Grok first | FACT (OPERATOR_MEMORY 2026-08) |

**Rule of thumb (OPINION):** Prefer Grok plugins + Mac scripts. Reach for n8n only when (1) catalog already has the webhook/cron, or (2) Grok cannot provide durable schedule / existing OAuth glue without Tier-3 rebuild.

---

## B) Our stack patterns (canon)

**FACT — endpoints**
- UI: https://evenslouis.ca/n8n only  
- Webhooks: https://evenslouis.ca/webhook + path from catalog  
- Deprecated: n8ncloud.tech — never browse/wire  
- VPS: root@69.62.66.78 · repo `/root/domain-paths/n8n-cursor`  
- Catalog: `scripts/hive/n8n-catalog.json` · `webhookBase`: `https://evenslouis.ca/webhook`

**FACT — auth pattern on hive webhooks**
- Many hive routes expect header `X-Hive-Secret` (secret not in git)  
- Some older `evens-*` routes note `authHeader: none` — treat as sensitive; don’t spray public callers

**FACT — representative catalog lanes (existing, not greenfield)**
- Health/notify: `hive-golden-path-smoke-notify`, `hive-outer-heaven-report-notify`, `evens-email-notify`  
- Self-heal: `hive-error-heal-notify` (HITL; Forge PR, operator merge)  
- Router: `hive-ecosystem-route`  
- CE slice: `hive-ce-lead-notify` (HITL)  
- Memory: `hive-chronicle-ingest`, `hive-founder-signal`  
- Digests/cron: `hive-operator-digest`, `hive-daily-operational-digest`, Life & Business Ops smokes via scripts  
- HITL drafts: `hive-predictive-construct` must stay inactive / `DRAFT_PENDING_REVIEW`

**FACT — approved scripts (prefer over ad-hoc shell)**
- `scripts/hive/smoke-*.sh`, `hive-watchdog.sh`, `life-business-ops-fix.sh`, `n8n-activate-all-hive-workflows.sh`  
- Import helpers named in catalog notes (`n8n-import-*.sh`) — operator/Forge only with care

**FACT — doctrine fields every workflow should have** (`docs/hive/N8N_DOCTRINE.md`)  
`name`, `owner`, `input_schema`, `output_schema`, `hitl`, `register_to`, `auth`

---

## C) Official n8n concepts Watchdog/Forge must know

Sources: docs.n8n.io (Webhook, Error workflows, Executions)

1. **Active vs inactive** — Production webhooks only register when workflow is **published/active**. Save ≠ active. (FACT — n8n docs)  
2. **Test URL vs Production URL** — `/webhook-test/...` needs editor listening; callers must use **production** `/webhook/...`. (FACT)  
3. **One webhook per path+method** — collisions → 404/wrong handler. (FACT)  
4. **Executions tab** — debug from prior run; pin/load data into editor. (FACT)  
5. **Error Trigger + Error workflow** — set in Workflow Settings; notify on failure. (FACT)  
6. **Stop and Error** — intentional fail into error workflow. (FACT)  
7. **Credentials** — OAuth/API keys in n8n credential store; never commit; Tier 3 to create/rotate. (FACT hive + n8n)  
8. **Pinned data / sticky notes** — safe for Forge dry-runs; don’t leave secrets pinned. (OPINION)  
9. **Proxy / WEBHOOK_URL** — self-hosted behind reverse proxy needs correct public URL + proxy hops. (FACT — n8n common issues)  
10. **Partial execution / “Execute step”** — prefer for fix loops over full prod fire. (OPINION)

---

## D) Common failure modes + SAFE debug

| Symptom | Likely cause | Safe first moves | NEVER |
|---------|--------------|------------------|-------|
| 404 on webhook | Inactive workflow; test URL used; path/method mismatch; catalog drift | Confirm Active; use production URL from UI; match catalog path; toggle off/on once | Wipe volume; rewrite random paths |
| 401/403 | Missing/wrong `X-Hive-Secret` or IP allowlist/proxy | Check header name only (not value in chat); verify proxy hops with operator | Paste secrets into agent chat |
| Empty/odd payload | Caller schema ≠ catalog `inputSchema` | Dry-run with fixture matching catalog; compare Executions JSON | Mutate CE/money payloads |
| “Works in editor, fails prod” | Test webhook vs production registration | Publish/activate; retest production URL | Leave workflow inactive “for safety” without saying so |
| OAuth expired (Gmail etc.) | Credential needs re-auth | Flag operator Tier 3; open credential in UI for them | Agent invents new OAuth app |
| Flapping / retries storm | Downstream timeout; missing error workflow | Read Executions; propose Error Trigger notify; rate-limit | Delete execution history as “cleanup” |
| Catalog says planned / Prefer script | Logic moved to Python | Run named Mac/VPS script instead of n8n | Re-implement in n8n greenfield |
| Docker “disk full” panic | Ops pressure | Report to operator; **read-only** `df` / logs | `docker volume rm`, prune n8n_data |

**Zero-loss sacred (FACT — hive):** Never wipe/truncate `n8n_data`, never `docker volume rm/prune` on n8n, never force-reset prod. If repair seems to need destructive action → STOP and ask operator.

---

## E) Watchdog — concrete next ops (health)

1. Weekly: open https://evenslouis.ca/n8n → Executions → filter Error last 24–48h; note workflow names + IDs.  
2. Diff active workflows vs `scripts/hive/n8n-catalog.json` (name + webhookPath); flag drift.  
3. Run approved smoke only: `bash scripts/hive/smoke-life-business-ops.sh` (or `hive-watchdog.sh` if that is the current health entry) on VPS via SSH — **no ad-hoc docker**.  
4. Confirm `hive-operator-digest` / daily digest cron still succeeding (Executions).  
5. Ping production URL for one low-risk smoke webhook (`hive-golden-path-smoke-notify`) with operator-approved secret path — or report if you cannot.  
6. Check Error workflows attached on critical hive flows (error-heal, ce-lead-notify).  
7. Alert operator on: inactive cataloged workflow, OAuth errors, n8ncloud references anywhere.  
8. Register findings to operator brief / event-bus — not client channels.  
9. Freeze-check pattern if script present: `freeze-check.sh` for active count anomalies.  
10. Stay silent (NO_ACTION) when nothing material failed — north star #1.

---

## F) Forge — concrete next ops (fix/edit existing only)

1. Discovery path (doctrine): catalog entry → input schema → fixture → dry-run → execute → capture execution ID.  
2. Prefer **partial execute / pin data** in editor over live CE/money webhooks.  
3. On `hive-error-heal-notify`: open PR for proposed fix; **never merge main**; operator merges.  
4. Predictive construct: leave `DRAFT_PENDING_REVIEW` inactive; never auto-activate.  
5. Import only via existing `n8n-import-*.sh` / workflow JSON already in repo — no new products.  
6. Fix Code nodes by pasting error + snippet into Cursor; keep change minimal.  
7. If catalog note says “Prefer: scripts/hive/…”, implement/fix the **script**, not a twin n8n flow.  
8. Credential/OAuth/activate = stop → propose Tier 3 to operator.  
9. After fix: document execution ID + before/after in PR or chronicle ingest.  
10. Refuse greenfield “let’s add a new agency funnel workflow” unless operator explicitly scopes it.

---

## G) Sources (progressive)

### Official / primary (prefer)
- https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/  
- https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/common-issues/  
- https://docs.n8n.io/flow-logic/error-handling/ (handle errors gracefully)  
- https://docs.n8n.io/workflows/executions/  
- Hive: `docs/hive/N8N_DOCTRINE.md`, `docs/hive/GROKBOT_ACCESS.md`, `scripts/hive/n8n-catalog.json`  
- Vault: OPERATOR_MEMORY § Four north stars #4; OUTER_HEAVEN_LIBRARY n8n row; AUTOPILOT_CONTRACT email fallback

### Expert video (secondary — Nate / automation diet; claims UNVERIFIED)
- Nate Herk channel: Claude Code ↔ n8n delivery patterns (operator binge; see CONTENT/nate-herk + operator-youtube dossiers)  
- Prefer docs for webhook/error truth; use Nate for *client delivery vocabulary*, not hosting canon  
- Official n8n YouTube for UI walkthroughs when stuck on editor UX

### Operator YouTube signal (INFERENCE from dossiers)
- Heavy Nate Herk + Simon Scrapes n8n adjacency → agents should speak webhook + client-hosted n8n, but **our** host is always evenslouis.ca

---

## Handoff one-liners

- **Day Planner:** n8n = scheduled/webhook legacy bus; don’t put daily brief on n8n UI.  
- **Watchdog:** catalog drift + failed executions + smokes; never volume wipe.  
- **Forge:** fix existing catalog rows; HITL activate; prefer scripts when catalog says Prefer.  
- **Librarian:** canonize this packet under CONTENT/research or research-packets.

---

## Confidence

- Stack endpoints + catalog + doctrine: **high** (repo/vault FACT)  
- Official webhook/error behavior: **high** (docs.n8n.io)  
- Exact live Active/Inactive state on VPS right now: **UNVERIFIED** this packet (Watchdog should verify)  
- Nate income / “best” tutorial rankings: **UNVERIFIED / ignore for ops**
