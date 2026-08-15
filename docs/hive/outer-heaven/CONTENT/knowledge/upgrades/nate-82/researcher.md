# Researcher — Nate 82 UNTESTED upgrades

**Desk:** `researcher` · **Cluster:** BUILD  
**Status:** UNTESTED · `do_not_auto_install: true`  
**Sources:** 82 takes `job-cards/takes/{id}/researcher.md` + LEARNED packets. Caption-only. No transcript re-walk.  
**Stack:** Cursor + Grok. On-tape vendors stay on-tape.  
**Clients:** parked. Tape $ UNVERIFIED. No LESSONS merge. No atom dump of 146.

Parts, not a Nate clone. Researcher owns full-read + steal + IMPLEMENTATION_MAP — not a RAG SKU and not a vector vendor.

## Desk job (unchanged)

Full read pass. One STEAL_SHEET + DEEP_SUMMARIES. Never thesis-only. Never quote tape $ as ours.

## Upgrades

### 1. Human-gesture retrieval chooser

**One-line:** Pick the door a careful human would open — filter / SQL / full-read / vector — never vector-first.

- **Capability:** Write the questions first and what the answer must look at. Tabular + known fields → filter (closed vocab + date format). Aggregations → SQL. Small ordered docs → full read. FAQ-from-a-hundred → vector.
- **Implementation fragment:** Speech: chunk retrieval loses document-level context; “summarize the meeting” summarizes *hit chunks*; “highest sales week” misses weeks not in the chunk. Token counts / 80% = UNVERIFIED. Clicks = `unobserved`.
- **Primitive:** RETRIEVE = THE HUMAN MOVE.
- **Leverage:** Wrong answer is usually wrong *context*, not a dumb model.
- **HITL:** Do not upload secrets / PII into a managed store. Do not add a hive vector SKU.
- **Operate-never:** n8n-cloud / Supabase / Pinecone as hive default. Quote demo revenue as FACT.
- **Evidence:** `kOKavHnlPik` · `ZwQ8rJhVCr4` (SOURCE).
- **Contradiction (labeled):** “Easiest RAG in minutes” managed Assistant (`QojPKL96Dx4`) vs this chooser. Do not flatten into “Pinecone wins” or “always four doors.” Assistant hides the pipeline; chooser names the door.

### 2. Ingest-count, then one gold question

**One-line:** After folder-drop ingest, confirm chunk count, then ask one known fact before building pipeline 2.

- **Capability:** File created → download by ID → upsert → N chunks visible → gold Q matched to the doc.
- **Implementation fragment:** Speech: five items appeared; shipping 1–2 / 3–7 “correct.” Chunker settings = `unobserved`. One Q ≠ RAG accuracy (keep sibling rows).
- **Primitive:** SMOKE-THE-STORE — count then known-ask.
- **Leverage:** Ingest and ask are two pipelines. A long RAG prompt first is the field’s fail.
- **HITL:** None on the smoke. Do not publish the answer as FACT.
- **Operate-never:** Supabase as hive; “look how smart / I didn’t even prompt” as quality law.
- **Evidence:** `Fu6vOfzFmcw` (SOURCE). Do not flatten vs `irg-2IfAjpo` / `KVFfApQZhE4` (managed File Search, no lifecycle).

### 3. Cite, then Ctrl+F the highlight

**One-line:** Demand document + page + a span you can find. Default “content” is often a summary — that is not a quote.

- **Capability:** Tool already returned pages; the agent must be told to speak them. Invented Nike quote Ctrl+F-missed until highlights were on (speech).
- **Implementation fragment:** Speech: no system prompt → correct number, no sources; “exact quote” prompt still faked until `include_highlights`. Playground model ≠ API model. HTTP body / curl = `unobserved` beyond what speech names.
- **Primitive:** TRUST = CTRL+F-ABLE SPAN.
- **Leverage:** Cite-the-page is already hive (`info-gain-cite`). This is the scar: summary-as-content lies.
- **HITL:** Do not publish unverified cites. Tape % / tokens UNVERIFIED.
- **Operate-never:** Buy Pinecone because the bakeoff; treat Assistant summary as a quote.
- **Evidence:** `QojPKL96Dx4` · `KVFfApQZhE4` · `QrJhdTbK3TU` (SOURCE).
- **Contradiction (labeled):** Tesla page 4 vs agent “p3–7.” Keep the miss. Gemini File Search cite UX is a different row — do not merge.

### 4. Bake-off on our task, one knob

**One-line:** Same brief, same docs, change one of model / prompt / tools. n=1 vendor win is not a crown.

- **Capability:** Hypothesis → labeled expected → run → writeback → inspect misses + tokens + time. Eval n≫10 when he says so; six-row demo is a shape, not a law.
- **Implementation fragment:** Speech: Assistant ~1277 tokens vs vector ~30k vs Supabase ~5k on one Q — UNVERIFIED. “Change one variable per run.” Eval-tab clicks = `unobserved`.
- **Primitive:** ONE-KNOB BAKE-OFF.
- **Leverage:** “I reran it and it looks better” is not research.
- **HITL:** Do not crown a release / vendor. Do not sell a workflow without an eval set (his claim — not a hive price).
- **Operate-never:** Quote 4.1% / 42% / six-row scores as FACT. Flatten arena scores into this eval.
- **Evidence:** `QojPKL96Dx4` · `8IUWeF3B-hk` · `lcNN3X9gXls` · `X80ljdCPM_U` · `Vb1SwBAn9cQ` (SOURCE).

### 5. Docs-curl, then assume the side effect

**One-line:** Fact-check the node against a curl. A send can succeed while the run fails. Don’t tool-call a model that sends before it can ack.

- **Capability:** Per-job eval on *our* task. Don’t trust a wrapper that drops required fields.
- **Implementation fragment:** Speech names the scar; exact node/API = `unobserved`. Gemini 3 Pro “build anything” stays on-tape.
- **Primitive:** SIDE-EFFECT ≠ RECEIPT.
- **Leverage:** Vendor docs lie by omission. Bake-off after the curl, not before.
- **HITL:** Send / book. Pass ≠ send.
- **Operate-never:** Add Gemini as hive; always-allow execute.
- **Evidence:** `Vb1SwBAn9cQ` · `EiHVBPyvTiE` (SOURCE).

### 6. Split research, watch idle, approve subs

**One-line:** Parallel researchers get territory and a kill switch. Glance for idle/approval; inspect is a different product.

- **Capability:** Delegate independent reads → diagram / write-back → human approve before the next hop. Spawn prompt is the only memory — name the recipient.
- **Implementation fragment:** Speech: activity-log skin ≠ seeing the work. Clicks = `unobserved`.
- **Primitive:** WATCH-IDLE-APPROVE.
- **Leverage:** Unwatched parallel burns the session and invents cites.
- **HITL:** Approve subs. Kill a bad path. No 24/7 research spend.
- **Operate-never:** Claude dashboard as ours; ultra-herd.
- **Evidence:** `xsAOpqjebOo` · `62Rfe1w9NBc` · `vDVSGVpB2vc` · `e18sdZLwP7o` (SOURCE).
- **Contradiction (labeled):** Silent specialists vs talking crew — see Forge #3. Researcher uses silent for pile, crew only when bounce is the job.

### 7. Research → lookup → draft (send removed)

**One-line:** The research machine ends at a draft and a log. Contact resolve is a lookup, not a send.

- **Capability:** Cache the research (`tDGiWn0flK8`). Follow-up reads the ticket (`hN58VkYLie4`). Newsletter path: research → plan → pin → human ships (`pxzo2lXhWJE` · `0Ujdys4LqNs`).
- **Implementation fragment:** Speech sequences only. Outreach $ / “$10,000 workflows” UNVERIFIED.
- **Primitive:** DRAFT-THEN-GATE.
- **Leverage:** Builder tapes hide the send. Hive already has `send-removed`.
- **HITL:** Send / publish. Always.
- **Operate-never:** Auto-send; new ICP from a similar-build inbound tape; quote last-price-plus as ours.
- **Evidence:** `nQtogLs_dlg` · `ECfusvK5tEU` · `pxzo2lXhWJE` · `0Ujdys4LqNs` · `KGXFkUlBHxw` (SOURCE).

### 8. Three questions, then layer (agent last)

**One-line:** Root problem → in-loop? → pure logic? → fixed order? Start low. Agent almost never first.

- **Capability:** Architecture brake for the rest of the 82. Tools can be workflows. Variable KB-pass count is the named exception — do not flatten it away.
- **Implementation fragment:** Speech pyramid GPT → no-AI workflow → AI workflow → agent. 50% / 3000 UNVERIFIED.
- **Primitive:** CLIMB ONLY WHEN FORCED.
- **Leverage:** Agent-first tapes in this shortlist will silently overwrite this unless Researcher keeps the tree in LEARNED.
- **HITL:** Do not spawn an agent SKU for a parked client.
- **Operate-never:** Agent-first intake. Plus as hive.
- **Evidence:** `4OOS96i2gfI` (SOURCE). Aligns with `wk8KV280fbg` (pain then outcome) — do not merge into one slogan.

## Labeled contradictions (do not flatten)

| Keep both | Why |
|-----------|-----|
| Four-door chooser vs managed Assistant “drop file and chat” | `kOKavHnlPik` · `QojPKL96Dx4` |
| Folder-count-then-gold-Q vs managed File Search (no lifecycle) | `Fu6vOfzFmcw` · `irg-2IfAjpo` / `KVFfApQZhE4` |
| Don’t chunk a count vs chunk-count as ingest stop | Count-as-metric (`irg-2IfAjpo`) ≠ count-as-smoke (`Fu6vOfzFmcw`) |
| Agent-last vs 80 builder-agent tapes | `4OOS96i2gfI` is the brake |
| Full-context three knobs vs vector cheaper/unordered | Same tape `kOKavHnlPik` — token numbers UNVERIFIED |
| “Exact quote” prompt vs summary-as-content | `QojPKL96Dx4` scar |
| Don’t 24/7 vs 24/7 Claude host tape | `EuzYhzB0vbI` · `ehg4fhydTgs` |

## System-upgrade flags (not a Researcher SKILL.md)

See `CLUSTER-build.md`. Researcher spotted: retrieve-by-human-gesture, cite=Ctrl+F, one-knob eval, side-effect≠receipt, start-low layer, watch-idle-approve.

## Operate-never (desk)

New vector vendor. Thesis-only. Quote tape $ / tokens / % as FACT. Auto-send. Unpark a client. Merge `LESSONS-FROM-TAPE.md`. Dump 146 atoms this turn.
