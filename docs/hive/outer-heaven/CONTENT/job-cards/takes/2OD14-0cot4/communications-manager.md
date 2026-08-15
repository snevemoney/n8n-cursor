# Communications Manager — 2OD14-0cot4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/2OD14-0cot4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/2OD14-0cot4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** GLM 5.2 in Claude Code is Blowing My Mind
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** review · 3855 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Cold open: GLM 5.2 inside Claude Code edited the intro from raw video to the cut you see — one /goal, ~1h15 for a 23-second clip, ~357k tokens, 1M context. Not perfect; one prompt.
- Design A/B: same company site, GLM vs Opus. Dead giveaway he names: Opus loves a weird F font. GLM 3:59 / fewer tokens vs Opus 14:59. Homework assignment written by Codex so neither side contaminated; Codex judged Opus better on a duplicate-record edge (true vs 1 vs 1.0). GLM good; Opus more precise.
- Feel: GLM solid and quick when the task is not heavy reasoning. Opus 4.8 is the better closed model. He guesses 10–20% of daily work needs Opus; 80%+ of knowledge work could be GLM or Sonnet-class. Skill of the era: which model per step. Counter-example: Opus 5 min vs GLM 24 min on a heavier job.
- Quota: ~$60/mo z.ai plan; 4–5 hours hammering, five sessions; 5-hour quota a bit over half, weekly ~10% — UNVERIFIED. Creative /goal: GLM ‘anatomy of attention’; Opus ‘life of a Death Star’ (F font again). Same prompt, GLM 35 min vs Opus 11.
- Harness thesis: Claude Code is a harness; Claude models use it best; GLM can /goal, read CLAUDE.md, run skills. Storm research skill: many GLM sub-agents, personas, V2 pass; HTML report with 60-second summary, five findings, skeptic vs academic. He would trust GLM to gather opinions/sources; Opus to decide what matters.
- Open-source vs rent: 753B params — you can’t run it at home; you rent z.ai. Claims ~5× cheaper than Opus ($1.40/$4.40 vs $5/$25). Benches vs Opus/GPT 5.5 / Frontier SWE — grain of salt, feel matters. Fable got pulled; $200 Max vs ~$8,000 inference if you use it — UNVERIFIED. Fear: next flagship returns API-only.
- Setup: z.ai → API key → settings.local.json routes Anthropic base URL to Z; blank Anthropic key; default models GLM 5.2. Two directories = two engines (GLM folder vs Opus folder with no local settings). Slide deck also GLM (calls him Herc). CTA: more local/open-source; like/end. Not a sponsor.

## B. Atomic Knowledge

### Route the step, not the stack — gather vs decide
- **Claim:** He would let GLM (or a cheaper model) gather sources and opinions, then use a heavier reasoner to decide what matters. Binary ‘best model’ is the wrong question.
- **Reasoning:** Most knowledge work is not the 10–20% that needs Opus-class precision. The harness, skills, and verification beat the badge on the model.
- **Mechanism:** Name the step (gather / design / judge). Pick the cheaper engine for gather. Keep a stronger model for the decision. Do not swap the hive stack.
- **Evidence:** Storm skill + ‘I would trust GLM to gather… Opus to think through.’ Homework: Opus caught the duplicate-record edge.
- **Conditions:** You have a multi-step job and a token meter.
- **Exceptions:** 80/20, 5×, benches, $60/$200/$8,000 UNVERIFIED. GLM/z.ai/Claude as ours is never. Routing Anthropic URL to another vendor is operate-never here.
- **Action:** Steal: cheaper model for gather, stronger for decide. Do not install GLM. Do not quote 5× in mail.
- **Confidence:** high as his routing thesis; $ UNVERIFIED
- **Source:** `2OD14-0cot4` @ UNKNOWN
- **Epistemic:** SOURCE

### A one-prompt intro is still a checked cut — and he says it wasn’t perfect
- **Claim:** The 23-second intro took 1h15 and 357k tokens. Some GLM jobs beat Opus on wall-clock; some lose badly (24 vs 5).
- **Reasoning:** Speed is task-dependent. Reasoning-heavy work slows the cheaper model.
- **Mechanism:** Do not treat ‘one /goal’ as a send or a publish. Inspect the cut. Evens still reviews.
- **Evidence:** 1h15 / 357k; design 3:59 vs 14:59; homework miss on true vs 1.0.
- **Conditions:** Demo / design / research jobs.
- **Exceptions:** We do not publish a no-review clip. We do not switch engines.
- **Action:** If a draft looks cheap-and-done, still cite-check. Do not mail benches.
- **Confidence:** high
- **Source:** `2OD14-0cot4` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Harness + skills + verification > the underlying model. **SOURCE**
- Open-source still means rent if you cannot host 753B. **SOURCE**
- Benches: grain of salt; feel and the job matter. **SOURCE**

## D. Procedures
- Per-directory settings = per-engine. **SOURCE**
- This desk: Cursor + Grok only. No z.ai route. No Anthropic-base-URL swap. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Same homework, two engines. → **Action:** Codex writes the test; Codex judges. → **Reasoning:** No cross-contamination. → **Outcome:** Opus wins the edge case. → **Lesson:** Cheaper gather is not cheaper judge. Implicit rule: do not mail the bench.

## F. Decision Rules
- If the step is gather/research → cheaper model is on-tape; we still do not switch stack.
- If the step is decide/apply → he wants Opus; we still draft in Grok and Evens reviews.
- If the UI says 5× cheaper → UNVERIFIED; not a price analog.
- Refuse: GLM/z.ai as ours. Quote $8,000 inference as FACT. Fable-pulled panic in a letter.
- Optimize: name the step before you name the model.

## G. Contrarian
- Field picks one ‘best’ model. He routes by step. **SOURCE**

## H. Assumptions
- 5× / 80% / benches / Max-vs-inference $ UNVERIFIED. Falsifier: a gather pass that invents sources.

## I. Questions
- Which letter steps are gather (cite) vs decide (what we actually say)?

## J. Connections
- **SYSTEM SYNTHESIS:** `J_jswzXhYJA` (verify loop). `EuzYhzB0vbI` (separate checker). `info-gain-cite`.

## K. Future-Use
- Model-per-step as an ops note. z.ai / GLM stay on-tape.

## Steal / Operate-never

### Machine: Route gather vs decide; never swap the hive engine; never quote 5× / benches as FACT
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Name the step → cheaper gather / stronger decide → Evens reviews → stop. No send. No stack swap.
- **Questions / signals:** Is this gather or decide? Are we about to quote a bench?
- **Qualify / frame / objections:** Qualify: routing vs ‘install GLM.’ Frame: harness > badge. Objection: ‘it’s 5× cheaper’ → UNVERIFIED, not ours.
- **Procedure:** 1) Do not install z.ai/GLM. 2) Do not route Anthropic URL. 3) Do not mail ticker/bench $. 4) No send.
- **Example that proves it:** Homework edge: true vs 1 vs 1.0 — Opus caught it.
- **Why it works:** The job has steps; the badge is not the job.
- **Conditions / exceptions:** Claude/GLM tapes. Exception: our stack is Cursor + Grok.
- **Operate-never payload:** Install GLM. Quote 5×. Publish the one-prompt intro.
- **Hive run (existing skills only):** `ask-principal`. `info-gain-cite`. Stack Cursor + Grok.
- **Source:** `2OD14-0cot4` @ UNKNOWN


### Operate-never (this desk will not operate)
- Install GLM / z.ai / Claude Code. Route Anthropic base URL. Quote 5× cheaper / $8,000 inference / Frontier SWE as FACT.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I do not write ‘we switched to GLM.’ I do not send. Clients parked.
