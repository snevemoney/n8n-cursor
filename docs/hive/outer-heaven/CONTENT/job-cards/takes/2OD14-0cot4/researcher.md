# Researcher — 2OD14-0cot4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/2OD14-0cot4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/2OD14-0cot4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~3855 words). Title: GLM 5.2 in Claude Code is Blowing My Mind. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Intro was one `/goal` — ~1h15 for a 23s cut; GLM 5.2 1M context, ~357k tokens. Hit-or-miss vs Opus: some jobs faster, this one slower. (2) Website bakeoff: same company, two one-prompt sites. Dead giveaway = Opus “weird F’s” font. GLM ~3:59 vs Opus ~14:59; GLM fewer tokens + ~5× cheaper per token — “relatively similar result.” (3) Homework: Codex wrote the assignment (no cross-contamination); Codex judged. Opus won on a subtle duplicate-record edge (`true` vs `1` vs `1.0`). GLM good; Opus more precise. (4) Model-routing thesis: Opus 4.8 is better/closed; he guesses only **10–20%** of daily tasks need it; **80%+** of knowledge work could be GLM 5.2 or Sonnet 3.7. Key future skill = which model per task. Counter-example: Opus ~5 min vs GLM ~24 min. (5) Quota: $60/mo z.ai plan UNVERIFIED; 4–5h hammering, five sessions; 5h quota a bit over half; weekly ~10%. (6) Creative `/goal`: GLM = “anatomy of attention” interactive HTML; Opus = Death Star timeline (F-font again). Same prompt; GLM ~35 min vs Opus ~11. More reasoning → GLM slower. Harness: Claude models use it best; GLM still reads CLAUDE, skills, `/goal`. (7) Storm research skill: open vs closed models → HTML report; all sub-agents GLM; ~27 min; V2 = second pass. Five lenses (academic, skeptic, practitioner, economist, historian). Trust GLM to gather opinions/data/sources; want Opus to decide what matters and how to apply. Not binary — which step gets which model. (8) Why GLM: open-source, 753B params (Ollama card says 756B); too big to run locally for most; rent via z.ai. Price card: Opus 4.8 $5 in / $25 out vs GLM $1.40 / $4.40 — his “~5× cheaper.” Fable pulled = rent can vanish. Anthropic/OpenAI “not profitable”; $200 Max vs “~$8,000 inference” if fully used — UNVERIFIED. Fear: Fable returns API-only, more expensive than Opus. Local/open as hedge. Benchmarks: Frontier SWE > GPT 5.5 (he says); beats Opus 4.7 / recent Sonnet on many evals; take benches with salt — feel matters. (9) Setup: z.ai chat/landing/3D/minigame → API console. Pay-per-token or plans $16 / $64 / $144 / mo (yearly cheaper). Dual-sub idea: Claude ~$100 + Z $64, bounce by task. API key → `settings.local.json` env: Anthropic base URL → Z; Anthropic auth token = Z key; default models = GLM 5.2. Blank Anthropic API key. Per-directory: `GLM/` folder has the json; `Opus/` has none → Max/Opus. Slide deck also GLM via his skill (“Herc”). CTA: more local/open-code content; model may not be the moat (fwd-deployed engineers). **Do not flatten** vs `ONmaDdOBGig` / `R0qF17BVl9w` `/goal` cost, `YHk45NEpspE` CLI>API>MCP, `eRS3CmvrOvA` harness plugins. All $ / quotas / benches / 10–20% UNVERIFIED.

## B. Atomic Knowledge

### Route the model per step, not per day
- **Claim:** Opus 4.8 is stronger; most knowledge work does not need it. GLM 5.2 (or Sonnet-class) can do ~80%+; save Opus for the 10–20% that need heavy reasoning / “what matters.”
- **Reasoning:** Closed frontier is a rent; open/cheap is a hedge when Fable-class features get pulled or moved to API-only.
- **Mechanism:** Same harness, two engines. Directory-scoped `settings.local.json` so GLM and Opus sit in sibling folders.
- **Evidence:** Website GLM 3:59 vs Opus 14:59 similar look; homework Opus won the `true`/`1`/`1.0` edge; creative `/goal` Opus faster (11 vs 35); storm report he would keep GLM on gather, Opus on apply.
- **Conditions:** His day of hammering; z.ai $60 plan; 1M context GLM.
- **Exceptions:** Heavy-reasoning jobs can make GLM *slower* than Opus. “5× cheaper” is a price-card ratio, not a measured invoice.
- **Action:** Steal step-level routing. Do not buy z.ai / switch hive stack because tape.
- **Confidence:** high as the routing thesis; % and $ UNVERIFIED.
- **Source:** `2OD14-0cot4` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** intro `/goal` slow vs Opus; homework GLM miss
- **Speech ≠ behavior:** “blowing my mind” vs “Opus is a better model” and several Opus wins.

### Harness + orchestration beat the underlying model
- **Claim:** After a day of tests he would trust GLM on storm-style research because of how he orchestrated (many agents, verification, V2 pass) — “way more important ultimately than the model.”
- **Reasoning:** Mixture-of-personas + second-pass beat raw IQ for gather jobs.
- **Mechanism:** `/goal` + storm skill + GLM sub-agents + HTML deliverable; then a stronger model to think.
- **Evidence:** 27-min report with five lenses, 60s summary, findings supported/challenged by named personas.
- **Conditions:** Skill already exists; he will ship a storm video later.
- **Exceptions:** He would not let GLM decide life-application from the pile.
- **Action:** Steal gather-vs-apply split. Map to `info-gain-cite` + existing research skills. No new skill file.
- **Confidence:** high as his belief; quality of the HTML unobserved.
- **Source:** `2OD14-0cot4` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none named on storm
- **Speech ≠ behavior:** none.

### Rent-can-vanish is the open-source argument
- **Claim:** Fable got pulled; labs are “not profitable” on $200 vs huge inference; they may return features as API-only. Open/local (or cheap rent of open weights) is the hedge. GLM is open but 753–756B — most people still rent z.ai.
- **Reasoning:** You do not own a closed engine. Switching the Anthropic base URL is “switching the engine of the car.”
- **Mechanism:** z.ai key as Anthropic auth token; models renamed to GLM 5.2 in local settings.
- **Evidence:** Price card $1.40/$4.40 vs $5/$25; Ollama lists the model but cloud-runs it; Frontier SWE claim vs GPT 5.5.
- **Conditions:** Hardware for true local is not “lying around.”
- **Exceptions:** He is still paying a Z subscription. Dual-sub ($100 Claude + $64 Z) is a spend idea, not a hive buy.
- **Action:** Learn the hedge. Operate-never: z.ai plan, paste his env block, quote benches as FACT.
- **Confidence:** medium (profitability / $8k inference are claims).
- **Source:** `2OD14-0cot4` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none
- **Speech ≠ behavior:** “yours / download” vs “I pay z.ai because it is massive.”

## C. Mental Models
The harness is the car; the model is the engine. Cost × quality is per *step*, not per *day*. Open weights ≠ free on your laptop. Benchmarks are salt; feel + a Codex-judged homework is the real test. Orchestration (personas, V2, verification) can outrun a weaker model on gather. Labs’ moat may move to services / forward-deployed humans.

## D. Procedures
1. Play on z.ai chat if you only want feel (on-tape).
2. API console → key or plan ($16/$64/$144 UNVERIFIED).
3. Put env in project `settings.local.json`: base URL → Z; auth token = Z key; default model GLM 5.2; leave Anthropic key blank.
4. Or ask the harness to write that file; swap the key.
5. Keep a sibling directory *without* that json for Opus/Max.
6. Route: GLM for design/gather/storm; Opus for precision edges and “what matters.”
7. When comparing: same prompt; optional third judge (he used Codex); record time + the one edge that flipped the win.
8. Hive: no z.ai spend; no vendor install; Cursor + Grok only. Hard steps HITL.

## E. Examples
- **Situation:** 23s intro from raw. **Action:** one `/goal`. **Outcome:** ~1h15, ~357k tokens. **Lesson:** GLM can finish the job and still lose the clock to Opus.
- **Situation:** Two one-prompt sites. **Action:** GLM vs Opus. **Outcome:** similar; Opus F-font; GLM 4 min vs 15. **Lesson:** “5× better?” is the wrong question if the look is close.
- **Situation:** Codex homework. **Action:** both agents; Codex judges. **Outcome:** Opus handles `true`/`1`/`1.0` dups. **Lesson:** precision edges still pay for frontier.
- **Situation:** Storm open-vs-closed. **Action:** GLM-only sub-agents, V2. **Outcome:** thorough HTML he would trust for gather. **Lesson:** harness > model on that step.

## F. Decision Rules
- IF the step is gather / design / first-pass HTML → he is willing to use GLM.
- IF the step is subtle correctness or “apply this to my life” → Opus.
- IF GLM is doing heavy reasoning → expect it to be *slower*, not cheaper-in-time.
- IF you need two engines in one day → directory-scoped settings, not one global swap.
- IF a closed feature vanished once (Fable) → treat rent as retractable.
- Refuse: z.ai/Claude spend; quote $1.40/$5/$8k/10–20% as FACT; new ICP; install GLM in hive.

## G. Contrarian
The title is hype; the body says Opus is better and sometimes much faster. “Open source” here still means a $60/mo cloud. Dual subscriptions *increase* spend to “bounce.” Codex as assignment-writer *and* judge is a conflict he does not name.

## H. Assumptions
All $ , quotas, benches, 753/756B, 10–20%, $8k inference, lab profitability = **UNVERIFIED**.
**Desk dissent:** Learn routing + gather/apply split. Do not add z.ai. Do not flatten vs `/goal` cost tapes or CLI-first tapes.

## I. Questions
- Exact env JSON (he says description — do not invent keys)?
- Storm skill contents (video “coming”)?
- Was Codex judge blinded to which agent was which beyond “Agent 1/2”?
- Peak-hour quota multiplier on z.ai — numbers?

## J. Connections
- **SYSTEM SYNTHESIS:** `ONmaDdOBGig` · `R0qF17BVl9w` · `EuzYhzB0vbI` (`/goal` overnight / cost) · `YHk45NEpspE` (CLI > API > MCP) · `J_jswzXhYJA` vs `ONmaDdOBGig` (Soul vs Fable $). Skills: `golden-test-loop` · `coverage-loop` · `ask-principal`.

## K. Future-Use
Per-step model router. Directory-scoped engine swap. Codex-as-judge bakeoff. Gather-GLM / apply-Opus. Open-weights-as-hedge (still rented). Storm V2 persona pass.

## Steal / Operate-never

### Machine: per-step-model-router
- **Epistemic:** SOURCE
- **Workflow / loop:** name the step (gather / design / judge / apply) → pick cheap-open vs frontier → run same prompt in sibling dirs if bakeoff → third-party judge on one edge → keep the cheaper engine on the step that passed
- **Questions / signals:** Does this need the `true`/`1`/`1.0` class of precision? Is GLM slower *because* it is reasoning? Did a closed feature get pulled before?
- **Qualify / frame / objections:** “5× cheaper” is a card, not an invoice. Dual-sub is more spend.
- **Procedure:** D.
- **Example that proves it:** Website GLM win on time; homework Opus win on edge; storm GLM gather + Opus apply.
- **Why it works:** Most tokens are not the hard thought. The harness already holds skills/context.
- **Conditions / exceptions:** $ / % / benches UNVERIFIED. Hive stack stays Cursor + Grok.
- **Operate-never payload:** z.ai plan; paste his env; quote Frontier SWE as FACT; new ICP.
- **Hive run (existing skills only):** `golden-test-loop` · `coverage-loop` · `ask-principal`
- **Source:** `2OD14-0cot4` @ UNKNOWN

**Operate-never**
- Buy z.ai or a second Claude plan. Install GLM / Ollama / Open Code. Quote tape $ as FACT. New `icp_id`. Send / pay / deploy.

## L. Role-Specific Applications
File GLM as an on-tape *engine option*, not a hive vendor. Keep gather/apply routing. Keep Fable-rent-vanishes next to Soul/Fable $ rows. Do not write a GLM skill.
