---
name: match-model-to-task
description: >-
  Use when a job has grunt reading plus a hard decision. Route cheap/fast models
  to grunt work; spend the expensive model only on the decision.
---
# Match the model to the task

## When
Long reads, summaries, or multi-step research before a judgment.

## Do
1. Split: extract/summarize (cheap) vs decide/write the call (expensive).
2. Do not run the biggest model on every step.
3. If a local or small model can pull quotes, use it first.

## Don’t
- One fat model for the whole pipe
- Quote a 10× savings number as ours (that claim is UNVERIFIED)


## DeepSeek Flash-as-flagship 2026-09-11 (`yt:Weom9fQnnJ0`) L2 PROVE

Pair with `cheap-read-expensive-decide`. Packet: `/workspace/research/youtube-daily/l2-20260911/Weom9fQnnJ0/recreation/decision-card.json`.

### Do (extra)
1. Match **active work type**, not the marketing flagship label — Flash beat Pro on agent jobs after harness practice while Pro still won plain recall (spoken).
2. If the job is 95%+ reread/context, default cheap; escalate only the decide slice.
3. Treat agent **wrapper/harness** as part of model choice — spoken ~9 pt DeepSWE swing by tool wrap.

### Don’t
- Quote video $ or vendor tok/s as ours (**UNVERIFIED**).
- Assume hive has DeepSeek V4.1 Flash API (**BLOCKED** — WORKAROUND = Grok/Cursor tiers).


## X bookmarks desktop 20260923 — closed tool+args without LLM
Id `2100665210419950031` (@CodingGarden): decision model picks tool + args (search/wiki/weather/todo/HA); responses cite sources; no free-text generator in the loop.

**Map:** closed tool catalog → cheap gate; open-ended reply → expensive model. Pair system-one-decision-gate. TypeSafe face **BLOCKED**.


## X bookmarks desktop 20260923-1635 — per-prompt best-value router
Id `2101811009455358121` (@0xCodila): Jev scored every LLM and picked the best-value model **per prompt** (not one global cheap/expensive split).

**Method atom (FACT pattern / TypeSafe face BLOCKED):**
1. Maintain a small model menu with cost+latency tags.
2. For each prompt, classify job class → pick menu row (not “always Haiku” / “always Opus”).
3. Log the pick; do not quote vendor % savings as ours (**UNVERIFIED**).

**Map:** extend cheap/expensive with **per-prompt menu**. Pair cheap-read-expensive-decide + system-one-decision-gate.


## YT daily stamp 2026-09-24 (`yt:qkCHiEFEZQg` Web Dev Cody 562 Jev demos) L2 PROVE

Packet: `/workspace/research/youtube-daily/l2-20260924/qkCHiEFEZQg/` · A–E PASS · Cap≤1.

### Steal (FACT)
- Score external demo catalogs on axes: creativity / wow / **utility** / technical depth / domain / form / views — **prefer utility** for day-job adopt.
- Distill only orthogonal patterns: **SCORER · ROUTER · GUARD · FILTER · REFLEX** — never mint 562 skills from 562 posts.
- 562 demos = **EXTERNAL_SIGNAL** (operator lock). Candidate eval backlog only; lifecycle ≤ EXPERIMENT_REQUIRED / LOCALLY_SUPPORTED until local hive evidence.
- Recreation: `recreation/utility_first_ranker.py` (utility-weighted sort PROVE).

### Tools
| Need | Path | Label |
|---|---|---|
| Local utility-first rank | packet recreation | **PROVE** |
| Hosted catalog mirror | https://webdevcody.github.io/jev-demos/ | **PROVE** (curl) |
| TypeSafe Jev API as hive face | — | **BLOCKED** — would work if Tier-3 key; use system-one-decision-gate WORKAROUND |
| Vendor 200× / ¢ claims | tape stills | **UNVERIFIED** |

Platform: **Grok Bot + Cursor**. Install: **none (process-only)**.

## X bookmark 20260924-1044
Cross-read with jev-craft-gate: vendor “Jev is the Internet moment” posts stay **menu-not-binary** — match model to task; do not replace Cursor/Grok stack with a single router claim.


## X bookmarks 20260930-1616-desktop — Jev confidence routing + cheap intern moment

Packet: `/workspace/research/packets/x-bookmarks/20260930-1616-desktop/`.

### @svpino Jev workflows by confidence (`x:2105284180242559167`)
**FACT (preview):** Updated workflows to Jev; uses each prediction's **confidence score** to branch; claims faster/cheaper/more options. Cap video.
**Map:** STRENGTHENS menu-not-binary + confidence-gated route (pair cheap-read-expensive-decide, jev-craft-gate). TypeSafe Jev face **BLOCKED**; local confidence thresholds on hive scorer/router **WORKAROUND**. Cap HELD.

### @carm1nee OpenAI "AI research intern" / cheaper models (`x:2104993410905985506`)
**FACT (preview):** Altman clip framing cheaper/faster model era ("internet moment" / research intern). Cap video.
**Map:** Thin STRENGTHENS cheap-read path — prefer cheaper models when job class allows. Vendor intern claim **UNVERIFIED**. Cap HELD news-demo.

Anti: ADOPT TypeSafe Jev as hive brain; mint confidence-router skill; treat Altman demo as FACT pricing. Install: **none**. NO mint.

## X bookmarks 20261001-1028-desktop (`x:2105367304817250566` @Jhaddix)
Thin cross-read: verbose dumps fit **cheap/local capture → expensive decide**; route dictation/ramble to session context, not a frontier one-liner. STRENGTHENS. See cheap-read + voice-ramble same stamp.


## X bookmarks 20261002-1324-desktop — Opus 5.5 marketing ≠ always-Opus

Packet: `/workspace/research/packets/x-bookmarks/20261002-1324-desktop/` · `x:2103839254115700744` (@rileybrown).

**FACT (preview):** Weekly wrap calls Opus 5.5 a “monster” and notes GPT Voice gains. Cap video.

**Map:** Thin STRENGTHENS menu-not-binary — marketing flagship label still does not collapse cheap/expensive split. Route by job class; escalate only decide slice. Vendor capability claims **UNVERIFIED** from preview.

**Anti:** Default every hive job to Opus 5.5 because a weekly wrap said “monster”. Install: **none**. NO mint.

## Enrich 2026-10-10: why batch size sets token price (`yt:xP1kjDOisVw` bycloud)
Decode is memory-bandwidth-bound and the weights are read once per step for the whole batch, so cost per token falls ~60x from batch 1 to 128 while per-user speed drops (`inference_econ.py`). Cheap providers are cheap because they batch. For latency-critical steps, pay for low-batch or wafer-scale serving.

## Enrich 2026-10-10: X-bookmark backlog study (signals-2mo-backlog-20261010)
- **Local box for low-stakes chatter.** With heavy experimental token spend, a local model (for example Gemma 4 31B) can take low-stakes traffic. The payback math is one user's claim (x:2040204860080230594). We have no GPU on the box, so this is BLOCKED here.
- **Cheap engine for the bulk, frontier model for the hardest fifth** (x:2069128452976832860, corroborated by x:2040204860080230594 and this skill's existing tiering). Price and quality figures UNVERIFIED.

## Enrich 2026-10-11: a model name is not a spec (yt:zxnXemN98d0)
- The same model id on a router can be served by many providers at different quantizations (BF16 → FP4 or "quantized"), context caps and max-output limits, and the default route is often the cheapest. A capped context makes agents silently compact and reread, failing quietly and costing more. When routing (OpenRouter via Cursor), pin provider, quantization floor, minimum context and max output for anything that matters; check which provider served the run.
- Self-hosting a frontier open-weight model rarely pays: creator math (re-checked) is an 8×B200 node at ~$42/h (~$30k/month), needing ~784 output tok/s nonstop to beat a $15/M API. Local wins only for private data, frozen weights, or offline work, at ≤~31B sizes. Before celebrating an "open" release, check the file size and the license (revenue caps, territory clauses). PROVE: `recreations/20261011/selfhost_breakeven.py` in signals-2mo-backlog-20261010 → PASS. Market figures are the creator's, UNVERIFIED.

## Enrich 2026-10-11: split by phase, not by project (yt:NZq88JAJSag, Cole Medin)
- In a plan → implement → validate → review loop, keep the frontier model on planning and review and give implementation to a cheap fast model, with the test/build check as the gate. The creator built the same app several ways and says the split cost about 4x less with similar results (UNVERIFIED).
- The math only reaches ~4x if implementation is ~80% of the tokens and the price gap is 10–20x (`/workspace/research/packets/signals-2mo-backlog-20261010/recreations/20261011/run1430/phase_split_cost.py`, example inputs, PASS). Measure your own token share per phase before expecting that saving.
