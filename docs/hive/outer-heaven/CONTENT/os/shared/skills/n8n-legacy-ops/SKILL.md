---
name: n8n legacy ops
description: >-
  Use this before any n8n webhook/cron call — Grok-first, correlationId, secret,
  HITL, archived rules; n8n as middleware when agent routines cannot accept custom webhooks.
---
# n8n legacy ops

Universal rules for calling https://evenslouis.ca/n8n as a legacy bus (not the daily OS).
LIVE: Mark Kashef “agent army in n8n with Claude” `yt:u2NluvotA80` — **CAPTION_GAP**; steal topology only. **WORKAROUND:** Grok-first army (routines + Cursor cloud agent + skills); n8n = ACTIVE legacy rows only. Remap Claude → Cursor+Grok.

**Enrich source:** Simon Scrapes `yt:icM0ewXGvAw` (least-privilege routines); Serop `yt:kXO4fIwxaDg` (Why I'm Still Using n8n Instead of Claude Routines) — FACT: Claude routines / scheduled agents still need middleware when inbound webhooks (e.g. Fathom) send custom auth headers the routine API cannot accept. Remap: do not chase Claude routines as n8n replacement; Grok routines + plugins first; n8n bridges when needed.

## Steps
1. Prefer Grok plugins/scripts/routines first. Call n8n only if your row in CONTENT/n8n-learning/agent-workflow-map.md (or agent-playbooks.md) says you own it **and** it is ACTIVE.
2. Use n8n as **webhook middleware** when a SaaS fires a webhook that cannot match Grok/Claude routine auth/header shape (FACT pattern from tape: Fathom → flexible webhook → agent). Forward cleaned payload into Grok routine / script.
3. Never call archived workflows (even if active=true). Prefer paginated inventory truth (177/69/108).
4. Always pass `correlationId` when the schema expects it (code nodes mint `prefix-${Date.now()}` if missing).
5. Most hive routes need `X-Hive-Secret` — never paste secrets in chat; use env/operator.
6. Treat Scorpion register POSTs as audit side effects, not the product outcome.
7. HITL=true (CE leads, error-heal merge, predictive activate, ElevenLabs client, master paid) → propose only; operator approves in Grok or /pro.
8. On failure run [n8n visual debug](sand-workflow:n8n-visual-debug): canvas + failing node + Executions screenshots.
9. Zero-loss: no n8n_data wipe, no n8ncloud, no activate/merge/main without Tier 3.

## Don't
- Sell “Claude/Grok routines replace Make/Zapier/n8n” to clients without the middleware caveat
- Stand up Claude desktop routines as the hive bus (**WORKAROUND:** Grok-first + n8n legacy)
- Custom Python middleware as default when an ACTIVE n8n bridge exists

## Tools
| Need | Path |
|---|---|
| Canonical n8n | `https://evenslouis.ca/n8n` + agent-playbooks — **PROVE** |
| Grok-first default | Grok plugins / CloudAgent / workflows — **PROVE** |
| Claude+n8n army as daily OS | **BLOCKED** — Grok-first **WORKAROUND**; n8n legacy only |
| n8ncloud | **NO** — ops never |

## Prompts
**ASR source:** Serop `yt:kXO4fIwxaDg` Whisper LIVE. FACT: Claude routines expect specific Authorization/headers; Fathom-class webhooks cannot paste routine API URL as destination when custom headers differ → need middleware.

**Before any n8n call**
```
Prefer Grok/Cursor first?
Row in agent-workflow-map ACTIVE (not archived)?
correlationId:
HITL required?:
Secret via env only (never chat).
```

**Webhook middleware decision (FACT Serop Fathom pattern)**
```
Trigger source: [Fathom / note-taker / SaaS]
Desired agent action: summarize transcript → email/Slack (or Grok equivalent)
Can destination accept THIS webhook's auth/header shape as-is?
- YES → Grok routine/plugin/event trigger
- NO → n8n ACTIVE bridge: receive flexible webhook → normalize payload → forward to Grok routine/script/SDK
Do NOT sell “routines replace Make/Zapier/n8n” without this caveat.
Remap: Claude routines → Grok routines; Claude Code/SDK → Cursor cloud agent + Grok (no Claude desktop dual-stack).
EU-hosting / managed-agents US-only claims = UNVERIFIED for our policy — note only.
```

**Agent-army remap (Kashef + Serop)**
```
Jobs as skills (not nameless swarm):
Orchestrator = Grok Bot / chief desk:
Workers = Cursor cloud agent / specialists:
n8n only for ACTIVE webhooks we already own / foreign header bridges.
No custom Python middleware as default when ACTIVE n8n bridge exists.
```

## Steal thicken — Simon 19 mistakes (`yt:icM0ewXGvAw`) FACT
- **Least privilege on automations:** Claude routines default-enable all connectors (unsafe + token-heavy). Same doctrine for Grok routines / n8n ACTIVE rows — only wire connectors the job needs; strip the rest retrospectively.
- Prefer load-tools-when-needed over always-on schema dumps into every turn.
- Remap: do not stand up Claude desktop routines as hive bus (**BLOCKED**); Grok-first + n8n legacy middleware remains.

## WL Hermes/OpenClaw (217/232/273)
Title only. Hive daily = Grok Bot. OpenClaw stays VPS fallback. Hermes/Ollama = local-private-agent-lab BLOCKED until Mac lab. Do not migrate this fire.


## WL26-100 remaining L2 2026-08-27 — Kashef army tape (PROVE)

Packet: `/workspace/research/packets/signals-20260826/WL26-100-L2-REMAINING.md`
Agent-army remap above now has tape:

`yt:u2NluvotA80` FACT: one-prompt JSON is a 0→80 **draft**, not a live hive. Tool-whitelist JSON so the model cannot hallucinate APIs or attach **triggers** as agent tools (watch-row ≠ add-row). Start **3** imports, audit, then the rest (credit + time). Orchestrator → subs with tools, not subs-of-subs. Grok-first still default; n8n ACTIVE legacy only. Community prompt **UNVERIFIED**.


## Bookmark enrich 2026-09-07 — Instance MCP describe → HITL activate
Source: X `20260907-1051` · @JulianGoldieSEO n8n instance-level MCP describe-workflow.

- Ops rule: plain-English → AI structure is allowed as a **draft** only. Forge/operator reviews graph, credentials, and triggers before activate.
- Keep Grok-first; n8n ACTIVE rows only when middleware shape requires it. Do not sell n8n as the hive OS.
- Platform: **n8n + Grok Bot**. Install: **none (process-only)**.


## X bookmarks enrich 2026-09-07

Packet: `/workspace/research/packets/x-bookmarks/20260907-1051/`

- **NL → workflow scaffold** (@JulianGoldieSEO): describe workflow in plain English; instance MCP builds structure. Grok-first first; n8n only on `https://evenslouis.ca/n8n`. Platform: Grok Bot / n8n legacy. Install: none. **WORKAROUND** for n8n-first demos.

## WAVE_X_REPASS_20260909
Packets CLOSED PARTIAL: `yt:kXO4fIwxaDg` (middleware gate VTT PROVE) · `yt:u2NluvotA80` (army topology VTT PROVE; prior CAPTION_GAP filled).
Path: `/workspace/research/youtube-daily/repass-20260909/<id>/`. Claude Routines / Claude+n8n daily OS remain **BLOCKED**; Grok-first + n8n legacy middleware **PROVE**.

## Provenance delta — wave Z (2026-09-09)
- `aRkxGXKYhVs`: Sheets→Postgres — **Aggregate before LLM**, then Split Out → Postgres. Live creds **BLOCKED**.
- `QCjMBOEhpLE`: Prefer n8n **Data Tables** + narrow query tools + calculator for agent-local state; escalate to Postgres at scale. Live feature **BLOCKED**.
Packets under `repass-20260909/<id>/`.

## Wave AA enrich 2026-09-09
- `yt:yjBHheCB6Ek` + `yt:57EkKWCsu_4`: keep on ACTIVE n8n legacy bridge lane (vision HTTP tool; MCP client SSE). Grok-first face where possible; vendor keys opsec ASK.

## Repass 20260909 wave AC — Eight agent pattern catalog
- Router · research · YT corpus · data analyst · DB create · meeting · shorts · Postgres tool-agent (ZXtVvroop_U).
- Prefer router→specialist; community template funnel **NO-SKILL**.


## CapEx pointer — n8n-kit-family Demonstrated 2026-09-09
Primary skill for CapEx tracks: `n8n-kit-forge`. Executable proof:
`/workspace/research/packets/skill-capability-transfer-20260909/demos/n8n-kit/` (Aggregate-before-LLM / sheets→sqlite stand-in).
**Transferred still OPEN.** Live Google/PG remain BLOCKED — fixtures only.


## Overnight C_STACK enrich — yt:QCjMBOEhpLE (2026-09-21T20:39:14-04:00)
Pattern **`native-data-table-narrow-query`**: n8n Native Data Tables as agent-local typed store (schema + CRUD get/insert/update/upsert/delete) + narrow filtered query tools + calculator; escalate Postgres at scale.
- L2: `/workspace/research/youtube-daily/l2-20260921/QCjMBOEhpLE/`
- Fixture: `recreation/native_data_table_narrow_query.py` → `proof-run.json` meets_proof=true (SQLite WORKAROUND; live n8n Data Tables BLOCKED)
- DISTINCT vs tonight `aRkxGXKYhVs` Sheets→PG migrate DROP and `57EkKWCsu_4` MCP enrich
- Speed vs Sheets **UNVERIFIED**; Skool **NO-SKILL**; no mint-per-URL

## Sandbox first (2026-10-10)
To try a new n8n feature or an LLM-built workflow, use [n8n-box-sandbox](sand-workflow:n8n-box-sandbox) (isolated 2.42.6 on localhost, dummy owner, no creds) — never the production instance. Promote to prod only through this skill's rules after the sandbox run's execution file shows success.

## Enrich 2026-10-11: batch size 1 on expensive nodes (x:1954343961424007234, Julian Goldie 5-hour n8n compilation)
- Expensive generation calls (image/video/LLM HTTP nodes): batch size 1 plus a batch interval, and a strict JSON body built with an expression, so one malformed item returns 422 alone and can be retried instead of failing the whole batch.
- Trigger nodes (Slack, webhook) switch from the test URL to the production URL only after the workflow is activated; re-paste the production URL into the source app.
- Rest of the tape (scrapers, keyword→WordPress draft, Sheets→social posting, local Ollama/DeepSeek) is covered elsewhere or is community upsell; templates are UNVERIFIED. Grok-first stays the default; try any of it in n8n-box-sandbox first.
- PROVE: `recreations/20261011/run1630/n8n_batch_isolation.py` in signals-2mo-backlog-20261010 → PASS (batch of 8 → 422; batch size 1 → 7 ok, 1 isolated).
