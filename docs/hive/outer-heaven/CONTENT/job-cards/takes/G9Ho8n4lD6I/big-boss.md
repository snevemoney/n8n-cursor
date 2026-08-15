# Big Boss — G9Ho8n4lD6I
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/G9Ho8n4lD6I/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/G9Ho8n4lD6I/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Short (PACKET: 1:54, 434 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: Vapi dashboard, Google Calendar tool pickers, the ChatGPT prompt pane, and the live voice UI are described, not seen. Caption: Vappy = Vapi; Naden = n8n; Chad Gabbt = ChatGPT — on tape. Demo email: `nate@acample.com` (typo for example.com).

Beats, in order:

1. Claim: “Here’s how to build your first voice agent with Vappy and Naden.”
2. Create new assistant → blank → name it a **booking agent** → create.
3. Job: car detailing company **Hercules Detailing**. Someone calls the phone number on herculesdetailing.com and books an appointment.
4. Needs: look at the calendar **and** create events.
5. Vapi dashboard → tools. Create those two tools.
6. Google Calendar tools available: **create event** and **check availability.** He will use both.
7. He uses ChatGPT to write the system prompt: “Please help me create a system prompt for a voice AI agent. Its name is Nate and it is a booking assistant for Hercules Detailing.”
8. Prompt comes back with overview, purpose, service options. He checks one thing: **when to use each tool.** He says it talks about that.
9. Copy the prompt into Vapi. Test.
10. Demo call: “Hey, this is Nate from Hercules Detailing.” Caller wants full interior + exterior **today**. Agent checks availability, offers 4:00–6:00 p.m., caller picks 5:00. Agent asks email for confirmation. Books 5:00 p.m. today. Confirmation sent to nate@acample.com. Thanks for choosing Hercules.
11. CTA: play-button to the full breakdown. n8n wiring is **named in the title/open and not shown** on this short.

Off-topic / not skipped: assistant named Nate; site URL as the phone source; ChatGPT as prompt writer; tool-when as the one review he does; fake email; auto-book + confirmation email on the demo.

## B. Atomic Knowledge

### Booking agent = two calendar tools, not a chatter
- **Claim:** The voice agent must check availability and create events. Those are the two tools he adds.
- **Reasoning:** A booking assistant that cannot see or write the calendar is theater.
- **Mechanism:** Vapi tools → Google Calendar → check availability + create event.
- **Evidence:** “look at the calendar and… create events… two ones that are available.”
- **Conditions:** Calendar is connected (how is visual-only). Demo finds same-day slots.
- **Exceptions:** No cancel/reschedule tool on tape. n8n not shown.
- **Action:** Job card for a booker lists the two tools and when. Do not operate auto-create.
- **Confidence:** high
- **Source:** `G9Ho8n4lD6I` @ UNKNOWN — “Create event and check availability”
- **Epistemic:** SOURCE

### Prompt is outsourced; the human checks “when to use each tool”
- **Claim:** ChatGPT writes the system prompt. He only insists the prompt includes when to use each tool.
- **Reasoning:** Overview/purpose/services can be generated. Tool-when is the failure point he watches.
- **Mechanism:** Paste a brief (name Nate, Hercules Detailing, booking assistant) → scan for tool-when → copy into Vapi.
- **Evidence:** “the one thing I just want to make sure we have here is when to use each tool.”
- **Conditions:** Tools already exist so “when” has referents. He does not rewrite the rest on tape.
- **Exceptions:** He does not show a bad prompt that called create-event first.
- **Action:** Checkable stop = written when-to-use for each tool before a test call.
- **Confidence:** high
- **Source:** `G9Ho8n4lD6I` @ UNKNOWN — “when to use each tool”
- **Epistemic:** SOURCE

### Demo is a full auto-book with confirmation
- **Claim:** Test call books same-day full interior/exterior at 5:00 p.m. and sends a confirmation email.
- **Reasoning:** He treats a completed book as the demo win. No human confirm on tape.
- **Mechanism:** Voice greet → need → check availability → offer window → pick slot → ask email → create event → confirm.
- **Evidence:** “You’re all set. I’ve booked… A confirmation email has been sent to nate@acample.com.”
- **Conditions:** Demo calendar had 4–6 p.m. Email is fake. Site/phone are props.
- **Exceptions:** No payment, no deposit, no “we’ll call you back.” Failed availability not shown.
- **Action:** Steal the question order. Operate-never the auto-book and auto-email.
- **Confidence:** high the demo said it booked
- **Source:** `G9Ho8n4lD6I` @ UNKNOWN — “I’ve booked your full interior and exterior detailing for today at 5:00 PM”
- **Epistemic:** SOURCE

### n8n is on the label, not on this tape
- **Claim:** Open/title pair Vapi with n8n. The short never shows an n8n node.
- **Reasoning:** Magnet is the combo. Body is Vapi + Calendar + a ChatGPT prompt.
- **Mechanism:** CTA to the full breakdown — likely where n8n would appear. Do not invent it.
- **Evidence:** First sentence names both; remaining beats stay in Vapi/ChatGPT/Calendar.
- **Conditions:** PACKET does not bind a sibling id.
- **Exceptions:** Viewer who came for n8n leaves empty.
- **Action:** Do not write an n8n procedure from this file.
- **Confidence:** high
- **Source:** `G9Ho8n4lD6I` @ UNKNOWN — “voice agent with Vappy and Naden”
- **Epistemic:** SOURCE (label) / SYSTEM SYNTHESIS (absent body)

## C. Mental Models

- **Blank assistant + a name is enough to start.** He does not begin from a template. **SOURCE**
- **Vertical is a prop (Hercules Detailing) to make the prompt concrete.** **SOURCE**
- **Tools first, then prompt.** He creates calendar tools before generating the prompt. **SOURCE**
- **The only prompt review that matters to him is tool-when.** **SOURCE**
- **A booked slot + confirmation email is the demo definition of done.** **SOURCE**
- **Auto-book is the feature. Hive: auto-book is the incident.** **SYSTEM SYNTHESIS**
- **ChatGPT as prompt intern is normal on his tape.** We do not install it. **SYSTEM SYNTHESIS**

## D. Procedures

1. **Name the job** (booking) and the two tools (check, create) before a voice vendor.
2. **Write when-to-use** for each tool. If a model drafts the rest, the human still checks when.
3. **Script the questions:** service → day → availability → pick → contact for confirm.
4. **Do not create the event or send the email** from the agent. Draft + HITL (`ask-principal`). Analog: `private-book-install` / `missed-call-book` with no auto-book.
5. **Treat Hercules / the URL / the fake email as props.** No new ICP.
6. **Do not invent the n8n half** from this short.

**Qualify / frame:** voice-booking demo for a fake detailer. Not a Path A install. Vapi / ChatGPT / n8n stay on tape.
**Objections:** “It booked in one call” — answer with: demo calendar, fake email, no HITL; auto-book is never.
**Avoid:** PSTN/Vapi install; auto-dial; auto-book; ChatGPT as hive prompt writer.
**When to change:** if tool-when is missing, do not test-call. If create-event can fire, stop. If the vertical is a real client, this short is still not a scope.

## E. Examples

**Situation:** He wants a first voice booker.  
**Action:** Blank assistant named booking agent; two Google Calendar tools (check, create).  
**Reasoning:** Book = see calendar + write calendar.  
**Outcome:** Tool belt exists before the prompt.  
**Lesson:** Tools first. Implicit rule: a voice without calendar tools is chat.

**Situation:** He needs a system prompt.  
**Action:** Asks ChatGPT for a prompt for “Nate” at Hercules; scans for when-to-use-each-tool; copies into Vapi.  
**Reasoning:** Tool-when is the one check.  
**Outcome:** Prompt pasted; test starts.  
**Lesson:** Human reviews when, not the whole essay. Implicit rule: generated prompt is not done until when exists.

**Situation:** Test caller wants full interior/exterior today.  
**Action:** Agent checks today, offers 4–6 p.m., books 5:00, asks email, sends confirmation to nate@acample.com.  
**Reasoning:** He wants a complete book on tape.  
**Outcome:** “You’re all set.”  
**Lesson:** Question order is stealable. Implicit rule: confirmation-sent is the send trap.

## F. Decision Rules

- If there is no check-availability tool → do not offer times.
- If there is no when-to-use → do not test-call.
- If create-event or email can fire unattended → operate-never.
- If n8n is only in the title → do not write n8n steps.
- If the business is a prop → do not open a hunt.
- Optimize: tools → when → question order → HITL book.
- Refuse (on this desk): Vapi; auto-book; auto-dial; ChatGPT prompt shop; Hercules as ICP.

## G. Contrarian

- Against “prompt first”: he adds tools, then generates the prompt.
- Against hand-writing the whole prompt: he outsources it and checks one clause.
- Against (hive) “voice agent = missed-call book”: he auto-books; we steal the questions and gate the write.
- Field assumes n8n is in the short. It is not.

## H. Assumptions

**His:** Vapi + Calendar + a ChatGPT prompt is a first voice agent; same-day book is impressive; confirmation email should send; Hercules is a clear example; n8n belongs in the title.

**Ours:** 434 words. Book and email **UNVERIFIED** as real calendar writes (demo). `acample.com` is a tell. Domain-specific: voice book for a service shop — analog exists (`missed-call-book`) but auto-book is kill.

**Falsifiers:** Slots were hallucinated. Event never wrote. Email never sent. Tool-when in the prompt was ignored. Real callers get a wrong time.

**Disagreement (keep labeled):** Hive will not install Vapi or auto-book. The **two tools + when-to-use + question order** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Where is n8n in this build? Not on this short.
- Did create-event actually write? Visual-only.
- Who owns herculesdetailing.com — prop or real? Treat as prop.
- What if no slots today? Not shown.
- Payment / deposit? Not on tape.
- Sibling long: PACKET does not bind an id.

## J. Connections

- **SYSTEM SYNTHESIS** → `missed-call-book`: restaurant/local missed-call → book CTA + HITL. No auto-book. Voice vendor = `ask-principal` only.
- **SYSTEM SYNTHESIS** → `private-book-install`: book CTA on the page they have; not a second Twilio number.
- **SYSTEM SYNTHESIS** → `ask-principal`: book / email send are hard steps.
- **SYSTEM SYNTHESIS** → `agent-job-card`: owns check-availability draft; never create-event unattended.
- **SYSTEM SYNTHESIS** → steal-usecases kill: auto-dial factories; auto-book with no callback.
- Do not unpark Normand or invent a detailer ICP because Hercules was the example.

## K. Future-Use

- Tool-when as the only required prompt clause (unassigned).
- Question order (service → day → slots → pick → contact) as a book script (unassigned).
- Title-names-n8n / body-omits-n8n as provenance (unassigned).
- Fake confirmation domain as a Watchdog “demo tell” (unassigned).

## Steal / Operate-never

### Machine: Two calendar tools + when-to-use + question order; book stays HITL
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (we invert auto-book)
- **Workflow / loop:** name the booker job → add check-availability + create-event as **described** tools → write when-to-use → run the question order → **draft** the slot and the confirmation → Evens books/sends. Checkable stop = when-to-use exists + no unattended create/email.
- **Questions / signals:** “Check or create?” “When does each fire?” “Did it already book?” “Is the vertical a prop?”
- **Qualify / frame / objections:** Voice demo for a fake detailer. Objection: it booked live — answer with: demo, fake email, auto-book is never.
- **Procedure:** D steps 1–5. Checkable stops: (1) two tools named, (2) when-to-use, (3) question order, (4) create/email gated, (5) no new ICP.
- **Example that proves it:** ChatGPT prompt checked for tool-when → test call offers 4–6, books 5:00, emails nate@acample.com. Lesson: when + order are the machine; confirmation-sent is the payload we refuse.
- **Why it works:** A booker without availability offers fiction. When-to-use stops create-first. Question order makes the slot real. Conditions: a real calendar, a human on write/send. Exceptions: n8n absent; Vapi/ChatGPT on tape; same-day auto-book on tape; Hercules is a prop.
- **Conditions / exceptions:** Cursor + Grok only. Vapi / ChatGPT / n8n / Calendar-as-OS stay on tape. Clients parked. No auto-dial.
- **Operate-never payload:** Auto-book; confirmation auto-email; Vapi install; ChatGPT as hive writer; Hercules hunt; auto-dial.
- **Hive run (existing skills only):** `missed-call-book` · `private-book-install` · `ask-principal` · `agent-job-card` · `playbook-before-send` · `slice-build` (script + when, not the phone).
- **Source:** `G9Ho8n4lD6I` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-book / auto-dial / auto confirmation email
- Vapi + n8n + ChatGPT as hive OS
- Install Claude / Codex / Gemini / Coda / Abacus / Skool
- Quote any $ as FACT
- New `icp_id` / unpark Normand / Hercules or voice-agent hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not chat a voice agent onto a phone number.

- **Done** on this slice: two tools named + when-to-use written + question order + book/email gated. A booked 5:00 slot is not done and is operate-never.
- **Delegate without being asked:** HITL owns book. Consultant maps clog/leak if Evens ever names a real shop — not Hercules. Forge fails if create-event can fire. Publishing does not ship a Vapi walkthrough as ours.
- **Skeptical review:** “First voice agent” is the short’s job. I will not approve Vapi or a detailer hunt because a demo said you’re all set.
- **One system this take:** when-to-use + HITL book script. Not “stand up Nate on a number.”
- Live hunt stays parked. I do not rotate to voice-booking because a fake domain got a confirmation.
