# Creative Studio — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Proposal-deck short (incomplete vs the long). Beats: hop off a call → deliverable (minutes or proposal) used to be a big full-time job; two-part workflow: (1) log the meeting when it ends → Google Sheet (date, title, attendees, gist, ID, status); (2) slide creation — **human approval** whether a deck is needed; if yes, proposal generator → Gamma API → “ready to go… super professional.” Live: webhook given to Fireflies; wait; pull title/transcript; if exists; cleanup JSON for attendees; log row. Second flow on new row; pin as if row just added; limit to last item if two meetings end together (guardrail); get meeting info; cleanup code node for speakers + full transcript; speaker labels collapse so Nate isn’t repeated every sentence. Play-button magnet before Gamma actually renders on this short. Fireflies / Gamma on tape.

## B. Atomic Knowledge

### Approve whether a deck is needed
- **Claim:** Not every logged meeting gets a deck; a human gate sits between the sheet and Gamma.
- **Reasoning:** Minutes ≠ proposal; volume would spam decks.
- **Evidence:** “We will get human approval right here to see if we want to have a slide deck generated or not, cuz we don't always need that.”
- **Conditions:** A row just landed.
- **Exceptions:** Auto-Gamma every call is the fail.
- **Action:** Keep the gate; hive publish/send still HITL after Gamma.
- **Confidence:** SOURCE.
- **Source:** `-Q_P7HFydZk` @ 00:00
- **Epistemic:** SOURCE

### Speaker-collapsed transcript
- **Claim:** Cleanup must print a speaker once until the next person talks, or the transcript is unreadable.
- **Evidence:** “I wanted to make sure it was like speaker Nate Herk and then it didn't say Nate Herk again until the next person spoke… otherwise… speaker for every single sentence… not super clean.”
- **Conditions:** Multi-speaker Fireflies dump.
- **Exceptions:** Single-speaker recordings.
- **Action:** Collapse speaker labels before any deck writer.
- **Confidence:** SOURCE.
- **Source:** `-Q_P7HFydZk` @ 01:27
- **Epistemic:** SOURCE

## C. Mental Models
Two workflows, not one blob. Logging is cheap and always; decks are optional. Guardrail for simultaneous meetings. Code node is allowed when JSON is ugly. “Super professional” is his Gamma adjective — hive still taste-gates.

## D. Procedures
1. Fireflies end → webhook → attendees + gist → sheet.
2. New row → last-item guardrail → cleanup transcript (collapse speakers).
3. Human: deck or not.
4. If yes → generator → Gamma.
5. Human: send/publish.

Avoid: auto-deck; sending Gamma as-is; Fireflies/Gamma install as stack.

## E. Examples
**Situation:** Call just ended.  
**Action:** Log row; pin; collapse speakers; (magnet cuts before the slide).  
**Reasoning:** Clean transcript is the input.  
**Outcome:** Sheet row + cleaner transcript.  
**Lesson:** The walkthrough starts as a row + readable speakers, not a Gamma cover.

## F. Decision Rules
- If no human said “deck” → stop at the sheet.
- If speakers repeat every sentence → cleanup failed.
- If two meetings collide → keep the last-item guard.

## G. Contrarian
“INSTANTLY generate” title vs an approval node and a code-node cleanup.

## H. Assumptions
Gamma quality UNVERIFIED (not shown on this short). Fireflies webhook. Sister `KGXFkUlBHxw`.

## I. Questions
What does the Gamma deck look like? Visual sheet? Approval UI?

## J. Connections
- SYSTEM SYNTHESIS → `KGXFkUlBHxw` (full proposals).
- SYSTEM SYNTHESIS → brand-template-as-skill (18-corpus Swadia) vs Gamma grunt.
- SYSTEM SYNTHESIS → `ask-principal`.

## K. Future-Use
Speaker-collapse as a transcript hygiene for any deck. Unassigned.

## Steal / Operate-never

### Machine: log-always, deck-sometimes
- **Epistemic:** SOURCE
- **Workflow / loop:** call end → sheet row → collapse speakers → human “deck?” → optional Gamma → human send
- **Questions / signals:** Do we need slides? Last item only?
- **Qualify / frame / objections:** Instant is the magnet
- **Procedure:** Approval node stays
- **Example that proves it:** Fireflies → sheet → speaker-collapsed transcript
- **Why it works:** Logging is cheap; slides are taste
- **Conditions / exceptions:** Gamma is grunt; brand bible still wins for client-facing
- **Operate-never payload:** Auto-Gamma; auto-send; Fireflies/Gamma as hive stack
- **Hive run:** `cinematic-recipe` (bible before deck); `ask-principal`
- **Source:** `-Q_P7HFydZk` @ 00:00

### Operate-never
- Auto-generate/send decks. Install Gamma/Fireflies as stack.
- New hunt. Merge `LESSONS-FROM-TAPE.md`.
- Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: “INSTANTLY generate proposal decks” — do not operate instant. Plate is a **sheet row + collapsed speakers**, then a taste-gated deck. Gamma is not the bible. HITL. Clients parked.
