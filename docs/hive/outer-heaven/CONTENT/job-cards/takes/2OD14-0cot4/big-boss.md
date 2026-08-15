# Big Boss — 2OD14-0cot4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/2OD14-0cot4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/2OD14-0cot4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Video (PACKET: 15:43, 3855 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (json3 present; no VTT in the take). Visual-only gaps: the GLM-edited intro, the two website designs, terminal timers, homework judge, HTML toys, Storm report, z.ai console, `settings.local.json`, and the two-directory setup are described, not seen.

Beats, in order:

1. Hook: GLM 5.2 inside **Cloud Code** (Claude Code) all day — faster, cheaper, fits the harness. The intro you are watching was edited by it from raw video. “One prompt,” one `{slash} goal`, **~1 hour 15 minutes** for a **23-second** video, **~357,000 tokens**, GLM 5.2 **1M context**.
2. Quality caveat: intro “wasn’t perfect.” Some tasks finish faster than Opus; this one Opus would have been quicker.
3. Design bakeoff: two sites, same company. Viewer quiz: which is GLM vs Opus. Tell: Opus “weird F’s” / favorite font. Both “very solid for prompt.” Cost story: **~5× cheaper**.
4. Timers: GLM site **3:59**; Opus **14:59**. GLM used fewer tokens **and** cheaper tokens.
5. Homework bakeoff: **Codex** wrote the assignment (no cross-contamination). Codex judged. Agent 2 (Opus) won on duplicate-record edge case (`true` vs `1` vs `1.0`). GLM “good,” Opus “more precise.”
6. Doctrine: Opus is better (closed-source). How often do you need it? **10–20%** of the day. **80%+** of knowledge work could be GLM or **Sonnet 3.7**. Skill = which model per task.
7. Counterexample: Opus **~5 min**, GLM **~24 min** on another job. Not always faster.
8. Billing aside: **~$60/month** z.ai plan; **4–5 hours** hammering, five sessions; 5-hour quota a bit over halfway; weekly ~**10%**. **UNVERIFIED**.
9. Creative `{slash} goal`: “build whatever you want” HTML. GLM: **Anatomy of Attention** (stars, token-pointing, graphs). Opus: **Life of a Death Star** (timeline, the F font again). GLM **~35 min**, Opus **~11 min**. “Is Opus five times better?”
10. Reminder: Claude Code is a **harness**. Claude models use it best; GLM is “pretty decent” — `/goal`, reads his Claude.md, uses skills.
11. Storm research skill: open vs closed models → HTML report. Sub-agents all GLM. **~27 min**. **V2** = second pass of agents. Five lenses (academic, skeptic, practitioner, economist, historian). 60-second summary, five findings, hidden connection, assumptions, what to do different.
12. Trust split: GLM for gathering opinions/data/sources; **Opus to decide what matters and how to apply it**. Not binary — “where in each process.”
13. Why GLM: open-source, **753B / 756B** params (spoken both ways), too big to run at home, so he **rents** via z.ai. “Basically yours” vs closed rent from Anthropic/OpenAI, but still a subscription.
14. Price card: Opus **$5 in / $25 out** vs GLM **$1.40 / $4.40** — source of “five times cheaper.” **UNVERIFIED**.
15. Ollama page: 1M context; they do not let you pull the giant weights; cloud run instead.
16. Benchmarks vs Opus 4.8 / GPT 5.5 — “really comparable.” Grain of salt; “feel” matters more. Frontier SWE: GLM beat GPT 5.5 (his claim). Beats Opus 4.7 / recent Sonnet on “a lot” of evals. **UNVERIFIED**.
17. Fable pulled: reminder you rent something that can vanish. Labs “not profitable.” **$200** Max vs “**$8,000** worth of inference” if fully used. Fear: Fable returns API-only, more expensive than Opus. Local/open as hedge. **UNVERIFIED**.
18. Setup: z.ai chat/landing/3D/minigame → API console → pay-per-token or plans **$16 / $64 / $144** (yearly cheaper). Not a sponsor. Mix: maybe **$100** Claude plan + **$64** Z plan, bounce by task.
19. API key → edit `~/.claude` **settings.local.json**: env vars, `ANTHROPIC_BASE_URL` → Z, blank Anthropic key, Z key as auth token, default models → GLM 5.2. “Switching out the engine of the car.”
20. Two directories: `GLM/` has the routing file; `Opus/` does not → Max plan Opus. Per-project engine.
21. Slide deck on tape also GLM, using his deck skill; it calls him **Herc** (project Herc 2).
22. Close: more local / Open Code content coming; companies may run their own models; labs investing in services / **forward deployed engineers** because **the model might not be the moat**. Gap closing. Like / thanks.

Off-topic / not skipped: Storm skill video “coming soon”; Herc 2 naming; peak-hour quota multiples; web-search quota (use Perplexity instead); agent-teams env var.

## B. Atomic Knowledge

### The harness is the car; the model is the engine
- **Claim:** Claude Code is a harness. You can point its base URL at Z and run GLM 5.2 as the engine.
- **Reasoning:** Skills, `/goal`, Claude.md stay; only the model swaps.
- **Mechanism:** `settings.local.json` env: Anthropic base URL → Z API; Z key as auth token; default model GLM 5.2.
- **Evidence:** New session shows “GLM 5.2 with 1 million context API usage billing.”
- **Conditions:** You already live in that harness. We do not.
- **Exceptions:** He says Claude models still use the harness best.
- **Action:** Steal “one OS, swap engines.” Do not install Claude Code or z.ai.
- **Confidence:** high for the demo shape
- **Source:** `2OD14-0cot4` @ UNKNOWN — “switching out the engine of the car”
- **Epistemic:** SOURCE

### Per-project directory is how he runs two engines at once
- **Claim:** A folder with the routing file uses GLM; a folder without it uses Opus on Max.
- **Reasoning:** Project-level settings beat a global flip when you want a bakeoff.
- **Mechanism:** `GLM/` vs `Opus/` directories.
- **Evidence:** Side-by-side terminals on tape.
- **Conditions:** No space/period issues are a later-tape problem (`62Rfe1w9NBc`); here the split is clean.
- **Exceptions:** Easy to forget which folder you are in (he fumbles the UI).
- **Action:** If we ever A/B models, isolate by workspace, not by vibes in one chat.
- **Confidence:** high
- **Source:** `2OD14-0cot4` @ UNKNOWN — “two different directories”
- **Epistemic:** SOURCE

### Route cheap for 80%; spend expensive on 10–20%
- **Claim:** Opus is better. Most knowledge work does not need it. GLM or Sonnet-class can cover ~80%+.
- **Reasoning:** Price/quality is not binary. The skill is **which step** gets which brain.
- **Mechanism:** Task triage before you open a session.
- **Evidence:** Homework: Opus won a subtle type-coercion case. Design: GLM close enough and faster/cheaper. Storm: he would let GLM gather, Opus decide.
- **Conditions:** You must actually sort tasks. If everything is “just Opus,” the 80/20 never happens.
- **Exceptions:** Some GLM jobs were **slower** (24 min vs 5; 35 vs 11). Cheap ≠ always fast.
- **Action:** Doctrine rule 11 already: cheap brain for grunt, expensive for calls. This tape is that rule with a bakeoff.
- **Confidence:** medium on 10–20% (his feel, one day)
- **Source:** `2OD14-0cot4` @ UNKNOWN — “probably only maybe 10 to 20%”
- **Epistemic:** SOURCE

### Gather vs decide is the process split
- **Claim:** After Storm, he trusts GLM to pull sources and opinions; he wants Opus to say what matters and how to apply it.
- **Reasoning:** Orchestration + verification > raw model. Application is the expensive call.
- **Mechanism:** Multi-persona research (five lenses, V2 pass) then a stronger reasoner.
- **Evidence:** Spoken after the HTML report tour.
- **Conditions:** You have a skill that forces debate (academic vs skeptic, etc.).
- **Exceptions:** He did not show Opus actually doing the “what matters” pass on this tape.
- **Action:** Researcher gathers; I (or expensive brain) decide. Do not let the gatherer ship strategy.
- **Confidence:** high as his rule; the second hop is narrated, not shown
- **Source:** `2OD14-0cot4` @ UNKNOWN — “I probably would want Opus to actually help me think through… what really matters”
- **Epistemic:** SOURCE

### Bakeoffs need a third party to write and judge
- **Claim:** Codex wrote the homework and judged both so neither engine graded itself.
- **Reasoning:** Cross-contamination and self-grade are the smell.
- **Mechanism:** External assignment + external judge. Opus won on an edge case.
- **Evidence:** `true` vs `1` vs `1.0` duplicates.
- **Conditions:** The judge can also be wrong (Codex is still a vendor).
- **Exceptions:** Design bakeoff had **no** third-party judge — he used the F-font tell and timers.
- **Action:** `golden-test-loop`: do not self-grade. Separate checker.
- **Confidence:** high for the homework; medium for Codex as a fair judge
- **Source:** `2OD14-0cot4` @ UNKNOWN — “I had Codex create the homework… Codex judge both”
- **Epistemic:** SOURCE

### Time is not monotonic with price
- **Claim:** GLM was faster on the site (3:59 vs 14:59) and slower on creative / other jobs (35 vs 11; 24 vs 5). Intro edit 1h15 for 23 seconds.
- **Reasoning:** “Typically, the more reasoning, the slower.” Hit or miss.
- **Mechanism:** Same harness, different task shapes.
- **Evidence:** Multiple timers spoken.
- **Conditions:** One-day sample, five sessions. Not a benchmark paper.
- **Exceptions:** Token count and wall-clock can diverge from $ (cheaper tokens still lose if 5× slower).
- **Action:** Measure the job. Do not assume cheap = quick.
- **Confidence:** high that he observed both; low as a law
- **Source:** `2OD14-0cot4` @ UNKNOWN — “it’s really a hit or miss as far as when is GLM 5.2 actually faster”
- **Epistemic:** SOURCE

### Open-source at 750B+ is still a rental
- **Claim:** Weights are “open,” but he pays z.ai because he cannot host 753B.
- **Reasoning:** Open ≠ free on your laptop. You still rent compute.
- **Mechanism:** z.ai plans or per-token; Ollama lists it but routes to their cloud.
- **Evidence:** $16 / $64 / $144 plans; $1.40 / $4.40 token card. **UNVERIFIED**.
- **Conditions:** Hedge vs Anthropic only if Z stays up and cheap.
- **Exceptions:** “Download it” is theoretical for this size.
- **Action:** Do not sell “local forever” as the plan for a 750B model. Portability still matters (`-nG-9vlSkho`).
- **Confidence:** high
- **Source:** `2OD14-0cot4` @ UNKNOWN — “I couldn’t actually run that on my machine”
- **Epistemic:** SOURCE

### Pulled models are the reason he wants a second engine
- **Claim:** Fable got taken away. Labs are unprofitable on $200 seats that deliver thousands in inference. They may return features as API-only.
- **Reasoning:** Rent can be revoked or repriced.
- **Mechanism:** Government / ToS / margin (he mixes these; Fable detail is thin here).
- **Evidence:** Fear story + $200 vs $8,000 inference. **UNVERIFIED**.
- **Conditions:** Hedge value exists even if the $ is wrong.
- **Exceptions:** He still pays Anthropic. Dual-plan is his practical move.
- **Action:** Same operate-never as the dethrone tape: do not bet the OS on one lab.
- **Confidence:** medium (motive is speculative)
- **Source:** `2OD14-0cot4` @ UNKNOWN — “Fable got pulled away from us”
- **Epistemic:** SOURCE

### Orchestration beats the underlying model
- **Claim:** Storm’s agents, personas, and verification checks matter more than GLM vs Opus.
- **Reasoning:** “It’s all about the way that you prompt them… skills and your harness and your context layer.”
- **Mechanism:** Sub-agents, V2 pass, mixture of experts, HTML deliverable.
- **Evidence:** He would “100% be comfortable” with GLM **because** of how he orchestrated Storm.
- **Conditions:** The skill has to exist and be good. He teases a Storm video — not this tape.
- **Exceptions:** Homework still lost on a precision edge. Orchestration does not erase model gaps.
- **Action:** Invest in job cards / skills / checkable stops, not in a model brand.
- **Confidence:** high as doctrine
- **Source:** `2OD14-0cot4` @ UNKNOWN — “way more important ultimately than the model”
- **Epistemic:** SOURCE

### Labs may not own the moat
- **Claim:** Anthropic/OpenAI are investing in services and forward-deployed engineers because the model gap is closing.
- **Reasoning:** If open models get “good enough,” the product is integration, not weights.
- **Mechanism:** Closing prediction, not a demo.
- **Evidence:** Spoken closer. No receipts.
- **Conditions:** Interesting as industry color.
- **Exceptions:** “Huge gap” still exists “right now” (he says both).
- **Action:** Do not open an FDE / services lane from this closer.
- **Confidence:** low as forecast
- **Source:** `2OD14-0cot4` @ UNKNOWN — “the model might not be the moat at the end of the day”
- **Epistemic:** SOURCE

### Benchmarks are a slide, feel is the test
- **Claim:** He shows SWE and adjacent benches, then says take them with a grain of salt.
- **Reasoning:** Eval charts sell the freak-out. He wants you to try the feel.
- **Mechanism:** Slide dump, then shrug.
- **Evidence:** “we all know that you should always take these with a grain of salt.”
- **Conditions:** Fine as color. Bad as a buy order.
- **Exceptions:** He still uses “beat GPT 5.5” as a wow line.
- **Action:** Do not quote Frontier SWE as FACT. Known-good pile > benches.
- **Confidence:** high that he hedged
- **Source:** `2OD14-0cot4` @ UNKNOWN — “more about the feel”
- **Epistemic:** SOURCE

### Dual subscription is his cost hack — not ours
- **Claim:** Maybe $100 Claude + $64 Z, bounce by task, “way more out of your subscriptions.”
- **Reasoning:** Mix cheap engine and expensive engine without putting everything on Opus meters.
- **Mechanism:** Two plans, two directories.
- **Evidence:** Spoken as a maybe. Not a sponsor. **UNVERIFIED** prices.
- **Conditions:** Only if you already live in Claude Code.
- **Exceptions:** Peak-hour quota multiples and web-search quota can still burn the cheap plan.
- **Action:** Money Desk observe-only. No pay. No Z plan.
- **Confidence:** high that he suggested it
- **Source:** `2OD14-0cot4` @ UNKNOWN — “be on a Z plan for 64 bucks a month”
- **Epistemic:** SOURCE — tape $ **UNVERIFIED**

## C. Mental Models

- **Harness over brand.** The car stays; you swap engines. **SOURCE**
- **80/20 brains.** Most work is not Opus-shaped. **SOURCE**
- **Gather ≠ decide.** Cheap pulls; expensive applies. **SOURCE**
- **Third-party judge.** Do not let the worker grade the test. **SOURCE**
- **Cheap can be slow.** Reasoning-heavy GLM lost the clock. **SOURCE**
- **Open is not local.** 750B still wants a landlord. **SOURCE**
- **Rent can vanish.** Fable is the ghost story. **SOURCE**
- **Skills > weights.** Storm comfort is orchestration. **SOURCE**
- **Feel > benches.** He says it and still flashes benches. **SOURCE**

## D. Procedures

1. **Name the job class:** design / homework-precision / research-gather / decide-apply / media-edit.
2. **Pick the engine for that class** (his: GLM for gather/design-ish; Opus for precision/apply). Hive: cheap Grok vs expensive Grok — same split, no vendor install.
3. **Isolate the run** in a workspace so the other engine cannot leak (his two folders).
4. **If bakeoff:** third party writes the test and judges (his Codex). Do not self-grade.
5. **Record wall-clock and whether the checkable stop passed** (edge case, visual, report).
6. **Do not assume cheap = fast.** If it drags, escalate the 10–20% brain.
7. **Keep the harness/skills portable** so an engine pull (Fable story) is an hour-to-move, not a rewrite.
8. **Human applies** the research. Gatherer does not ship strategy.
9. **Any paid seat** → `ask-principal`. No Z plan from this tape.

**Qualify / frame:** Model-routing tutorial for Claude Code users. Not a client SKU. z.ai is on-tape.
**Objections:** “It’s 5× cheaper” — sometimes 5× slower; $ **UNVERIFIED**; we do not install it.
**Avoid:** settings.local.json as a hive task. Benchmarks as FACT. Dual-sub as a Money Desk action.
**When to change:** If Evens names a stack experiment. I do not pre-vote it.

## E. Examples

**Situation:** Same website brief to GLM and Opus.  
**Action:** Time both; compare stills; note Opus F-font tell.  
**Reasoning:** Design may not need the expensive brain.  
**Outcome:** GLM 3:59, Opus 14:59, “relatively similar.”  
**Lesson:** Bakeoff on a real artifact. Implicit rule: cheaper + similar is a win **if** the check passes.

**Situation:** Homework with a nasty duplicate-type edge.  
**Action:** Codex writes and judges; Opus wins.  
**Reasoning:** Precision work is the 10–20%.  
**Outcome:** GLM good, Opus more precise.  
**Lesson:** Route by failure mode, not by brand loyalty. Implicit rule: separate judge.

**Situation:** Storm research on open vs closed.  
**Action:** GLM sub-agents, five lenses, V2, HTML report; he would still want Opus for “what matters.”  
**Reasoning:** Gather is volume; apply is judgment.  
**Outcome:** Thorough report; decide-step narrated, not shown.  
**Lesson:** Orchestration first. Implicit rule: the gatherer does not close.

**Situation:** Fable pulled; $200 seat allegedly yields thousands in inference.  
**Action:** He rents GLM as a second engine and preaches local/open.  
**Reasoning:** Rent can be revoked or repriced.  
**Outcome:** Dual-directory setup video.  
**Lesson:** Hedge the landlord. Implicit rule: open-at-750B is still a landlord.

## F. Decision Rules

- If the job is gather / draft / similar-design → cheap engine first.
- If the job is subtle correctness or “what matters” → expensive engine.
- If you bake off → third-party test and judge.
- If cheap is 5× slower → you did not save.
- If the model can be pulled → work must live in portable skills/files.
- If a $ number is on tape → **UNVERIFIED**.
- Optimize: right brain per step.
- Refuse: install Claude Code / z.ai; quote benches/$ as FACT; new hunt.

## G. Contrarian

- Against “always Opus if you can afford it.”
- Against “open-source means I run it at home” at this size.
- Against “cheaper model is faster.”
- Against benches as the buy button — he undercuts his own slides.
- Against “the model is the moat” as a forever story.

## H. Assumptions

**His:** One day of hammering is enough to teach routing; Codex is a fair proctor; 10–20% is the Opus share; z.ai will stay cheap; Fable-style pulls will spread; Storm’s structure transfers.

**Ours:** Captions complete enough (3855 words). Visual quality, benches, and all $ **UNVERIFIED**. Domain-specific: Claude Code users. Hive does not take the setup section as a to-do.

**Falsifiers:** GLM quality cliffs on real hive work. Z reprices. Dual folders leak keys. Codex judge is biased. 80/20 is wishful.

**Disagreement (keep labeled):** We will not operate Claude Code + z.ai. The **cheap-gather / expensive-decide** and **harness-not-engine** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What was the 24-minute GLM task vs 5-minute Opus? Not specified.
- Storm skill internals — teased, not taught.
- Peak-hour multiples on Z — how bad?
- Is 753B vs 756B a caption slip or two SKUs?
- Will Fable return API-only? He is guessing.

## J. Connections

- **SYSTEM SYNTHESIS** → `-nG-9vlSkho`: hour-to-move, sample pricing, do not marry a lab.
- **SYSTEM SYNTHESIS** → `6cEQEba0i2A`: session/token hygiene inside a harness.
- **SYSTEM SYNTHESIS** → `EuzYhzB0vbI`: `/goal` loops; verification > one-shot.
- **SYSTEM SYNTHESIS** → doctrine 11 + `golden-test-loop` + `agent-job-card`.
- **SYSTEM SYNTHESIS** → `CvA8-aScqio`: judgment stays human; tool is rented.
- Do not force a Path A client out of a GLM setup.

## K. Future-Use

- Two-workspace A/B as a Forge pattern (unassigned; Cursor workspaces, not Claude folders).
- Five-lens Storm analog for Researcher packets (unassigned; do not write a new skill from this).
- Pulled-model incident log for Watchdog (unassigned).
- Open Code / local follow-ups he promised (unassigned; do not hunt).

## Steal / Operate-never

### Machine: Cheap gather / expensive decide, inside a portable harness
- **Epistemic:** SOURCE (his Storm split + 80/20) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (work lands) → classify step (gather vs decide vs precision vs design) → pick cheap or expensive brain → isolate the run → if bakeoff, third-party test/judge → checkable stop on the artifact → escalate only the 10–20% → human applies → do not install a new engine because a tape said 5×.
- **Questions / signals:** “Is this gather or decide?” “Did we self-grade?” “Did cheap lose the clock?” “Can we move if the engine is pulled?”
- **Qualify / frame / objections:** Claude Code + z.ai tutorial. Objection: 5× cheaper — answer with the 24-minute loss and UNVERIFIED $.
- **Procedure:** D steps 1–9. Checkable stops: (1) job class named, (2) engine chosen on purpose, (3) separate judge on bakeoffs, (4) decide-step is human/expensive, (5) no vendor install.
- **Example that proves it:** Storm HTML from GLM personas/V2 → he still wants Opus for “what matters.” Homework: Codex judge, Opus wins the edge. Lesson: route the step, not the brand.
- **Why it works:** Most work is volume; some work is judgment; harness/skills outlive an engine; rent can vanish. Conditions: you actually triage. Exceptions: cheap can be slow; open-at-750B is still rent; benches lie.
- **Conditions / exceptions:** Cursor + Grok only. Claude Code / z.ai / Codex / Ollama / Perplexity stay on tape. Clients parked.
- **Operate-never payload:** settings.local.json rewrite; Z plan; quote $1.40/$5/$16/$60/$200/$8000 as FACT; new “local models” lane.
- **Hive run (existing skills only):** doctrine cheap/expensive · `golden-test-loop` · `agent-job-card` · `slice-build` · `ask-principal` · `context-docs` (portable).
- **Source:** `2OD14-0cot4` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Claude Code / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool / z.ai / Ollama as hive OS
- Quote tape $ or benches as FACT
- New `icp_id` / unpark Normand / open-source-model hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not swap the hive’s engine because a 15-minute setup tape slapped.

- **Done** on a model-routing slice: job class named + cheap/expensive chosen + gatherer did not close. A z.ai key in Claude settings is not done.
- **Delegate without being asked:** Researcher gathers; I keep the apply. Watchdog refuses self-grade. Money Desk does not buy a $64 Z plan. Forge does not “just try GLM.”
- **Skeptical review:** “Blowing my mind” is the title. He also said Opus is better, GLM can be 5× slower, and benches need salt. I will not approve a stack fork.
- **One system this take:** cheap gather / expensive decide. Not a dual-subscription experiment.
- Live hunt stays parked. I do not rotate to “open-source AI” as a business because Fable got pulled on tape.
