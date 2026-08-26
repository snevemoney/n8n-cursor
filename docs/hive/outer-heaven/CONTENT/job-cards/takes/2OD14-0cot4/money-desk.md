# Money Desk — 2OD14-0cot4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/2OD14-0cot4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/2OD14-0cot4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~3855 words. Nate: GLM 5.2 inside Claude Code — cheaper/faster-sometimes; harness stays, engine swaps. Caption-only; timestamp UNKNOWN. Beats in order: intro edited by GLM from raw→watchable via one `/goal` (~1h15 for a 23s clip; GLM 5.2 1M context; ~357k tokens) — not perfect; some tasks faster than Opus, this one slower. Design A/B: same company sites; Opus tell = weird F font; GLM ~3:59 vs Opus ~14:59; GLM fewer tokens + ~5× cheaper/token, similar result. Homework: Codex wrote the assignment (no cross-contamination); Codex judged; Opus (Agent 2) won on duplicate-record edge (true vs 1 vs 1.0); GLM good, Opus more precise. Feel: GLM solid when not heavy-reasoning; Opus still better closed model; maybe 10–20% of daily tasks need Opus, 80%+ GLM or Sonnet 3.7 — model-per-task is the skill. Counter: Opus ~5 min vs GLM ~24 min on another job. Billing aside: $60/mo z.ai; 4–5h hammer, five sessions; 5h quota >halfway, weekly ~10% UNVERIFIED. Creative `/goal` HTML: GLM ‘anatomy of attention’ (stars, token graph, tired→it→animal); Opus ‘life of a Death Star’ timeline + F font; GLM ~35 min vs Opus ~11 — hit/miss on speed; more reasoning → slower GLM. CC is a harness; Claude models fit it best; GLM still does `/goal`, reads CLAUDE.md, uses skills. Storm research skill `/goal`: open vs closed source → HTML; all sub-agents GLM; personas; ~27 min; V2 = second pass; 60s summary, five findings with supporter/challenger lenses, hidden connection, assumptions, what-to-do-different. Trust GLM to gather opinions/sources; want Opus to decide what matters / apply. Not binary — which step gets which model. Why GLM: open-source, 753B (Ollama card 756B), too big to run at home so he rents z.ai like he rents Anthropic, much cheaper. Price card: Opus 4.8 $5 in / $25 out vs GLM $1.40 / $4.40 ≈5× UNVERIFIED. Fable pulled from sub = rent can vanish; Anthropic/OpenAI not profitable; $200 Max vs ‘$8,000 inference if you use it’ UNVERIFIED; fear Fable returns API-only > Opus $. Local OSS = hedge. Benches: vs Opus 4.8 / GPT-5.5 comparable; Frontier SWE > GPT-5.5; beats Opus 4.7 and latest Sonnet on many evals — take with salt, feel matters. Setup: z.ai site (chat/landing/3D/minigame) → API console; pay-per-token or $16 / $64 / $144/mo (yearly cheaper); not a sponsor; maybe $100 Claude + $64 Z and bounce by task. API key → edit `.claude/settings.local.json` env: Anthropic base URL → Z, Anthropic auth token = Z key, default models = GLM 5.2, Anthropic API key blank. Per-directory: `GLM/` folder has the json; `Opus/` folder has none → Max Opus. Slide deck this video = GLM using his deck skill (calls him Herc / Herc 2). Close: more local/OpenCode content if comments ask; labs know model may not be the moat (services, forward-deployed). Like CTA.

## B. Atomic Knowledge
### Harness-stays-engine-swaps
- **Claim:** Claude Code is the car; the model is the engine. Point Anthropic base URL at Z, put the Z key in the auth token, blank the Anthropic key, set default model GLM 5.2. Two directories = two engines.
- **Reasoning:** Same skills, CLAUDE.md, `/goal` ran on GLM. Storm V2 and the slide deck used his existing skill.
- **Mechanism:** Per-project `settings.local.json`. Do not bake the key. Bounce by task, not by religion.
- **Evidence:** On-tape GLM folder vs empty Opus folder; 1M context; 357k on the intro `/goal`.
- **Conditions:** You already live in a harness (we do not install CC).
- **Exceptions:** z.ai / GLM / Claude Code / Codex / Hermes / OpenCode / Ollama are not ours. Paying Z is HITL.
- **Action:** Steal engine-vs-harness. Do not install or pay.
- **Confidence:** high as a pattern
- **Source:** 2OD14-0cot4 @ UNKNOWN
- **Epistemic:** SOURCE
### Model-per-step-not-per-religion
- **Claim:** Maybe 10–20% of tasks need Opus; 80%+ can be cheaper. GLM gathers; Opus decides. Speed is hit/miss — intro 1h15 vs design 3:59 vs homework-loss on duplicates vs 24 min vs 5 min vs 35 vs 11.
- **Reasoning:** Codex-written homework + Codex judge: Opus caught true/1/1.0. Orchestration (Storm personas + verify) mattered more than the base model for the research HTML.
- **Mechanism:** Assign the model to the hop: gather vs judge vs design. Measure time and the edge case, not the blog bench.
- **Evidence:** On-tape 5× price card; $60 plan quotas; Frontier SWE claim UNVERIFIED.
- **Conditions:** You have more than one hop.
- **Exceptions:** 80/20 and $5/$25 vs $1.40/$4.40 are his cards, UNVERIFIED. Do not analog as our COGS.
- **Action:** Steal model-per-step. Do not quote 5× as FACT.
- **Confidence:** high as a rule; numbers UNVERIFIED
- **Source:** 2OD14-0cot4 @ UNKNOWN
- **Epistemic:** SOURCE
### Rent-can-vanish-so-know-the-escape
- **Claim:** Fable left the subscription. Unprofitable labs may return features as API-only. OSS you can run (or rent cheaper) is a hedge — he cannot run 753B at home so he still rents Z.
- **Reasoning:** Moat-after-model = services / forward-deployed (same thesis as `brB-hSiV2iU`).
- **Mechanism:** Know which hops are gather-cheap vs judge-dear. Do not build the business on a preview model.
- **Evidence:** On-tape Fable July-window / Thor tweet from the wiki tape; $200 vs $8k inference UNVERIFIED.
- **Conditions:** A vendor feature is in your critical path.
- **Exceptions:** Local OSS is not a hive install. $16/$64/$144 Z plans are not ours.
- **Action:** Steal rent-hedge as a CFO observe. Do not buy Z.
- **Confidence:** medium — vendor-risk essay
- **Source:** 2OD14-0cot4 @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: open cheap models inside a good harness are enough for most hops. Priority: orchestration > base model; directory-level engine swap. Experience: one long day, five sessions, A/Bs. Contrarian: Opus is not 5× better at one-shot design. Uncertainty: benches grain-of-salt; quotas anecdotal.

## D. Procedures
His order: z.ai key → settings.local.json route → GLM directory vs clean Opus directory → `/goal` / skills as usual → pick gather vs judge. Our order: do not create a Z account. Steal model-per-step and harness-vs-engine. Caption-only: console clicks UNKNOWN.

## E. Examples
**Situation:** Same site prompt. **Action:** GLM vs Opus. **Reasoning:** price vs F-font. **Outcome:** 3:59 vs 14:59, similar, GLM cheaper. **Lesson:** Design one-shot is not where you buy Opus.

**Situation:** Codex homework. **Action:** Codex judges. **Reasoning:** no self-grade. **Outcome:** Opus wins on true/1/1.0. **Lesson:** Precision hops still pay.

**Situation:** Storm open-vs-closed HTML. **Action:** all sub-agents GLM, V2 pass. **Reasoning:** orchestration. **Outcome:** he would gather on GLM, think on Opus. **Lesson:** Split the process.

## F. Decision Rules
IF the hop is gather/design-one-shot → cheaper model may be enough. IF the hop is edge-case/judge/apply → he still wants Opus. IF speed matters → measure; GLM is not always faster. IF $5/$25 vs $1.40/$4.40 / $60 / $200 / $8k → UNVERIFIED. Refuse: z.ai / Claude Code / Codex / Hermes / OpenCode / Ollama as ours; pay Z.

## G. Contrarian
Rejects ‘always Opus.’ Rejects ‘GLM is always faster.’ Rejects benches without feel. Rejects model-as-forever-moat.

## H. Assumptions
One day, five sessions. Codex wrote and judged the homework (circular if you distrust Codex). 753B not local. Not a sponsor — still an install video. Survivorship: his skills already existed. Falsifier: Z route breaks CC tools. Speech≠behavior: ‘open source / yours’ then a $60 rent.

## I. Questions
Any receipt we can open for 5× on a real job? Did the intro `/goal` actually ship as the YouTube intro? What’s Z’s real quota math?

## J. Connections
SYSTEM SYNTHESIS: harness-vs-engine = wrapper thesis `brB-hSiV2iU`. Model-per-step = gather vs show `hQvwMj7IJe4`. Storm personas = mixture-of-experts. z.ai/CC/Codex operate-never. $ cards → `pricing-margin-roi-guardrails` UNVERIFIED.

## K. Future-Use
Unassigned: directory-level engine swap as a cost-control pattern (observe). Fable-as-API-only as a vendor-risk flag.

## Steal / Operate-never

### Machine: Model-per-step-inside-one-harness
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: a job with gather + judge hops → action: cheap model gathers; dear model judges; measure time and the edge case → checkable stop: you can say which hop paid for Opus
- **Questions / signals:** Is this gather, design, or judge? Did we measure? Is the key in env not in git?
- **Qualify / frame / objections:** Frame: swap the engine, keep the harness. Objection: ‘OSS is free’ — he still pays Z because 753B doesn’t fit.
- **Procedure:** Do not open z.ai. Steal the split. HITL any pay. Tape $ UNVERIFIED.
- **Example that proves it:** 3:59 vs 14:59 design; true/1/1.0 Opus win; Storm 27 min GLM gather. UNVERIFIED $.
- **Why it works:** Most hops are not the 10–20% that need the dear model. Orchestration beats the logo on the engine.
- **Conditions / exceptions:** Works as a split. Exception: z.ai / CC / Codex / Hermes / OpenCode / $60/$200/$8k / 5× as FACT operate-never.
- **Operate-never payload:** z.ai account · Claude Code · Codex · Hermes · OpenCode · Ollama · pay Z · 5× as analog
- **Hive run (existing skills only):** `token-receipt` (proposed) · `ask-principal` · `pricing-margin-roi-guardrails` · `input-required-gate`
- **Source:** 2OD14-0cot4 @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote $1.40/$4.40 / $5/$25 / $60 / $16/$64/$144 / $200 / $8k / 5× / 10–20% as FACT or as our analog.
- Create a z.ai account. Install Claude Code / Codex / Hermes / OpenCode / Ollama. Pay Z.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD GLM/z.ai and Claude Code. Steal model-per-step and harness-vs-engine. Any pay stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
