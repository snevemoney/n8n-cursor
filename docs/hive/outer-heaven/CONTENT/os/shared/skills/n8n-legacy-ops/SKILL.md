---
name: n8n legacy ops
description: >-
  Use this before any n8n webhook/cron call — Grok-first, correlationId, secret,
  HITL, archived rules; n8n as middleware when agent routines cannot accept custom webhooks.
merged_from: [n8n-kit-big-boss, n8n-kit-comms, n8n-kit-consultant, n8n-kit-creative, n8n-kit-forge, n8n-kit-hitl, n8n-kit-lead-hunter, n8n-kit-librarian, n8n-kit-money-desk, n8n-kit-product-gtm, n8n-kit-researcher, n8n-kit-watchdog, n8n-kit-wealth]
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
8. On failure run [n8n visual debug](sand-workflow:n8n-box-sandbox): canvas + failing node + Executions screenshots.
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
Primary skill for CapEx tracks: `n8n-legacy-ops`. Executable proof:
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

---

## Merged from `n8n-kit-big-boss` (2026-10-11)

- Original description: Use this when Big Boss uses n8n digests, founder-signal, toolbox, or master orchestrator
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — Big Boss

## Own (ACTIVE)
- hive-daily-operational-digest — cron → fetch missions/GP → build → register
- hive-founder-signal-ingest — webhook → register; may forward predictive (inactive draft)
- hive-execute-tool / toolbox-router — JSON-RPC → invoke (secret); failover → error-heal
- evens-master-orchestrator — HITL for paid/client paths
- hive-operator-digest — JSON digest feed (fallback; prefer Grok morning brief)

## Do
1. [n8n legacy ops](sand-workflow:n8n-legacy-ops). Morning = Grok brief first; n8n digest = fallback feed.
2. Pass correlationId on toolbox / founder-signal calls.
3. Master orchestrator paid/client → HITL Operator; never auto-execute Tier 3.
4. Failures → [n8n visual debug](sand-workflow:n8n-box-sandbox).

Canon: CONTENT/n8n-learning/agent-playbooks.md


---

## Merged from `n8n-kit-comms` (2026-10-11)

- Original description: Use this for operator email notify/reply n8n flows — never client send without Tier 3
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — Communications Manager

## Own
- Email Notification System (ACTIVE) — operator notify fallback only
- Evens Louis Email Reply Agent (ACTIVE)
- Support Agent Webhook (INACTIVE) — revive only with HITL

## Do
1. Prefer Grok Gmail plugin (read/draft). n8n = fallback.
2. [n8n legacy ops](sand-workflow:n8n-legacy-ops).
3. Never send client email/SMS without Tier 3 HITL.
4. Failures → [n8n visual debug](sand-workflow:n8n-box-sandbox).

Canon: CONTENT/n8n-learning/agent-playbooks.md


---

## Merged from `n8n-kit-consultant` (2026-10-11)

- Original description: Use this for meta-critique n8n flows when activated — directive to Forge, not prod deploy
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — Consultant

## Own (INACTIVE — do not fire until operator activates)
- hive-meta-critique-notify — webhook → register critique HITL
- hive-sunday-meta-critique — cron → register → telemetry pulse (secret)

## Do
1. [n8n legacy ops](sand-workflow:n8n-legacy-ops). Default = Grok audit skills, not n8n.
2. When live: output = CRITIQUE directive → Forge staging PR; never prod deploy.
3. Failures → [n8n visual debug](sand-workflow:n8n-box-sandbox).

Canon: CONTENT/n8n-learning/agent-playbooks.md


---

## Merged from `n8n-kit-creative` (2026-10-11)

- Original description: Use this for Nana/image and ElevenLabs n8n flows — client audio is HITL
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — Creative Studio

## Own (ACTIVE)
- elevenlabs post-call — HITL for client-facing audio
- Nana / create-combine-edit image / background removal / Nano Photoshop
- Secondary on hive-creative-pivot aesthetics with Forge

## Do
1. [n8n legacy ops](sand-workflow:n8n-legacy-ops).
2. Client voice/audio → HITL Operator before send.
3. Prefer Grok creative tools when sufficient; n8n for established pipelines.
4. Failures → [n8n visual debug](sand-workflow:n8n-box-sandbox).

Canon: CONTENT/n8n-learning/agent-playbooks.md

## Provenance delta — wave Z `Vm8QOo9MiC4` (2026-09-09)
- Sora 2 × n8n: async poll, structured scene prompts, reject realistic-person i2v. Live Sora/fal **BLOCKED**; price/watermark **UNVERIFIED**. Motion bar N/A.

## Repass 20260909 wave AC — Lofi/media factory pattern
- Music HTTP + image + img2video poll + Drive stage; Remotion **WORKAROUND**; VEO/PiAPI **BLOCKED**; Blotato **NO-SKILL** (ncle74RhYQ8).


---

## Merged from `n8n-kit-forge` (2026-10-11)

- Original description: Use this when Forge owns n8n self-heal or creative-pivot — HITL propose, not auto-merge
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — Forge

Sources enriched: Kashef n8n+Claude army `yt:u2NluvotA80` (CAPTION_GAP) — Grok-first; no greenfield army estate.

## Own (ACTIVE)
- hive-error-heal-notify — webhook → code(`self-heal-*` cid) → register HITL (propose PR; operator merges)
- hive-creative-pivot-notify — Evaluate Pivot HITL → register (loop-cost heuristic)

## Support
- Meta-critique / predictive drafts → staging PR only; never activate prod.
- Estate SaaS scaffolds: document/archive candidates with Watchdog — no greenfield.

## Do
1. [n8n legacy ops](sand-workflow:n8n-legacy-ops) first.
2. Never merge main / activate / wipe volumes.
3. Failures → [n8n visual debug](sand-workflow:n8n-box-sandbox) then PR.
4. Telemetry CRITICAL and toolbox failover may hit error-heal — expect HITL.

Canon: CONTENT/n8n-learning/agent-playbooks.md

## Tools
| Need | Path |
|---|---|
| Error-heal / creative-pivot | ACTIVE n8n kits — **PROVE** |
| Visual debug | n8n-box-sandbox — **PROVE** |
| Greenfield n8n agent army SaaS | **BLOCKED** — Grok-first kits **WORKAROUND** |

## Prompts
**Forge n8n touch**
```
Run n8n-legacy-ops first.
Propose PR only; no activate/merge/main.
Failures → screenshots then PR.
```

## WAVE_X_REPASS_20260909
Topology pointer: `yt:u2NluvotA80` army gate (orch + ≤3 specialists + real tools). Do not mint Claude+n8n army as daily OS.

## Provenance delta — wave Z (2026-09-09)
- Aggregate-before-LLM migrate; Data Tables narrow tools; Sora2 HTTP **submit→poll→store** topology (`Vm8QOo9MiC4`). Sora face **BLOCKED**.

## Wave AA enrich 2026-09-09 — vision agent forge pattern
- `yt:yjBHheCB6Ek`: forge shape = HTTP image tool + markdown render rule + prompt-refine loop. Do not mint crypto-TA SKU. Packet `repass-20260909/yjBHheCB6Ek/`.

## Repass 20260909 wave AC — Postgres tool-agent + poll
- Narrow non-deterministic DB tools; async poll-until-ready for media APIs (ZXtVvroop_U · ncle74RhYQ8).
- Live DB/API keys **BLOCKED** until operator creds.


## CapEx tracks (Documented / Demonstrated / Transferred) — DoD 2026-09-09

Capability tracks for `n8n-kit-family` (this skill is primary). **Do not** treat Sheets→PG checklist alone, YT stamp enrich, or skill-file touch as PASS.

| Track | Bar | Counterexample |
|---|---|---|
| **Documented** | Aggregate-before-LLM / sheets→PG / poll topology written with BLOCKED live Google/PG | Inventory touch; stamp-only metadata |
| **Demonstrated** | Executable kit run: fixture rows → Aggregate → **1** mock-LLM → Split Out → local DB, with logged output + workflow schema dry-run | `SHEETS_TO_POSTGRES_N8N_GATE.md` checklist alone; enrich-only; markdown without runner output |
| **Transferred** | **Another desk** runs the kit binary on a **different** sheet fixture (not CapEx `sheet_rows.json`) and lands matching invariants | Replaying CapEx fixtures; enrich-only; copying STATUS prose |

### Hard rules
- **checklist-only ≠ Demonstrated.** Packet recreation checklists stay **Documented** until a runner writes kit_run artifacts.
- **enrich-only ≠ Transferred.** Touching this SKILL.md or stamping YT daily does **not** move Transferred.
- Live Google / Postgres / OpenAI / n8n cloud = **BLOCKED** for CapEx demos — simulate with local fixtures.

### Certified Demonstrated — 2026-09-09
CapEx demo: `/workspace/research/packets/skill-capability-transfer-20260909/demos/n8n-kit/`
- Runner: `aggregate_kit.py`
- Fixtures: `fixtures/sheet_rows.json`, `fixtures/workflow_kit.json`
- Proof: `out/kit_run.json` + `out/kit_run.log` + `out/aggregated_payload.json` + `out/llm_receipt.json` + `out/products_migrated.sqlite` (llm_calls=1, db_rows=6)
- Packets reused: `aRkxGXKYhVs`, `HAFqyN7RExc`, `QCjMBOEhpLE`

### Transferred — OPEN
Requires another desk run on a **different** sheet fixture. Until that returns fresh kit_run logs, **Transferred = unchecked**.

### Done-when (E / Transferred)
```
Done when (Demonstrated): aggregate_kit.py (or successor) exit 0 with llm_calls=1, db_rows=sheet_rows, out/*.log on disk.
Done when (Transferred): different desk + different sheet JSON → new out/ with same aggregate-before-LLM contract.
Enrich-only / checklist-only / re-fixture replay ≠ Transferred.
```


## Overnight C_STACK enrich — yt:QCjMBOEhpLE (2026-09-21T20:39:14-04:00)
Pattern **`native-data-table-narrow-query`**: n8n Native Data Tables as agent-local typed store (schema + CRUD get/insert/update/upsert/delete) + narrow filtered query tools + calculator; escalate Postgres at scale.
- L2: `/workspace/research/youtube-daily/l2-20260921/QCjMBOEhpLE/`
- Fixture: `recreation/native_data_table_narrow_query.py` → `proof-run.json` meets_proof=true (SQLite WORKAROUND; live n8n Data Tables BLOCKED)
- DISTINCT vs tonight `aRkxGXKYhVs` Sheets→PG migrate DROP and `57EkKWCsu_4` MCP enrich
- Speed vs Sheets **UNVERIFIED**; Skool **NO-SKILL**; no mint-per-URL

## L2 2026-10-10 YouTube (`yt:i-mBOC3dbZU`, `yt:4DgmXP3GoaA`) — live Data Tables now PROVE in sandbox
- **Live n8n Data Tables: BLOCKED → PROVE (sandbox only)** on an isolated n8n 2.42.6 on the box ([n8n-box-sandbox](sand-workflow:n8n-box-sandbox)): feed-list table → RSS → normalize → Remove Duplicates → Data Table *rowNotExists* → insert; run 1 saved 82 rows, run 2 "Keep Only New" = 0 (`/workspace/research/youtube-daily/l2-20261010/i-mBOC3dbZU/recreation/task1_run*_summary.json`). Filter shape: `{"conditions":[{"keyName":"link","condition":"eq","keyValue":"={{ $json.link }}"}]}`. The SQLite fixture above stays as the no-n8n fallback. Production n8n untouched.
- Agent tools on a growing table must be **bounded** (limit/filter), never Return All; never fetch data in front of the agent node (runs every turn) — see [n8n-llm-build-bakeoff](sand-workflow:n8n-llm-build-bakeoff).
- Multi-agent: supervisor AI Agent + `agentTool` sub-agents with `$fromAI("query",…)` (`yt:4DgmXP3GoaA` 8:55); Agents (Preview) Knowledge rejects image-only PDFs — precheck text first.


---

## Merged from `n8n-kit-hitl` (2026-10-11)

- Original description: Use this when gating HITL n8n paths — CE leads, heal merge, predictive activate, client send
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — HITL Operator

## Gate these
- hive-ce-lead-notify / phase9-pipedrive-lead
- hive-error-heal-notify (merge)
- hive-predictive-construct (activate)
- evens-elevenlabs-post-call (client)
- evens-master-orchestrator (paid/client)
- Any proposal to activate an INACTIVE workflow

## Do
1. Surface decision in Grok chat; never auto-approve money/send/deploy/secrets.
2. /pro only when a formal queue item exists.
3. Confirm agent used [n8n legacy ops](sand-workflow:n8n-legacy-ops) and screenshots if failure-related.
4. Zero-loss sacred rules still apply after approval.

Canon: CONTENT/n8n-learning/agent-playbooks.md


---

## Merged from `n8n-kit-lead-hunter` (2026-10-11)

- Original description: Use this for CE/Pipedrive/scraper n8n lead flows — always HITL before mutate
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — Lead Hunter

## Own (ACTIVE)
- hive-ce-lead-notify — webhook → Format Lead (HITL,/pro) → register (`ce-lead-*` cid)
- phase9-pipedrive-lead — HITL; do not fire casually
- Estate: New Leads, Apollo enrichment, PI qualifier, social/profile scrapers

## Do
1. [n8n legacy ops](sand-workflow:n8n-legacy-ops).
2. All lead mutates → HITL Operator /pro — never auto-approve.
3. Prefer warm research packets over blind webhook spam.
4. Failures → [n8n visual debug](sand-workflow:n8n-box-sandbox).

Canon: CONTENT/n8n-learning/agent-playbooks.md

## Wave AA enrich 2026-09-09 — firmographic enrich SKU shape (`yt:57EkKWCsu_4`)
- Name+website → industry/size/revenue/NAICS enrich is a lead-hunter SKU shape. Gate vendor+$+PII before client offer. Hostinger/Skool CTAs **NO-SKILL**.


---

## Merged from `n8n-kit-librarian` (2026-10-11)

- Original description: Use this when Librarian runs Outer Heaven report notify or chronicle glue — prefer brief.py reads; chronicle webhook unverified
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — Librarian

## Own
- **ACTIVE FACT:** hive-outer-heaven-report-notify — POST `/webhook/hive-outer-heaven-report` + cron `0 14 * * 1` (Mon 14:00 UTC) → Fetch Golden Paths → Format Report → Telegram → Register Scorpion. cid `hive-report-*` or body.correlationId.
- **Repo JSON / UNVERIFIED live:** hive-chronicle-ingest — file `active:false`, not in live hive name list. Prefer `append-chronicle.sh` / `mine-transcripts.py` until Watchdog confirms alias. Shape: Normalize → Register → highSignal? → founder-signal (secret).

## Do
1. **Reads:** outer-heaven-brief.py + vault/cache — never Scorpion HTTP for memory; n8n = ingest/notify glue only.
2. [n8n legacy ops](sand-workflow:n8n-legacy-ops); on fail [n8n visual debug](sand-workflow:n8n-box-sandbox).
3. Deep one-pager: CONTENT/n8n-learning/one-pagers/librarian.md
4. Never delete CHRONICLE entries; never paste X-Hive-Secret / Telegram tokens.

Canon: CONTENT/n8n-learning/agent-playbooks.md · one-pagers/librarian.md


---

## Merged from `n8n-kit-money-desk` (2026-10-11)

- Original description: Use this for hive revenue-sensor hourly — prefer Python sensors; no autonomous treasury
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — Money Desk

## Own (ACTIVE)
- hive-revenue-sensor-hourly — cron → fetch golden paths → code → register hypothesis (HITL-ish)

## Prefer
- `hive-revenue-sensors.py` when available over n8n cron

## Do
1. [n8n legacy ops](sand-workflow:n8n-legacy-ops).
2. No autonomous treasury / send / pricing changes — Tier 3.
3. CE lead money implications → HITL Operator + Lead Hunter.
4. Failures → [n8n visual debug](sand-workflow:n8n-box-sandbox).

Canon: CONTENT/n8n-learning/agent-playbooks.md


---

## Merged from `n8n-kit-product-gtm` (2026-10-11)

- Original description: Use this for predictive-construct draft only — never auto-activate n8n workflows
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — Product GTM

## Own (INACTIVE draft only)
- hive-predictive-construct — webhook → Inject n8n Draft API → Register HITL → respond
- hive-feature-priority-rank — planned; prefer scripts

## Do
1. [n8n legacy ops](sand-workflow:n8n-legacy-ops).
2. Never auto-activate drafts. Activation = Tier 3 + HITL Operator.
3. Suppress loud GTM until offer validated (north star).
4. Failures → [n8n visual debug](sand-workflow:n8n-box-sandbox).

Canon: CONTENT/n8n-learning/agent-playbooks.md


---

## Merged from `n8n-kit-researcher` (2026-10-11)

- Original description: Use this for research/RAG n8n scrapers — prefer Python scripts; never webhook spam; n8n only as legacy bridge per n8n-legacy-ops.
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — Researcher

**Enrich:** `yt:kXO4fIwxaDg` — confirm research stays script-first; n8n is not the research OS.

## Prefer scripts
- hive-web-research.py / web-learning-cycle.py over n8n stubs
- Signal close via [research-signal-to-skills](sand-workflow:research-signal-to-skills) + [research-signal-to-skills](sand-workflow:research-signal-to-skills)

## ACTIVE estate (optional)
- Company research · Market research · Summarize site · Website scraper
- One PDF RAG only (3 active dupes — flag consolidation; archived RAG non-callable)

## Do
1. [n8n legacy ops](sand-workflow:n8n-legacy-ops) + [JIT research gate](sand-workflow:jit-research-gate).
2. Never blind-fire research webhooks for spam.
3. Promote packets to Librarian CONTENT; don't leave knowledge only in n8n.
4. Failures → [n8n visual debug](sand-workflow:n8n-box-sandbox).

## Tools
| Need | Path |
|---|---|
| Research scripts | box Python — **PROVE** |
| n8n research stubs | legacy only — **WORKAROUND** |
| Claude research routines | **BLOCKED** — Grok+scripts **WORKAROUND** |

## Prompts
**Research path**
```
Question: …
Prefer box script / WebFetch. n8n only if ACTIVE map row. Close to skill + SIGNAL_INDEX.
```

Canon: CONTENT/n8n-learning/agent-playbooks.md

## Enrich 2026-09-03 — agent outside workflow (X bookmarks)
FACT pattern from bookmarks: one agent + workflows-as-tools; describe outcome → AI drafts workflow → human review.
Hive map: Researcher/Forge stay script-first (`hive-web-research.py`). If n8n is used, treat workflows as **tools** for one desk, not an AI node inside every flow. Any AI-built workflow = HITL before activate. Never webhook-spam research.
Platform: Grok Bot + box Python. Install: `none (process-only)` for the pattern; n8n UI only when legacy ACTIVE map requires it.


## Concrete steps — agent-as-tools (deep repass 2026-09-03)
1. Write outcome + done-when in one paragraph (no node graph yet).
2. Prefer a box script (hive-web-research.py / WebFetch). Stop if script covers it.
3. If plumbing needs SaaS connectors: list ACTIVE n8n workflows as tools the desk may call (HTTP/webhook to one workflow), not LLM nodes inside every flow.
4. AI-build path: paste outcome → ask Forge/Cursor for draft n8n JSON or node list → human reviews graph → activate only after HITL.
5. Hybrid boundary: n8n = deterministic move/transform/notify; Grok/Cursor agent = judgment/research/draft.
6. On fail: n8n-box-sandbox; never blind re-fire research webhooks.
7. Promote findings to Librarian CONTENT + research-signal-to-skills — knowledge must not live only in n8n.
Platform: Grok Bot + box Python; n8n legacy. Install: none (process-only).

## LIVE enrich 2026-09-03 video UI confirm
Source: X `2095584609685868891` (~8.7m) — n8n Agents preview UI.

Confirmed on tape: one project agent · workflows-as-tools · Channels (Slack/Telegram/Linear) · instance MCP · Evaluations tab · approval before sensitive send · `{{ $json }}` message-an-agent.
Stance unchanged: **scripts-first** for research; n8n = tool surface / legacy bridge; AI-built workflow = HITL before activate; never webhook-spam. SOP-for-DM pitches = UNVERIFIED.


## Bookmark enrich 2026-09-07 — Describe-workflow via instance MCP
Source: X `20260907-1051` · @JulianGoldieSEO (enable instance MCP → connect AI tool → describe outcome → AI builds structure).

- Stance unchanged: **scripts-first** (`hive-web-research.py` / WebFetch). n8n = tool surface / legacy bridge only (host: `evenslouis.ca/n8n`).
- Describe-workflow path = **WORKAROUND**: AI-drafted graph is a 0→80 draft → human reviews nodes/triggers → activate only after HITL. Never webhook-spam research.
- Platform: **Grok Bot + n8n legacy**. Install: **none (process-only)**.

## Enrich wave-H 2026-09-09 — n8n agent-outside-workflow `2095584609685868891` (marker: wave-H-20260909-n8n)
Packet: `/workspace/research/youtube-daily/repass-20260909/2095584609685868891/`
Docs UI stills: one agent · workflows-as-tools · draft/published · MCP manage · approval before send. Scripts-first lock unchanged. $ SOP UNVERIFIED.

## Wave AA enrich 2026-09-09 — vision TA + Explorium MCP
- `yt:yjBHheCB6Ek`: n8n agent + chart-img (TradingView) vision pattern; thin system prompt + markdown image URL. Live chart API **BLOCKED**; trading **NO-SKILL**. Packet `repass-20260909/yjBHheCB6Ek/` · `recreation/N8N_VISION_TA_AGENT_GATE.md`.
- `yt:57EkKWCsu_4`: Sheets→loop→agent+Explorium MCP→output parser firmographic enrich. Topology **PROVE**; live Explorium key **BLOCKED**. Packet `…/57EkKWCsu_4/` · `recreation/MCP_FIRMOGRAPHIC_ENRICH_GATE.md`.

## Enrich — yt:rW3eyvrSqio (2026-09-21)
Describe→workflow demos: prefer owned MCP + box script proof first. Optional n8n JSON recipe only as ACTIVE/legacy bridge — not Zapier OS. See L2 `rW3eyvrSqio` recreation.

## Enrich 2026-09-21 — dated-CSV daily ledger (`yt:PXMJ6FS7llk`)

Course signal reinforces **script-first research ledger**: scrape/fixture → DataFrame/rows → dated CSV on disk → cron outside n8n. Prefer box Python (`dated_csv_daily_ledger.py` pattern) over n8n Cron+Write Binary for this class. n8n only if ACTIVE map needs a SaaS connector the script lacks.

## Overnight C_STACK enrich — yt:yjBHheCB6Ek (2026-09-21)
Packet: `/workspace/research/youtube-daily/l2-20260921/yjBHheCB6Ek/`
Pattern: **vision→signal→action** — thin agent system prompt + specialty markdown image URL rule + Execute-Workflow chart tool + vision TA prompt.
Hive: n8n ACTIVE optional bridge else **fixture WORKAROUND** (`recreation/vision_signal_action.py` meets_proof). Live chart-img / LLM vision / broker **BLOCKED** · trading **NO-SKILL**.
Stance: scripts-first lock unchanged; do not mint TA bot SKU; promote signals to ledger not chat-only.

## Overnight C_STACK enrich — yt:QCjMBOEhpLE (2026-09-21T20:39:14-04:00)
Pattern **`native-data-table-narrow-query`**: n8n Native Data Tables as agent-local typed store (schema + CRUD get/insert/update/upsert/delete) + narrow filtered query tools + calculator; escalate Postgres at scale.
- L2: `/workspace/research/youtube-daily/l2-20260921/QCjMBOEhpLE/`
- Fixture: `recreation/native_data_table_narrow_query.py` → `proof-run.json` meets_proof=true (SQLite WORKAROUND; live n8n Data Tables BLOCKED)
- DISTINCT vs tonight `aRkxGXKYhVs` Sheets→PG migrate DROP and `57EkKWCsu_4` MCP enrich
- Speed vs Sheets **UNVERIFIED**; Skool **NO-SKILL**; no mint-per-URL

## L2 2026-10-10 YouTube (`yt:i-mBOC3dbZU`, `yt:4DgmXP3GoaA`) — live Data Tables now PROVE in sandbox
- **Live n8n Data Tables: BLOCKED → PROVE (sandbox only)** on an isolated n8n 2.42.6 on the box ([n8n-box-sandbox](sand-workflow:n8n-box-sandbox)): feed-list table → RSS → normalize → Remove Duplicates → Data Table *rowNotExists* → insert; run 1 saved 82 rows, run 2 "Keep Only New" = 0 (`/workspace/research/youtube-daily/l2-20261010/i-mBOC3dbZU/recreation/task1_run*_summary.json`). Filter shape: `{"conditions":[{"keyName":"link","condition":"eq","keyValue":"={{ $json.link }}"}]}`. The SQLite fixture above stays as the no-n8n fallback. Production n8n untouched.
- Agent tools on a growing table must be **bounded** (limit/filter), never Return All; never fetch data in front of the agent node (runs every turn) — see [n8n-llm-build-bakeoff](sand-workflow:n8n-llm-build-bakeoff).
- Multi-agent: supervisor AI Agent + `agentTool` sub-agents with `$fromAI("query",…)` (`yt:4DgmXP3GoaA` 8:55); Agents (Preview) Knowledge rejects image-only PDFs — precheck text first.

## Enrich 2026-10-10: X-bookmark backlog study (signals-2mo-backlog-20261010)
- **n8n AI workflow builder.** n8n can draft a workflow from a plain description. Treat the draft as a starting point: review it node by node, test with pinned data, and only then activate (x:2093432934334411014; feature claim not tested here, needs an n8n instance).


---

## Merged from `n8n-kit-watchdog` (2026-10-11)

- Original description: Use this when Watchdog owns n8n health — smoke, telemetry, ecosystem route, estate hygiene
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — Watchdog

## Own (ACTIVE)
- hive-golden-path-smoke-notify — webhook → register (2 nodes)
- hive-telemetry-ingest — webhook → code(cid) → register; CRITICAL → hive-error-heal (secret)
- hive-ecosystem-route — resolve route → forward with X-Hive-Secret
- Estate: Security/Emergency/Error Recovery/Backup/QA + browser tools

## Missing
- hive-disk-alert → 404 — do not invent; ask operator to scope

## Do
1. Run [n8n legacy ops](sand-workflow:n8n-legacy-ops) before any call.
2. Treat webhook 200 + Executions as SSOT over display-name drift.
3. On fail: [n8n visual debug](sand-workflow:n8n-box-sandbox).
4. Watch pagination (all:true / export script) for counts; UI for screenshots only.
5. Flag SaaS scaffold hygiene to Forge; do not grow estate.

Canon: CONTENT/n8n-learning/agent-playbooks.md


---

## Merged from `n8n-kit-wealth` (2026-10-11)

- Original description: Use this for Automated Stock Analysis n8n reports — Personal CFO templates stay HITL
- Unique content carried: one per-desk section each (workflow names + HITL rule); forge self-heal (99 lines) and researcher RAG scrapers (105 lines) carry most

# n8n kit — Wealth Manager

## Own (ACTIVE)
- Automated Stock Analysis Reports…

## Adjacent
- Inactive “Automate Financial Operations…” → Personal CFO only if operator scopes + HITL

## Do
1. [n8n legacy ops](sand-workflow:n8n-legacy-ops).
2. Portfolio advice stays advisory; money moves = Tier 3.
3. Failures → [n8n visual debug](sand-workflow:n8n-box-sandbox).

Canon: CONTENT/n8n-learning/agent-playbooks.md
