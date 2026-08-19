# Product GTM — KGXFkUlBHxw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk. Title: “I Built an AI System That Automates My Proposals (n8n + Gamma).” Beats: (1) post-call deliverable (minutes/proposal) from his old full-time job; two workflows: **log the meeting** (date, title, attendees, gist, id, status in Sheets) then **deck** only after **human approval** (not every meeting needs a deck) → proposal agent → **Gamma** API; (2) split for scale/routing later (who the meeting was with); Fireflies webhook = transcription-complete, body is mostly **meeting id** — then fetch transcript; **wait + poll** because AI gist/action-items are not ready at first ping; if gist exists → continue, else wait-loop; code node to speakers (he pastes JSON into Claude to write the n8n code). Rest of tape = Gamma path. Timestamp UNKNOWN.

## B. Atomic Knowledge
### Approval before the deck — split log from generate
- **Claim:** The steal is already on `-Q_P7HFydZk`: do not auto-Gamma. Log every call; generate only on a yes. Poll until the summary exists.
- **Reasoning:** Fireflies “done” ≠ gist done. A deck on a call that did not need one is spam.
- **Mechanism:** Webhook id → wait → fetch → gist? → sheet → HITL → Gamma.
- **Evidence:** He names the split and the approval node on tape.
- **Conditions:** On-tape n8n + Fireflies + Gamma. Hive: no n8n/Gamma product; approval maps to `ask-principal`.
- **Exceptions:** Code-node-via-Claude is his habit — we do not add n8n.
- **Action:** Steal log/approve/then-deck. Do not productize Gamma.
- **Confidence:** high as machine.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Log ≠ generate. Webhook-done ≠ gist-done. Poll. Split for later routes. Approval node.

## D. Procedures
After a call: log. Ask Evens if a deck. Only then generate. No auto-send.

## E. Examples
**Situation:** Fireflies pings. **Action:** Immediate fetch. **Outcome:** No AI gist yet. **Lesson:** Wait-loop is the product.

## F. Decision Rules
- If no approval node → do not generate a client-facing deck.
- If webhook body is only an id → fetch, then poll.
- Refuse: n8n+Gamma SKU; Fireflies as our OS; auto-deck.

## G. Contrarian
Against “automate the proposal” as the title. The title hid the approval.

## H. Assumptions
Theirs: Fireflies+Gamma. Ours: HITL already. Falsifier: Evens names Path A (still MUST + no auto-Gamma).

## I. Questions
What the Gamma agent actually writes. Sibling `-Q_P7HFydZk`.

## J. Connections
**SYSTEM SYNTHESIS:** Approval before Gamma = `-Q_P7HFydZk`. Maps to `ask-principal`.

## K. Future-Use
Unassigned: “log, approve, then deck.” Keep.

## Steal / Operate-never

### Machine: log every call; deck only on a yes
- **Epistemic:** SOURCE
- **Workflow / loop:** meeting ends → wait for gist → log → ask → Gamma-or-not
- **Questions / signals:** Does this call need a deck?
- **Qualify / frame / objections:** “Automates my proposals” hid the approval.
- **Procedure:** No n8n/Gamma product. HITL.
- **Example that proves it:** Poll until gist; split workflows.
- **Why it works:** Not every call is a proposal; “transcribed” ≠ “summarized.”
- **Conditions / exceptions:** Vendor tape.
- **Operate-never payload:** n8n+Gamma; Fireflies OS; auto-deck
- **Hive run (existing skills only):** `ask-principal`
- **Source:** `KGXFkUlBHxw` @ UNKNOWN

### Operate-never
- Productize Gamma / n8n / Fireflies
- Auto-send a deck
- New hunt; merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Do not anneal Gamma. Clients parked.
