# Communications Manager — G9Ho8n4lD6I
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/G9Ho8n4lD6I/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/G9Ho8n4lD6I/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** Build Your First Voice AI Agent with Vapi and n8n
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** short · 434 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Create blank Vapi assistant named booking agent for Hercules Detailing (car detailing).
- Needs calendar look + create events. Vapi tools: Google Calendar create event + check availability.
- Uses ChatGPT (on-tape) to write the system prompt: name Nate, booking assistant, Hercules; wants when-to-use-each-tool in the prompt.
- Live test: caller wants full interior+exterior today; agent checks availability 4–6pm; books 5pm; asks email; confirms nate@acample.com.
- CTA: full. Long-form `zWLZ3bVVwD8`.

## B. Atomic Knowledge

### Prompt must say when to use each tool
- **Claim:** He has ChatGPT write the system prompt but insists it includes when to use check-availability vs create-event.
- **Reasoning:** Tools without a when-clause get called wrong.
- **Mechanism:** Overview + purpose + services + when-to-use-each-tool → paste into Vapi → test call.
- **Evidence:** “the one thing I just want to make sure we have here is when to use each tool.”
- **Conditions:** Two calendar tools exist.
- **Exceptions:** A generated prompt is still a draft (`NO97pqqc10A`). Vapi/ChatGPT on-tape.
- **Action:** Steal the when-clause; do not install Vapi; do not auto-book.
- **Confidence:** high
- **Source:** `G9Ho8n4lD6I` @ UNKNOWN
- **Epistemic:** SOURCE

### Voice booking demo auto-books and emails
- **Claim:** The test call checks slots, books 5pm, asks email, says confirmation was sent.
- **Reasoning:** Happy-path book + confirm is the demo.
- **Mechanism:** Call → check availability → pick slot → ask email → book → “confirmation email has been sent.”
- **Evidence:** Spoken booking + nate@acample.com (ASR).
- **Conditions:** Demo business Hercules Detailing.
- **Exceptions:** Auto-book and auto-confirm email are operate-never on this desk.
- **Action:** Do not build or praise an auto-book voice agent as ours.
- **Confidence:** high
- **Source:** `G9Ho8n4lD6I` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- When-to-use-each-tool is the prompt’s load-bearing sentence. **SOURCE**
- Voice + calendar write = a hard step (book). **SYSTEM SYNTHESIS**
- Hercules / Nate-as-agent is theater. **INFERENCE**

## D. Procedures
- Create assistant → add calendar tools → generate prompt with when-clauses → test call. **SOURCE**
- This desk: book / confirm-email = HITL. Draft a human callback, do not auto-book. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Car-detailing booking line. → **Action:** Vapi + Calendar tools + ChatGPT prompt with when-to-use. → **Reasoning:** Must look and create. → **Outcome:** Books 5pm, claims email sent. → **Lesson:** Steal when-clauses. Implicit rule: the demo’s send/book is the never.

## F. Decision Rules
- If a tool can write a calendar → human must confirm.
- If the prompt lacks when-to-use → do not run it.
- Refuse: Vapi install. Auto-book. Auto-confirm email.
- Optimize for a callback draft, not a night-time booker.

## G. Contrarian
- Field wants the agent that books while you sleep (`-Lo_SlSgtnA`). We steal the prompt rule and park the book. **SYSTEM SYNTHESIS**

## H. Assumptions
- Vapi + ChatGPT + Google Calendar on-tape. Fake email domain. Falsifier: wrong-slot book.

## I. Questions
- Did a human see the event before the confirm email?

## J. Connections
- **SYSTEM SYNTHESIS:** `zWLZ3bVVwD8` · `glM8godEcic` · `BO-jFbN4p8Y` · `-Lo_SlSgtnA`. `ask-principal` on book.

## K. Future-Use
- When-to-use-each-tool as a playbook line for any multi-tool draft.

## Steal / Operate-never

### Machine: When-to-use-each-tool stays; auto-book does not
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Need a booking conversation → write when-to-use for check vs create → draft the lines → **stop**. Human books. No Vapi. No confirm email.
- **Questions / signals:** Which tool? Did a human confirm the slot? Was an email sent?
- **Qualify / frame / objections:** Qualify: prompt rule vs booker product. Frame: callback. Objection: “it booked and emailed” → operate-never.
- **Procedure:** 1) Keep when-clauses on the card. 2) Do not stand up Vapi. 3) Do not send confirmations.
- **Example that proves it:** Hercules test: 4–6pm offered, 5pm booked, email claimed sent.
- **Why it works:** Wrong tool-call is a bad book. Auto-book is a hard step without HITL.
- **Conditions / exceptions:** Voice+calendar demos. Exceptions: none for auto-book.
- **Operate-never payload:** Vapi. Auto-book. Auto-confirm. ChatGPT as stack.
- **Hive run (existing skills only):** `ask-principal` · `warm-draft-hitl` · `playbook-before-send`.
- **Source:** `G9Ho8n4lD6I` @ UNKNOWN


### Operate-never (this desk will not operate)
- Vapi install. Auto-book. Auto-confirm email. ChatGPT prompt as certified.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I draft booking questions. I do not book. I do not email a confirmation. Clients parked.
