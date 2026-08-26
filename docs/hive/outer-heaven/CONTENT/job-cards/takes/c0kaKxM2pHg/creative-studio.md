# Creative Studio — c0kaKxM2pHg
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/c0kaKxM2pHg/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/c0kaKxM2pHg/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
“The Skill That 10x’d My Claude Code Projects” — grill-me. Beats: same model → same output unless you add taste/voice/decisions; extraction is the hard part; client discovery annoyance is the price of 95% vs 80%; 5-minute brain dump is never enough; grill-me asks relentlessly, checkpoints to a knowledge doc, loops until no holes; origin Matt Pocock, 4–5 sentences (interview relentlessly, walk the design tree, recommend an answer, one question at a time, explore the codebase if it can); Nate “ruined” it by adding checkpoint-after-every-question because hour-long grills fill the window; `brainstorms/` at project root; packaging example: algorithm, key decisions, Q&A log, highlights; then it offered to update packaging guide + packaging skill; “understand the business” grill; old curve 70%→75%→95% over many iters vs grill-me first jump to ~90%; axe-sharpening; Skool magnet for his version; demo “grill me about applying AI internally safely”; capture file with discovery nodes, key decisions, Q&A, **open flags** (go ask the real operator); 5–30 questions until shared knowledge; come back when packaging changes. 95/80/70/90 UNVERIFIED. Claude/Skool on tape.

## B. Atomic Knowledge

### Checkpoint every answer
- **Claim:** A long grill without writing back will misremember early answers; the skill must checkpoint to a doc after each question.
- **Reasoning:** Context window fills; he used to say “write this to a doc” by hand.
- **Evidence:** “if it's grilling you for an hour plus… I started to get worried that it was going to misremember… I just found myself telling it manually… Why not just work that into the skill?”
- **Conditions:** Sessions long enough to fill a window.
- **Exceptions:** A five-question grill may not need it — he still wants the habit.
- **Action:** Q → A → write; never dump-only.
- **Confidence:** SOURCE.
- **Source:** `c0kaKxM2pHg` @ UNKNOWN
- **Epistemic:** SOURCE

### Flags for the real operator
- **Claim:** When he cannot explain a process as well as the stakeholder, the skill flags “go ask this person, drop it back in.”
- **Evidence:** “I can't explain the same way as the actual stakeholder… Here's some things to flag. Go reach out to this person”
- **Conditions:** Business-wide grill.
- **Exceptions:** Inventing the missing process.
- **Action:** Open flags stay open until a human who does the job answers.
- **Confidence:** SOURCE.
- **Source:** `c0kaKxM2pHg` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Taste/voice/decisions are the only differentiator on a shared model. Skills can be a prompt you refuse to retype. Nothing is 100% because the business moves. Up-front boring questions are the axe.

## D. Procedures
1. Invoke grill-me on a named process (packaging, internal AI, a skill).
2. One question at a time; it recommends an answer.
3. Checkpoint to `brainstorms/`.
4. Keep the Q&A log.
5. Honor open flags — ask the operator.
6. At the end, update the guide and the skill.
7. Re-grill when a breakthrough lands.

Avoid: 5-minute dump; Skool join; Claude install; treating 95% as FACT.

## E. Examples
**Situation:** Packaging.  
**Action:** Grill → log → “your guide and skill are missing this nuance” → yes, update both.  
**Reasoning:** Shared understanding.  
**Outcome:** Better packaging docs.  
**Lesson:** The walkthrough is the Q&A log + the updated bible, not a skill orb.

## F. Decision Rules
- If you only brain-dumped → it is not good enough.
- If an hour passed with no checkpoint → expect lost answers.
- If you are not the operator → flag, do not invent.
- If the skill and the guide disagree → update both.

## G. Contrarian
A skill does not have to be a complex automation. Also: more questions even if the client gets annoyed.

## H. Assumptions
Pocock origin. 95/80/70/90 are a sketch. Skool classroom magnet.

## I. Questions
What did the packaging algorithm look like? Visual axe chart?

## J. Connections
- SYSTEM SYNTHESIS → `cinematic-recipe` / brand-template-as-skill (packaging grill is this desk).
- SYSTEM SYNTHESIS → `session-bootstrap` (long dump, then loops).
- SYSTEM SYNTHESIS → `eMPWBunaOic` ramble vs this relentless Q.

## K. Future-Use
Grill-me on the motion bible. Unassigned. Do not auto-write SKILL.md.

## Steal / Operate-never

### Machine: one-question grill then checkpoint
- **Epistemic:** SOURCE
- **Workflow / loop:** name the process → one Q → answer → write to brainstorm doc → flags for operators → update guide+skill → stop at shared knowledge
- **Questions / signals:** Holes? Who actually runs this? Guide vs skill drift?
- **Qualify / frame / objections:** 5-minute dump is the anti-pattern
- **Procedure:** Recommend an answer; explore the repo if the answer is there
- **Example that proves it:** Packaging grill → update guide and skill
- **Why it works:** Taste leaves the head before the generate
- **Conditions / exceptions:** Long sessions need checkpoints; 90% is a sketch
- **Operate-never payload:** Skool join; Claude install; auto-write SKILL.md; new hunt
- **Hive run:** `cinematic-recipe` (bible first); `session-bootstrap`; `ask-principal`
- **Source:** `c0kaKxM2pHg` @ UNKNOWN

### Operate-never
- Join Skool. Install Claude. Auto-write SKILL.md.
- Quote 95/10x as FACT. New hunt. Merge `LESSONS-FROM-TAPE.md`.
- Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: the “horrible visual” 70→95 vs jump-to-90 is the plate — a **curve**, not a brain. This desk should grill packaging/type/motion before the next generate. HITL. Clients parked.
