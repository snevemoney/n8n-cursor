# Day Planner — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short: auto proposal decks after a call. Beats: hop off a call → minutes/proposal used to be a full-time job; two-part workflow — (1) Fireflies webhook → wait → fetch title/transcript → if exists → clean attendees JSON → log Sheet (date, title, attendees, gist, ID, status); (2) new Sheet row → pull details → **human approval** whether to generate a deck (not always needed) → proposal agent → Gamma API → professional deck; pin the new-row; limit to last item if two meetings end together; second cleanup code node collapses speaker labels so Nate isn’t repeated every sentence. CTA to full (`KGXFkUlBHxw`). Timestamp UNKNOWN. Vendors: Fireflies, Gamma — on-tape.

## B. Atomic Knowledge
### Log the meeting, then ask before a deck
- **Claim:** Every ended call can be logged; a slide deck is optional and needs human approval.
- **Reasoning:** “We don’t always need that.”
- **Mechanism:** Fireflies webhook → Sheet row → approval node → maybe Gamma.
- **Evidence:** “get human approval… to see if we want to have a slide deck generated or not.”
- **Conditions:** A transcript exists (the if).
- **Exceptions:** No transcript → do not generate.
- **Action:** Steal log + approval. Send the deck = Evens. Gamma/Fireflies stay on-tape.
- **Confidence:** high.
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

### One-at-a-time + clean speaker turns
- **Claim:** Limit to the last item if two meetings collide; collapse speaker labels to turn-taking, not per sentence.
- **Reasoning:** Guardrail + readable transcript.
- **Mechanism:** Limit node; code node for speakers + full transcript.
- **Evidence:** “only keep the last item… speaker Nate Herk and then it didn’t say Nate Herk again until the next person spoke.”
- **Conditions:** Batch risk; messy ASR.
- **Exceptions:** A single clean transcript may not need the collapse.
- **Action:** Collision guard + readable turns are the steal.
- **Confidence:** high.
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Follow-up decks ate his full-time job; now they are a maybe. Priority: show log then approval then Gamma. He uses a code node when cleanup is “tricky” — allowed when necessary. Uncertainty: whether approval is in-app or email.

## D. Procedures
1. Meeting ends → log (date/title/attendees/gist/id/status).
2. If no transcript → stop.
3. Ask: do we need a deck? (HITL)
4. If yes, generate a draft. Send = Evens.
5. If two rows land → process one.
Avoid: Gamma/Fireflies install; auto-send the deck; skip approval.

## E. Examples
**Fireflies → Sheet → maybe Gamma:** Situation → call just ended. Action → webhook log; approval; optional Gamma. Reasoning → not every call needs slides. Outcome → row logged; deck only if yes. Lesson → steal approval; never auto-send.

**Speaker collapse:** Situation → ASR repeats the name every sentence. Action → code node groups turns. Reasoning → readable. Outcome → cleaner transcript. Lesson → cleanup is a named step.

## F. Decision Rules
- If approval is skipped → do not generate.
- If the next verb is send the deck → Evens.
- If two meetings collide → one item.

## G. Contrarian
Rejects “every call gets a deck.” Field assumption: automate the follow-up always. He inserts a human yes.

## H. Assumptions
Theirs: Fireflies + Gamma are good enough. Ours: vendors on-tape; send-never. Falsifier: approval always-yes in practice. Survivorship: one live run.

## I. Questions
Full `KGXFkUlBHxw`? Where does approval appear? Who sends the Gamma link?

## J. Connections
- SYSTEM SYNTHESIS → `KGXFkUlBHxw` · `ask-principal` · `send-removed` · `0Ujdys4LqNs` (pin).

## K. Future-Use
Approval-before-deck as a default after any call. Unassigned.

## Steal / Operate-never

### Machine: log call → HITL “need a deck?” → draft; send HITL
- **Epistemic:** SOURCE
- **Workflow / loop:** transcript in → Sheet row → ask generate? → if yes, draft deck → Evens sends
- **Questions / signals:** Is there a transcript? Do we need slides? Two meetings at once?
- **Qualify / frame / objections:** Auto-deck every call is the fail. Approval is the pass.
- **Procedure:** Log only today. No Gamma/Fireflies install. No send.
- **Example that proves it:** Situation → hop off a sales call. Action → Fireflies log + approval + optional Gamma. Reasoning → not always needed. Outcome → row + maybe deck. Lesson → steal the ask; never the send.
- **Why it works:** A yes/no keeps CUT from filling with unused decks.
- **Conditions / exceptions:** No transcript → stop. Clients parked.
- **Operate-never payload:** Gamma/Fireflies as SKUs; auto-send proposals; quote “super professional” as FACT.
- **Hive run (existing skills only):** `ask-principal` · `send-removed`.
- **Source:** `-Q_P7HFydZk` @ UNKNOWN

### Operate-never
- Auto-send a Gamma deck.
- Install Fireflies / Gamma / switch stack.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as approval-before-deck. Clients parked.
