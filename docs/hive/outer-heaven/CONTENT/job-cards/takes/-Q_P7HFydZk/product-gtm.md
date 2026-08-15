# Product GTM — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Near-short (title: “How I INSTANTLY Generate Proposal Decks with n8n AI Agents” 3:00). Beats: (1) hop off a call → need minutes or a proposal (big part of his old full-time job) — now automatable; live run of a follow-up slide deck; (2) two parts: (A) log the meeting when it ends to a Google Sheet (date, title, attendees, gist, ID, status); (B) on new row, **human approval** whether to generate a deck (not always needed) → proposal agent → Gamma API → professional deck; (3) webhook given to Fireflies; wait; pull title/transcript; if exists; clean JSON attendees; log sheet; (4) second workflow on new row; pin as if just added; re-fetch meeting; **limit to last item** if two meetings end together; cleanup code node: speakers + full transcript, speaker name only when the speaker *changes* (not every sentence); (5) play-button full. Timestamp UNKNOWN. Long: `KGXFkUlBHxw`. Clip ends mid-cleanup.

## B. Atomic Knowledge
### Approval gate before the pretty deck
- **Claim:** After the meeting is logged, a human decides whether a slide deck is needed; only then Gamma runs.
- **Reasoning:** Not every call needs a proposal; generate-always is waste and noise.
- **Mechanism:** Fireflies end → sheet row → approval node → Gamma.
- **Evidence:** “We don’t always need that.”
- **Conditions:** Fireflies + Gamma (on-tape).
- **Exceptions:** Logging always; generating optionally.
- **Action:** Steal log-always / generate-on-approve. Do not productize Gamma/Fireflies. Do not auto-send the deck.
- **Confidence:** high.
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

### Guardrails: exists-check, last-item, speaker-change transcript
- **Claim:** If-check that Fireflies fields exist; process only the last meeting if two end together; transcript cleaned so the speaker name prints on change, not every sentence.
- **Reasoning:** Dirty JSON and double-fires make a bad deck; ugly transcripts make a bad deck.
- **Mechanism:** Wait → get → if → clean → sheet; then limit 1 → clean speakers.
- **Evidence:** He explains both guardrails on camera.
- **Conditions:** Webhook storms / talkative transcripts.
- **Exceptions:** Code node is “a little trickier,” still not too hard.
- **Action:** Steal the three guardrails. Code node only when necessary (hive n8n rule) — he needed it for speaker-change.
- **Confidence:** high.
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
The job is the follow-up artifact after a call, not “AI decks.” Instantly is the title; approval is the system. Logging is cheap; generation is the spend. Clean speakers are taste.

## D. Procedures
1. Meeting ends → log sheet (date, title, attendees, gist, id, status).
2. Human: generate deck? yes/no.
3. If yes: cleaned transcript (speaker-on-change) → proposal agent → deck tool.
4. Guard: fields exist; only last concurrent meeting.
- Avoid: auto-Gamma every call; auto-email the deck to the prospect.

## E. Examples
**Situation:** Just hopped off a potential-client call. **Action:** Fireflies webhook logs the row; approval; (clip ends before Gamma output). **Reasoning:** Follow-up deck. **Outcome:** Sheet row shown; deck promised. **Lesson:** Approval is the product. Implicit rule: two simultaneous ends would duplicate without limit-1.

## F. Decision Rules
- If every call auto-gets a deck → he would say no.
- If two meetings end together → keep the last only (his guard).
- Refuse: Gamma/Fireflies SKU; Client Pack fork (related but parked).

## G. Contrarian
Against generating a proposal for every logged call. Against dumping speaker-name-on-every-line into the model.

## H. Assumptions
Theirs: Fireflies gist is good enough to log; Gamma = professional. Ours: Client Pack tape said he would not sell that V1; this is the same family. Falsifier: approved deck that ignores the transcript.

## I. Questions
What does the approval UI look like? What is in the Gamma deck? Long `KGXFkUlBHxw`.

## J. Connections
**SYSTEM SYNTHESIS:** Long `KGXFkUlBHxw`. Client Pack in 18-tape (`IVx8OSMbTss`): waitlist + walkthrough, do not fork this week. Maps to `ask-principal` + `warm-draft-hitl` (approve generate ≠ approve send).

## K. Future-Use
Unassigned: speaker-on-change as a transcript hygiene rule. Keep.

## Steal / Operate-never

### Machine: always-log the call → HITL “need a deck?” → then generate
- **Epistemic:** SOURCE
- **Workflow / loop:** call ends → write sheet row → human yes/no → if yes, clean transcript → generate deck → human sends
- **Questions / signals:** Do we need a deck this time? Did two meetings collide? Is the speaker log clean?
- **Qualify / frame / objections:** “Instantly” without approval is spam
- **Procedure:** Approve generate ≠ approve send. Do not install Gamma/Fireflies
- **Example that proves it:** Fireflies → sheet → approval node he insists on → Gamma
- **Why it works:** Not every call is a proposal; guardrails keep one row / one clean transcript
- **Conditions / exceptions:** Clip ends before the deck. Vendor APIs
- **Operate-never payload:** Auto-proposal SKU; Gamma; Fireflies; fork Client Pack
- **Hive run (existing skills only):** `ask-principal` · `warm-draft-hitl`
- **Source:** `-Q_P7HFydZk` @ UNKNOWN

### Operate-never
- Auto-generate or auto-send decks
- Productize Gamma/Fireflies; fork Client Pack this week
- New hunt; switch stack; merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Approval-before-pretty is GTM. Path C does not email a generated deck to a stranger. Four-blank still required on a named client before a proposal is a SKU. Clients parked.
