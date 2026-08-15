# LEARNED — BO-jFbN4p8Y
Protocol: deep-video-learning
Status: filled
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/full.txt`
**Desks merged:** Researcher 2026-08-14. Librarian not yet. Keep later dissent as labeled rows. Do not flatten.
**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.
**Note:** Derived from Researcher A–K + Steal after a full `full.txt` walk. Other desks add labeled rows; do not overwrite dissent.

## A. Source Map
Caption-only (`full.txt`, ~739 lines). Title: I Built a Voice Agent That Calls Every New Lead (n8n + Vapi). Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Outbound qualify after a form (surveys/reviews/reactivation named, not built). Demo form: Richard / Greengrass / lead-gen / holidays slowdown / 1-month / no AI past / **5–10k** + wants free discovery. Elliot (Vapi) discloses AI, confirms request, asks motivation/urgency/experience/budget/paid-intent, ends. Poll then Sheets: interest, motivation, urgency, past, budget, intent, complete. (2) Wireframe first: form → normalize phone → create-call → poll get-call → pickup vs voicemail. Native n8n form for the template; production would be site → webhook (UPAI). (3) Code node via Claude oneshot: incoming JSON copied; output 10-digit no punct; else `incorrect format`. If bad → log, no call. (4) Vapi assistant: GPT-4o; wait-for-user first message; system = identity/style + `{{lead_name}}` `{{lead_company_name}}` `{{lead_request}}`; wrong-number / bad-time branches; required topics; end-call toggle on (default off). Structured outputs replaced deprecated summary/success-eval; seven fields linked to this assistant. Prompt “30 minutes of testing,” expect to keep rewriting from call logs. (5) Create-call POST: bearer key, assistant ID, phone-number ID, `+1`+digits (US-assumed), `assistantOverrides` variable values. Vapi-bought numbers hit daily outbound cap → he switched to imported Twilio. Create returns initiated only → wait ~60s → GET call by id → limit first item (26-item bug) → loop 10s until `status=ended` → if `endedReason=voicemail` log callback else write structured artifacts. Structured outputs buried under `artifacts` (he calls it hard to find). School + Plus CTA. **Do not flatten** vs `y-cq_Qo4zVo` receptionist · `-cdexJWN8YA` / `zWLZ3bVVwD8` voice. Vapi = operate-never. All $ UNVERIFIED.

## B. Atomic Knowledge

### Normalize then gate; never POST a dirty number
- **Claim:** Phone formats kill the vendor call. Code node → 10 digits or `incorrect format` → If → log, don’t call.
- **Reasoning:** He could not fully control the form; Vapi fails on junk.
- **Mechanism:** Copy inbound JSON → oneshot the transform + guardrails → if-node.
- **Evidence:** Nine-digit pin demo writes incorrect-phone row.
- **Conditions:** US +1 hardcoded later. Global = country field or no hardcode.
- **Exceptions:** If the form already forces E.164, the node is thinner — not said as skip.
- **Action:** Steal normalize-then-gate. No Vapi.
- **Confidence:** high as the gate.
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** dirty-number path shown
- **Speech ≠ behavior:** “I don’t know how to code” vs the node is the product.

### Create-call ≠ get-call; poll until ended
- **Claim:** One request starts the call. A second request (GET by id) is the only way to learn ended / voicemail / structured fields. Wait ~60s first (no-answer window), then 10s loops.
- **Reasoning:** Create payload is “initiated,” not a transcript.
- **Mechanism:** POST create → wait → GET → limit 1 (26-item bug) → if not ended wait 10s → if voicemail callback-log else Sheets.
- **Evidence:** Demo still polling while they talk; 10 GET runs; earlier voicemail row.
- **Conditions:** Vapi on-tape. Hive: no Vapi poll in prod.
- **Exceptions:** none that make create return the extract.
- **Action:** Steal two-request + poll-until + voicemail split. `inbox-to-task-routing` analog, HITL.
- **Confidence:** high as the async machine.
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 26-item dump; Vapi-number daily cap
- **Speech ≠ behavior:** “automatically going to call them” vs 60s+ poll before the row exists.

### Variables + structured outputs are the qualify machine; prompt is never done
- **Claim:** Assistant prompt holds `{{vars}}`; n8n `assistantOverrides` fills name/company/request. Extract is structured outputs (status, budget, urgency, past, motivation, paid intent, …) linked per-assistant — not chat vibes. Disclose AI. Human-transfer if they demand it (named, not built).
- **Reasoning:** Voice quality = prompt + extract schema. 30-minute prompt is a draft.
- **Mechanism:** Wait-for-user open; required topics; end-call tool on; drill `artifacts.structuredOutputs`.
- **Evidence:** Richard holiday/1-month/5–10k/free-then-paid captured into columns I–N.
- **Conditions:** 5–10k / free 30-min = demo theater. **UNVERIFIED**. Not a hive price.
- **Exceptions:** He says this is not the optimal agency motion.
- **Action:** Steal var-inject + schema-extract + disclose. Operate-never: auto-dial; Vapi/Twilio.
- **Confidence:** high as the extract machine; $ UNVERIFIED.
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Vapi number cap → Twilio ID
- **Speech ≠ behavior:** “qualify before outreach” vs the tape *is* the outreach (the call).

## C. Mental Models
Wireframe before nodes. Vendor docs (create vs get) are the workflow. Phone is a hostile input. Async jobs need a ticket loop. Schema > summary paragraph. Prompt is a living object you rewrite from logs. Disclose AI. Caps hide on “free” numbers.

## D. Procedures
1. Wireframe: form → normalize → create → poll → voicemail vs extract.
2. Normalize phone; gate incorrect.
3. Assistant: disclose; vars; required topics; structured outputs linked; end-call on.
4. POST create: assistant id, from-number id, E.164, overrides.
5. Wait, GET by call id, keep first item, loop until ended.
6. Voicemail → callback log. Else map structured fields to the sheet.
7. Hive: no Vapi, no auto-dial, no School. Any live call = HITL / `ask-principal`.

## E. Examples
- **Situation:** Richard form. **Action:** Elliot call + poll. **Outcome:** holiday/1-mo/5–10k/paid-intent row. **Lesson:** extract fields you didn’t put on the form.
- **Situation:** Nine-digit pin. **Action:** code node. **Outcome:** incorrect-format log, no POST. **Lesson:** gate before vendor.
- **Situation:** Vapi-bought from-number. **Action:** outbound. **Outcome:** daily cap error. **Lesson:** “10 free numbers” ≠ unlimited outbound.
- **Situation:** Let it ring out. **Action:** endedReason=voicemail. **Outcome:** callback path. **Lesson:** ended ≠ talked.

## F. Decision Rules
- IF number ≠ 10 clean digits → log, do not call.
- IF create returns initiated → you are not done; poll.
- IF endedReason=voicemail → callback row, not a qualify.
- IF they say wrong number / not now → apologize / reschedule (prompt), don’t push topics.
- IF they want a human → transfer (named). Disclose AI always on this tape.
- Refuse: Vapi as hive SKU; auto-dial parked clients; quote 5–10k as FACT.

## G. Contrarian
Auto-call every form is the hook; he still wants you to wireframe and rewrite the prompt forever. Free Vapi numbers are the trap. Structured outputs replaced the old summary widgets — old Vapi tapes are stale on that row.

## H. Assumptions
5–10k, free 30-min, 10 free numbers, 225k School, 60s/10s, 26-item bug = **UNVERIFIED**.
**Desk dissent:** vs `y-cq_Qo4zVo` inbound receptionist · `-cdexJWN8YA` · `zWLZ3bVVwD8` · hive no-Vapi · `Pi-m8R068r4` hours-first (this tape’s 5–10k is theater).

## I. Questions
- Human-transfer actually wired on a later tape?
- Structured-output path stable after the deprecation?
- Same Elliot prompt reused on `y-cq_Qo4zVo`?

## J. Connections
- **SYSTEM SYNTHESIS:** `y-cq_Qo4zVo` · `-cdexJWN8YA` · `zWLZ3bVVwD8` · `tFFKuq2t0rI` form→draft. Skills: `warm-draft-hitl` · `ask-principal` · `inbox-to-task-routing` · `send-removed`.

## K. Future-Use
Normalize-then-gate. Create≠get. Poll-until-ended. Voicemail split. Var-inject. Structured extract. Disclose. Free-number cap.

## Stolen machines

### Machine: dirty-input-gate → async-ticket → schema-extract
- **Epistemic:** SOURCE
- **Workflow / loop:** form → normalize/gate → start job → poll until terminal state → branch voicemail vs schema → log → human follow-up
- **Questions / signals:** E.164? Initiated or ended? Voicemail? Paid-intent field present?
- **Qualify / frame / objections:** Demo 5–10k is not a price. Auto-call is the never.
- **Procedure:** D.
- **Example that proves it:** Nine-digit gate; 10-poll demo; voicemail path; artifacts buried.
- **Why it works:** Hostile phone + async vendor + schema beat “the agent just calls them.”
- **Conditions / exceptions:** Vapi/Twilio on-tape. Hive: draft/route, no dialer.
- **Operate-never payload:** Vapi; auto-dial; Twilio spend; School JSON; new ICP.
- **Hive run (existing skills only):** `warm-draft-hitl` · `inbox-to-task-routing` · `ask-principal` · `send-removed`
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN

**Operate-never**
- Vapi / Twilio auto-dial. Quote 5–10k. New `icp_id`. Switch stack. Send/pay/book.

## THINK / BEHAVE / TRICKS / USE
**Added:** 2026-08-14 last-mile. Caption-only. Visual/click UNKNOWN unless `watch.json`. Do not flatten this speaker into a hive personality.

### THINK
Decision order, what they ask before they build, what they ignore, how they choose tools, when they kill vs continue — see §C Mental Models and §F Decision Rules above. Desk that must think this way: see TAPE-WIRE-NOTES.

### BEHAVE
What they repeatedly check, skip, retry, and speech≠behavior — see §A / §E / speech≠behavior rows. Sequence-from-speech only. `multimodal-youtube-learning`: no invented clicks.

### TRICKS
Do / don’t and implicit shortcuts — see §D Procedures and Stolen machines. Shown system (files, loops, UI, offer, CTA) mapped to Cursor+Grok primitives on the named workflow. Caption-only = transcript-implied / unobserved.

### USE
Each trick lands as a desk **action** on Cursor + Grok Bot (not a quote). Operate-never on their vendors. Reproduce card: `job-cards/takes/_knowledge-use/{{slug}}.md`.
