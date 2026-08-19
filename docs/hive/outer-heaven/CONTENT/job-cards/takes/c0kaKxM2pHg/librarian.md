# Librarian — c0kaKxM2pHg
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/c0kaKxM2pHg/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/c0kaKxM2pHg/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** The Skill That 10x’d My Claude Code Projects
**Channel:** Nate Herk | AI Automation
**Kind:** video (~1854 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Hard part of an AI OS is extraction: head → system. Same model (Opus 4.8 named) ⇒ same prompts ⇒ same output unless you add taste/voice/decisions.
2. Discovery/scoping is the same pain: questions until a client is annoyed; difference between a system successful 95% vs 80% (UNVERIFIED).
3. Five-minute brain dump is never enough. Skill: **grill me** — relentless Qs → checkpoint to a knowledge doc → loop until no holes.
4. Origin: Matt Pocock, 4–5 sentences: interview relentlessly; walk the design tree; resolve dependencies one by one; recommend an answer; one Q at a time; if the codebase can answer, explore instead of asking.
5. Skill can be “a prompt you don’t want to say every single time.” He “destroyed/ruined” it: checkpoint after every Q because hour-plus grills overflow context and he was manually saying “write this to a doc.”
6. Creates `brainstorms/` at project root; markdown with algorithm, key decisions, step-by-step Q&A log, highlights. Packaging session ended: “you have a packaging guide and skill; nuance we talked about is not in there — update both?” He said yes.
7. Also grilled “everything about the business.” Chart: old path ~70% iter 1 → 75% … cap ~95% over 10–30 iters, never 100% because business evolves; grill-me front-load → ~90% on iter 1 (UNVERIFIED cartoon). Axe: 6 hours to chop, 4 sharpening.
8. CTA: Pocock version or his free Skool classroom / YouTube resources. Invoke “grill me about…” or slash. Demo: applying AI internally safely — capture file, discovery nodes, summary, Q&A, **open flags** (go ask the real operator, come back). 5–30 questions until shared knowledge. Re-grill when a breakthrough lands.
Gap: visual of the skill file and brainstorm folder. Timestamp UNKNOWN. Claude/Skool on-tape.

## B. Atomic Knowledge

### Extraction is a checkpointed interview, not a dump
- **Claim:** Relentless one-at-a-time questions + write-back after each answer + flags for what the speaker cannot know beats a 5-minute brain dump.
- **Reasoning:** Context window forgets earlier answers; clients/operators hold the real process; first-iter quality jumps if you pay the interview tax.
- **Mechanism:** Pocock core (one Q, recommend answer, walk design tree, explore codebase first) + his `brainstorms/` checkpoint + offer to update existing guide/skill + re-grill.
- **Evidence:** Packaging session → update guide+skill; internal-AI session → flags to ask a stakeholder; “I found myself telling it manually… write this to a doc.”
- **Conditions:** A human will sit the grill; a project root; you will not skip flags.
- **Exceptions:** He still iterates after the ~90% cartoon. Never 100%.
- **Action:** Steal the loop. Do not join Skool. Do not auto-write a hive `SKILL.md` — checkpoint to a doc; Evens decides skill writes.
- **Confidence:** high as a method; 95/80/70/90 cartoon UNVERIFIED
- **Source:** `c0kaKxM2pHg` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN (caption-only). Speech describes opening `.claude/skills`, `brainstorms/`, packaging doc.
- **Failed / retried:** Original skill forgot earlier answers on long grills → he added checkpoint.
- **Speech ≠ behavior:** none labeled

### A skill can be a reusable prompt
- **Claim:** A skill does not have to be complicated automation; it can be a prompt you refuse to retype.
- **Evidence:** “it is a super simple prompt. It’s like four to five sentences.”
- **Action:** File reusable-prompt-as-skill; hive still does not auto-write SKILL.md
- **Confidence:** high
- **Source:** `c0kaKxM2pHg` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Context (taste/voice/decisions) is the differentiator, not the model. Annoyance is a feature of good discovery. Axe-sharpening: boring front-load helps downstream. He is fine making Pocock’s simple skill longer for memory. Skills keep evolving with the business.

## D. Procedures
1. One question at a time; offer a recommended answer.
2. Walk each branch of the design tree; resolve dependencies one by one.
3. If the codebase can answer, explore instead of asking.
4. After each answer, checkpoint to `brainstorms/*.md` (algorithm, key decisions, Q&A log, highlights, open flags).
5. Flag what the speaker cannot know; send the human to the real operator; drop the answer back in.
6. At shared understanding, offer to update the matching guide/skill — human says yes/no.
7. Re-grill when a breakthrough lands; append, do not start from zero.
Avoid: 5-minute dump; skipping flags; treating 70→95 cartoon as FACT.

## E. Examples
**Packaging grill:** Situation — packaging process in his head. Action — grill + Q&A log. Reasoning — nuance missing from guide/skill. Outcome — he approved update to both. Lesson — end of grill is a write-back offer, not just a chat.

**Internal AI safety grill:** Situation — “applying AI internally in a safe way that won’t damage the business.” Action — capture file + open flags. Reasoning — he is not the stakeholder for every process. Outcome — flags to go ask the operator. Lesson — grill fails closed on unknown ownership.

## F. Decision Rules
- IF brain-dump feels “good enough” → it is not; start grill.
- IF hour-plus session → checkpoint every Q (context will forget).
- IF speaker cannot explain like the operator → flag, do not invent.
- IF existing skill/guide exists at end → offer update; wait for yes.
- IF breakthrough later → re-grill the same doc.
- Refuse: Skool as hive; 95/80/70/90 as FACT; auto-write SKILL.md.

## G. Contrarian
Against “just dump it in Claude for 5 minutes.” Against skill-as-complex-automation-only. Against waiting for 100%.

## H. Assumptions
% cartoon and 95-vs-80 UNVERIFIED. Skool CTA. Caption-only: do not invent the skill-file clicks. Aligns with hive `ask-principal` / discovery tax. Do not flatten Pocock-simple vs Nate-checkpoint as a fight — he kept both.

## I. Questions
What is the exact stop rule besides “feels like shared knowledge”? How many flags typically? Does checkpoint after every Q waste tokens vs every N?

## J. Connections
SYSTEM SYNTHESIS → hive `session-bootstrap` (one long dump then short loops) is the opposite failure mode he is warning about unless the dump is grilled. → `ask-principal`. → `c0kaKxM2pHg` LEARNED (Researcher already filed).

## K. Future-Use
Grill-me loop + open-flags + re-grill as atoms. Checkpoint-to-doc pattern for any long interview.

## Steal / Operate-never

### Machine: grill → checkpoint → flag → update-on-yes → re-grill
- **Epistemic:** SOURCE
- **Workflow / loop:** invoke grill → one Q + recommended answer → write `brainstorms/` → flag unknowns → loop until shared knowledge → offer update to guide/skill → human yes/no → later re-grill on breakthrough. Checkable stop = Q&A log + no open holes the human accepts, or named flags.
- **Questions / signals:** Can the codebase answer? Who is the real operator? What is missing from the existing skill/guide?
- **Qualify / frame / objections:** “Annoyed by questions” is a feature; axe-sharpening frame.
- **Procedure:** D above.
- **Example that proves it:** Packaging → update both; internal-AI → flags to stakeholder.
- **Why it works:** Context forgets; dump is incomplete; first-iter quality is an interview tax.
- **Conditions / exceptions:** Human must sit it; never 100%; still iterate.
- **Operate-never payload:** Skool/Plus as hive; auto-write SKILL.md; 95/80/70/90 as FACT; Claude as hive stack (on-tape only).
- **Hive run:** `ask-principal` · `session-bootstrap` (grill, do not dump) · do not auto-write skill
- **Source:** `c0kaKxM2pHg` @ UNKNOWN

### Operate-never
- Join Skool / Plus. Quote 95/80/70/90 as FACT. Auto-write a new hive SKILL.md. Install Claude as hive stack.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File grill-me as the Librarian interview loop for future tapes and for operator extraction: one Q, checkpoint, flag what Evens is not the stakeholder for. Do not flatten Researcher LEARNED. No Skool wiki.
