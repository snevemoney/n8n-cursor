# Big Boss — EuzYhzB0vbI
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/EuzYhzB0vbI/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/EuzYhzB0vbI/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 14:33, 3,673 words, captions `en` VTT + json3). Visual-only gaps: four looping agents, tweet screenshots, quality-vs-attempts chart, thumbnail grid, Three.js plane, Abbey Road HTML versions 1–7, slide deck + “full audit” PDF.

Beats, in order:

1. Cold open: four agents looping, calling sub-agents, writing prompts, designing systems. He asks if that is **productive** or a **cool demo** (`00:00:04`).
2. Tweets on tape: stop prompting coding agents; design loops that prompt them. **Boris Cherny** and **Peter Steinberg / Steinberger** no longer prompt; they write loops. A loop = **trigger + action + stop condition** (`00:00:19`). The “meta agent that infers loops from your vibe” line is the falling-behind bit he is **clearing up**, not the prescription.
3. **Loop engineering** = replace yourself as the person who prompts the agent; design the system that does that (`00:00:45`). Loop = recursive goal: purpose, iterate until complete. Two pillars: an **objective** goal (not subjective) and **verification** (how it knows the stop).
4. If you take the tweets and stand up **24/7 swarms** (`00:01:13`), ask what is moving the needle. Not understanding → **scale problems / bugs** (`00:01:41`). His use: **cadence + event** actions. Around-the-clock fleets do not help his knowledge-work. Maybe if he were on a team shipping a product.
5. He ran a research loop: articles, YouTube transcripts, X — captions **45 sources** (`00:02:27`) — then HTML through screenshot-review. Not V1; **probably V7** (`00:02:36`).
6. Definition: reason → act → observe → repeat until checkable done. Quality-vs-attempts chart: human feedback climbs slow; outsource the feedback loop so attempt one lands higher. Cake-fork test (`00:04:48`): fork comes out clean = done. Smart intern you do not micromanage; it only returns after it has checked.
7. Majority of tasks do **not** need a massive architecture. He still wraps verification in a loop, but **solo loop** (one terminal + a good prompt) is what he uses most. Three shapes: **solo** · **maker-checker** · **manager + helpers** (nesting-doll fleets).
8. Demos from **Matthew Berman’s Loop Library** + his own `/goal`:
   - (a) 10 thumbnails scored vs a Mr Beast rubric (clarity at small size, curiosity, emotional pull, contrast) → top three improved → iterate the strongest. Done was **“until satisfied”** (`00:06:56`) — weak. Best loops: keep iterating until **X metric = Y** (`00:07:08`). Scores were subjective; a **dedicated scorer** sub-agent + evals would be the fix. Runtime **27 minutes** (`00:07:41`).
   - (b) Three.js plane — build, open browser, spin, iterate — **37 minutes** (`00:08:12`). Still not perfect (wanted see-through). Closer than a one-shot “build me a plane.”
   - (c) Abbey Road in HTML/CSS, **no image gen**. Stop if average **≥9**, hard cap **8** passes (`00:09:33`). Screenshots get closer; final **looks nothing like the picture** (`00:10:01`). Loops get you **closer on the first try**, not 100%.
9. Before you build: **what does done mean** and **how will it check** (`00:10:42`) — visual / functional / play the level / tone. Tools must match the check. His common use: Hyperframes in Claude Code — transcript, cut mistakes/pauses, beats, render, verify beats in bounds. “One shot” YouTubes are often a hidden loop.
10. What makes a loop work: checkable goal, hard stop, good tools, memory, **separate checker**, planning first, logging, cost that makes sense. **12-hour+** often not useful (`00:12:23`). He likes **~35 min to a couple hours**, or a chunky overnight **4–8 hours** (`00:13:51`) then a **human** iterates. Do not drop everything because Steinberger **10x**’d (`00:12:55`) — it does not apply the same to every role (`00:12:43`).
11. Close: slide deck + wordy “full audit” in **free School / Skool** classroom → All YouTube resources (`00:14:11`). Like the video.

Off-topic / not skipped: Russian-nesting-doll metaphor; Hyperframes video-edit loop; knowledge-work vs codebase-refactor split.

## B. Atomic Knowledge

### A loop is trigger + action + stop — not a vibe inferrer
- **Claim:** Cherny / Steinberger write loops, not prompts. Three parts: trigger, action, stop condition. The tweet about a meta-agent inferring loops from your vibe is the panic he is talking down.
- **Reasoning:** Everyone has a different spin. Without a stop, a loop is a swarm.
- **Mechanism:** Recursive goal + verification that can fire the stop.
- **Evidence:** Opening tweets + his definition beat.
- **Conditions:** You can name the trigger and the stop in one sentence.
- **Exceptions:** Majority of tasks need verification more than a fancy loop architecture.
- **Action:** `coverage-loop` already is trigger → act → checkable stop. Do not stand up a vibe-inferrer.
- **Confidence:** high
- **Source:** `EuzYhzB0vbI` @ `00:00:19` — “A loop is three things: a trigger, an action, and a stop condition”
- **Epistemic:** SOURCE

### Replace the re-prompter, not the principal
- **Claim:** Loop engineering = replace yourself as the person who prompts the agent. Design the system that does that.
- **Reasoning:** The human is good at the end goal. The intern should check its own work and only come back when done (or when the cap hits).
- **Mechanism:** Reason → act → observe → (if not done) again.
- **Evidence:** Cake-fork; smart-intern metaphor.
- **Conditions:** Stop is objective enough to check. Hard step (send/pay/book) is still a human.
- **Exceptions:** He still iterates as a human after overnight chunks.
- **Action:** I replace myself as the person who re-prompts. I do not replace Evens as the person who sends.
- **Confidence:** high
- **Source:** `EuzYhzB0vbI` @ `00:00:45` — “replacing yourself as the person who prompts the agent”
- **Epistemic:** SOURCE

### 24/7 fleets scale bugs if you do not understand the job
- **Claim:** Around-the-clock swarms are not “using the subscription.” If you do not understand the work, you scale problems. His useful shape is cadence + events.
- **Reasoning:** Knowledge-work (his) ≠ team-on-a-codebase (maybe). Steinberger 10x is role-specific.
- **Mechanism:** Scheduled / event triggers, not nesting-doll managers prompting managers.
- **Evidence:** Spoken twice (early warning + close).
- **Conditions:** You can name what the overnight chunk is for.
- **Exceptions:** He still fires 4–8 hour overnight experiments, then a human iterates.
- **Action:** 24/7 on this hive = learn / dry-run / score, not auto-money. `/loop` only if Evens names the interval.
- **Confidence:** high
- **Source:** `EuzYhzB0vbI` @ `00:01:41` — “you’re probably just going to scale problems”
- **Epistemic:** SOURCE

### Done is X metric = Y, not “until satisfied”
- **Claim:** Best loops iterate until a number hits a number. “Until you’re satisfied” / “until 100% confident” is a weak stop. Subjective scores need a **separate checker** that has been eval’d.
- **Reasoning:** Abbey Road had ≥9 and a hard cap of 8 and still looked nothing like the photo — the check was the wrong kind (code screenshot vs image gen). Thumbnails scored themselves.
- **Mechanism:** Write the metric and the cap **before** `/goal`.
- **Evidence:** Thumbnail “until satisfied”; Abbey ≥9 / 8-pass cap; cake-fork.
- **Conditions:** The metric must be observable with the tools you gave it.
- **Exceptions:** Sometimes you cannot get fully objective; then say so, and still cap the passes.
- **Action:** `golden-test-loop`. I do not accept self-grade. Watchdog grades Forge.
- **Confidence:** high
- **Source:** `EuzYhzB0vbI` @ `00:07:08` — “Keep iterating until X metric equals Y result”
- **Epistemic:** SOURCE

### Observe the artifact, not the workflow screenshot
- **Claim:** Plane loop had to open the browser and spin. Abbey loop screenshot each HTML version. Verification tools must match the job (play the level / tone / visual).
- **Reasoning:** A loop that cannot open the thing it built is a demo.
- **Mechanism:** Tooling for the check is part of the loop design, not an afterthought.
- **Evidence:** 37-minute plane still missing see-through; Abbey versions 1–7 on screen.
- **Conditions:** You will look. He did.
- **Exceptions:** Closer-on-first-try is the win, not 100%.
- **Action:** `click-live-site`. Open the plane / the page / the PDF.
- **Confidence:** high
- **Source:** `EuzYhzB0vbI` @ `00:10:42` — “What does done mean? And then how will it check?”
- **Epistemic:** SOURCE

### Solo loop is the default; manager+helpers is already this hive
- **Claim:** Majority of tasks: one terminal session + a good prompt. Maker-checker when you need a grader. Manager + helpers is a nesting doll — only if one main agent orchestrates.
- **Reasoning:** Fancy 3-day / 12-hour+ architecture is how you scale bugs. He does not go for those runs.
- **Mechanism:** Pick the smallest shape that can verify.
- **Evidence:** “what I’m typically doing the most” = solo.
- **Conditions:** Verification still exists in the solo prompt.
- **Exceptions:** Overnight 4–8h chunk for a big experimental goal, then human.
- **Action:** `slice-build`. 17 named desks already are manager + helpers. No 18th vibe-inferrer. `interview-to-desk` before any new desk.
- **Confidence:** high
- **Source:** `EuzYhzB0vbI` @ UNKNOWN — “You just get it done with one simple terminal session and a good prompt”
- **Epistemic:** SOURCE

### Hard cap and cost are part of done
- **Claim:** If the goal and the check are both hard, the loop can run forever. 12h+ has not been useful to him. 35 min–a couple hours, or overnight 4–8h then human.
- **Reasoning:** Cost must make sense. A loop that cannot hit the metric will burn the night.
- **Mechanism:** Hard cap on passes (Abbey: 8). Logging. Separate checker.
- **Evidence:** 27 min / 37 min / 12h+ / 4–8h spoken. **UNVERIFIED** as facts.
- **Conditions:** You will wake up and iterate; the overnight is not a send.
- **Exceptions:** Steinberger’s 10x does not transfer to every role — including this desk.
- **Action:** `ask-principal` after the chunk. Do not arm a 24/7 send/pay/book fleet.
- **Confidence:** high as a policy; minutes UNVERIFIED
- **Source:** `EuzYhzB0vbI` @ `00:12:23` — “loops that have gone for 12 hours plus, and they’re just not like super useful”
- **Epistemic:** SOURCE

### “One shot” is often a hidden loop
- **Claim:** People say they one-shotted a video edit. His Hyperframes `/goal` cuts, beats, renders, and verifies alignment. That is a loop with tools.
- **Reasoning:** The magnet is one prompt. The machine is verification + iteration.
- **Mechanism:** Transcript → cut → beats → render → check bounds.
- **Evidence:** Spoken as his most common loop. Not walked node-by-node.
- **Conditions:** Tools exist for the check.
- **Exceptions:** We do not install Claude / Hyperframes.
- **Action:** Steal the hidden-loop read. Do not chase one-shot titles.
- **Confidence:** medium (described, not demoed)
- **Source:** `EuzYhzB0vbI` @ `00:11:31` — “it was a loop, because it had verification and iteration”
- **Epistemic:** SOURCE

## C. Mental Models

- **Trigger, action, stop.** Three nouns or it is a swarm. **SOURCE**
- **Cake-fork.** Done is a check, not a feeling. **SOURCE**
- **Outsource the feedback, not the hard step.** **SOURCE**
- **24/7 is how you scale bugs.** Cadence + events. **SOURCE**
- **X = Y beats “satisfied.”** **SOURCE**
- **Open the thing.** Browser / screenshot / play the level. **SOURCE**
- **Smallest shape that can verify.** Solo default. **SOURCE**
- **Closer on try one, not perfect.** **SOURCE**
- **Role-specific 10x.** Do not drop the hunt because OpenAI posted. **SOURCE**
- **Four looping agents is the joke, not the hire plan.** **INFERENCE**

## D. Procedures

1. Write **done** (X metric = Y) and **how it checks** before `/goal`.
2. Write a **hard cap** (passes or hours). 12h+ is a smell.
3. Pick the smallest shape: solo unless you need a separate checker.
4. Give the loop the **tools the check requires** (browser, tests, rubric scorer).
5. Plan first. Log. Do not self-grade.
6. Run headed or overnight-chunk. Human iterates the output. No send/pay/book/publish in the loop.
7. If the artifact cannot be opened, the loop is a demo.
8. Do not copy Steinberger’s fleet because a tweet said 10x.

**Qualify / frame:** Loop-definition tape + Skool magnet. Thumbnails / plane / Abbey are teaching props.
**Objections:** “You’re falling behind without a 24/7 swarm” — he says that is false for his work. “Until satisfied” — he calls it the issue. “Abbey scored ≥9” — it still looked nothing like the photo.
**Avoid:** Claude Code / Loop Library as OS; quote 27/37 min / 45 sources / V7 / 10x / 12h as FACT; vibe-inferrer product.
**When to change:** if the check cannot see the artifact, stop. If the next action is a hard step, Evens.

## E. Examples

**Situation:** Four agents writing prompts for each other on screen.  
**Action:** He asks: productive or cool demo? Then defines trigger/action/stop.  
**Reasoning:** The tweet stream produces swarms.  
**Outcome:** A definition tape, not a fleet install.  
**Lesson:** Opening demo is the anti-example. Implicit rule: nesting dolls are not default.

**Situation:** `/goal` thumbnails, done = “until satisfied.”  
**Action:** 10 concepts, score, improve top 3, pick #8 V3. 27 minutes.  
**Reasoning:** Rubric existed; scorer was the same brain.  
**Outcome:** A final still; he wants a dedicated eval’d scorer.  
**Lesson:** Subjective self-score is a weak stop. Implicit rule: separate checker.

**Situation:** Abbey Road in HTML, stop ≥9, cap 8.  
**Action:** Screenshot each version; stop at v7 near the cap.  
**Reasoning:** Check was visual-code, not image gen.  
**Outcome:** Colors/road/car; “nothing like the picture.”  
**Lesson:** Loop is only as good as the done check. Implicit rule: wrong check + hard cap still ships a miss.

**Situation:** Big goal at bedtime.  
**Action:** 4–8 hour chunk; morning human iterate.  
**Reasoning:** Cheaper than 3-day fancy runs; still experimental.  
**Outcome:** Something to chuck into the next loop.  
**Lesson:** Overnight is a draft. Implicit rule: human after the chunk; no send in the night.

## F. Decision Rules

- If you cannot name trigger, action, and stop → you do not have a loop.
- If done is “satisfied” / “confident” → rewrite as X = Y or add a cap + separate checker.
- If the check has no tool → do not start.
- If the job is majority-of-tasks → solo loop, not manager+helpers.
- If someone cites Steinberger 10x → ask whether the role matches; default no.
- If the loop can send/pay/book/publish → remove that capability.
- If runtime → 12h and the metric is not moving → kill.
- Optimize: closer on try one with a checkable stop.
- Refuse: 24/7 auto-money; vibe-inferrer; Loop Library as required stack.

## G. Contrarian

- Against “if you’re not running 24/7 fleets you’re falling behind.”
- Against “one-shot” as the real method — hidden loops.
- Against “until satisfied” as done.
- Against dropping your workflow because a coder at OpenAI 10x’d.
- Field assumes more agents. He assumes more verification. He still uses Claude Code 24/7 for knowledge work — labeled: **use ≠ unattended swarm**.

## H. Assumptions

**His:** `/goal` + Loop Library is enough to teach; 35 min–8h is the useful band; separate scorer would have fixed thumbnails; Skool deck/audit helps; knowledge-work loops transfer.

**Ours:** Captions complete enough (3,673 words). 27 min / 37 min / 45 sources / V7 / ≥9 / 8 passes / 12h / 4–8h / 10x **UNVERIFIED**. Visual quality of plane/Abbey/thumbnails **UNVERIFIED**. Claude / Berman library / Skool on tape. Clients parked.

**Falsifiers:** X = Y is gamed by a self-scorer. Overnight chunk sends. Solo loop without a check is just a long prompt. Abbey-style wrong check becomes our “done.”

**Disagreement (keep labeled):** We will not operate a 24/7 swarm or install Claude. The **trigger + action + checkable stop + separate checker + hard cap** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What did the 45-source research actually keep vs discard?
- Did he ever eval a dedicated scorer, or only prescribe it?
- Hyperframes sibling tape — not bound here.
- Who reads the “full audit” PDF? Skool, not here.

## J. Connections

- **SYSTEM SYNTHESIS** → `coverage-loop` (trigger / act / `can_complete_task`).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (X = Y; do not self-grade).
- **SYSTEM SYNTHESIS** → `click-live-site` (plane / Abbey / any URL).
- **SYSTEM SYNTHESIS** → `slice-build` · `agent-as-hire` · `ask-principal` · `interview-to-desk`.
- **SYSTEM SYNTHESIS** → `3GAxd90fEE4` / `tDGiWn0flK8` (plan first, named done, rot).
- **SYSTEM SYNTHESIS** → doctrine #5 manage don’t chat; #6 reject 70%; #8 known-good pile.
- Do not rotate the live hunt because a thumbnail loop ran 27 minutes.

## K. Future-Use

- Dedicated scorer as Watchdog eval set (unassigned).
- Overnight-chunk-then-human as a Day Planner bucket (unassigned; Evens names the interval).
- “Hidden loop behind one-shot” as a Publishing sniff test (learn; no publish).
- Hard-cap default on any `/loop` (unassigned).

## Steal / Operate-never

### Machine: Name done (X = Y) + how it checks + hard cap → smallest loop that can observe the artifact
- **Epistemic:** SOURCE (definition + three demos) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (a named goal) → write X = Y and the check tool → write a pass/hour cap → pick solo (default) or maker-checker → plan → run → observe the **artifact** (browser/file/test) → if not done and under cap, again → else return to human → Evens iterates / HITL hard step. No 24/7 send. No vibe-inferrer.
- **Questions / signals:** “What is the trigger?” “What is X = Y?” “How will it see the result?” “What is the cap?” “Can this loop send?”
- **Qualify / frame / objections:** Definition tape + Skool. Objection: four looping agents — that was the joke. Objection: Abbey ≥9 — wrong check, still a miss. Objection: Steinberger 10x — role-specific; do not drop the hunt.
- **Procedure:** D steps 1–8. Checkable stops: (1) X = Y written, (2) check tool exists, (3) cap set, (4) artifact opened, (5) no hard step inside the loop.
- **Example that proves it:** Thumbnails self-scored “until satisfied”; he names that as the bug. Abbey had a number and a cap and still missed because the check was the wrong kind. Lesson: metric + matching observe + cap. Implicit rule: closer-on-try-one is the win.
- **Why it works:** Feedback happens anyway; outsourcing it only helps if the stop is real. Conditions: objective-enough done, tools for the check, a human after the chunk. Exceptions: 12h+ not useful; majority of tasks need a prompt + verify, not a fleet; he still uses Claude — we do not install it.
- **Conditions / exceptions:** Cursor + Grok only. Loop Library / Claude / Skool on tape. Clients parked. Tape minutes / 10x UNVERIFIED.
- **Operate-never payload:** 24/7 auto-send/pay/book/deploy/publish; vibe-inferred meta-agent; Berman library as OS; quote 27/37 min / 45 sources / V7 / 10x as FACT.
- **Hive run (existing skills only):** `coverage-loop` · `golden-test-loop` · `click-live-site` · `slice-build` · `agent-as-hire` · `ask-principal` · `interview-to-desk` · `tape-self-teach` (parent launches desks; this desk does not spawn 17).
- **Source:** `EuzYhzB0vbI` @ `00:00:19` / `00:07:08` / `00:10:42`

**Operate-never (this desk will not operate — still walked the tape):**

- 24/7 auto-send / auto-pay / auto-book / auto-deploy / auto-publish
- Install Claude Code / “Cloud Code” / Loop Library as hive OS. Cursor + Grok only
- Meta-agent that infers loops from vibe as a product
- Quote 27 min / 37 min / 12h / 4–8h / 45 sources / V7 / ≥9 / 8 passes / Steinberger 10x as FACT
- Nate Skool / Plus / “full audit” as a hive SKU
- New hunt ICP. Clients parked. No Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not let four agents prompt each other and call it a company.

- **Done** on a loop slice: X = Y written + check tool named + cap set + artifact opened. A 27-minute thumbnail run is not done. A 24/7 fleet is not done.
- **Delegate without being asked:** Watchdog is the separate checker (Forge does not self-grade). Day Planner does not arm overnight unless Evens names the interval. HITL holds any loop that could send.
- **Skeptical review:** The cold open is a cool demo. Cake-fork is the work. I will not approve a swarm because a tweet said we are falling behind.
- **One system this take:** one solo loop with a checkable stop on work we already do (`coverage-loop` / a golden). Not a nesting-doll OS.
- Live hunt stays parked. I do not rotate because Steinberger 10x’d.
