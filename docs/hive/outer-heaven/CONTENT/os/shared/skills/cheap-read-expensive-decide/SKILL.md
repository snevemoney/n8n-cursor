---
name: Cheap read expensive decide
description: >-
  Use when routing models — cheap models for read/summarize; expensive models for decisions and taste.
---

# Cheap read expensive decide

Sources: Simon Scrapes `yt:icM0ewXGvAw`; Nate match-model-to-task; Demkinn/Prompting doctrine; operator doctrine.

## When
Choosing a model for a step.

## Do
1. Read/summarize/extract → cheap.
2. Taste, POSITION, money framing, architecture → expensive.
3. Record the choice in the packet when it matters.

## Don't
- Burn frontier model on bulk caption scrub
- Use tiny model for cinematic taste work

## Tools
| Need | Path |
|---|---|
| Model routing | Grok tiers / Cursor model pick — **PROVE** |

## Prompts
**Route model**
```
Step type: read/summarize → cheap; taste/POSITION/money → expensive
Record choice when it matters.
```

## Steal thicken — Simon 19 mistakes (`yt:icM0ewXGvAw`) FACT
**Mid-conversation model switch can cost more than staying:** each model has its own prompt cache; switching (e.g. Opus→Haiku→Opus) rebuilds uncached input for the whole context. Prefer: pick model at session start for the job class; for a cheap side-ask, use a **fresh short session** or side-channel — not a mid-thread downgrade on a fat context.

**Prompt**
```
Session model locked?: Y/N
If cheap side question: new short thread /btw-style — do not switch mid-cache.
```

## Implement 2026-08-26 meter
One Grok Bot weekly meter. Auto is per-model. Do not switch models mid-fat-context to save. Do not binge 15 parallel hunts.


## WL26-100 remaining L2 2026-08-27 — effort + thinking (PROVE tape)

Packet: `/workspace/research/packets/signals-20260826/WL26-100-L2-REMAINING.md`

### Chase (`yt:eF20iepBQCU`) FACT timedtext
- Medium effort default for normal work. Extra-high → max on his DeepSuite slide was cost-without-gain. **HIS $ / % UNVERIFIED.** Headroom = high on the hard job only.
- Dynamic / ultrathink swarms: cap spawned agents or wait for weekly reset. Do not default every task to a 100-agent fan-out.

### Hormozi (`yt:sPtx8Rm78Mo`) FACT timedtext
- Do not let the cheap model **decide** while you skip the thinking — you then have no context for the why. Use cheap for draft; expensive / human for the call.

## Agent Factory nondilutive 2026-08-29 (`yt:L8pR2YAV8Fw`) watch-page PROVE
Scanning grants / loans / tax credits / procurement for Canada is a **cheap read**.
Matching + a draft checklist is cheap. Submitting, paying Happly, or treating guest $ traction as FACT is expensive.
Guest claims (84k users · $90M landed · $2T NA pool · BEP $265M) = **UNVERIFIED**.
No auto-submit. No extension install. Tier 3 propose-first. Pair `nondilutive-funding-scan`.

## Simon 37 2026-08-30 (`yt:RDeofKimDxo`) watch-page PROVE
Do not switch models mid-fat-cache to "save" a side question (already here). Extra: stay on the locked model and say **give me a quick answer** for the cheap turn so the cache stays warm. Concise default: results first, keep errors/warnings. ccusage CLI / Claude billing dashboards BLOCKED — check the one Grok Bot weekly meter before a binge. Caveman token-trim install NO-SKILL.


## DeepSeek Flash-as-flagship 2026-09-11 (`yt:Weom9fQnnJ0`) L2 PROVE

Packet: `/workspace/research/youtube-daily/l2-20260911/Weom9fQnnJ0/` · recreation: `recreation/route_jobs.py` + `decision-card.json`.

### Steal (FACT timedtext + stills)
- Vendor retired **V4 Pro** as default and sent traffic to **V4.1 Flash** — budget model as flagship when active compute + memory + harness win.
- Read wakes fewer params than write (spoken ~8B read / ~16B write vs Pro ~49B both); customer tokens are mostly **re-reads** → cheap read is the money.
- KV / shared notes / narrower number formats shrink session memory (spoken &lt;1GB / M tokens) — we did **not** re-measure on box.
- Training/RL inside real agent harnesses (Claude Code / Codex / Open Code / vendor harness) flipped Flash past Pro on agent benches; architecture alone made it cheap.
- Launch catch: same model swings ~9 pts by wrapper; Flash can overthink (spoken 81% thinking tokens).

### Hive map (WORKAROUND)
| Tape idea | Hive action |
|---|---|
| Cheap read half | Grok/Cursor **cheap/fast** for summarize/extract/caption/reread |
| Expensive write/decide | Grok/Cursor **expensive/Max/HITL** for money/POSITION/architecture/taste |
| Harness matters | Prefer good tools/process over bumping model nameplate |

### Labels
- DeepSWE on-screen 74.2 vs Opus 5 74.0 = OCR still `frames/t0315.jpg` (source claim, not our bench).
- All **$** = **UNVERIFIED** — never quote as hive FACT.
- **BLOCKED:** DeepSeek V4.1 Flash endpoint + local GPU KV measurements — would work if we had those.
- Platform: Grok Bot + Cursor · Install: none (process-only).

### Prompt
```
Job signals: summarize|extract|caption|reread → CHEAP_READ
            money|position|taste|architecture|decide → EXPENSIVE_DECIDE
            both → SPLIT (cheap packet → expensive call only)
Do not mid-switch fat cache for a side ask.
```

## Per-run research budget gate 2026-09-17 (`yt:FqnNL8fnUWo`)

Morning-brief pattern: lock a **research budget / token gate** per run before public web prep (source spoken ≤$0.25 — treat $ as **UNVERIFIED**; use our meter/budget flag instead).
Calendar fetch + template assemble = cheap/deterministic host; drafting taste = bounded model call; do not wake an expensive agent thread for every weekday 6am.
Recreation: `l2-20260917/FqnNL8fnUWo/recreation/`. Pair host-automations-outside-subscription.

## X bookmarks 20260918-1338 — Jev ultrafast / browser-use speed

Packet: `/workspace/research/packets/x-bookmarks/20260918-1338/` · sources x:2100411068426469552 (@gregpr07 → github.com/browser-use/jev-ultrafast) · x:2100786001765371926 (@gilgNYC quote)

**FACT:** Live bookmark pair points at `browser-use/jev-ultrafast` and frames GPT browser-use as slow.
**UNVERIFIED:** Vendor speed claims; production fitness for hive.
**INFERENCE:** Same-day continuity with YT Jev System-One routing signal — prefer cheap/local browser steps, escalate only when decide/money/taste.

### Map
1. Route: summarize/extract/navigate-reread → **CHEAP_READ**; money/POSITION/architecture/taste/decide → **EXPENSIVE_DECIDE**.
2. Prefer Grok/Cursor + existing Playwright / Browser-use MCP already in catalog — **WORKAROUND**.
3. `browser-use/jev-ultrafast` = **RESEARCH-OK** only via [awesome-skill-import-gate](sand-workflow:awesome-skill-import-gate). Do **not** install second browser-agent face this fire.
4. `system-one-decision-gate` was ABSENT at X-close 20260918-1338; **minted 2026-09-21** from YT L2 `B-1nLUAixzI` REDO — see section below.

| Need | Label |
|---|---|
| Cheap vs expensive routing (process) | **PROVE** |
| Existing Playwright / Browser-use MCP | **PROVE** (connector); per-task prove still |
| Grok/Cursor instead of new agent install | **WORKAROUND** |
| Install jev-ultrafast as hive face | **BLOCKED** |

## System-One local gate 2026-09-21 (`yt:B-1nLUAixzI`) GHOST Sep-18 REDO

Packet: `/workspace/research/youtube-daily/l2-20260918/B-1nLUAixzI/` · skill: [system-one-decision-gate](sand-workflow:system-one-decision-gate) · recreation `recreation/decision_gate.py` (proof **5 CHEAP_LOCAL / 1 ESCALATE**).

### Steal
- Bounded-label decisions = cheap System-One path; free-text / taste / money / architecture = expensive decide.
- TypeSafe Jev API = **BLOCKED** (waitlist/key). Hive uses **WORKAROUND** local lexicon gate — proves routing shape only, not vendor latency/$.
- Vendor homepage 193× / 444× / ¢ claims = **UNVERIFIED**. No Jev / typesafe SDK / jev-ultrafast install as hive face.
- Pair: LLM writes plan once → gate runs repeated tiny calls (source pattern).

### Map
| Need | Label |
|---|---|
| Local decision_gate.py 5/1 proof | **PROVE** |
| Process cheap vs expensive routing | **PROVE** |
| TypeSafe Jev live | **BLOCKED** |
| Vendor 193×/$ | **UNVERIFIED** |

### Prompt
```
If step is closed-label route/score/yes-no → system-one-decision-gate (cheap)
If open-ended / low-conf / taste|money|architecture → EXPENSIVE_DECIDE
TypeSafe = BLOCKED; local WORKAROUND only.
```

## Enrich 2026-09-21 — MODEL_ROUTE (yt:VE5dsWll06M)
Agent harness can ask a System-One gate whether a coding/prompt task is simple (USE_CHEAP) or complex (USE_EXPENSIVE) before waking the big model. Local shape: `l2-20260921/VE5dsWll06M/recreation/harness_route_risk_judge.py`. TypeSafe face BLOCKED; vendor multipliers UNVERIFIED.


## X bookmarks desktop 20260923 — Grok decides-via-gate then acts
Ids: `2102453475078533209` · `2101433560796467348` (and echoes). Preview loop: `prompt → Grok Bot → cheap decision → Grok Bot acts → result`.

**Steal:** Same as System-One plug — expensive agent does plan/act; bounded gate owns micro-decisions. Do not mint a Jev+GrokBot product skill. Speed/$ “95% stacks” = **UNVERIFIED**.


## X bookmarks desktop 20260923-1635 — menu not binary
Id `2101811009455358121`: best-value pick can be mid-tier for some prompts. Binary cheap|expensive is the floor; a tagged menu is the upgrade when latency/$ differ by job class. TypeSafe **BLOCKED**; Grok/Cursor tiers **WORKAROUND**.


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

## X bookmark 20260924-1044 (`x:2101292455391809670` 0xRicker)
INFERENCE: treat millisecond “control layer / router” claims as **cheap-read → expensive-decide** routing, not a new hive brain.
- Atom: route next-step with a tiny classifier/gate before spending a frontier call.
- Label: WORKAROUND (vendor Jev ≠ ADOPTED; map to existing scorer/router/guard skills).
- Lifecycle: CANDIDATE → EXPERIMENT_REQUIRED (local ranker already touched Sep24 YT); do not ADOPT from bookmark alone.


## X bookmarks 20260930-1616-desktop
Cross-read `x:2105284180242559167` (Jev confidence branching) + `x:2104993410905985506` (cheaper-model "intern" framing): confidence/score gates before expensive calls STRENGTHENS this skill; vendor Jev/OpenAI faces stay WORKAROUND/BLOCKED as prior. Cap HELD. See match-model-to-task same stamp.

## X bookmarks 20261001-1028-desktop (`x:2105367304817250566` @Jhaddix)
Verbose context dump before frontier spend STRENGTHENS cheap-read → expensive-decide: front-load understanding (local/dictation/ramble) so the expensive call gets a dense brief, not a thin ask. Pair voice-ramble. Process-only. NO mint.

## X bookmarks 20261007-1032-desktop (`x:2107573382229188645` @OpenAIDevs Decisions API)
FACT (docs + community announcement + openai-python PR #4033, checked 2026-10-07): OpenAI Decisions API is in public beta at `POST /v1/decisions`, model `gpt-6-luna` only. One shared `input` (text/image) plus a `questions[]` array with unique names; typed answers: **predicate** (probability true), **choice** (fixed options + confidence), **score** (rubric level, probability-weighted). Vendor claims ~10x faster than the same decision via Responses API (**UNVERIFIED** locally). No input caching yet. Also reachable via Vercel AI Gateway (`openai/gpt-6-luna-decisions`) and AI SDK `experimental_decide`.
- Atom: the cheap gate can now be a *typed decision call* (predicate/choice/score with confidence) instead of a free-text cheap-model prompt; branch on confidence and escalate to the expensive call only below threshold.
- Batch several gate questions into one call (one input, many named questions) rather than N classifier calls.
- Label: **EXPERIMENT_REQUIRED** — needs an OpenAI key + local latency/accuracy check vs current gate; Grok/Cursor-native scorer stays the WORKAROUND. STRENGTHENS this skill; no new skill minted.
- Refs: [OpenAI Decisions guide](https://developers.openai.com/api/docs/guides/decisions) · [Vercel explainer](https://vercel.com/i/what-is-openai-decisions-api) · [openai-python PR](https://github.com/openai/openai-python/pull/4033)

## L2 2026-10-10 YouTube (`yt:i-mBOC3dbZU` n8n × Flowgrammer bakeoff)
Atom: **cheapest model that passes a production-break rubric**, judged on the built artifact, not chat. On tape all 6 models passed the simple build (GLM 5.3 $0.68 cheapest) but only Grok 4.7 ($7.36 total) and Opus 5.5 ($8.68) passed the agent+API build; GLM/Kimi/Qwen/Astra DQ (Return-All tools, pre-agent fetch, no error response). So: a cheap model is fine for simple, well-specified builds; pay up (or steer by hand) when latent production failures are possible. Method + grader + ledger: [n8n-llm-build-bakeoff](sand-workflow:n8n-llm-build-bakeoff). Contestant re-runs BLOCKED on box (OpenRouter key lives in Cursor → Cursor cloud agent).

## Enrich 2026-10-10: X-bookmark backlog study (signals-2mo-backlog-20261010)
- **Cheap model scores, code commits.** A cheap model classifies, dedupes and scores drafts against your own rules; deterministic code saves and verifies (x:2100979911825789393; the 193x/444x figures are UNVERIFIED).
