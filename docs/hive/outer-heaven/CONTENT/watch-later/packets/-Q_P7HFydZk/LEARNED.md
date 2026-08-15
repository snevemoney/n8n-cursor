# LEARNED — -Q_P7HFydZk
Protocol: deep-video-learning
Status: filled
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Desks merged:** Researcher 2026-08-14. Librarian not yet. Keep later dissent as labeled rows. Do not flatten.
**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.
**Note:** Derived from Researcher A–K + Steal after a full `full.txt` walk. Other desks add labeled rows; do not overwrite dissent.

## A. Source Map
Proposal-deck short (Fireflies → sheet → HITL → Gamma). Beats: (1) After a call you owe minutes or a proposal — that was a big part of his full-time job; now automatable. (2) Scenario: hop off a potential-client call → follow up with a slide deck. (3) Two workflows: (A) meeting end → log Google Sheet (date, title, attendees, gist, ID, status); (B) new row → **human approval** whether to generate a deck (not always needed) → proposal agent → Gamma API → professional deck. (4) A: webhook given to Fireflies; wait; pull title/transcript; if exists; cleanup JSON attendees; log row. (5) B: new row trigger; he **pins** as if the row just arrived; get meeting info; **limit last item** (two meetings ending together); cleanup code node for speakers + full transcript; speaker labels collapse so “Nate Herk” is not repeated every sentence. (6) Play-button before Gamma actually fires on this clip. Timestamp UNKNOWN. Long: `KGXFkUlBHxw`. Fireflies / Gamma on-tape.

## B. Atomic Knowledge

### Log first, approve deck second
- **Claim:** Every ended meeting is logged; a deck is optional and gated.
- **Reasoning:** “We don’t always need that.”
- **Mechanism:** Fireflies webhook → sheet; sheet row → approval → Gamma.
- **Evidence:** Two-workflow split + approval node named.
- **Conditions:** Fireflies (or equivalent) emits an end event; a human will click.
- **Exceptions:** This short cuts before the Gamma output — do not invent the deck.
- **Action:** Steal log-all + approve-some. HITL is SOURCE here, not our add-on.
- **Confidence:** high for the split; deck quality unseen on this clip.
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

### Cleanup: attendees, then collapsed speaker transcript
- **Claim:** Fireflies JSON is dirty; one cleanup gets attendees; a trickier code node builds a readable transcript (speaker name only when the speaker changes).
- **Reasoning:** Per-sentence speaker tags look unclean and blow tokens (INFERENCE on tokens).
- **Mechanism:** If-exists → JSON cleanup → sheet; later code node speakers+transcript.
- **Evidence:** He calls the second code node “a little bit more tricky.”
- **Conditions:** Transcript has speaker turns.
- **Exceptions:** He still uses a code node — hive prefers standard nodes when possible, but the collapse rule is the steal.
- **Action:** Collapse speaker labels on change only.
- **Confidence:** high as his rule.
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

### Guardrail: only the last meeting
- **Claim:** If two meetings end together, process one (last item).
- **Reasoning:** “Something weird like that.”
- **Mechanism:** Limit last item after fetch.
- **Evidence:** Explicit guardrail.
- **Conditions:** Batch fetch from Fireflies/sheet.
- **Exceptions:** Last ≠ the one you care about (he accepts that risk).
- **Action:** When batching, name the collision rule.
- **Confidence:** high he added it.
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Follow-up artifacts are a job, not a vibe. Approval is productized. Pin-for-debug appears again (`0Ujdys4LqNs`). He is automating his old full-time pain.

## D. Procedures
1. On call end: pull title/transcript/attendees; abort if missing; log sheet.
2. On new row: optionally pin; fetch; if many, keep last; collapse speakers.
3. Human: generate deck or not.
4. If yes: proposal agent → Gamma (on-tape). Hive: stop at approve; no Gamma account.

## E. Examples
- **Situation:** Fireflies call ended. **Action:** Webhook → wait → if → cleanup → sheet row (title/attendees/gist/status/id). **Reasoning:** Log always. **Outcome:** Row visible. **Lesson:** Deck is a second machine. Implicit rule: missing Fireflies payload fails closed (the if).

## F. Decision Rules
- If meeting ended → log, do not auto-deck.
- If two ended → last-item rule (his); hive should *name* the rule even if we pick a different one.
- Refuse: Fireflies/Gamma as hive; auto-send the deck; quote “super professional” as FACT.

## G. Contrarian
The interesting node is approval + speaker-collapse, not “AI made slides.”

## H. Assumptions
Fireflies webhook is reliable. Gamma output is good (not shown here). Code node is justified.
**Desk dissent:** none yet. Long `KGXFkUlBHxw` may show the deck — do not flatten this clip into “deck proven.”

## I. Questions
- What does the approval UI look like?
- Gist: model-written or Fireflies summary?

## J. Connections
- **SYSTEM SYNTHESIS:** `KGXFkUlBHxw` long. `0Ujdys4LqNs` pin. `ask-principal` (approval is on-tape). `warm-draft-hitl`.

## K. Future-Use
Speaker-collapse + log-then-approve as unassigned meeting-follow-up notes.

## Stolen machines

### Machine: log-meeting-then-approve-deck
- **Epistemic:** SOURCE
- **Workflow / loop:** call end → validate payload → cleanup attendees → sheet log → new row → collision rule → collapse speakers → human approve → (optional) deck
- **Questions / signals:** Do we need a deck this time? Is the payload complete? Two meetings at once?
- **Qualify / frame / objections:** Auto-proposal after every call → he says no.
- **Procedure:** D.
- **Example that proves it:** Fireflies webhook → sheet columns; pin; last-item; speaker-collapse explained; Gamma not shown.
- **Why it works:** Log is cheap and always; slides are gated.
- **Conditions / exceptions:** Fireflies/Gamma on-tape. Clip ends before slides.
- **Operate-never payload:** Gamma/Fireflies install; auto-send deck; new ICP.
- **Hive run:** `ask-principal` · `warm-draft-hitl` · `golden-test-loop`
- **Source:** `-Q_P7HFydZk` @ UNKNOWN

**Operate-never**
- Auto-deck. Auto-send. New `icp_id`. Send / pay / deploy / book / publish.

## THINK / BEHAVE / TRICKS / USE
**Added:** 2026-08-14 last-mile. Caption-only. Visual/click UNKNOWN unless `watch.json`. Do not flatten this speaker into a hive personality.

### THINK
Decision order, what they ask before they build, what they ignore, how they choose tools, when they kill vs continue — see §C Mental Models and §F Decision Rules above. Desk that must think this way: see TAPE-WIRE-NOTES.

### BEHAVE
What they repeatedly check, skip, retry, and speech≠behavior — see §A / §E / speech≠behavior rows. Sequence-from-speech only. `multimodal-youtube-learning`: no invented clicks.

### TRICKS
Do / don’t and implicit shortcuts — see §D Procedures and Stolen machines. Shown system (files, loops, UI, offer, CTA) mapped to Cursor+Grok primitives on the named workflow. Caption-only = transcript-implied / unobserved.

### USE
Each trick lands as a desk **action** on Cursor + Grok Bot (not a quote). Operate-never on their vendors. Reproduce card: `job-cards/takes/_knowledge-use/{{slug}}.md`.
