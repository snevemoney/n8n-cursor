# Researcher — y-cq_Qo4zVo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/y-cq_Qo4zVo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/y-cq_Qo4zVo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~891 lines). Title: AI Voice Receptionist with Vapi and n8n MCP. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Kylie / Hercules Detailing. Vapi front + n8n MCP **seven** workflows. Demo: new caller Nate (`nateample.com`, 333-444-5678) → account + interior tomorrow 8am (busy 10:15–11:15, 2–3). Call 2: lookup → bump +1h → 9am Dec 7. End-of-call: summary + outcome booked/rescheduled. (2) Edit insert: **always disclose AI** (“I am Kylie, an AI assistant”) — interruptions/etiquette never perfect. (3) Wireframe first: inbound → email lookup → exist vs create CRM → merge intent (FAQ / book / change / delete / transfer sales|support) → KB loop · avail before book · lookup+avail before change · lookup before delete → CRM activity → end → call log. First design: two mega webhooks (CRM vs appointment) + intent switch; **abandoned** — webhook response + param sprawl. MCP instead. (4) Vapi: GPT-4.1 > 4 at following; first message asks email; ~50th prompt; generate-edits (sarcastic demo discarded). **No AI in n8n backends** — Vapi is the brain; second brain = latency+cost+error. Tools: client lookup, new client, check avail, book, update, lookup appt, delete. (5) MCP wire: production URL + `Authorization: Bearer <n8n API key>` + **SSE not streamable HTTP**. Prompt: lowercase email; speak before tool (kill silence); confirm spelling before write. Avail: now→23:59:59 today; future = whole day; tell busy windows not event titles; 1h duration. (6) Handoff tool: transfer-call = phone; handoff = other Vapi assistant (support/sales/Alex); multi-destination. Angry caller no-email → support. (7) KB: upload FAQ PDF; “default query tool” (not a named tool). Don’t invent. (8) Why MCP: schemas travel with workflows; custom tools would duplicate params in two places. (9) Call log: Vapi server settings → n8n webhook **production** (active=prod even if UI shows test); server message = end-of-call report; analysis summary 2–3 sentences + structured `outcome`. (10) Phone: free Vapi US numbers ≤10/account; assign inbound; outbound tease. Skool zip + 15-page guide; Plus 2h build. **Operate-never: Vapi.** **Do not flatten** vs `-cdexJWN8YA` ElevenLabs · `zWLZ3bVVwD8` · `BO-jFbN4p8Y`. 50th prompt / 7 tools UNVERIFIED.

## B. Atomic Knowledge

### Voice brain once; backends are dumb verbs
- **Claim:** Don’t put an n8n AI agent behind Vapi. Seven one-job workflows. MCP picks the verb from descriptions. Double-brain = double latency and errors.
- **Reasoning:** The receptionist prompt already reasons.
- **Mechanism:** MCP trigger + production URL + Bearer + SSE.
- **Evidence:** Lookup empty → “new client”; lookup hit + no appts; avail empty day; book writes calendar + sheet.
- **Conditions:** Vapi+n8n on-tape. Hive: no Vapi. Pattern maps to `inbox-to-task-routing` verbs, not voice.
- **Exceptions:** Handoff is a Vapi-native tool, not MCP.
- **Action:** Steal one-brain + dumb verbs. Operate-never Vapi.
- **Confidence:** high as the architecture.
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** two-webhook design abandoned
- **Speech ≠ behavior:** “pretty much anything” vs seven verbs + FAQ file.

### Wireframe + speak-before-tool + confirm-before-write
- **Claim:** Draw if-X-then-Y before the prompt. Always talk while the tool runs. Confirm email/name before CRM write. Lowercase email. Disclose AI (post-edit).
- **Reasoning:** Voice silence and bad writes are the product failures.
- **Mechanism:** Script blocks in the system prompt; generate-to-edit then accept/discard.
- **Evidence:** New-user confirm; reschedule confirm; “let me check.”
- **Conditions:** 50th version — iterate is the method.
- **Exceptions:** Transfer can skip email if they refuse.
- **Action:** Steal wireframe + confirm-before-write. Clients parked.
- **Confidence:** high as the voice hygiene.
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** “buddy” he didn’t love
- **Speech ≠ behavior:** First-message does **not** disclose AI in the live demo; the disclose rule is an edit-room insert.

### MCP schemas beat dual-maintained webhooks
- **Claim:** Custom Vapi tools need per-verb params (book vs change vs delete). Change the backend twice. MCP reads workflow inputs. End-of-call = separate **webhook**, not MCP (summary + outcome).
- **Reasoning:** Appointment verbs share a calendar but not a payload.
- **Mechanism:** Active webhook = production URL; only `end-of-call-report` selected.
- **Evidence:** Event ID is the join key for update/delete/sheet notes.
- **Conditions:** Keep vs `-cdexJWN8YA` direct cal.com (no n8n).
- **Exceptions:** KB is a file + default query, not MCP.
- **Action:** Steal schema-on-the-workflow + event-id join. No Vapi.
- **Confidence:** high as the refactor scar.
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** webhook+intent over-build
- **Speech ≠ behavior:** “Hercules open 24 hours” — prompt gap he laughs at.

## C. Mental Models
Wireframe before prompt. One brain. Seven verbs. MCP carries schema. Speak in the gap. Confirm then write. Event ID joins the log. Disclose AI (even if the demo didn’t). End-of-call is a different pipe.

## D. Procedures
1. Box the paths: lookup / create / FAQ / book / change / delete / handoff / log.
2. One-job workflows, no AI nodes. Descriptions = when-to-call.
3. Prompt: disclose; speak before tools; lowercase email; confirm writes; avail windows; 1h length.
4. MCP: prod URL, Bearer, SSE.
5. KB file + “use only this.” Handoff destinations with when-to.
6. Messaging: end-of-call report → logger webhook (prod).
7. Hive: do not stand up Vapi. Map verbs to HITL book/inbox. Clients parked.

## E. Examples
- **Situation:** New Nate. **Action:** lookup miss → create → avail → 8am. **Outcome:** booked. **Lesson:** two verbs.
- **Situation:** Move +1h. **Action:** avail + lookup ID + update. **Outcome:** 9am notes. **Lesson:** event ID.
- **Situation:** Furious no-email. **Action:** handoff support. **Outcome:** other assistant. **Lesson:** skip CRM.
- **Situation:** Two webhooks. **Action:** abandoned. **Outcome:** MCP. **Lesson:** schema once.

## F. Decision Rules
- IF second AI in n8n → cut it.
- IF params differ per verb → MCP or you’ll edit twice.
- IF silence while tooling → force a spoken filler.
- IF they refuse email → still allow handoff.
- Refuse: Vapi; auto-book; outbound (other tape); new ICP.

## G. Contrarian
Demo first-message skips the AI disclose he later demands. Fake detailing shop. Plus 2h build is the real product. “Free Vapi number” is still Vapi.

## H. Assumptions
50th prompt, 7 workflows, 15-page guide, ≤10 numbers = **UNVERIFIED**.
**Desk dissent:** vs `-cdexJWN8YA` ElevenLabs one-hop · `zWLZ3bVVwD8` beginner · `BO-jFbN4p8Y` outbound. Vapi operate-never. Hive Cursor+Grok.

## I. Questions
- Same 7-verb MCP as other Nate MCP tapes?
- Did production webhook vs test bite anyone on tape? He warns; no fail shown.
- Disclose: did he ever re-record the first message?

## J. Connections
- **SYSTEM SYNTHESIS:** `-cdexJWN8YA` · `zWLZ3bVVwD8` · `BO-jFbN4p8Y` · assigned 7-verb MCP tapes. Skills: `private-book-install` · `inbox-to-task-routing` · `ask-principal` · `input-required-gate`.

## K. Future-Use
One-brain. Dumb verbs. Wireframe-first. Speak-before-tool. Confirm-before-write. MCP schema. Event-id join. Disclose≠demo. End-of-call separate.

## Steal / Operate-never

### Machine: wireframe-one-brain-seven-verbs
- **Epistemic:** SOURCE
- **Workflow / loop:** paths on paper → one-job workflows → MCP descriptions → prompt fillers+confirms → KB file → handoff table → eoc webhook log
- **Questions / signals:** Second brain? Params in two places? Silence? Event ID?
- **Qualify / frame / objections:** ElevenLabs-direct is a different machine. Vapi is operate-never.
- **Procedure:** D.
- **Example that proves it:** two-webhook abandon; 8am book; 9am move; no-email handoff.
- **Why it works:** The voice model decides; the backend is a verb list with a join key.
- **Conditions / exceptions:** Vapi on-tape. Hive: verb pattern only.
- **Operate-never payload:** Vapi; auto-book; outbound; new ICP.
- **Hive run (existing skills only):** `private-book-install` · `inbox-to-task-routing` · `ask-principal` · `input-required-gate`
- **Source:** `y-cq_Qo4zVo` @ UNKNOWN

**Operate-never**
- Vapi. Auto-book. Outbound voice. New `icp_id`. Switch stack.

## L. Role-Specific Applications
Map one-brain + dumb verbs + confirm-before-write onto hive book/inbox. Keep ElevenLabs vs Vapi unflattened. Disclose-vs-demo labeled. Book HITL.
