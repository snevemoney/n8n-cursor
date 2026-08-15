# Big Boss — glM8godEcic
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/glM8godEcic/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/glM8godEcic/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Short (PACKET: 2:14, 484 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt`. Visual-only gaps: Vapi (“Vappy”) NAND tool, seven n8n workflows, live calendar left / CRM right, the call itself. ASR: Naden/NAND, Vappy, nate@acample.com, Natek, Hercules Detailing, Kylie. Caption cuts on the CTA.

Beats, in order:

1. Hook: “This n8n MCP server powers my entire voice agent.”
2. Split: front end Vapi, back end n8n. Question: how do they connect?
3. In Vapi, the assistant has one tool: n8n. That tool is “our MCP server with all seven of these workflows.”
4. Seven named tools, each “one very specific function”: client lookup, new client CRM, check availability, book event, update appointment, lookup appointment, delete appointment.
5. Claim: Vapi + MCP “figure out which one to call” and “get answers back so quick.”
6. He tiles calendar (left) and CRM (right) to watch live updates.
7. Demo call: “give Kylie a ring.” Kylie = Hercules Detailing receptionist.
8. Kylie asks for email to look him up. He is a new caller, not in the system.
9. She asks email, full name, phone. He gives nate@acample.com, Natek (K at the end), 3334445678.
10. She reads back email/name/phone. He confirms. She says she will “send that in and get your profile set up.”
11. He asks for interior detailing tomorrow. She lists taken slots (10:15–11:15, 2–3) and open hour slots. He picks 8 a.m.
12. She confirms: interior, tomorrow, 8 a.m., “spot is reserved.” Offers to change later.
13. CTA: play button to the full breakdown (caption cuts).

Off-topic / not skipped: fake email/phone; “Natek with a K”; Hercules as the shop; delete-appointment exists and is unused.

## B. Atomic Knowledge

### One tool, one function
- **Claim:** Seven n8n workflows sit behind one Vapi MCP tool. Each workflow does one job (lookup, create, availability, book, update, lookup appt, delete).
- **Reasoning:** The model picks which function; it does not get a swiss-army workflow.
- **Mechanism:** MCP server exposes the seven. Vapi calls one at a time.
- **Evidence:** He lists all seven by name. Demo uses new-client + availability + book (inferred from the talk, not a debug log).
- **Conditions:** Names are specific. Overlap (lookup client vs lookup appointment) is still two tools.
- **Exceptions:** We do not see a wrong-tool call or a delete.
- **Action:** Steal one-function tools. Do not install Vapi/MCP as the hive OS.
- **Confidence:** high for the list; medium for which three actually fired
- **Source:** `glM8godEcic` @ UNKNOWN — “each tool has one very specific function”
- **Epistemic:** SOURCE

### Confirm-before-write
- **Claim:** Kylie reads back email, name, and phone and waits for “that’s all correct” before “send that in.”
- **Reasoning:** ASR will mangle (acample / Natek). Read-back is the gate.
- **Mechanism:** Collect → read-back → confirm → then CRM write (on his telling).
- **Evidence:** Spoken confirm. CRM/calendar tiles promised, not described after the book.
- **Conditions:** Works if the agent actually waits. Fails if it writes on the first hear.
- **Exceptions:** He does not show a corrected read-back (the interesting fail).
- **Action:** Confirm is the checkable stop. Auto-book without read-back is operate-never.
- **Confidence:** high that she read back
- **Source:** `glM8godEcic` @ UNKNOWN — “Just to confirm, your email is nateample.com… Right? That’s all correct.”
- **Epistemic:** SOURCE

### Availability then pick, not “you’re booked”
- **Claim:** She states taken windows and that other hour slots are open; he chooses 8 a.m.; then she reserves.
- **Reasoning:** The human picks the slot. The agent does not assign one.
- **Mechanism:** check availability → list conflicts → human pick → book event.
- **Evidence:** 10:15–11:15 and 2–3 taken; 8 a.m. chosen. Live calendar **UNVERIFIED**.
- **Conditions:** Inventory is real. On a demo it can be staged.
- **Exceptions:** Delete/update tools exist for later change; not run.
- **Action:** Steal list-then-pick. No auto-book. `missed-call-book` analog only if Evens names a local — still HITL.
- **Confidence:** high for the talk track
- **Source:** `glM8godEcic` @ UNKNOWN — “every other hourlong slot during the day is open. Yeah, let’s do an 8 a.m. slot.”
- **Epistemic:** SOURCE

### Front/back split is the architecture, not the SKU
- **Claim:** Vapi is the voice front; n8n is the back; MCP is the socket.
- **Reasoning:** He opens with “how do we actually connect these two things?”
- **Mechanism:** One assistant tool named n8n pointing at the MCP server.
- **Evidence:** Spoken. No auth/security review.
- **Conditions:** Both vendors up. Hive stack is neither.
- **Exceptions:** “Entire voice agent” is a magnet. Seven workflows is not “entire business.”
- **Action:** Learn the socket idea. Do not stand up Vapi.
- **Confidence:** high for his split
- **Source:** `glM8godEcic` @ UNKNOWN — “front end with Vappy and… back end with Naden”
- **Epistemic:** SOURCE

## C. Mental Models

- **Named functions beat a blob agent.** Seven nouns, one each. **SOURCE**
- **Live tiles are the proof.** Calendar + CRM “in real time” is the demo theater. **SOURCE**
- **New caller is a first-class path.** Not-in-system → collect three fields. **SOURCE**
- **Read-back is politeness and a checksum.** **SOURCE**
- **Speed is a feature** (“answers back so quick”). Unmeasured. **SOURCE** / speed UNVERIFIED
- **Hercules Detailing is a prop shop, not an ICP we unpark.** **INFERENCE**
- **Fake PII is still a send/book demo.** Doctrine 7 applies. **SYSTEM SYNTHESIS**

## D. Procedures

1. **Name the functions** before the call (lookup, create, availability, book, update, lookup-appt, delete). One job each.
2. **New vs existing:** if lookup misses, collect email + full name + phone. Do not skip create.
3. **Read back** all three. Wait for yes. If no, correct. Do not write yet.
4. **Need:** service + day (interior, tomorrow).
5. **Availability:** speak taken slots and the open rule. Do not assign.
6. **Human picks** a slot. Then book. Say the reservation out loud.
7. **Offer change** (update/delete exist). Do not run them unless asked.
8. **Hive stop:** this entire call is operate-never to run. Steal the gates only. Voice vendor = `ask-principal`. No auto-book.

**Qualify / frame:** voice receptionist demo. Hercules is a prop. Fake email/phone.
**Objections:** “It booked 8 a.m.” — that is the hard step we will not operate. “MCP is cool” — not our stack.
**Avoid:** Vapi / n8n-cloud / auto-dial. Cursor + Grok only.
**When to change:** if read-back is skipped, kill the write. If the model invents a slot, kill the book.

## E. Examples

**Situation:** Voice front needs a back end.  
**Action:** One Vapi tool → MCP → seven one-function n8n workflows.  
**Reasoning:** The model should pick a noun, not invent HTTP.  
**Outcome:** Architecture claimed; auth unshown.  
**Lesson:** One function per tool. Implicit rule: a blob “do the CRM” tool is the fail.

**Situation:** New caller, not in CRM.  
**Action:** Ask email to lookup → miss → collect email, name, phone → read back → confirm → then “send that in.”  
**Reasoning:** Lookup before create; confirm before write.  
**Outcome:** Profile “set up” on his telling. CRM tile **UNVERIFIED**.  
**Lesson:** Confirm-before-write. Implicit rule: ASR will mangle the email (it already did in captions).

**Situation:** He wants interior tomorrow.  
**Action:** She lists two taken windows, says other hour slots are open; he picks 8 a.m.; she reserves and offers later changes.  
**Reasoning:** Inventory then pick then book.  
**Outcome:** Appointment claimed. Calendar tile **UNVERIFIED**.  
**Lesson:** List-then-pick. Implicit rule: “you’re all set” without a spoken pick is auto-book — operate-never.

## F. Decision Rules

- If a tool does two jobs → split it.
- If lookup misses → create path, do not pretend they exist.
- If write/book is next → read-back first.
- If availability is next → list conflicts; human picks.
- If the demo tiles “live CRM” → still require a human-opened receipt (doctrine 6).
- Optimize: seven nouns, two gates (confirm, pick).
- Refuse: Vapi install; auto-dial; auto-book; unpark a detailing ICP.

## G. Contrarian

- Against one “voice agent” workflow that does everything.
- Against booking on the first hear of a time.
- Against front-end-only voice (he insists on a back-end of named tools).
- Field assumes the short is a product we should run. It is a vendor sandwich we will not operate.

## H. Assumptions

**His:** Vapi + n8n MCP is the right split; seven is the right cut; Kylie sounds good enough; live tiles prove writes; fake PII is fine; “so quick” is a benefit.

**Ours:** 484 words, ASR emails mashed. Book/CRM/calendar **UNVERIFIED**. Domain-specific: YouTube detailing prop, not Montreal `local-pro`. Voice vendors on-tape only.

**Falsifiers:** MCP called the wrong tool. Read-back skipped in the real workflow. 8 a.m. was always free because the calendar is fake. Delete tool can wipe a day.

**Disagreement (keep labeled):** Hive will not operate this receptionist. The **one-function tools**, **confirm-before-write**, and **list-then-pick** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Which of the seven actually fired? No log on the short.
- Did the CRM/calendar tiles move? He promised we would see; captions do not describe a change.
- Sibling long `y-cq_Qo4zVo` — confirm bind.
- What happens on a bad read-back? Not shown.

## J. Connections

- **SYSTEM SYNTHESIS** → `UCKLHU5AkEM` (Gemini speech-to-speech). Model vs this booking graph. Do not fuse into one SKU.
- **SYSTEM SYNTHESIS** → `missed-call-book` / `private-book-install`: HITL book only if Evens names a local.
- **SYSTEM SYNTHESIS** → `agent-job-card` / `interview-to-desk`: one job per desk, same as one function per tool.
- **SYSTEM SYNTHESIS** → doctrine 7: the demo sends/books. Architecture must remove send, not prose-never it.
- **SYSTEM SYNTHESIS** → `ask-principal`: Vapi is a voice vendor ask, not a default.
- Do not unpark Normand or invent `hercules-detailing`.

## K. Future-Use

- Seven-noun cut as a Forge checklist for any “receptionist” (unassigned, still operate-never to run).
- Read-back as HITL card string practice: ACTION/WHY/AGENT/RISK/REVERSIBILITY (unassigned).
- Delete-appointment as a Watchdog “reversibility” example (unassigned).
- Live dual-tile proof as Creative walkthrough theater (unassigned).

## Steal / Operate-never

### Machine: One-function tools + confirm-before-write + list-then-pick
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (inbound call — we will not dial) → lookup → if miss, collect email/name/phone → read-back → confirm → create → need + day → list taken/open → human picks → book (HITL / we stop) → offer update/delete.
- **Questions / signals:** “Are they in the system?” “Did we read back?” “Did they pick the slot?” “Which one function is this?”
- **Qualify / frame / objections:** Prop detailing shop. Objection: “it booked” — that is why we steal the gates and refuse the run. Objection: “MCP is the future” — not our stack.
- **Procedure:** D steps 1–8. Checkable stops: (1) tools are nouns, (2) confirm before write, (3) pick before book, (4) no vendor installed, (5) no live hunt.
- **Example that proves it:** New caller Nate/K → read-back → interior tomorrow → taken slots listed → 8 a.m. picked → reserved. Lesson: the gates are the machine; Kylie is not.
- **Why it works:** ASR lies. Blob tools lie. Assigned slots feel magical and skip consent. Conditions: named functions, a human on the line, inventory that exists. Exceptions: tiles unverified; delete unused; fake PII; we will not operate the call.
- **Conditions / exceptions:** Cursor + Grok only (Vapi / n8n-cloud stay on tape). No auto-dial, no auto-book. Clients parked. Hercules is a prop.
- **Operate-never payload:** Run Kylie; Vapi install; auto-book; detailing hunt; quote speed as FACT.
- **Hive run (existing skills only):** `agent-job-card` (one function) · `interview-to-desk` · `ask-principal` (voice vendor) · `missed-call-book` / `private-book-install` (HITL only, named client) · `golden-test-loop` (read-back as the check) · doctrine 7 send-removal.
- **Source:** `glM8godEcic` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Vapi / n8n MCP receptionist; auto-dial; auto-book
- New `icp_id` / unpark Normand / Hercules or detailing hunt
- Quote “so quick” or any $ as FACT
- Install Claude / Codex / ChatGPT / Gemini / Coda / Abacus / Skool
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not ring Kylie.

- **Done** on a voice-teach slice: functions named as nouns + confirm gate + pick gate written. A reserved 8 a.m. on his calendar is not done for us.
- **Delegate without being asked:** HITL owns any future voice-vendor ask; Watchdog treats live tiles as unverified until opened; Lead Hunter does not hunt detailers; I do not add a lane.
- **Skeptical review:** “Powers my entire voice agent” is the short’s job. I will not approve MCP + Vapi because a fake Nate booked interior.
- **One system this take:** write the three gates. Not a receptionist product.
- Live hunt stays parked. I do not rotate to auto-detailing because the CRM tile moved (if it did).
