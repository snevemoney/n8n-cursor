# Forge — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Proposal-deck teaser (long `KGXFkUlBHxw`). Beats: hop off a call → need minutes/proposal (his old full-time job) → two-part system: (1) log meeting when it ends into a Google Sheet (date, title, attendees, gist, ID, status); (2) new row → pull details → **human approval** whether to generate a deck (not always needed) → if yes, proposal agent → Gamma API → professional slides. Live: Fireflies webhook → wait → title/transcript → if-exists → clean JSON attendees → log row. Second workflow on new row: re-fetch meeting, **limit to last item** (two meetings ending together), cleanup code node for full transcript with speaker runs collapsed (Nate once until the next speaker). Play-button. Timestamp UNKNOWN. Fireflies/Gamma on-tape.

## B. Atomic Knowledge

### Log ≠ generate; approval sits between
- **Claim:** Every ended call logs; a deck is optional and gated by a human.
- **Reasoning:** “We don’t always need that.”
- **Mechanism:** Sheet row → approve → Gamma.
- **Evidence:** Two-part diagram + approval node.
- **Conditions:** Fireflies webhook exists.
- **Exceptions:** He still automates the log.
- **Action:** Steal the gate. Do not auto-Gamma. Do not send the deck.
- **Confidence:** high.
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

### Last-item guard + speaker-run cleanup
- **Claim:** Process only the last meeting if two end together; collapse speaker labels so Nate isn’t repeated every sentence.
- **Reasoning:** Guardrail + readable transcript.
- **Mechanism:** Limit last item; code node groups speaker runs.
- **Evidence:** Second-workflow aside.
- **Conditions:** Sheet-triggered generate path.
- **Exceptions:** Teaser cuts before Gamma output.
- **Action:** Steal last-item + readable transcript. Code node only when necessary (he needed it here).
- **Confidence:** high.
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Follow-up is two machines. Logging is cheap and always-on. Slides cost money/taste and need a yes. Cleanup is for humans who will read.

## D. Procedures
1. Call ends → webhook → validate payload → log sheet. 2. New row → fetch → last-item guard → clean speakers → **ask human**. 3. If yes → generate. 4. Human sends.

## E. Examples
**Situation:** Fireflies call done.  
**Action:** Log row; second graph waits for approve.  
**Reasoning:** Not every call needs a deck.  
**Outcome:** Teaser stops at cleanup.  
**Lesson:** Approval is the product.

## F. Decision Rules
- If no human yes → no Gamma.
- If two rows land → last item only.
- If speaker labels spam every sentence → collapse runs.

## G. Contrarian
Field auto-sends a deck after every call. He asks first.

## H. Assumptions
Fireflies/Gamma work as shown. Falsifier: approve-yes with a wrong meeting ID.

## I. Questions
Long-tape send path? Who clicks approve?

## J. Connections
SYSTEM SYNTHESIS: `KGXFkUlBHxw` long. `ask-principal`. `slice-build` two systems (log vs generate). Clients parked.

## K. Future-Use
Approve-between-log-and-artifact on any post-call slice.

## Steal / Operate-never

### Machine: always-log → human yes → optional deck → human send
- **Epistemic:** SOURCE
- **Workflow / loop:** webhook → sheet → approve → generate → stop
- **Questions / signals:** Do we need a deck this time?
- **Qualify / frame / objections:** “Automatically” in the title is the hook; the node is HITL.
- **Procedure:** Last-item guard. No Fireflies/Gamma install for us.
- **Example that proves it:** Two-part graph; approval before Gamma.
- **Why it works:** Logs are cheap. Decks are taste + a send.
- **Conditions / exceptions:** Vendor APIs on-tape.
- **Operate-never payload:** Auto-Gamma; auto-email the deck; new hunt.
- **Hive run:** `ask-principal` + `slice-build` (log first).
- **Source:** `-Q_P7HFydZk` @ UNKNOWN

### Operate-never
- Auto-send proposals. Install Gamma/Fireflies.
- Quote “super professional” as FACT. New hunt.
- Send / pay / deploy / book / publish. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not auto-deck. If we log a call: sheet first, Evens yes, then maybe a draft. Deploy HITL.
