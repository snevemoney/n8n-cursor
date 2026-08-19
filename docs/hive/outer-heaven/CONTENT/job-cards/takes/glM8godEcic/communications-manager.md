# Communications Manager — glM8godEcic
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/glM8godEcic/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/glM8godEcic/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** I Built an AI Voice Receptionist with Vapi and n8n MCP
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** short · 484 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Front end Vapi, back end n8n; Vapi tool = n8n MCP server with seven one-function workflows: client lookup, new client CRM, check availability, book event, update appointment, lookup appointment, delete appointment.
- Each tool one function; Vapi+MCP pick which to call.
- Live call to Kylie / Hercules: asks email to look up; new caller; collects email, full name, phone; confirms; sets up profile; interior detailing tomorrow; reads taken slots; books 8am.
- CTA: full. Long-form `y-cq_Qo4zVo`.

## B. Atomic Knowledge

### One function per tool
- **Claim:** Seven n8n workflows, each one job; MCP lets the voice agent pick.
- **Reasoning:** Specific functions beat a god-tool.
- **Mechanism:** Vapi NAND/n8n tool → seven named workflows.
- **Evidence:** “each tool has one very specific function.”
- **Conditions:** MCP server lists those seven.
- **Exceptions:** Book/delete/CRM-write are hard steps. One-function is the steal; write tools are the never.
- **Action:** Steal the split. Do not expose book/delete to an auto agent.
- **Confidence:** high
- **Source:** `glM8godEcic` @ UNKNOWN
- **Epistemic:** SOURCE

### New-caller path collects PII then books
- **Claim:** New caller: email, full name, phone, confirm, CRM setup, then availability + book.
- **Reasoning:** Lookup-first, then create, then book.
- **Mechanism:** Spoken confirm of email/name/phone before write.
- **Evidence:** Kylie call; nate@acample.com; 333-444-5678; 8am interior.
- **Conditions:** Demo Hercules.
- **Exceptions:** Spoken confirm is good; auto-CRM + auto-book is still operate-never.
- **Action:** Draft a human confirm. Do not auto-write CRM or calendar.
- **Confidence:** high
- **Source:** `glM8godEcic` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- One-function tools. **SOURCE**
- Confirm-back the PII before write. **SOURCE**
- Voice receptionist that books is a hard-step machine. **SYSTEM SYNTHESIS**

## D. Procedures
- Lookup → if new, collect+confirm PII → availability → book. **SOURCE**
- This desk: confirm PII on a card; human writes CRM/calendar. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** New caller, wants tomorrow interior. → **Action:** Seven one-function tools; confirm PII; book 8am. → **Reasoning:** MCP picks the tool. → **Outcome:** Profile + reservation. → **Lesson:** Split functions; confirm PII. Implicit rule: delete-appointment existing means a voice can also destroy.

## F. Decision Rules
- If a tool writes CRM/calendar/delete → human.
- If PII is not read back → do not write.
- Refuse: Vapi. Auto-book. Auto-CRM. Voice-delete.
- Optimize: one-function draft tools only.

## G. Contrarian
- Field wants one god voice agent. He splits seven. We still will not let it book. **SYSTEM SYNTHESIS**

## H. Assumptions
- Vapi+n8n MCP on-tape. Fake phone. Falsifier: wrong-person CRM write.

## I. Questions
- Is delete actually reachable in production or only in the list?

## J. Connections
- **SYSTEM SYNTHESIS:** `y-cq_Qo4zVo` · `G9Ho8n4lD6I` · `BO-jFbN4p8Y`. `ask-principal`.

## K. Future-Use
- One-function split as an architecture note for any “inbox agent.”

## Steal / Operate-never

### Machine: One function per tool; write/book/delete stay human
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Call/inbound → lookup draft → if new, collect+read-back PII on a card → **stop**. Human books. No Vapi. No delete tool live.
- **Questions / signals:** Which function? Did we read back PII? Can it delete?
- **Qualify / frame / objections:** Qualify: lookup vs write. Frame: one function. Objection: “Kylie booked 8am” → operate-never.
- **Procedure:** 1) Split tools. 2) Confirm PII. 3) Unplug book/delete. 4) Do not send confirmations.
- **Example that proves it:** Kylie new-caller path to 8am book.
- **Why it works:** God-tools mis-call. Write tools without HITL mint bad appointments and bad CRM rows.
- **Conditions / exceptions:** Voice+MCP receptionists. Exceptions: none for auto-book.
- **Operate-never payload:** Vapi. Auto-book. Auto-CRM. Voice-delete. Auto-confirm.
- **Hive run (existing skills only):** `ask-principal` · `warm-draft-hitl` · `send-removed`.
- **Source:** `glM8godEcic` @ UNKNOWN


### Operate-never (this desk will not operate)
- Vapi. Auto-book/CRM/delete. Voice confirm email.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I may draft a lookup script. I do not book. I do not write CRM. Clients parked.
