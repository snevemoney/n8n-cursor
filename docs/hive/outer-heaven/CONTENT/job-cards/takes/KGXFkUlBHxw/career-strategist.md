# Career Strategist — KGXFkUlBHxw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption ingest (~5064 words). Old take upgraded. Beats in order: (1) FT job used to mean hop off a call → minutes/proposal by hand (2) two n8n workflows: (a) Fireflies webhook → wait/poll until AI gist exists → clean attendees → Google Sheet log (b) on new row, **Slack yes/no** whether to generate a deck — not every meeting needs one (3) split for later routing (different meeting types) (4) webhook body is thin (id + event); second Fireflies fetch; wait because summary lags transcript (5) if yes: proposal agent (transcript → structured proposal) → Gamma API → email link to himself; human tweaks then **human sends** (6) example Green Grass / UpAI: ~350+ hours/year, 4-week cycle — model-invented numbers in the deck (7) manual meeting-ID path uses the same tail. Visual-only: n8n/Gamma — unobserved. Gap: no send-to-client in the demo.

## B. Atomic Knowledge

### Log everything; generate only on HITL yes
- **Claim:** Every ended call can hit a sheet. A slide deck is optional. Slack “would you like to generate a proposal?” is the gate. He sends the Gamma link to **himself**, tweaks, then a human sends.
- **Reasoning:** FT follow-up was the pain. Auto-deck on every call is waste and risk (wrong meeting type).
- **Mechanism:** Fireflies complete → poll gist → sheet → Slack approve → agent + Gamma.
- **Evidence:** “we will get human approval… because we don’t always need that”; “You can make your tweaks and then you send it off as a human.”
- **Conditions:** Fireflies in the call; Slack reachable.
- **Exceptions:** Manual ID inject if you skipped the webhook.
- **Action:** Steal the gate. Do not wire Fireflies/n8n/Gamma. Do not send a generated proposal.
- **Confidence:** high as a HITL pattern.
- **Source:** `KGXFkUlBHxw`
- **Epistemic:** SOURCE

### Split ingest from deliverable so you can route later
- **Claim:** Two workflows so “meeting ended” can grow paths (minutes vs proposal vs nothing) without baking Gamma into the logger.
- **Reasoning:** Scalability he learned in a FT ops job.
- **Mechanism:** Sheet as the join; status column (logged / generated).
- **Evidence:** “if I was to bake in this part… it would just be a little tougher to separate out later.”
- **Conditions:** You will have more than one post-call artifact.
- **Exceptions:** One-off is fine to keep together.
- **Action:** Same as hive: log vs publish are different steps.
- **Confidence:** high.
- **Source:** `KGXFkUlBHxw`
- **Epistemic:** SOURCE

### Poll for the summary; the deck will invent $ if you let it
- **Claim:** Fireflies “transcription complete” ≠ AI gist ready — wait + if. Gamma will happily write 350 hours and a 4-week plan from a transcript.
- **Reasoning:** Two AI layers (proposal agent + Gamma) compound fiction.
- **Mechanism:** Poll until gist exists; later a human reads the deck.
- **Evidence:** Green Grass “350 plus productivity hours” / four-week cycle on tape.
- **Conditions:** You treat those figures as draft, not FACT.
- **Exceptions:** None that make the deck’s math true.
- **Action:** Any number in a generated proposal is UNVERIFIED until Evens owns it.
- **Confidence:** high.
- **Source:** `KGXFkUlBHxw`
- **Epistemic:** SOURCE (lag) + UNVERIFIED (deck $)

## C. Mental Models
FT follow-up is a pipeline: capture → decide → draft → human send. Approval is a product feature. Webhook ≠ payload. Two AIs in a row will write a confident fiction. Sheet status is the memory.

## D. Procedures
His (do not run): Fireflies prod webhook → wait/poll → sheet → Slack yes/no → agent → Gamma → email self → tweak → send.  
Hive: after a real call, Comms drafts, Evens sends. No auto-deck.

Questions: Does this meeting need a deck? Is the gist actually there? Which numbers did the model invent?

Signals: Slack ask. Red: deck went to the client without a read.

## E. Examples
**Situation:** Green Grass discovery.  
**Action:** Slack yes → Gamma deck with hours and a 4-week plan.  
**Reasoning:** Agent “high-converting proposal.”  
**Outcome:** Looks tailored; numbers unearned.  
**Lesson:** Human send is the only honest step.

## F. Decision Rules
- If every meeting auto-gets a proposal, you skipped the gate.
- If the gist is missing, wait — do not generate on an empty summary.
- If the deck states hours or price, Evens must rewrite or delete.
- If n8n/Gamma is the path, stop — on-tape vendors.

## G. Contrarian
Rejects “automate the whole follow-up including send.” The tape still uses Slack approve + human send — keep that, drop the install.

## H. Assumptions
**Theirs:** Gamma is “super professional”; 350 hours is usable. **Ours:** Deck math UNVERIFIED. n8n/Fireflies/Gamma/Slack on-tape. Clients parked. Falsifier: a call that must not be stored in Fireflies (confidential).

## I. Questions
- How often did he click no?
- Did any invented-hour deck go out unedited?

## J. Connections
- SYSTEM SYNTHESIS → `Lg5TYWPSg6M` (their numbers, not the model’s).
- SYSTEM SYNTHESIS → `3XIGcM7VICc` (your name is on it).
- On-tape n8n. Stack Cursor + Grok.

## K. Future-Use
Unassigned: Slack-yes-before-artifact as a Comms rule. Not a Gamma integration.

## Steal / Operate-never

### Machine: log → ask → draft → human send
- **Epistemic:** SOURCE
- **Workflow / loop:** capture the call → decide if a deliverable is needed → generate behind a yes → human edits numbers → Evens sends
- **Questions / signals:** Need a deck? Gist ready? Who invented the 350 hours?
- **Qualify / frame / objections:** Not every meeting is a proposal.
- **Procedure:** Split log from publish. No n8n. No client send.
- **Example that proves it:** Slack gate (B); Green Grass hours (E).
- **Why it works:** FT pain was the write-up, not the judgment (B/C).
- **Conditions / exceptions:** Confidential calls may not be recorded.
- **Operate-never payload:** Wiring Fireflies to Gamma; sending the deck; quoting 350 hours as FACT; opening a proposal SKU.
- **Hive run (existing skills only):** `ask-principal` · `info-gain-cite`
- **Source:** `KGXFkUlBHxw`

### Operate-never
- Send the proposal. Install n8n/Gamma.
- Quote deck $ / hours as FACT.
- Unpark clients.
- Auto-write `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
Employment covers baseline — this *is* a FT follow-up tape. Steal HITL approve + human send + “gist lags transcript.” Do not steal n8n/Gamma or auto-proposals. Clients parked. Old steal-note upgraded to A–L.
