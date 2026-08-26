# Publishing Engine — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** How I INSTANTLY Generate Proposal Decks with n8n AI Agents
**Channel:** Nate Herk | AI Automation

## A. Source Map
1. After a call you owe minutes or a proposal — a big part of his old full-time job. That can be automated.
2. Scenario: hop off a potential-client call, follow up with a slide-deck proposal. Live run.
3. Two parts: (1) log the meeting when it ends into a Google sheet — date, title, attendees, gist, ID, status.
4. (2) Slide creation: new row → pull details → human approval whether to generate a deck (not always needed) → proposal generator → Gamma API → professional deck.
5. Part 1: webhook given to Fireflies; on call-done, wait, pull title/transcript, if-exists, clean JSON for attendees, log the sheet.
6. Part 2: new-row trigger; pin as if just added; fetch meeting info; limit to last item if two meetings end together (guardrail); cleanup code node for speakers + full transcript — speaker name only when the speaker changes, not every sentence.
7. CTA: full breakdown. Fireflies/Gamma on tape. Send deck = HITL.
Timestamp UNKNOWN (no VTT unless noted). Tape $ / student counts / job-loss % = UNVERIFIED.

## B. Atomic Knowledge

### Log, then ask, then deck
- **Claim:** The deck is optional. The log is not. A human approves whether Gamma runs.
- **Reasoning:** Not every meeting needs a proposal. Always logging lets you choose.
- **Mechanism:** Fireflies webhook → sheet row → human yes/no → Gamma deck.
- **Evidence:** We get human approval right here to see if we want to have a slide deck generated or not, cuz we don't always need that.
- **Conditions:** A transcript exists. A human is reachable.
- **Exceptions:** Auto-Gamma every call is the anti-pattern.
- **Action:** Package: logged gist + approve chip + deck preview. Do not send. Do not install Gamma.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

### Speaker-change transcript, last-item guardrail
- **Claim:** Cleanup reprints the speaker name only when the speaker changes; a last-item limit avoids double-process if two meetings end together.
- **Reasoning:** A transcript that labels every sentence is unreadable. Two simultaneous ends would double-bill Gamma.
- **Mechanism:** If-exists → clean attendees → log; later clean full transcript with speaker-change; limit last item.
- **Evidence:** I wanted to make sure it was like speaker Nate Herk and then it didn't say Nate Herk again until the next person spoke.
- **Conditions:** Multi-speaker call. Possible overlapping ends.
- **Exceptions:** A one-speaker voicemail does not need the change logic.
- **Action:** If we package a transcript, use speaker-change. Guardrail before a paid render.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
- Two workflows, not one god-graph.
- Approval is the product boundary.
- Code node is allowed when the cleanup is the job.

## D. Procedures
- Log every call. Ask before a deck. Limit to one row. Clean speakers. Do not send the Gamma link.

## E. Examples
- Situation: Call ends. Action: Fireflies → sheet; human approve; Gamma. Reasoning: Not every call needs a deck. Outcome: Logged row + optional deck. Lesson: Approve-before-render; send is Evens.

## F. Decision Rules
- If Gamma runs without approve → never.
- If we send the deck → never.
- Do not quote Gamma as hive stack.

## G. Contrarian
- Field would auto-deck every call. He inserts a human chip because 'we don't always need that.'

## H. Assumptions
- Theirs: Fireflies+Gamma is the stack. On-tape.
- Ours: Client Pack spine can reuse the gist fields. Clients parked. Pay Gamma = Evens.

## I. Questions
- What is the if-exists checking?
- Who clicks approve — Slack?
- Is the long video `KGXFkUlBHxw`?

## J. Connections
- **SYSTEM SYNTHESIS:** `KGXFkUlBHxw` long proposals. Nate Client Pack (18-corpus IVx8OSMbTss).
- **SYSTEM SYNTHESIS:** `ask-principal` = the approve chip.

## K. Future-Use
- Unassigned: gist fields (date/title/attendees/gist/status) as a report spine.
- Unassigned: speaker-change as a transcript pack rule.

## Steal / Operate-never

### Machine: log-then-approve-then-deck
- **Epistemic:** SOURCE
- **Workflow / loop:** call ends → log gist fields → human chip: deck or not → if yes, generate preview → checkable stop = preview URL, not sent
- **Questions / signals:** Was it logged? Did anyone approve? Did it send?
- **Qualify / frame / objections:** Not 'instantly generate proposals' as a send.
- **Procedure:** I package the gist + a HITL deck preview. Evens sends.
- **Example that proves it:** Fireflies logs the sheet; approve gate; Gamma only if yes; last-item guardrail.
- **Why it works:** Optional render saves money and taste. The log is the always.
- **Conditions / exceptions:** Fireflies/Gamma on tape. Pay/send HITL.
- **Operate-never payload:** Auto-Gamma; send the deck; install Gamma; quote a fee as FACT.
- **Hive run (existing skills only):** `ask-principal` · `one-channel-deep` · `outcome-offer-funnel`
- **Source:** `-Q_P7HFydZk` @ UNKNOWN

**Operate-never**
- Publish / schedule live / paid boost without Evens.
- Republish Nate or any source creator.
- Quote tape $ / hours×rate / student counts as FACT or as our price.
- Send / pay / deploy / book.
- New icp_id / unpark a client / Grok Bot sendPrompt.
- Install on-tape vendors (n8n-cloud, Skool, Vapi, Claude, ChatGPT, Gemini, Coda, Abacus).
- Send the proposal.
- Pay Gamma from this desk.
- Auto-deck every call.

## L. Role-Specific Applications
- I package a logged gist + approve chip + optional deck preview. I do not send.
- I will not cut 'instantly' as a send promise.
- Evens publishes. I do not.
