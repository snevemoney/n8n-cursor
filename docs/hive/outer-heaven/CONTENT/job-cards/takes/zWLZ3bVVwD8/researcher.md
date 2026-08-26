# Researcher — zWLZ3bVVwD8
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/zWLZ3bVVwD8/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/zWLZ3bVVwD8/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~1225 lines). Title: Learn Voice Agents Now, Thank Me Later (Full Beginner's Guide). Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) STT → LLM → TTS. Anatomy: model, prompt, voice, tools. Inbound / outbound / widget. Vapi+n8n “endless.” 2026 ROI slide. (2) Fresh Vapi account: Assistants + Tools. Example Riley. Model cost/latency; who-speaks-first; prompt sections (identity / persona / if-X); files; max tokens; temperature. Voice providers: Vapi / ElevenLabs / Deepgram / OpenAI. Tools: custom + end-call + transfer. (3) Template Alex / Tech Solutions → **Green Grass**. KB = upload PDF (not a vector; “like ChatGPT file”; huge KB → n8n vector later). Talk-to-assistant: returns 30-day / bulk → sales@ / gift cards; **default query tool** each answer. First pass offered billing transfer he didn’t want. (4) Blank **Hercules** booking. Native Vapi Google Calendar **check availability + create event** (not n8n-in-the-middle — he says native is easier for this first tape). Integrations: own 11Labs/OpenAI keys cheaper than Vapi markup. TZ America/Chicago. ChatGPT prompt, strip “please” (rude-study). Must **select tools** on the assistant, not only mention them. (5) Scar: first avail listed 12–5 but calendar date **2023-11-03**. Inject “today is {{now}} Chicago.” Second call: 5pm book; email confirm misspell (`nateample`); correct; event+attendee. Third: Anthropic + other voice = **slower, repeats “let me check.”** 4o cluster smoother. Loop: 5 calls → notes → ChatGPT refine. (6) Analysis: summary + structured (type / email / datetime). Messaging → n8n **POST webhook**; only end-of-call-report. **Test vs prod:** execute workflow for test URL; active + **paste production URL** or it dies. “Today” in datetime — ask full date. Empty fields if no book → say NA. Sheet append + manager Gmail. Webhook UI always looks test; active = prod. (7) Phone: 1 free, ≤10 US; inbound assign; outbound tease; Twilio import. $10 → ~18.5 credits; ~8.52 left of 10. Plus CTA. **Operate-never: Vapi, auto-book, outbound.** **Do not flatten** vs `y-cq_Qo4zVo` 7-verb MCP · `-cdexJWN8YA` ElevenLabs. 10 credits / 18.5 / 2023 bug UNVERIFIED.

## B. Atomic Knowledge

### File KB first; vector later; native calendar ≠ MCP tape
- **Claim:** Drop a policy PDF; default query. Don’t stand up Pinecone for a one-pager. For book/avail, this tape uses **Vapi native Google tools**. `y-cq_Qo4zVo` later uses seven dumb n8n verbs — keep separate.
- **Reasoning:** Beginner path is fewer hops.
- **Mechanism:** Files on the assistant; tools tab must list the two calendar tools; TZ on both tools.
- **Evidence:** Green Grass FAQ answers; Hercules 5pm event.
- **Conditions:** Vapi on-tape. Hive: no Vapi. Pattern = file-ground + confirm.
- **Exceptions:** Huge KB → n8n vector (named, not built).
- **Action:** Steal file-ground + tool-must-be-selected. Operate-never Vapi.
- **Confidence:** high as the split vs MCP tape.
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 2023 date; email spell
- **Speech ≠ behavior:** “n8n as a tool” teased; calendar is native.

### Clock and model are the first two bugs
- **Claim:** Without now+TZ the tool reads a stale calendar year. Confirm email out loud. Heavier model = latency + repeated filler. Iterate 5 calls, don’t one-shot the prompt.
- **Reasoning:** Voice “open all afternoon” was a date bug, not a calendar bug.
- **Mechanism:** `{{now}}` in additional notes; publish after every edit.
- **Evidence:** 2023-11-03; then Oct 29 tomorrow slots; 4o vs Anthropic feel.
- **Conditions:** Same family as `-cdexJWN8YA` UTC vs Central.
- **Exceptions:** Rude-to-ChatGPT is a cited study, not shown.
- **Action:** Steal now+TZ + confirm-spell. Book HITL.
- **Confidence:** high as the scar.
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 2023 window; double “let me check”
- **Speech ≠ behavior:** “confirmation email sent” — attendee add; mail not shown.

### EoC is a second pipe; test URL ≠ prod
- **Claim:** Summary + properties go to n8n webhook, not the calendar tools. Test execute vs active+production URL (same warning as `y-cq_Qo4zVo`). Structured “today” is useless in a sheet. No-book still fires — default NA. Activate webhook + swap URL.
- **Reasoning:** Logging is a different contract than booking.
- **Mechanism:** POST webhook; only end-of-call-report; append row + optional Slack/mail.
- **Evidence:** 4pm interior + `nativeample.com` in the payload; sheet row; manager mail.
- **Conditions:** Keep vs `y-cq_Qo4zVo` MCP+eoc. Vapi markup vs own keys.
- **Exceptions:** Success-eval named, not used.
- **Action:** Steal test-vs-prod + full-date property. No Vapi.
- **Confidence:** high as the plumbing.
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** “today” not a date
- **Speech ≠ behavior:** 4pm book in the eoc demo skipped the confirm dance.

## C. Mental Models
Voice is an LLM with ears. File before vector. Native tools vs MCP are different machines. Now+TZ or you book 2023. Confirm the email. EoC ≠ book. Test URL dies. Iterate five calls.

## D. Procedures
1. Anatomy: model / prompt / voice / tools. Pick inbound vs widget vs outbound (outbound operate-never).
2. KB file + “use only this.” Select tools on the assistant.
3. Inject now+TZ. Confirm spell. Publish every edit.
4. Five test calls → notes → rewrite. Watch latency when swapping models.
5. EoC: properties with full dates + NA. n8n POST. Active + **production** URL.
6. Hive: do not stand up Vapi. Map confirm+log to `private-book-install` HITL.

## E. Examples
- **Situation:** Returns Q. **Action:** default query. **Outcome:** 30-day policy. **Lesson:** file KB.
- **Situation:** Afternoon slots. **Action:** no now. **Outcome:** 2023. **Lesson:** clock.
- **Situation:** nateample. **Action:** confirm. **Outcome:** corrected + event. **Lesson:** spell.
- **Situation:** Test webhook. **Action:** must execute. **Outcome:** then swap prod. **Lesson:** two URLs.

## F. Decision Rules
- IF one PDF → file, not vector.
- IF book/avail on this tape → native tools; on `y-cq` → MCP verbs — don’t merge.
- IF slots look wrong → date/TZ first.
- IF eoc → prod URL + active.
- Refuse: Vapi; auto-book; outbound; new ICP.

## G. Contrarian
“Learn now / 2026 blow up” is the hook. Native calendar here vs “don’t put a brain in n8n” later. $10/18.5 credits. Free number is still Vapi.

## H. Assumptions
10 credits, $10→18.5, ≤10 numbers, 2023 date, 8.52 left = **UNVERIFIED**.
**Desk dissent:** vs `y-cq_Qo4zVo` MCP · `-cdexJWN8YA` ElevenLabs · `BO-jFbN4p8Y` outbound. Vapi operate-never.

## I. Questions
- Same Hercules shop as `y-cq_Qo4zVo` — upgrade path on tape?
- Did he ever add the now expression to the template Riley?
- Own-key vs Vapi markup — any $ shown?

## J. Connections
- **SYSTEM SYNTHESIS:** `y-cq_Qo4zVo` · `-cdexJWN8YA` · `BO-jFbN4p8Y`. Skills: `private-book-install` · `ask-principal` · `input-required-gate` · `golden-test-loop`.

## K. Future-Use
File-KB. Select-the-tool. Now+TZ. Confirm-spell. Five-call iterate. EoC prod URL. Native≠MCP. “Today”≠date.

## Steal / Operate-never

### Machine: file-kb-now-tz-eoc-prod
- **Epistemic:** SOURCE
- **Workflow / loop:** anatomy → file KB → select tools + TZ → inject now → 5-call iterate → confirm spell → eoc properties (full date/NA) → active + production webhook
- **Questions / signals:** What year is the tool using? Tools selected? Test or prod URL? Empty book?
- **Qualify / frame / objections:** Native calendar ≠ seven-verb MCP. Vapi is operate-never.
- **Procedure:** D.
- **Example that proves it:** 2023 slots; email confirm; Anthropic repeat; “today” in sheet.
- **Why it works:** Grounding + a clock + a log pipe that isn’t the book tool.
- **Conditions / exceptions:** Vapi on-tape. Hive book HITL only.
- **Operate-never payload:** Vapi; auto-book; outbound; new ICP.
- **Hive run (existing skills only):** `private-book-install` · `ask-principal` · `input-required-gate` · `golden-test-loop`
- **Source:** `zWLZ3bVVwD8` @ UNKNOWN

**Operate-never**
- Vapi. Auto-book. Outbound. New `icp_id`.

## L. Role-Specific Applications
Map file-KB + now/TZ + eoc-prod onto hive book/log. Keep native-vs-MCP and ElevenLabs rows unflattened. Book HITL.
