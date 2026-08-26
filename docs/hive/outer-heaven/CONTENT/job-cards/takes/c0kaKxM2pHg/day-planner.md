# Day Planner — c0kaKxM2pHg
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/c0kaKxM2pHg/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/c0kaKxM2pHg/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: the “grill me” skill. Beats: same model → same output unless you extract taste/voice/decisions; extraction is the hard part (also on client discovery — they get annoyed; 95% vs 80% success — UNVERIFIED); 5-minute brain dump is never enough; grill = relentless Qs → checkpoint to a knowledge doc until no holes; original = Matt Pocock, 4–5 sentences (interview relentlessly, walk the design tree, recommend an answer, one Q at a time, explore the codebase if you can); Nate “ruined” it by adding **checkpoint after every question** into `brainstorms/` (hour-plus grills blow context); packaging example: Q&A log + then “update the guide and the skill?”; business-wide grill; iteration chart 70→95 over many loops vs ~90% on iteration one if you grill first (axe metaphor); flags when he is not the stakeholder; re-grill when something changes; CTA Matt’s skill or Nate’s Skool classroom. Timestamp UNKNOWN.

## B. Atomic Knowledge
### Relentless one-at-a-time Qs + write-back every answer
- **Claim:** A short interview skill beats a brain dump; Nate’s add is checkpoint-every-answer so a long grill cannot forget.
- **Reasoning:** Context window fills; he was manually saying “write this to a doc.”
- **Mechanism:** One Q → answer → markdown in `brainstorms/` → next Q → at the end, offer to update skills/docs.
- **Evidence:** “checkpointing after every single question… nothing gets lost.”
- **Conditions:** You will sit for many questions (5–30+).
- **Exceptions:** If the codebase can answer, explore instead of asking (Pocock line).
- **Action:** Steal one-Q + checkpoint. Do not auto-write SKILL.md. Do not join Skool.
- **Confidence:** high as the machine.
- **Source:** `c0kaKxM2pHg` @ UNKNOWN
- **Epistemic:** SOURCE

### Grill until shared understanding, flag the holes
- **Claim:** Stop when you share the knowledge; flag what the operator cannot explain and send a human to the stakeholder.
- **Reasoning:** He is not every operator.
- **Mechanism:** Open flags on the capture file.
- **Evidence:** “go reach out to this person… drop that into me.”
- **Conditions:** Multi-person process.
- **Exceptions:** Solo process may have no flags.
- **Action:** Flags are a HITL ask, not a hunt. Clients parked — do not grill a client.
- **Confidence:** high.
- **Source:** `c0kaKxM2pHg` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Context is the moat, not the model. Sharpen the axe (4 of 6 hours). Skills never hit 100% because the business moves — re-grill. A skill can be a prompt you refuse to retype. Priority: extraction. Uncertainty: 70/90/95% are his sketch.

## D. Procedures
1. Invoke grill on one process.
2. One question at a time; recommended answer allowed.
3. Checkpoint every answer to a doc.
4. If codebase can answer → look, don’t ask.
5. At the end: update existing docs only if Evens says (do not auto-write SKILL.md).
6. Re-grill when a breakthrough lands.
Avoid: Skool; hour-plus through CUT without a stop; grilling a parked client.

## E. Examples
**Packaging grill:** Situation → packaging process in his head. Action → Q&A log + then update guide+skill. Reasoning → dump was not enough. Outcome → “so much better.” Lesson → checkpoint + end-update offer.

**Internal AI-safe grill:** Situation → “apply AI internally without damaging the business.” Action → capture file with discovery nodes, decisions, Q&A, open flags. Reasoning → flags for stakeholder gaps. Outcome → a list of people to ask. Lesson → flags are HITL, not a send.

## F. Decision Rules
- If it is a 5-minute dump → not enough; grill or CUT.
- If a flag names a person → Evens asks; this desk does not send.
- If the grill would eat CUT with no checkpoint → fail his own add.

## G. Contrarian
Rejects “brain dump into Claude for 5 minutes.” Field assumption: more prompt text = context. He wants an interview loop.

## H. Assumptions
Theirs: 90% on iter 1 is real. Ours: UNVERIFIED; Skool is operate-never; do not auto-write skills. Falsifier: checkpoint spam that never ends. Survivorship: packaging felt better.

## I. Questions
Pocock original vs Nate fork — which lines are load-bearing? Same as `session-bootstrap`? When does he stop a 30-Q grill?

## J. Connections
- SYSTEM SYNTHESIS → `session-bootstrap` (dump then short loops — grill is the dump) · `agent-job-card` · `ask-principal` (flags) · do not auto-write `SKILL.md`.

## K. Future-Use
Grill+checkpoint as an extraction machine for hive docs Evens names. Unassigned. Skool copy stays parked.

## Steal / Operate-never

### Machine: one-Q grill → checkpoint every answer → flag holes → re-grill
- **Epistemic:** SOURCE
- **Workflow / loop:** name the process → one Q → write the answer to a doc → next Q → flags to humans → stop on shared understanding
- **Questions / signals:** Can the repo answer this? Who is the real stakeholder? Are we dumping or grilling?
- **Qualify / frame / objections:** 5-minute dump is the fail. Endless grill through CUT is also a fail — demand a checkpoint file.
- **Procedure:** One process. No Skool. No auto SKILL.md. No client grill (parked).
- **Example that proves it:** Situation → packaging in his head. Action → grill + brainstorms/ log + update offer. Reasoning → context window + holes. Outcome → better skill/doc. Lesson → steal checkpoint; never the Skool.
- **Why it works:** Write-back beats memory; one Q beats a dump; flags keep fake certainty out.
- **Conditions / exceptions:** % UNVERIFIED. Clients parked.
- **Operate-never payload:** Nate Skool; auto-write SKILL.md; grill a parked client; quote 95% as FACT.
- **Hive run (existing skills only):** `session-bootstrap` · `agent-job-card` · `ask-principal`.
- **Source:** `c0kaKxM2pHg` @ UNKNOWN

### Operate-never
- Join Skool / install Claude as stack.
- Auto-write SKILL.md / unpark a client to grill.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as one-Q + checkpoint extraction (no Skool). Clients parked.
