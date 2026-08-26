# Career Strategist — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (3:00, 812 words). Caption ingest; timestamps from json3. Beats in order: (1) how he generates proposal decks after a client call (2) aside: meeting minutes / proposals were a big part of the job when he was still working full-time (3) pretend hop-off-call → follow-up slide deck (4) live run promised (5) two-part workflow: log the meeting when it ends (6) Google Sheet: date, title, attendees, gist, ID, status (7) second part: slide-deck creation (8) human approval gate — “we don’t always need that” (9) if yes → proposal generator → API to Gamma → ready deck (10) webhook given to Fireflies (11) wait → pull title/transcript → if-exists → clean JSON → log sheet (12) new-row trigger → limit to last item as guardrail (13) cleanup code node: speakers + full transcript, speaker name only on turn change (14) CTA: click play for full breakdown. Visual/click: UNKNOWN (caption-only). Gap: short cuts before the Gamma call is shown succeeding; no send of the deck.

## B. Atomic Knowledge

### Full-time leftover is the follow-up artifact
- **Claim:** Meeting minutes and proposals were a big part of his job when he was still working full-time; that follow-up can be automated now.
- **Reasoning:** The career pain is not “build an agent.” It is the post-call deliverable that used to eat FT hours.
- **Mechanism:** Call ends → log → optional deck.
- **Evidence:** “which is actually a big part of my job when I was still working full-time. All of that can be automated now.” @ 0:10
- **Conditions:** You hop off a call that needs a written follow-up.
- **Exceptions:** Calls that need no artifact.
- **Action:** Name the leftover FT artifact before naming a tool.
- **Confidence:** high for his story; not a quit-job proof.
- **Source:** `-Q_P7HFydZk` @ 0:10
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none

### Human approval before the deck exists
- **Claim:** After the meeting is logged, a human decides whether a slide deck should be generated — “we don’t always need that.”
- **Reasoning:** Not every logged meeting deserves a proposal. The gate is the product.
- **Mechanism:** New sheet row → pull details → approval node → only then Gamma.
- **Evidence:** “We will get human approval right here to see if we want to have a slide deck generated or not, cuz we don’t always need that.” @ 0:49–0:52
- **Conditions:** You have a logged meeting and a reason to propose.
- **Exceptions:** Always-on deck generation is what he refuses.
- **Action:** Put HITL before artifact generation, not after send.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ 0:49
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** approval node spoken, not seen
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none

### Log first, generate second; one-item guardrail
- **Claim:** Workflow is two systems: Fireflies webhook logs the meeting; a second workflow fires on new sheet row, keeps only the last item, then (if approved) calls Gamma.
- **Reasoning:** Simultaneous endings could double-process. Limit is a guardrail.
- **Mechanism:** Webhook → wait → Fireflies info → if exists → clean attendees → sheet. New row → last-item limit → cleanup transcript → agent → Gamma API.
- **Evidence:** “only keep the last item because on the off chance where maybe you have two meetings end at the same time” @ UNKNOWN (after 1:14 Fireflies beat)
- **Conditions:** Meeting recorder posts a webhook; sheet is the queue.
- **Exceptions:** Visual success of Gamma not on this short.
- **Action:** Separate log from generate. Cap concurrency.
- **Confidence:** medium — live run claimed, pixels UNKNOWN
- **Source:** `-Q_P7HFydZk` @ 1:14
- **Epistemic:** SOURCE
- **Knowledge type:** declared + transcript-implied demo
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** “live run” spoken; success not captioned

## C. Mental Models
The valuable job is the post-call artifact, not the agent label. Full-time taught him which leftover to automate. Human taste decides whether a proposal is even warranted. Deterministic log + optional generate beats always-on theater. Clean speaker turns matter because the deck is for a human. Vendors (Fireflies, Gamma, Google Sheet) are on-tape pipes, not the career.

## D. Procedures
1. Hop off a call that might need a follow-up.
2. Meeting recorder webhook fires.
3. Wait, pull title/transcript, check they exist.
4. Clean attendees JSON; log date/title/attendees/gist/ID/status to a sheet.
5. New-row trigger. Keep only the last item.
6. Pull full meeting info. Clean transcript so a speaker name appears only on turn change.
7. Human approval: generate a deck or not.
8. If yes, proposal generator → Gamma API → ready deck.
9. Stop. He does not describe sending the deck.

Questions: Do we need a deck at all? Did the webhook payload exist? Qualify: logged meeting + human yes. Signals: new sheet row, approval node.

## E. Examples
**Situation:** Just hopped off a potential-client call; used to write minutes/proposals by hand in FT.  
**Action:** Log via Fireflies webhook; wait for human yes; only then generate a Gamma deck.  
**Reasoning:** Not every meeting needs a proposal; simultaneous ends need a last-item cap.  
**Outcome:** He claims a professional ready deck; send and client yes are not on this short.  
**Lesson:** Automate the leftover FT artifact; keep HITL before the artifact exists. Implicit rule: log ≠ generate ≠ send.

## F. Decision Rules
- IF the leftover is a post-call write-up → automate log + optional deck, not “an agent.”
- IF the meeting does not need a proposal → stop at the approval node.
- IF two meetings could end together → keep only the last item.
- IF speaker labels repeat every sentence → rewrite transcript before the generator sees it.
- Do not treat Gamma / Fireflies as the receipt.

## G. Contrarian
Rejects “every logged call becomes a proposal.” The field assumes more output is more professional. He puts a human no in the middle.

## H. Assumptions
**Theirs:** Fireflies + sheet + Gamma is a durable post-call machine; “ready to go” equals usable with a client. Survivorship: one short, no failed deck shown. **Ours:** Caption-only — clicks UNKNOWN. Tape vendors stay on-tape. Falsifier: approval skipped in real use, or deck sent without HITL. Speech≠behavior: live run promised; success not captioned.

## I. Questions
- Did he send the deck, and did a client pay? Not on this short.
- What does “gist” contain, and who writes it?
- How often does he click no at the approval node?

## J. Connections
- SYSTEM SYNTHESIS → `KGXFkUlBHxw` (longer n8n + Gamma proposal system).
- SYSTEM SYNTHESIS → `5IM27lbCwjM` (scope-on-call then artifact; this tape is the follow-up machine).
- SYSTEM SYNTHESIS → `ask-principal` / `send-removed` (deck generate ≠ send).

## K. Future-Use
Unassigned: “FT leftover → log → HITL → optional artifact” as a career receipt pattern when Evens names a post-call write-up he still does by hand. Not a hunt. Not a Gamma install.

## Steal / Operate-never

### Machine: post-call log → HITL → optional proposal
- **Epistemic:** SOURCE (path) + SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** call ends → webhook log to sheet → new row → last-item guardrail → human yes/no → only then generate deck → stop (no send)
- **Questions / signals:** “Do we need a deck?” New sheet row is the signal. Empty Fireflies payload → do not log.
- **Qualify / frame / objections:** Fit = a call that might need a written follow-up. Frame is leftover FT work, not “AI agent.”
- **Procedure:** Separate log from generate. Clean speaker turns. HITL before Gamma. Do not auto-send.
- **Example that proves it:** FT minutes/proposals → two-part workflow → approval because “we don’t always need that” (E).
- **Why it works:** The career pain is the leftover artifact; the gate protects taste and cost (B/C).
- **Conditions / exceptions:** Needs a meeting recorder and a human who will click no. Visual Gamma success unobserved on this short.
- **Operate-never payload:** Auto-generating every meeting; sending the deck; installing Fireflies/Gamma; quoting “instantly” as FACT; new proposal SKU / `icp_id`.
- **Hive run (existing skills only):** `ask-principal` on generate-and-send · `send-removed` · `slice-build` if Evens names the leftover · `info-gain-cite` for an honest receipt of the log, not the vendor
- **Source:** `-Q_P7HFydZk` @ 0:10–0:59

### Operate-never
- Quote tape $ / “instantly” / student counts as FACT.
- Send the proposal, email, or calendar book without HITL.
- Install Fireflies / Gamma / n8n-cloud. Cursor + Grok only.
- Unpark Normand / new hunt ICP. Clients parked.
- Treat a logged meeting as a client yes.
- Auto-write `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
Employment still covers baseline. The career receipt is “I named the leftover FT follow-up and put a human no before the artifact,” not “I generate decks with Gamma.” Gym the approval question (do we need a deck?) before Evens ever sends a real follow-up. Description of Fireflies/Gamma stays on-tape. Do not treat this short as a reason to leave the day-job floor or open a proposal SKU.
