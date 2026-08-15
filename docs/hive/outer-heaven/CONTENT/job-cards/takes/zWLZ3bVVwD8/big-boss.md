# Big Boss — zWLZ3bVVwD8
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/zWLZ3bVVwD8/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/zWLZ3bVVwD8/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 41:54, 9550 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: Vapi dashboard, Green Grass FAQ answers, Hercules calendar (3–4 and 6–8 busy), latency/cost chips, credit meter **8.52 / 10**.

Beats, in order:

1. Zero-to-first voice agent. Vapi + n8n = “endless.” Voice agent = chatbot with speech I/O; can be inbound, outbound, or a site widget (he counts widget as inbound).
2. Core: **STT → LLM → TTS**. Anatomy: **model, prompt, voice, tools**. Dentist-book thought experiment (GPT-4o, prompt, voice, calendar/email tools).
3. Why n8n: Vapi can trigger any n8n workflow as a tool (book, lookup, email, payments — payments named, not built).
4. Learn-now pitch: voice “blows up in 2026,” clear ROI. **UNVERIFIED.**
5. Fresh Google signup. Ignore the rest of the UI. Assistants + tools. Default example: Wellness Partners / Riley. Who-speaks-first. Prompt sections (identity, persona, if-this-then-that). Files. Max tokens (cost cap). Temperature (random vs deterministic). Iterate forever; never first-try.
6. **FAQ agent (Alex / Green Grass / Haven):** customer-support template. Upload policy PDF (shipping, returns, warranty, payment, privacy, FAQ). Files = read-the-doc, not a vector DB. Huge KB → n8n/vector (out of scope). Talk-to-assistant test: returns 30-day / unused / customer pays shipping unless defect; bulk → sales@haven.com; digital gift cards on the site. Each answer used **default query**. Refine what you did not love.
7. **Booking agent (Hercules Detailing):** blank assistant. First message “Nate from Hercules.” Native Google Calendar tools (check availability, create event) — he says this is easier than n8n-in-the-middle for calendar. Integrations: connect Calendar; optional BYO 11Labs/OpenAI keys (cheaper, own rate limits; Vapi marks up). Time zone America/Chicago. Prompt via ChatGPT; strip “please” (rude-to-GPT study). Must attach tools in the tools tab, not only mention them.
8. Fail 1: offers 12–5pm because the model thinks **3 Nov 2023**. Fix: inject **today’s date/time** expression in additional notes.
9. Pass: check rest of today → 3–4 and 4–6 style windows → he picks 5pm → asks email → **mis-hears**, confirm catches it → create event + attendee. Would have emailed if real.
10. Model swap to Anthropic + other voice: feels slower; repeats “let me check” **twice**; latency/cost chips drop when he returns to 4o. Doctrine: prompt → ~5 test calls → notes → refine prompt → repeat.
11. **End-of-call → n8n:** analysis summary (2–3 sentences) + structured properties (appointment type, email, datetime). Advanced → messaging → POST webhook. Server message = end-of-call report only. Test URL + Execute vs later **active + production URL** (same trap as other tapes). Demo books 4pm interior; “today” in the datetime (he would specify full date). Sheet append + Gmail “new call log” to himself; strip n8n attribution. Empty fields if they did not book — tell it to write NA.
12. Keep logic **in Vapi until the report**. Future videos: Vapi → n8n agent → image/video/CRM and back. Phone: **10 free** US numbers; inbound assign; outbound settings exist; Twilio import. Credits: **10** free, he has **8.52**; **$10 ≈ 18.5** credits. Plus **200**. **$ UNVERIFIED.**

Off-topic / not skipped: Wellness Partners example agent; ChatGPT as prompt writer; HIPAA chip mentioned not used; background sound / punctuation levers he skips; dentist as a slide, not a live ICP.

## B. Atomic Knowledge

### Voice is the same LLM with different doors
- **Claim:** STT in, TTS out. Do not mystify. Four parts: model, prompt, voice, tools. Tools are where action lives.
- **Reasoning:** If you can prompt a chat agent, you can prompt a voice agent. The new risk is latency, silence, and writes on a live line.
- **Mechanism:** Provider model + system prompt + voice vendor + tool list.
- **Evidence:** Opening anatomy. Dentist thought experiment uses the same four.
- **Conditions:** Real-time, “minimal latency.”
- **Exceptions:** Widget vs PSTN is still inbound in his taxonomy.
- **Action:** Steal the four-part checklist. Do not install Vapi.
- **Confidence:** high
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN — “no need to over complicate voice agents at their core. It’s just an LLM”
- **Epistemic:** SOURCE

### Inbound, outbound, widget — outbound is a different machine
- **Claim:** Inbound = they call you (support, FAQ, schedule). Outbound = you call them (sales, reminders, surveys, marketing). Widget ≈ inbound.
- **Reasoning:** Who starts the call changes consent and blast radius. He builds inbound. Outbound is a settings pane and a teaser.
- **Mechanism:** Phone number inbound assign vs outbound settings / Twilio import.
- **Evidence:** Types section + end-card outbound.
- **Conditions:** Inbound needs a published assistant + a number.
- **Exceptions:** Doctrine #11: no auto-dialer. This tape does not demo outbound.
- **Action:** Learn inbound qualify/loop. Operate-never outbound / auto-dial.
- **Confidence:** high
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN — “outbound agents… proactively call people”
- **Epistemic:** SOURCE

### Prompt never ships on pass one — five calls, then rewrite
- **Claim:** You will not get the prompt right first. Run conversations, jot likes/hates, feed notes back, repeat. He used ChatGPT for v1 with “no data” and ~three practice calls.
- **Reasoning:** Phone has more branches than a form. The world is the test set.
- **Mechanism:** Talk-to-assistant in the dashboard (no number required to test). Publish = save (he hates the word publish).
- **Evidence:** Green Grass refine-what-you-didn’t-love. Hercules date bug + email confirm + double filler.
- **Conditions:** You can hear the call. Max tokens / temperature are extra levers.
- **Exceptions:** Template prompts (Riley, Alex) are starting points, not done.
- **Action:** `golden-test-loop`. Five listens is the cheap check. Live number is not.
- **Confidence:** high
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN — “prompt, run like five calls, jot down what you don’t like… refine the system prompt again”
- **Epistemic:** SOURCE

### FAQ file first — prove truth before a write tool
- **Claim:** First live agent only answers a policy PDF. No calendar. Default query on every answer. Do not invent.
- **Reasoning:** Cheapest proof that the brain uses a source of truth. Writes are a later slice.
- **Mechanism:** Upload file → attach on the assistant → test returns / bulk / gift cards.
- **Evidence:** 30-day unused original packaging; sales@haven.com; gift cards on the site. He saw the query tool each time.
- **Conditions:** Short doc. Huge KB → vector/n8n (named, not built).
- **Exceptions:** First refund answer tried to bounce him to billing — he clarified “policy, not a refund.”
- **Action:** One system: script + FAQ that **cannot** create an event. Proof = cited file.
- **Confidence:** high
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN — “this is our source of truth”
- **Epistemic:** SOURCE

### The model does not know what day it is unless you say
- **Claim:** Without a now() expression, it booked against **3 Nov 2023**.
- **Reasoning:** Calendar tools + a stale “today” = confident wrong slots.
- **Mechanism:** Additional notes: today’s date/time + timezone. He says ask Perplexity/ChatGPT for the Vapi expression.
- **Evidence:** He hung up when 12–5pm did not match the real calendar.
- **Conditions:** Any “today / tomorrow” booking path.
- **Exceptions:** After the fix, tomorrow-afternoon demo still repeated filler (different bug).
- **Action:** Now-stamp is a checkable stop before any availability call. Still no auto-book.
- **Confidence:** high
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN — “today is not 2023 November 3rd”
- **Epistemic:** SOURCE

### Confirm the email; STT will lie
- **Claim:** It heard the address wrong. Confirm let him correct. Then it wrote the event.
- **Reasoning:** Same read-back physics as `y-cq_Qo4zVo`. Without confirm, the attendee is a stranger.
- **Mechanism:** Prompt: ask email, confirm spelling, then create event.
- **Evidence:** nateample.com bounce. Event titled “full interior and exterior” at 5pm with attendee.
- **Conditions:** Create-event tool attached in the tools tab (mention-in-prompt is not enough).
- **Exceptions:** He still auto-creates the event on tape.
- **Action:** Steal confirm. Calendar write stays Evens.
- **Confidence:** high
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN — “I’m glad that I told it to confirm that. We were able to correct it”
- **Epistemic:** SOURCE

### Double “let me check” is a named bug
- **Claim:** Anthropic swap: slower + said the check line twice. He would change model or reprompt.
- **Reasoning:** Filler is required (`y-cq_Qo4zVo`) and also over-fires. Latency is a model choice, not only a prompt.
- **Mechanism:** Listen test. Compare latency/cost chips across models.
- **Evidence:** Tomorrow-afternoon demo. 4o felt smoother when he switched back.
- **Conditions:** First-iteration prompt, few calls.
- **Exceptions:** Not fixed on this tape — only named.
- **Action:** `golden-test-loop`: one filler. Two is a fail.
- **Confidence:** high
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN — “it said that twice. And so that’s something that we would want to… reprompt”
- **Epistemic:** SOURCE

### End-of-call extract is a log; active webhook is prod
- **Claim:** After hangup, summary + type/email/time go to n8n → sheet + optional email. Test ear vs always-on ear. Keep Vapi logic until this report (beginner slice).
- **Reasoning:** Visibility after the call. Empty properties if they did not book (write NA). “Today” in structured time is another now-stamp miss.
- **Mechanism:** Analysis properties + messaging server URL + end-of-call only. Then append row + Gmail.
- **Evidence:** 4pm interior demo payload. He emails himself. Warns: will not work until **active** + production URL pasted.
- **Conditions:** Execute while testing. Prod string when live.
- **Exceptions:** He sent a Gmail from the tutorial path — send is HITL here.
- **Action:** Steal extract-to-sheet as a draft log. Do not flip active from a beginner tape. Do not auto-email.
- **Confidence:** high
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN — “this will not work unless you turn it on to be active”
- **Epistemic:** SOURCE

### Native calendar tools vs n8n-in-the-middle
- **Claim:** For check/create event he prefers Vapi’s Google Calendar tools over sending to n8n and back. n8n waits for the end-of-call report in this video. Later videos will put n8n in the middle for harder actions.
- **Reasoning:** Beginner slice: fewer hops, less latency. MCP seven-tool tape (`y-cq_Qo4zVo`) is the other design.
- **Mechanism:** Create tool → Google Calendar → connect under integrations.
- **Evidence:** Spoken contrast “in the past… n8n… but now we can just do this.”
- **Conditions:** Calendar-only writes. CRM/FAQ/handoff complexity is the other tape.
- **Exceptions:** BYO keys to avoid Vapi markup — still his vendor.
- **Action:** Do not treat native-calendar as a reason to auto-book. Two designs, same HITL write.
- **Confidence:** high
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN — “it’s probably easier to connect to some Google calendar tools… rather than creating a custom tool where you send data to n8n”
- **Epistemic:** SOURCE

### Credits and Plus are the close
- **Claim:** 10 free credits, **8.52** left after testing; **$10 ≈ 18.5** credits; Plus **200** + three courses + weekly live.
- **Reasoning:** Beginner tape converts on leftover credits and school.
- **Mechanism:** Pay-as-you-go screen.
- **Evidence:** End card. **$ UNVERIFIED.**
- **Conditions:** His screenshot.
- **Exceptions:** “Voice blows up in 2026 / clear ROI” has no number.
- **Action:** Do not quote credits or 200 as FACT. Do not buy a credit pack from this desk.
- **Confidence:** high that he said it
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN — “you get 10 free credits… $10 to get about 18.5 credits”
- **Epistemic:** SOURCE (said) / UNVERIFIED (money)

## C. Mental Models

- **Same brain, voice door.** Tools do the write. **SOURCE**
- **FAQ before fingers.** Prove truth, then (maybe) a write tool. **SOURCE**
- **Five listens beat a clever prompt.** **SOURCE**
- **Now-stamp or you book 2023.** **SOURCE**
- **Confirm or you email a stranger.** **SOURCE**
- **Filler once.** Twice is a bug. **SOURCE**
- **Report ≠ book.** Active = prod. **SOURCE**
- **Outbound is a different, refused machine.** **SYSTEM SYNTHESIS**
- **Publish button means save.** Still not our publish. **INFERENCE**

## D. Procedures

1. **Qualify / frame:** Voice 101. Steal qualify/loop/proof. Clients parked. Dentist/Hercules are props.
2. **Anatomy checklist:** model, prompt, voice, tools. Who speaks first.
3. **Slice 1:** FAQ file only. Five listens. Cite-the-file proof.
4. **If a write path is even sketched:** now-stamp, availability, read-back. Stop. Ticket to Evens.
5. **Name bugs:** stale date, double filler, “today” in structured time.
6. **Log after hangup** as a draft sheet. Do not activate prod webhook from the tutorial.
7. **Questions / signals:** “Did it use the file?” “What day does it think it is?” “Did it confirm the email?” “Test or prod?”
8. **Objections:** “Native calendar is easier so go live” — easier is not HITL. “Outbound is in the UI” — auto-dial never.
9. **Avoid:** Vapi install, auto-book, credit pack, Plus as SKU.
10. **When to change:** If it offers slots for the wrong year, halt.

## E. Examples

**Situation:** FAQ caller asks returns, bulk, gift cards.  
**Action:** Default query each time; reads 30-day / sales@ / gift cards.  
**Reasoning:** File is truth.  
**Outcome:** Answers match the PDF (narrated). First refund turn tried to transfer to billing until clarified.  
**Lesson:** Source-of-truth + listen. Implicit rule: clarify policy vs action.

**Situation:** Booking agent offers a full afternoon on a 2023 date.  
**Action:** Hang up; inject now(); retry.  
**Reasoning:** Availability against the wrong day is worse than silence.  
**Outcome:** Later 5pm book after email confirm.  
**Lesson:** Now-stamp is a gate. Implicit rule: hang up is allowed.

**Situation:** End-of-call writes “today 4pm” into the sheet and emails Nate.  
**Action:** He notes he should have demanded a full date; shows active vs test.  
**Reasoning:** Extract is only as good as the property prompt.  
**Outcome:** Log exists; send happened in the demo.  
**Lesson:** Specify the field. Implicit rule: tutorial send is not our send.

## F. Decision Rules

- If there is no source-of-truth file → do not answer policy.
- If now() is missing → do not check calendar.
- If email/time was not confirmed → do not write.
- If filler fired twice → fail the listen.
- If webhook is test → do not share a number.
- If the feature is outbound → never.
- Optimize: FAQ proof + listen notes. Not time-to-first-book.
- Refuse (this desk): Vapi, auto-book, credit pack, dentist hunt.

## G. Contrarian

- Against “voice is a new kind of AI”: he says it is an LLM with ears.
- Against “n8n in the middle on day one”: he keeps calendar native until the report.
- Against “one prompt”: five calls or it is not tested.
- Field assumes the beginner tape is a production receptionist. He is still injecting the date.

## H. Assumptions

**His:** Vapi is the place to learn; ChatGPT can write v1 prompts; native Calendar is enough; 10 free credits teach the loop; Plus is the upgrade; 2026 voice boom is real.

**Ours:** Captions complete enough (9550 words). Audio **UNVERIFIED**. Green Grass / Hercules / dentist are props. Clients parked. Sibling MCP tape is `y-cq_Qo4zVo` (SYSTEM SYNTHESIS).

**Falsifiers:** File-read invents anyway. Now-stamp still wrong timezone. Prod webhook flipped from the tutorial. Outbound settings get used as a hunt.

**Disagreement (keep labeled):** Hive will not operate Vapi or auto-book. The **FAQ-first → five listens → now-stamp → confirm → log** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Exact Vapi now() expression? He pointed off-tape.
- HIPAA chip — when would he turn it on? Named only.
- Is `y-cq_Qo4zVo` the “more videos / MCP” sequel? PACKET does not bind.
- What used 1.48 of 10 credits? Not itemized.

## J. Connections

- **SYSTEM SYNTHESIS** → `y-cq_Qo4zVo` (MCP seven tools, disclose AI, filler, handoff).
- **SYSTEM SYNTHESIS** → `missed-call-book` (HITL only).
- **SYSTEM SYNTHESIS** → `ask-principal` (book / prod / send).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (five calls; double filler; now-stamp).
- **SYSTEM SYNTHESIS** → `agent-as-hire` (model/prompt/voice/tools).
- **SYSTEM SYNTHESIS** → `tFFKuq2t0rI` (test vs production webhook).
- **SYSTEM SYNTHESIS** → doctrine #10–11 (no auto-book, no auto-dial).
- Do not force Path A dentist/detailing from a 101.

## K. Future-Use

- Who-speaks-first as a script checkbox (unassigned).
- Max-tokens as a cost cap analog (Money Desk — no tape $ as FACT).
- NA-if-missing structured fields as a log quality rule (Watchdog).
- “Publish means save” as a vocabulary trap for HITL (unassigned).

## Steal / Operate-never

### Machine: FAQ-first → five listens → now-stamp + confirm → log (no auto-book)
- **Epistemic:** SOURCE (101 demos) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (learn or script a receptionist) → name the four parts → attach a truth file → five listens, cite-the-file proof → if a write is even sketched, inject now-stamp → check availability → read-back → **ticket to Evens** → after hangup, extract a draft log. Do not activate prod. Do not outbound. Checkable stops: file cited; date is this year; email confirmed; webhook still test.
- **Questions / signals:** “Did it use the file?” “What day is it?” “Did they confirm?” “Test or prod?”
- **Qualify / frame / objections:** Beginner tape, not a dentist SKU. Objection: native calendar is easier — easier is not a live book. Objection: outbound is in the UI — auto-dial never.
- **Procedure:** D steps 1–6.
- **Example that proves it:** Green Grass FAQ cited the PDF. 2023 slots → hang up → now(). Email mis-hear → confirm. Double filler named. Lesson: gates and listens are the machine; 5pm create-event is not.
- **Why it works:** Voice is an LLM that will be confidently wrong about the day and the email. Files, now-stamps, confirms, and listens catch it. Conditions: dashboard test before any number. Exceptions: he still books and emails himself on tape.
- **Conditions / exceptions:** Cursor + Grok only. Vapi / ChatGPT-as-prompter / 11Labs / Twilio on tape. Clients parked.
- **Operate-never payload:** Auto-book; outbound auto-dial; prod webhook from a 101; quote 10 credits / 8.52 / $10 / 18.5 / 200 members / 2026 ROI as FACT.
- **Hive run (existing skills only):** `ask-principal` · `golden-test-loop` · `agent-as-hire` · `slice-build` · `missed-call-book` (HITL only) · `send-removed`.
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Vapi / auto-book / prod webhook from a beginner tape / outbound auto-dial
- Quote 10 credits / $10 / 18.5 / 8.52 / 200 members / “2026 boom” as FACT
- Nate Plus / Hercules / Green Grass / dentist as a hive SKU
- New hunt ICP. Clients parked. No Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not buy his credit pack.

- **Done** on this 101: a script + FAQ that cannot create a calendar event + five listen notes. A 5pm booking is not done.
- **Delegate without being asked:** HITL Operator owns any later ticket; Watchdog names date-bug and double-filler; Communications does not get a number; Money Desk labels 8.52 UNVERIFIED.
- **Skeptical review:** “Endless possibilities” is the music sting. He spent the body teaching now() and confirm. I will not approve a dentist booker because Riley was in the template.
- **One system this take:** FAQ voice draft, no create-event. Not a credit pack. Not outbound.
- Live hunt stays parked. I do not rotate to voice-101 because the sheet row populated.
