# Librarian — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** How I INSTANTLY Generate Proposal Decks with n8n AI Agents
**Channel:** Nate Herk | AI Automation
**Kind:** short (~3:00 / ~812 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Generate proposal decks automatically after a call (minutes or proposal — big part of his old full-time job).
2. Scenario: hop off a potential-client call; follow up with a slide deck.
3. Two parts: (A) log the meeting when it ends into a Google Sheet (date, title, attendees, gist, ID, status); (B) slide creation.
4. After a new sheet row: human approval whether to generate a deck (not always needed) → proposal generator → Gamma API → professional deck.
5. Part A: webhook given to Fireflies; on call-done → wait → pull title/transcript → IF exists → cleanup JSON attendees → log sheet.
6. Part B: new row triggers; he pins as if the row was just added; limit keep last item (two meetings ending together) as a guardrail.
7. Cleanup code node: speakers + full transcript; collapse so "Nate Herk" is not repeated every sentence — only on speaker change.
8. CTA: full breakdown (approval + Gamma not fully shown on this short).
Gap: approval UI, Gamma output. Timestamp UNKNOWN. Fireflies / Gamma / n8n / Sheets on-tape.

## B. Atomic Knowledge

### Log first, approve, then deck
- **Claim:** Meeting-end logs a sheet row; a second workflow may generate a Gamma deck only after human approval.
- **Reasoning:** "We don't always need" a deck.
- **Mechanism:** Fireflies webhook → sheet → new-row trigger → approve → Gamma.
- **Evidence:** "we get human approval right here to see if we want to have a slide deck generated or not, cuz we don't always need that."
- **Conditions:** Fireflies call exists
- **Exceptions:** Minutes vs proposal not branched on this short
- **Action:** File approve-before-Gamma; park Fireflies/Gamma
- **Confidence:** high as architecture
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

### Last-item guardrail + speaker-collapse
- **Claim:** Keep only the last meeting if two end together; collapse transcript so speaker name prints on change, not every sentence.
- **Reasoning:** Guardrail against double process; cleanliness of the transcript.
- **Evidence:** "only keep the last item" / "didn't say Nate Herk again until the next person spoke"
- **Action:** File both as ingest hygiene
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Two workflows, not one blob. Sheet is the handoff. Approval is a keep-gate. Code node is allowed when speaker-collapse needs it. Pin stands in for a new row while building.

## D. Procedures
1. Fireflies done → webhook → wait → pull → IF complete → cleanup attendees → sheet.
2. New row → (limit last) → pull transcript → speaker-collapse → HITL approve → Gamma.
Avoid: auto-send the deck. Signals: sheet columns; last-item limit; speaker-change collapse.

## E. Examples
**Fireflies → sheet:** Situation — call ends. Action — webhook, wait, IF, cleanup, log. Reasoning — log before deck. Outcome — row with title/attendees/gist/status/ID. Lesson — log+approve; Gamma is the parked payload.

## F. Decision Rules
- If no approval node → not this machine.
- If two meetings could collide → keep last (his guardrail).
- If speaker repeats every sentence → collapse failed.
- Refuse: Gamma/Fireflies as hive; auto-send decks.

## G. Contrarian
Against generating a deck for every call. Against one workflow that both logs and ships.

## H. Assumptions
Theirs: Gamma is "super professional" (unseen here). Ours: teaser of `KGXFkUlBHxw`. Code node used — hive prefers standard nodes except when collapse needs code (his reason). Falsifier: long tape auto-sends.

## I. Questions
What does approval look like? Deck quality? Same as `KGXFkUlBHxw`?

## J. Connections
SYSTEM SYNTHESIS → `KGXFkUlBHxw`; `send-removed`; `ask-principal`; 18-corpus Client Pack parked.

## K. Future-Use
Approve-before-artifact + speaker-collapse as atoms. Unassigned: hive proposals HITL.

## Steal / Operate-never

### Machine: log meeting → approve → then artifact
- **Epistemic:** SOURCE
- **Workflow / loop:** call-end → sheet row → new-row trigger → human yes/no → only then generate deck → checkable stop = approval recorded; deck not sent
- **Questions / signals:** Do we need a deck? Last item only? Speaker-collapsed?
- **Qualify / frame / objections:** Instant decks are the hook; approval is the keep
- **Procedure:** Fireflies webhook; last-item limit; speaker-change collapse
- **Example that proves it:** call-done → sheet row → pin/new-row → (approval promised)
- **Why it works:** not every meeting wants a deck; collision guard
- **Conditions / exceptions:** Gamma/Fireflies on-tape; approval not fully shown
- **Operate-never payload:** Gamma/Fireflies as hive; auto-send proposal
- **Hive run:** `ask-principal` · `send-removed`
- **Source:** `-Q_P7HFydZk` @ UNKNOWN

### Operate-never
- Gamma / Fireflies as hive. Auto-send decks. n8n-cloud.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File two-workflow handoff + approval + speaker-collapse. Do not stand up Gamma as a wiki SKU. Client Pack stays parked.
