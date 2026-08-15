# Big Boss — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Short (PACKET: 3:00, 812 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (json3 present; no VTT in the take). Visual-only gaps: the two n8n canvases, the Google Sheet, the Fireflies payload, the approval node, and any Gamma deck are described, not seen. The short **cuts before** the proposal generator / Gamma call is executed on camera.

Beats, in order:

1. Hook: “generate proposal decks for my clients automatically.”
2. Frame: you just hopped off a call; you owe minutes or a proposal. He says that was “a big part of my job when I was still working full-time.”
3. Scenario: potential client call → follow up with a slide deck.
4. Live-run promise: two-part workflow.
5. **Part 1 — log:** meeting ends → Google Sheet row (date, title, attendees, gist, ID, status).
6. **Part 2 — deck:** new row → pull details → **human approval** (“we don’t always need that”) → proposal generator agent → API to **Gamma** → “ready to go” deck.
7. Part 1 trigger: webhook given to **Fireflies**.
8. Demo run: wait → pull title/transcript → **if** the stuff exists → code node cleans Fireflies JSON (attendees) → log the sheet. Row pops.
9. Part 2 trigger: new row on that sheet. He **pins** data “as if we just added this row.”
10. Guardrail: after re-fetch, **limit to the last item** in case two meetings end at once.
11. Second cleanup: code node now keeps speakers **and** the full transcript; collapse so “Nate Herk” is not stamped on every sentence.
12. CTA: play button to “the full breakdown.” Short ends on the cleanup, not on a finished deck.

Off-topic / not skipped: Fireflies as the recorder; Gamma as the deck vendor; code-node pride; “pin this data”; full-time-job aside.

## B. Atomic Knowledge

### Two workflows, two jobs
- **Claim:** Logging the meeting and generating the deck are separate machines.
- **Reasoning:** Every call gets a row. Not every call gets a deck.
- **Mechanism:** Workflow A (Fireflies webhook → sheet). Workflow B (new row → approve → Gamma).
- **Evidence:** “this workflow has two parts… we don’t always need that.”
- **Conditions:** Works when the sheet is the shared handle between jobs.
- **Exceptions:** If you merge log+deck into one firehose, the approval gate is easier to skip (not shown; INFERENCE).
- **Action:** One job per workflow. Do not auto-deck every transcript.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN — “two parts” / “human approval… we don’t always need that”
- **Epistemic:** SOURCE

### Human approval sits between log and artifact
- **Claim:** After the row exists, a human decides whether a deck is generated.
- **Reasoning:** Not every meeting deserves slides. Approval is the pick gate.
- **Mechanism:** Approval node on workflow B, before the proposal agent.
- **Evidence:** Spoken before the Gamma mention.
- **Conditions:** Someone is at the node. Unattended approval is not shown.
- **Exceptions:** He does not show a “no” path.
- **Action:** Definition of done includes a yes/no. Auto-Gamma is operate-never.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN — “human approval right here”
- **Epistemic:** SOURCE

### Meeting-end is the trigger, not a calendar guess
- **Claim:** Fireflies finishing a call hits the n8n webhook.
- **Reasoning:** The artifact should start when the conversation exists, not when someone remembers.
- **Mechanism:** Fireflies → webhook → wait → fetch title/transcript.
- **Evidence:** “whenever a Fireflies call is done, it’s going to trigger this end web hook.”
- **Conditions:** Recorder actually finishes and the webhook is reachable.
- **Exceptions:** Native form is not used here (unlike `-Lo_SlSgtnA`). No Fireflies-down path.
- **Action:** Steal “call ended → log.” Do not install Fireflies as hive OS.
- **Confidence:** high for the shape; low for reliability (not tested on tape)
- **Source:** `-Q_P7HFydZk` @ UNKNOWN — “webhook is given to Fireflies”
- **Epistemic:** SOURCE

### Existence check before you write the row
- **Claim:** An **if** confirms title/transcript/etc. exist before cleanup and log.
- **Reasoning:** Empty Fireflies payloads should not create ghost rows.
- **Mechanism:** If-node, then JSON cleanup, then sheet.
- **Evidence:** “if to see if all of that stuff exists, and I’ll explain that in a sec” — explanation is on the long, not this short.
- **Conditions:** Useful when the recorder can fire with missing fields.
- **Exceptions:** The “why” is deferred. We do not have his exact predicates.
- **Action:** Checkable stop: payload complete **before** the sheet write.
- **Confidence:** medium (check exists; rules not given)
- **Source:** `-Q_P7HFydZk` @ UNKNOWN — “if to see if all of that stuff exists”
- **Epistemic:** SOURCE

### One-item guardrail when two meetings collide
- **Claim:** Workflow B keeps only the last item so two simultaneous ends do not double-process.
- **Reasoning:** “Off chance… two meetings end at the same time.”
- **Mechanism:** Limit node after re-fetch.
- **Evidence:** He names the race and the limit.
- **Conditions:** Helps a single-operator sheet. Fails if the “last” item is the wrong meeting (not discussed).
- **Exceptions:** No lock, no meeting-ID match shown on this short — only “last item.”
- **Action:** Steal the race-condition thought. Prefer ID match over “last” when we wire (SYSTEM SYNTHESIS).
- **Confidence:** high that he added it; medium that “last” is correct
- **Source:** `-Q_P7HFydZk` @ UNKNOWN — “only keep the last item”
- **Epistemic:** SOURCE

### Transcript cleanup is the ugly step he bothers to name
- **Claim:** The hard code is speaker-collapse: one name until the next person speaks, plus full transcript.
- **Reasoning:** Per-sentence speaker stamps look dirty and waste context.
- **Mechanism:** Second code node (speakers + transcript), “trickier” than the attendees-only first node.
- **Evidence:** He spends more words here than on Gamma.
- **Conditions:** Multi-speaker calls. Single-speaker calls need less.
- **Exceptions:** He says it is “still not too difficult.” Quality of collapse is **UNVERIFIED**.
- **Action:** Named cleanup before any generator. Do not dump raw Fireflies JSON into a decker.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN — “didn’t say Nate Herk again until the next person spoke”
- **Epistemic:** SOURCE

### Gamma is the deck vendor, not the machine
- **Claim:** After approval, an agent “shoots off an API call to Gamma.”
- **Reasoning:** He wants a professional slide artifact without building slides by hand.
- **Mechanism:** Proposal generator agent → Gamma API.
- **Evidence:** Spoken in the architecture pass. **Not executed** before the CTA.
- **Conditions:** Approval = yes. API up. Taste of Gamma is **UNVERIFIED**.
- **Exceptions:** Short never shows the deck.
- **Action:** Steal “approved transcript → one artifact.” Gamma stays on tape.
- **Confidence:** high that he named it; low that the deck is good
- **Source:** `-Q_P7HFydZk` @ UNKNOWN — “API call to Gamma”
- **Epistemic:** SOURCE

### Short is a magnet; the live run is incomplete
- **Claim:** He promises a live run of “this system,” then cuts after cleanup.
- **Reasoning:** Architecture + partial execute + missing deck = click the long.
- **Mechanism:** Play-button CTA.
- **Evidence:** Last lines; no Gamma success on this transcript.
- **Conditions:** Works if a long exists.
- **Exceptions:** Viewer who wanted the deck recipe leaves empty.
- **Action:** Do not treat the short as a Gamma build spec.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN — “watch the full breakdown”
- **Epistemic:** SOURCE

## C. Mental Models

- **Log everything, generate some.** The sheet is cheap; the deck is not. **SOURCE**
- **Approval is how you keep the second machine optional.** **SOURCE**
- **Recorder-end is a better trigger than memory.** **SOURCE**
- **Ugly JSON is a first-class job.** He will write a trickier code node so the generator sees clean speakers. **SOURCE**
- **Race conditions are worth one node even on a short.** **SOURCE**
- **“Automatically” still has a human yes.** The title lies a little. **INFERENCE**

## D. Procedures

1. **Call ends** in the recorder (Fireflies on tape).
2. **Webhook** fires. Wait / fetch title + transcript.
3. **If missing fields → stop.** Do not write a ghost row.
4. **Cleanup 1:** attendees (and gist) into a sheet row: date, title, attendees, gist, ID, status.
5. **Checkable stop:** open the sheet; confirm the row.
6. **New-row trigger** starts workflow B. Re-fetch. **Limit / ID-match** so two ends do not collide.
7. **Cleanup 2:** full transcript with collapsed speaker labels.
8. **Human approval:** generate deck? If no, stop.
9. **If yes:** one generator → one slide artifact (Gamma on tape; hive = `folder-to-deck` / `client-delivery-kit`).
10. **Human ships** the deck (HITL). Short does not show send.

**Qualify / frame:** Post-call content ops for his clients. Not a Path A plumber SKU.
**Objections:** “Automatic decks” — answer with the approval node and the missing Gamma execute.
**Avoid:** Fireflies / Gamma / n8n as hive stack. Auto-send the deck. Pin-data as production.
**When to change:** If the meeting was internal and needs minutes, not a proposal — that is a different artifact (he names both, builds one).

## E. Examples

**Situation:** Fireflies call finishes.  
**Action:** Webhook → existence if → attendee cleanup → sheet row.  
**Reasoning:** Every meeting deserves a log; the log is the handle.  
**Outcome:** Title, attendees, gist, ID, status visible.  
**Lesson:** Log first. Implicit rule: no row, no deck.

**Situation:** New row appears; maybe two meetings ended.  
**Action:** Re-fetch; keep last item; cleanup speakers + transcript.  
**Reasoning:** Double-process is worse than dropping a race (his trade).  
**Outcome:** One transcript prepared.  
**Lesson:** Name the collision. Implicit rule: “last item” is a guardrail, not a law.

**Situation:** Not every call needs slides.  
**Action:** Approval node before Gamma.  
**Reasoning:** Deck cost / noise.  
**Outcome:** Architecture says human yes; short never shows the yes or the deck.  
**Lesson:** Approval is the machine. Implicit rule: title “automatically” still stops for a person.

## F. Decision Rules

- If the recorder payload is incomplete → do not log.
- If two rows could collide → do not process the batch blindly.
- If the meeting does not need a deck → approve no.
- If the transcript is raw per-sentence stamps → clean before generate.
- If the short is a magnet → do not build Gamma from the short.
- Optimize: time from call-end to a **decided** artifact (yes deck / no deck).
- Refuse: auto-deck, auto-send, Fireflies/Gamma as hive OS.

## G. Contrarian

- Against “one workflow that does it all”: he splits log and generate.
- Against “AI should decide to send slides”: human approval.
- Against “the generator is the hard part”: he talks longer about speaker-collapse.
- Field assumes the short includes the deck. He withholds it.

## H. Assumptions

**His:** Fireflies + sheet + Gamma is the right OS; last-item is enough; a Gamma deck is “super professional”; the long will finish the live run.

**Ours:** Captions complete enough (812 words). Sheet/deck quality **UNVERIFIED**. Domain-specific: agency follow-up, not a book-flow. Pin-data is a demo lie.

**Falsifiers:** Fireflies webhook misses. Last-item grabs the wrong meeting. Gamma decks look generic and hurt the close. Approval is always-on in production.

**Disagreement (keep labeled):** Hive will not operate Fireflies→Gamma. The **log → approve → one artifact** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What are the exact “exists” predicates? (Deferred to the long.)
- Does he match on meeting ID anywhere, or only “last item”?
- Who clicks approval, and on what SLA?
- Minutes vs proposal: same generator or two?
- Gamma cost / taste — not on tape. $ **UNVERIFIED**.
- Sibling long id — PACKET does not bind one. Do not invent.

## J. Connections

- **SYSTEM SYNTHESIS** → `folder-to-deck` / `client-delivery-kit`: notes/transcript → one deck for *their* clients. Analog, not a Gamma install.
- **SYSTEM SYNTHESIS** → `ask-principal`: ship/send the deck stays HITL.
- **SYSTEM SYNTHESIS** → `slice-build`: two small systems, not one blob.
- **SYSTEM SYNTHESIS** → `golden-test-loop`: existence if + last-item are cheap checks.
- **SYSTEM SYNTHESIS** → `-Lo_SlSgtnA`: both are “thicken the record before the human acts.” That short uses a phone; this one uses a deck gate.
- Do not force a Path A client out of a Gamma prop.

## K. Future-Use

- Speaker-collapse as a standard transcript hygiene step (unassigned; Researcher/Librarian).
- Approval-before-artifact as a default for Publishing Engine (learn; no publish).
- Meeting-ID match vs last-item as a Forge test (unassigned).
- Minutes vs proposal as two artifact types on one log (unassigned).

## Steal / Operate-never

### Machine: Call-end log → human approve → one deck
- **Epistemic:** SOURCE (architecture) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (recorder finished) → fetch transcript → existence check → clean attendees → sheet row (checkable stop) → new-row job → de-dupe/limit → clean speakers + transcript → **human yes/no** → if yes, one generator → one slide artifact → human ships (HITL).
- **Questions / signals:** “Did the payload exist?” “Is this the right meeting?” “Do we need a deck?” “Is the transcript readable?”
- **Qualify / frame / objections:** Post-call agency ops. “Automatically” still has a yes. Objection: we will forget to follow up — answer with the log, not auto-Gamma.
- **Procedure:** D steps 1–10. Checkable stops: (1) complete payload, (2) visible sheet row, (3) human approval, (4) artifact reviewed, (5) send still human.
- **Example that proves it:** Fireflies end → row with gist/ID → he insists on approval because “we don’t always need” a deck → Gamma named, not shown. Lesson: optional second machine; first machine is the log.
- **Why it works:** A row is a handle. Taste/need is a pick. Cleanup is cheaper than a dirty generator. Conditions: recorder + a human at the gate. Exceptions: last-item race; deck never shown; short is a magnet.
- **Conditions / exceptions:** Cursor + Grok only (Fireflies / Gamma / n8n stay on tape). Clients parked. No auto-send.
- **Operate-never payload:** Auto-deck every call; Gamma as hive SKU; pin-data as production; install his stack.
- **Hive run (existing skills only):** `folder-to-deck` · `client-delivery-kit` · `ask-principal` · `slice-build` · `golden-test-loop` · `channel-walk` (short → long).
- **Source:** `-Q_P7HFydZk` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-generate / auto-send decks · Gamma / Fireflies / n8n as hive OS
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- Quote any implied $ as FACT
- New `icp_id` / unpark Normand / “proposal mill” hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not let every transcript become a slide novel.

- **Done** on a post-call slice: row logged + Evens says yes/no + one artifact if yes. A Gamma API ping is not done.
- **Delegate without being asked:** Day Planner protects the approval click. Creative / Publishing package the deck; they do not ship. Watchdog opens the sheet row. Forge treats missing existence-checks as a fail.
- **Skeptical review:** “Instantly generate” is the short’s job. I will not approve an always-on decker because he pinned a row and praised a code node.
- **One system this take:** log-then-approve. Not a Fireflies army.
- Live hunt stays parked. I do not rotate to “proposal decks as a SKU” because a magnet slapped.
