# Big Boss — y-cq_Qo4zVo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/y-cq_Qo4zVo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/y-cq_Qo4zVo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 34:21, 8187 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: Vapi Kylie UI, seven n8n workflows, calendar/CRM updating, 15-page PDF, Plus 2-hour build.

Beats, in order:

1. Claim: voice receptionist that “can do pretty much anything.” Front = Vapi (Kylie / Hercules Detailing). Back = n8n **instance MCP** with **seven** no-AI workflows. Free system prompt + workflows + **15-page** guide.
2. Live demo 1 (new caller): ask email → not in CRM → collect email/name/phone → **read-back confirm** → create profile → intent = interior tomorrow → **“let me check”** → list busy windows → book **8am** → hang up → end-of-call: account created + appointment booked.
3. Live demo 2 (return): email lookup → move +1 hour → check availability so we “don’t double book” → confirm interior → update to **9am Dec 7** → log: rescheduled.
4. Edit aside: he still wants the agent to **disclose it is AI** at the start. Interruptions/etiquette will never be perfect. Points at the **40-minute beginner** tape (`zWLZ3bVVwD8` is the likely sibling — SYSTEM SYNTHESIS until PACKET binds).
5. Build doctrine: **wireframe first** (if X then Y) before prompting. His flow: inbound → email lookup → exist vs new CRM → merge to **intent** (Kylie / transfer sales / transfer support) → FAQ loop **or** appointment (book/change/delete) → CRM activity → end → call logger.
6. Appointment dependencies: book ⇒ **availability first**. Change ⇒ lookup + availability. Delete ⇒ lookup first.
7. He almost built two mega-webhooks (CRM tool / appointment tool) with intent switches. Abandoned: webhook response + parameter lists in two places. **MCP server** instead: one trigger, seven tiny workflows, descriptions tell the server which to call.
8. Vapi: GPT-4.1 (better at following than 4), first message, ~**50th** system prompt, generate-edits (he demos sarcastic then discards). Tools: n8n MCP + Handoff.
9. Seven tools shown: client lookup, new client, check availability, book event, update appointment, lookup appointment, delete appointment. Many are 1–2 nodes. **No AI in the backend** — a second brain doubles latency, cost, and error. “Makes me cringe.”
10. New-client path in executions: lookup mike@ → empty → “new client” message → after confirm, new-CRM write. Tool choice = description + prompt (“use the n8n tool…”).
11. Connect: MCP server **production URL** + header `Authorization: Bearer <n8n API key>` + server-sent events. Prompt: lowercase email; **say something before every tool call** (avoid dead air); confirm spelling before write.
12. Book path: lookup existing Mike → no prior appts → check availability (now → end of day) → confirm → book (start/end/email/summary) → calendar + sheet row. Prompt: if “entire day available” say so; if slots returned those are **busy**; today = now→23:59:59; future = 00:00–23:59; don’t read event titles; appointments last 1 hour. Hercules “open 24 hours” is a joke on the prompt.
13. Reschedule: availability → lookup (need **event ID**) → update calendar + sheet match on event ID. Delete = same with delete + note “cancelled.”
14. Handoff: angry caller refuses email → transfer to “customer support” (another Vapi assistant). Handoff ≠ PSTN transfer (that is a phone number). One handoff tool, many destinations (support / sales / **Alex**), each with a when-to-use line.
15. FAQ: upload policies PDF; “use only this file / default query tool / do not make up.” Demo: services/tiers without email.
16. Why MCP won: custom tools would force Vapi to declare different parameter sets (book vs change vs delete) and dual updates. MCP reads workflow schemas.
17. End-of-call: Vapi call logs for listen/test. Advanced → messaging → n8n **production** webhook → **end-of-call report only** (not full transcript/tool stream). Analysis: 2–3 sentence summary + structured **outcome**. Writes call-log sheet.
18. Phone: up to **10 free** US Vapi numbers; assign inbound assistant; outbound mentioned (“tell me use cases”). Twilio import possible.
19. Close: free Skool JSON/PDF; Plus **200** members + **2-hour** live build + courses. **$ UNVERIFIED.**

Off-topic / not skipped: nateample.com / 333-444-5678 as fake PII; “buddy” he did not love; refuse-email path; outbound teaser.

## B. Atomic Knowledge

### Wireframe the if/then before you prompt
- **Claim:** Voice has too many branches to discover inside the prompt editor. Paper first: inbound → lookup → exist/new → intent → FAQ or appointment or handoff → log.
- **Reasoning:** Conditional logic is the product. Prompting without a map is how you get 50 silent versions.
- **Mechanism:** Flowchart, then Vapi system prompt sections that match the boxes.
- **Evidence:** He walks the wireframe before any node. Prompt is “the 50th version.”
- **Conditions:** You already know the business actions (book/change/delete/FAQ/transfer).
- **Exceptions:** He says this flow is not “optimal,” just what he wanted.
- **Action:** Qualify the branches on paper. Do not start at the phone number.
- **Confidence:** high
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN — “it all starts with some sort of wireframe… if X do Y”
- **Epistemic:** SOURCE

### Qualify (email / exist / intent) before any write
- **Claim:** First job is lookup. New vs existing. Then intent. Writes (CRM, book, update, delete) come after.
- **Reasoning:** A receptionist who books before knowing who you are is a vandal. Intent decides Kylie vs a named desk.
- **Mechanism:** Client-lookup tool → new-CRM or greet → intent gather → FAQ / appointment / handoff.
- **Evidence:** Both live calls start with email. Angry path skips CRM and hands off.
- **Conditions:** Email is his chosen key. Refuse-email is allowed if they want a human.
- **Exceptions:** FAQ can proceed without email (demo).
- **Action:** Steal qualify. Do not skip to book.
- **Confidence:** high
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN — “ask them for their email so she could see if they already exist in the CRM”
- **Epistemic:** SOURCE

### Availability before book; lookup before change/delete
- **Claim:** Book without a check double-books. Change/delete without an event ID writes the wrong row.
- **Reasoning:** Dependencies are the guardrails. Tools are dumb; the prompt must order them.
- **Mechanism:** Check-availability → confirm time → book. Lookup (window → event ID) → update/delete. Sheet matches on event ID.
- **Evidence:** Wireframe + both appointment demos + “don’t double book.”
- **Conditions:** Calendar is source of busy. He treats returned events as busy windows, not titles to read aloud.
- **Exceptions:** “Entire day available” path when get-many returns nothing — including a 24h shop joke.
- **Action:** Checkable stop = availability payload + spoken confirm **before** any create. On our stack the create itself stays HITL (`ask-principal`). Auto-book = operate-never.
- **Confidence:** high
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN — “if they want to book an appointment, we first have to check availability”
- **Epistemic:** SOURCE

### Read-back before write
- **Claim:** Repeat email / name / phone / appointment type / new time and wait for yes before the write tool.
- **Reasoning:** STT will mangle. He wants “we get everything perfect.” Later tape (`zWLZ3bVVwD8`) shows a wrong email caught by confirm.
- **Mechanism:** Prompt: confirm spelling before logging; confirm time before book/update.
- **Evidence:** Demo 1 read-back of nateample.com / Nate K / 333…. Demo 2 confirms interior + 9am.
- **Conditions:** Caller is still on the line.
- **Exceptions:** He still booked 8am live on tape — the confirm is his, not ours to operate.
- **Action:** Steal the confirm loop. Do not treat confirm as permission for the hive to auto-book.
- **Confidence:** high
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN — “I’ll confirm them with you so we get everything perfect”
- **Epistemic:** SOURCE

### One brain in front; dumb tools in back
- **Claim:** Vapi is already an agent. An n8n agent behind it doubles reasoning, cost, and latency. Backend workflows have **zero AI**.
- **Reasoning:** Second brain is how voice feels drunk. Guardrails = standard nodes.
- **Mechanism:** Seven tiny workflows (often 1–2 nodes). MCP picks by description.
- **Evidence:** “Makes me cringe.” Flip-through of one-node tools.
- **Conditions:** Front prompt is specific about when to call which tool.
- **Exceptions:** He almost built two intent-switch webhooks; MCP won for schema-in-one-place.
- **Action:** Named tools, one job each (`agent-as-hire` / `slice-build`). No double-brain.
- **Confidence:** high
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN — “you’re just doubling the amount of reasoning and potential errors”
- **Epistemic:** SOURCE

### Fill the silence before the tool call
- **Claim:** Before every tool, say “let me check.” Otherwise the line dies for ~5 seconds.
- **Reasoning:** Latency is a UX bug. Filler is part of the script, not personality.
- **Mechanism:** System prompt must-say before n8n tool.
- **Evidence:** Both demos. Beginner tape will double the filler (`zWLZ3bVVwD8`).
- **Conditions:** Tool calls are slow enough to hear.
- **Exceptions:** Too many fillers = the double-check bug on the sibling tape.
- **Action:** Name the awkward second. One filler, not two.
- **Confidence:** high
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN — “before calling the tool you must say something… to avoid silences”
- **Epistemic:** SOURCE

### Disclose AI; handoff is a named desk
- **Claim:** Open with “I am Kylie, an AI assistant.” Handoff to support / sales / Alex — another assistant or a human number — not a transfer farm.
- **Reasoning:** It will never be perfect (interruptions, “buddy”). Honesty + a door to a person.
- **Mechanism:** First-message / identity. Handoff tool with per-destination when-to-use. PSTN transfer is a different tool.
- **Evidence:** Edit aside. Angry-caller demo. “Alex” as a named destination.
- **Conditions:** Destinations exist and are described.
- **Exceptions:** Outbound teaser — he asks for use cases. Auto-dial = operate-never (doctrine #11).
- **Action:** Handoff = desk, not a swarm. We already have 17. No outbound from this tape.
- **Confidence:** high
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN — “the AI systems… should start off the conversation by saying… I am Kylie, an AI assistant”
- **Epistemic:** SOURCE

### FAQ file is the only truth for general questions
- **Claim:** Policies/hours/tiers come from an uploaded file via default query. “Do not make up.”
- **Reasoning:** Voice will invent hours. A source-of-truth file is cheaper than a vector DB for a short doc (sibling tape says huge KB → n8n/vector).
- **Mechanism:** Vapi files + prompt “use only… default query tool.”
- **Evidence:** Tiers demo after refuse-email.
- **Conditions:** File is current. He cut her off mid-list.
- **Exceptions:** Huge KB not on this tape.
- **Action:** Proof = she cited the file (tool call visible). Invented policy = fail.
- **Confidence:** high
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN — “do not make up any of your information”
- **Epistemic:** SOURCE

### End-of-call report is a log, not a second book
- **Claim:** After hangup, summary + structured outcome hit a sheet. Appointment writes already happened (or should have) during the call.
- **Reasoning:** Logger is visibility and testing. It is not where booking should be invented.
- **Mechanism:** Server settings → production webhook → end-of-call report only. Analysis prompt + `outcome` property.
- **Evidence:** Demo logs: booked / rescheduled / inquired about services.
- **Conditions:** Workflow **active** + production URL (test/prod trap, same as `tFFKuq2t0rI`).
- **Exceptions:** He could pluck email/time here too; he already logs those on the appointment sheet.
- **Action:** Steal the log. Do not treat report as the book. Active webhook = prod — Evens.
- **Confidence:** high
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN — “all I wanted to do was end of call report”
- **Epistemic:** SOURCE

### Bearer key in the voice vendor is the blast radius
- **Claim:** Vapi stores `Authorization: Bearer <n8n API key>` to see every workflow on that MCP trigger.
- **Reasoning:** The pretty ear holds the factory key. Leak = the seven writes (including delete).
- **Mechanism:** Header on the MCP tool. Key from n8n settings.
- **Evidence:** Setup section, spoken step-by-step.
- **Conditions:** Required for his connect.
- **Exceptions:** None that help us.
- **Action:** Operate-never: paste instance API keys into a voice vendor. Vapi on-tape only.
- **Confidence:** high
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN — “capital B bearer space and then paste in your n8n API key”
- **Epistemic:** SOURCE

## C. Mental Models

- **Paper before prompt.** Branches are the build. **SOURCE**
- **Qualify, then act.** Email / intent / availability are gates. **SOURCE**
- **Confirm is part of the write.** Read-back is not optional polish. **SOURCE**
- **One brain.** Second agent in the back is how you add latency. **SOURCE**
- **Dumb tools, specific jobs.** Seven small workflows beat two mega-hooks. **SOURCE**
- **Fill the dead air.** Silence is a bug. **SOURCE**
- **Say you are AI.** Perfect voice is a lie. **SOURCE**
- **Handoff to a name.** Support / sales / Alex. **SOURCE**
- **Log after; do not book after.** **SOURCE**
- **8am reserved is his demo, not our operate.** **SYSTEM SYNTHESIS**

## D. Procedures

1. **Qualify / frame:** Voice-receptionist demo for a detailing prop. Steal qualify/loop/proof. Clients parked. No `missed-call-book` go-live.
2. **Wireframe** exist/new, intent, FAQ, book/change/delete, handoff, log.
3. **Proof in the chair:** lookup → confirm → availability payload → spoken yes. Stop. Ticket to Evens.
4. **FAQ** answers only from a file. Invented hours = fail.
5. **Handoff** to a named desk if they refuse the bot or want a human.
6. **Log** outcome after hangup. Do not create the calendar event from the report.
7. **Questions / signals:** “Did we qualify?” “Did we check availability?” “Did they confirm?” “Is this a write?” “Who is the handoff?”
8. **Objections:** “Kylie booked 8am so we should” — auto-book is operate-never (doctrine #10). “Just add outbound” — auto-dial is operate-never (doctrine #11).
9. **Avoid:** Vapi, bearer key in a vendor, auto-book, auto-delete, outbound.
10. **When to change:** If a write would fire without confirm or availability, halt.

## E. Examples

**Situation:** New caller, not in CRM, wants interior tomorrow.  
**Action:** Read-back PII → create profile → check calendar → offer windows → he says 8am → she books.  
**Reasoning:** Qualify + confirm + availability.  
**Outcome:** Calendar and CRM update; log = booked.  
**Lesson:** The loop is stealable. The live reserve is operate-never. Implicit rule: availability before write.

**Situation:** Return caller wants +1 hour.  
**Action:** Lookup → check 9am open → confirm interior → lookup event ID → update.  
**Reasoning:** Change without ID is vandalism.  
**Outcome:** 9am Dec 7; notes = moved.  
**Lesson:** Lookup is part of change. Implicit rule: match on a unique id.

**Situation:** Furious caller refuses email, wants support.  
**Action:** Skip CRM; handoff to customer-support assistant.  
**Reasoning:** Qualify can end in a person.  
**Outcome:** Other assistant answers.  
**Lesson:** Refuse path is a feature. Implicit rule: bot is not a hostage situation.

## F. Decision Rules

- If identity or intent is unknown → do not write.
- If availability was not checked → do not book.
- If they did not confirm the read-back → do not write.
- If they want a human or refuse the bot → handoff.
- If the next node is calendar create/delete → Evens (`ask-principal`). Auto-book / auto-delete = never.
- If someone asks for outbound / auto-dial → never.
- Optimize: qualify → check → confirm → ticket. Not time-to-8am.
- Refuse (this desk): Vapi install, bearer-in-vendor, live detailing number.

## G. Contrarian

- Against “put an n8n agent behind the voice agent”: he calls it cringe.
- Against “two mega webhooks”: MCP + tiny workflows so schema lives once.
- Against “hide that it is AI”: he wants the disclose (edit aside).
- Against “optimal receptionist = this flow”: he says it is just what he wanted.
- Field assumes the demo book is the product. Doctrine: auto-book without a principal is the anti-pattern.

## H. Assumptions

**His:** Vapi + n8n MCP is the stack; seven tools cover a shop; GPT-4.1 follows; 15-page PDF + Plus 2-hour is the conversion; free Vapi number is enough; outbound is a future video.

**Ours:** Captions complete enough (8187 words). Audio quality **UNVERIFIED**. Hercules is a prop, not an ICP. Clients parked. Voice vendor = `ask-principal` only. No second voice vendor (doctrine #10).

**Falsifiers:** Double-book despite the check. Wrong event ID updated. Bearer key leaks. FAQ file stale. Outbound tutorial lands and people hunt it.

**Disagreement (keep labeled):** Hive will not operate Vapi or auto-book. The **qualify → availability → confirm → ticket / handoff / log** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Does PACKET bind the 40-minute beginner as `zWLZ3bVVwD8`? Do not invent if unbound.
- What did versions 1–49 of the prompt fail at?
- Handoff to Alex — who is Alex on tape? Named only.
- Production MCP URL + bearer in a vendor — any scoped key? Not shown.

## J. Connections

- **SYSTEM SYNTHESIS** → `zWLZ3bVVwD8` (anatomy, FAQ-first, date bug, double filler, end-of-call). Confirm pair before treating as sequel.
- **SYSTEM SYNTHESIS** → `missed-call-book` (restaurant/local analog) — **HITL only**, no auto-book.
- **SYSTEM SYNTHESIS** → `ask-principal` / `confirm-then-actuate` (book / reschedule / delete).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (read-back + availability).
- **SYSTEM SYNTHESIS** → `agent-as-hire` / `slice-build` (one tool, one job).
- **SYSTEM SYNTHESIS** → doctrine `DEEP_SUMMARIES` #10 (callback / no auto-book) and #11 (no auto-dial).
- **SYSTEM SYNTHESIS** → `vFepZE_wrfg` (W+T dumb in prod; A in the chair — here A is Vapi, W+T are n8n).
- Do not unpark Normand or invent a detailing ICP.

## K. Future-Use

- Wireframe-before-prompt as a voice/HITL checklist (unassigned).
- Refuse-email → handoff as a Communications path (unassigned).
- Event-ID match as a Forge unique-key rule (unassigned).
- Disclose-AI line as a Watchdog listen-test (unassigned).
- Outbound teaser stays parked forever unless Evens names a different job (this desk).

## Steal / Operate-never

### Machine: Qualify → check availability → read-back → ticket (book stays HITL)
- **Epistemic:** SOURCE (demos + wireframe) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (inbound call or a call script) → disclose AI → qualify (email/exist/intent, or refuse → handoff) → if FAQ, answer only from file → if appointment, check availability → read-back type/time/PII → **stop** → write a booking **ticket** for Evens → log outcome. Checkable stops: identity/intent known; availability payload; spoken confirm; no calendar write without Evens.
- **Questions / signals:** “Who is this?” “What do they want?” “Is the slot actually open?” “Did they confirm?” “Human or bot?”
- **Qualify / frame / objections:** Detailing prop, not a SKU. “Can do anything” is the magnet. Objection: she booked 8am — that is his demo; auto-book is the anti-pattern. Objection: add outbound — auto-dial is never.
- **Procedure:** D steps 1–6.
- **Example that proves it:** New caller read-back → availability → 8am (his write). Return caller +1 hour needs event ID. Furious caller skips CRM and hands off. Lesson: gates are the machine; the live reserve is not.
- **Why it works:** Voice lies (STT, silence, invented hours). Gates catch it. Dumb tools stay on rails. Conditions: paper branches, one front brain, named tools, a human for the write. Exceptions: he auto-books on tape; we will not.
- **Conditions / exceptions:** Cursor + Grok only. Vapi / n8n-cloud / Twilio / Skool on tape. Clients parked. `missed-call-book` analog only as a draft ticket.
- **Operate-never payload:** Auto-book; auto-delete; auto-dial / outbound; bearer API key in a voice vendor; live Hercules number; quote seven tools / 15 pages / 2 hours / 8am / 10 numbers / 200 members as FACT.
- **Hive run (existing skills only):** `ask-principal` · `confirm-then-actuate` · `golden-test-loop` · `agent-as-hire` · `slice-build` · `missed-call-book` (HITL only) · `playbook-before-send` (if anyone ever talks script — no dial).
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Vapi / auto-book / auto-delete calendar / outbound auto-dial
- Paste instance API bearer into a voice vendor
- Quote seven tools / 15 pages / 2 hours / 8am / 10 free numbers / 200 members as FACT
- Nate Skool / Hercules / Plus as a hive SKU
- New hunt ICP. Clients parked. No Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not let Kylie reserve 8am.

- **Done** on a voice slice: wireframe + qualify + availability + read-back + a **draft ticket**. A live calendar event is not done.
- **Delegate without being asked:** HITL Operator owns the ticket; Watchdog listens for disclose-AI + filler-once; Communications does not get a number; Lead Hunter does not get outbound from the teaser.
- **Skeptical review:** “Pretty much anything” is the cold open. Seven dumb tools and a 50th prompt are the work. I will not approve a live number because the CRM row moved.
- **One system this take:** a draft booking ticket from a call script, Evens confirms. Not a live detailing number. Not outbound.
- Live hunt stays parked. I do not rotate to voice-receptionist because Hercules updated in real time.
