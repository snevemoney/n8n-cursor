# Big Boss — c0kaKxM2pHg
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/c0kaKxM2pHg/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/c0kaKxM2pHg/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 7:24, 1854 words, captions `en-orig` json3). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: AIOS dump, Grill Me skill file, `brainstorms/` folder, packaging Q&A log, the 70%→95% vs 90%-first sketch.

Beats, in order:

1. Thesis: hardest part of skills / an OS is getting what is in your head into the system. Same model (Opus 4.8) → same prompts → same output unless you add taste, voice, decisions.
2. Extraction is the gap. Client discovery / scoping: ask until they are almost annoyed. Difference he names: system successful “95% of the time” vs “80%.” **UNVERIFIED.**
3. Skill: **Grill Me** — relentless questions until the process is known. Not a 5-minute brain dump. Loop: question → answer → **checkpoint to a knowledge doc** → repeat until no holes.
4. Origin: Matt Pocock, “super simple” 4–5 sentences: interview relentlessly; walk each branch of the design tree; resolve dependencies one by one; for each question provide a recommended answer; one question at a time; if the codebase can answer, explore the codebase instead.
5. His mutation: Pocock’s skill did not checkpoint. Hour-plus grills filled the window; he feared misremembered early answers; he kept saying “write this to a doc.” So he baked checkpointing in.
6. Mechanism: create `brainstorms/` at project root; one markdown per session; algorithm / key decisions / step-by-step Q&A log / highlights. End of packaging grill: skill notices packaging guide + packaging skill are missing nuance → offers to update both → he says yes.
7. Second grill: “understand everything about the business” — decisions and processes end to end. OS “feels like it knows even more.”
8. Sketch: old way — dump → ~70% on iteration 1 → +5% per run → cap ~95% after 10–30 iterations, never 100% because the business moves. Grill-first: spend the time up front, start ~90%, then iterate. Axe-sharpening (6 hours / first 4). **UNVERIFIED** percentages.
9. CTA: Pocock’s skill, or Nate’s version in free Skool classroom / YouTube resources. Invoke: “grill me about this” or `/grill-me`.
10. Live demo: grill “applying AI to my own business internally in a safe way that won’t damage the business.” Creates capture file; discovery nodes; summary; key decisions; Q&A log; **open flags**. Flags = things he cannot explain as well as the real operator — go get that person, drop the answer back, update the brainstorm.
11. Re-entry: docs are durable. New packaging breakthrough → reopen the doc, grill again, update.
12. Length: he keeps the video short on purpose. Like/CTA.

Off-topic / not skipped: client-annoyance as a feature; Skool; “safe internal AI” as the demo prompt.

## B. Atomic Knowledge

### A brain dump is not extraction
- **Claim:** Five minutes into the model is “not ever good enough.” Relentless, one-at-a-time questions until shared understanding.
- **Reasoning:** Same model + same thin dump = same generic output. Taste/voice/decisions live in the head until written.
- **Mechanism:** Grill loop + recommended answers + walk the design tree + resolve dependencies in order.
- **Evidence:** Pocock prompt quoted; his packaging and “whole business” sessions.
- **Conditions:** A human who will sit the hour. Client version: they may get annoyed — he still asks.
- **Exceptions:** If the codebase can answer, do not ask the human (Pocock rule he kept).
- **Action:** `session-bootstrap` / `interview-to-desk` are dumps *plus* questions until sure. Dump-only is 70%.
- **Confidence:** high for the claim shape; low for 70/90/95.
- **Source:** `c0kaKxM2pHg` @ UNKNOWN — “It’s not ever good enough”
- **Epistemic:** SOURCE

### Checkpoint every answer or the window will lie
- **Claim:** A long grill without writes will misremember early answers as context fills.
- **Reasoning:** He caught himself doing the writes by hand. That is a skill smell: if you say it every time, bake it in.
- **Mechanism:** `brainstorms/*.md` with Q&A log, decisions, flags. Durable so you can re-grill later.
- **Evidence:** Packaging log on tape; “write this to a doc” habit.
- **Conditions:** Hour-plus sessions. Short grills may not need it — he still defaulted to always.
- **Exceptions:** Original Pocock skill had no checkpoint and still “interviewed.”
- **Action:** Definition of done for a discovery = answers in a file, not only in the chat.
- **Confidence:** high
- **Source:** `c0kaKxM2pHg` @ UNKNOWN — “I started to get worried that it was going to misremember”
- **Epistemic:** SOURCE

### End of grill updates the operating artifacts
- **Claim:** When the session finds nuance missing from the guide/skill, offer to patch both. Re-open when the world changes.
- **Reasoning:** The brainstorm is a staging area. The skill/doc is what later jobs load.
- **Mechanism:** Notice gap → ask permission → update packaging guide + packaging skill. Later: “grill me again, here’s what’s new.”
- **Evidence:** Packaging example; he still changes months-old skills.
- **Conditions:** Human says yes. Never 100% — business evolves.
- **Exceptions:** Flags that require a *different* stakeholder — do not invent; go get them.
- **Action:** Librarian/Forge: brainstorm is not the card. Promote only after the owner confirms.
- **Confidence:** high
- **Source:** `c0kaKxM2pHg` @ UNKNOWN — “do you want me to update both of those?”
- **Epistemic:** SOURCE

### Flags are holes with owners
- **Claim:** Grill should mark what the current speaker cannot explain as well as the real operator, and send you to that person.
- **Reasoning:** One founder’s dump of “the funnel” will be wrong where they do not run the step.
- **Mechanism:** Open flags in the capture file; reach out; drop the answer back; update.
- **Evidence:** Internal-AI-safety demo; funnel-map flags.
- **Conditions:** You know who the stakeholder is, or the grill asks you to name them.
- **Exceptions:** If you skip the flag, the OS learns a confident hole.
- **Action:** Big Boss: a flag is a delegated interview, not a skip. HITL on the outreach.
- **Confidence:** high
- **Source:** `c0kaKxM2pHg` @ UNKNOWN — “Go reach out to this person”
- **Epistemic:** SOURCE

### A skill can be a prompt you refuse to retype
- **Claim:** Grill Me started as four sentences. Complexity is optional; checkpointing was the justified add.
- **Reasoning:** He “destroyed” the simple skill on purpose. The lesson he keeps: skills are standing questions, not only automations.
- **Mechanism:** Slash command or “grill me about X.”
- **Evidence:** Pocock quote vs his longer file.
- **Conditions:** The standing prompt is one you would otherwise forget mid-session.
- **Exceptions:** Fancy skills for the video are the failure mode on `eRS3CmvrOvA`.
- **Action:** Do not require a plugin to ask one question at a time and write it down.
- **Confidence:** high
- **Source:** `c0kaKxM2pHg` @ UNKNOWN — “a skill can just be a prompt that you don’t want to have to say every single time”
- **Epistemic:** SOURCE

## C. Mental Models

- **Context is taste, not the model.** **SOURCE**
- **Annoyance is a discovery feature.** **SOURCE**
- **Sharpen the axe (time up front).** **SOURCE**
- **Never 100%; the business moves.** **SOURCE**
- **If you repeat a manual “checkpoint,” it belongs in the skill.** **SOURCE**
- **Holes need names (flags → people).** **SOURCE**
- **70/90/95 is a napkin, not a measurement.** **INFERENCE**

## D. Procedures

1. **Name the object:** a plan, a skill, a business process, a “safe internal AI” rule.
2. **Grill one question at a time.** Offer a recommended answer. Walk branches; resolve dependencies in order.
3. **If the repo can answer, read the repo.** Do not ask the human.
4. **Checkpoint every answer** to `brainstorms/` (or hive equivalent): decisions, Q&A log, flags.
5. **On flags:** name the stakeholder; HITL ask; paste back; update.
6. **At shared understanding:** patch the real skill/doc, not only the brainstorm.
7. **Re-enter** when a breakthrough or a process change lands.

**Qualify / frame:** Extraction tape, not a Skool SKU. Claude / Grill Me plugin stay on tape.
**Objections:** “We already dumped” — he says that is 70%. “Clients get annoyed” — he treats that as the job.
**Avoid:** installing his skill from Skool; quoting 95% as FACT; grilling a parked client.
**When to change:** if flags pile up and nobody is sent, stop calling the OS “smarter.”

## E. Examples

**Situation:** Packaging skill/guide exists; he grills packaging anyway.  
**Action:** Full Q&A log; skill offers to update both artifacts; he accepts.  
**Reasoning:** Nuance was in his head, not in the files the model loads.  
**Outcome:** “Those skills and docs are so much better.” **UNVERIFIED.**  
**Lesson:** Grill is for the *gap between head and file*. Implicit rule: staging doc → promote to the loaded skill.

**Situation:** Hour-plus grill, original skill, no writes.  
**Action:** He manually checkpoints; then bakes it in.  
**Reasoning:** Window will misremember.  
**Outcome:** `brainstorms/` as default.  
**Lesson:** Repeated operator paste is a missing procedure. Implicit rule: durable log or the interview did not happen.

**Situation:** Funnel questions he cannot answer like the operator.  
**Action:** Flag; go get that person; return; update.  
**Reasoning:** Confident holes are worse than named holes.  
**Outcome:** Capture file has open flags.  
**Lesson:** Extraction includes who else to interview.

## F. Decision Rules

- If it is only in a head → grill, do not dump-and-build.
- If the answer is in the repo → do not ask.
- If the session is long → write after every answer.
- If a flag names a person → that is the next interview, HITL.
- If the skill/doc was not updated → the grill is unfinished.
- Optimize: iteration-1 quality of the *loaded* artifact.
- Refuse: Skool install; 95% as FACT; nameless “grill the company” swarm.

## G. Contrarian

- Against “brain dump into Claude and go.”
- Against skills as complex automations only.
- Against iterating from 70% because “we’ll fix it in prod.”
- Against treating client irritation as a stop (he treats it as a signal you are finally asking the real questions).
- Field assumes more model. He assumes more questions.

## H. Assumptions

**His:** 95 vs 80 / 70 vs 90 are real enough to draw; hour grills are good; Skool copy is the conversion; updating both guide and skill is always right after a yes.

**Ours:** Captions complete enough (1854 words). Percent sketches **UNVERIFIED**. Domain-specific: Claude-Code OS / YouTube packaging. Client-annoyance does not license grilling a parked Path A.

**Falsifiers:** Checkpointed grills still lose decisions. Flags never get filled and the OS ships the hole. Recommended answers bias the human into his defaults.

**Disagreement (keep labeled):** Hive will not operate Grill Me / Skool / Claude. The **one-question + checkpoint + flag-the-owner + promote-to-skill** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- How does he decide the grill is over besides “feels like shared knowledge”?
- Do recommended answers contaminate?
- Packaging: what nuance was actually missing? (Not quoted.)
- 10 vs 30 iterations — any count, or a wave of the hand?

## J. Connections

- **SYSTEM SYNTHESIS** → `interview-to-desk` (questions until sure; then one TEAM task).
- **SYSTEM SYNTHESIS** → `session-bootstrap` (one dump, then short loops — grill is the loop).
- **SYSTEM SYNTHESIS** → `context-docs` (judgment Gmail never captured).
- **SYSTEM SYNTHESIS** → `agent-job-card` (promote brainstorm → owns/never).
- **SYSTEM SYNTHESIS** → `brB-hSiV2iU` (wrapper needs what was in the head).
- **SYSTEM SYNTHESIS** → doctrine: don’t chat — manage; ask until sure; argue the plan.
- Do not unpark a client to “grill” them because Nate scopes that way.

## K. Future-Use

- `brainstorms/` analog under Outer Heaven packets (unassigned; Researcher/Librarian).
- Open-flags as a morning Big Boss list (unassigned).
- Axe-time as Day Planner CUT protection (unassigned).
- “Skill = prompt you won’t retype” as Forge simplicity check (unassigned).

## Steal / Operate-never

### Machine: Relentless one-question interview → checkpoint → flag owners → promote to the loaded skill
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (new skill, process, or “the model doesn’t sound like us”) → name the object → ask one question at a time with a recommended answer → walk branches / dependencies → write each answer to a durable log → flag holes with a named person → HITL fill flags → patch the *loaded* skill/doc → re-grill when the world moves.
- **Questions / signals:** “Is this in the repo already?” “Who actually runs this step?” “Did we write the last answer down?” “Did the skill file change?”
- **Qualify / frame / objections:** Extraction, not a plugin SKU. 70/90/95 is a napkin. Objection: this is slow — he answers with axe-sharpening and fewer later iterations.
- **Procedure:** D steps 1–7. Checkable stops: (1) Q&A log exists, (2) flags have owners, (3) loaded skill/doc updated, (4) dump-only was refused.
- **Example that proves it:** Packaging grill finds nuance missing from guide+skill; updates both. Lesson: head → log → loaded artifact. Implicit rule: brainstorm is staging.
- **Why it works:** Same model needs your decisions. Windows forget; files do not. Conditions: a human who will sit it; stakeholders for flags. Exceptions: never 100%; recommended answers can bias; Skool copy is not the machine.
- **Conditions / exceptions:** Cursor + Grok only. Claude / Grill Me / Skool stay on tape. Clients parked. Tape % UNVERIFIED.
- **Operate-never payload:** Install his skill; quote 95% as FACT; grill a parked client; new hunt.
- **Hive run (existing skills only):** `interview-to-desk` · `session-bootstrap` · `context-docs` · `agent-job-card` · `ask-principal` (outreach to the flagged person) · `wiki-ingest` (promote pages).
- **Source:** `c0kaKxM2pHg` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Claude / Grill Me / Skool as hive OS
- Quote 95% / 80% / 70% / 90% as FACT
- New `icp_id` / unpark Normand / “discovery-call agency” hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md`

## L. Role-Specific Applications

I manage; I do not run a one-hour chat and call it a strategy.

- **Done** on an extraction slice: Q&A log + flags with owners + the *loaded* card/skill updated. “We brain-dumped” is 70% and I reject it.
- **Delegate without being asked:** Consultant/Researcher run the questions. Librarian persists what Evens keeps. Forge refuses a skill with no checkpoint trail. HITL owns the flag outreach. I do not spawn a nameless interviewer.
- **Skeptical review:** Axe-sharpening is real. His napkin math is not. I will not buy Skool to learn how to ask one question at a time.
- **One system this take:** one grill-to-card loop. Not “understand the whole business” in a single session unless Evens orders that dump.
- Live hunt stays parked.
