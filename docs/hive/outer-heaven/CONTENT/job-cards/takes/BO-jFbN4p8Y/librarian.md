# Librarian — BO-jFbN4p8Y
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** I Built a Voice Agent That Calls Every New Lead
**Channel:** Nate Herk | AI Automation
**Kind:** video (~6445 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. n8n + **Vapi** outbound while you sleep. Free template. Use-cases: survey/review/reactivate; today = **auto-qualify a form**. Pretend UpAI agency. Demo form (not webhook) → HTTP "call lead" → he answers as **Richard / Green Grass gardening**. Elliot (AI, named) confirms form, motivation (holiday slowdown), 1-month urgency, no prior AI, **$5–10k** budget, free 30-min then paid scope. Agent ends. Poll → Sheet: interest/motivation/urgency/experience/budget/intent/complete.
2. Wireframe first (Plus courses CTA). Form fields → **normalize phone** (Vapi is picky) → create-call then **get-call poll** → pickup vs voicemail. Code node: paste incoming JSON into Claude; one-shot: 10 digits, no punctuation; else `incorrect format` → if-true log, don't call. He later proves 9-digit path.
3. Vapi assistant: GPT-4o; wait-for-user first (natural pickup); system prompt identity/style + `{{lead_name}}` `{{lead_company}}` `{{lead_request}}`; wrong-number / bad-time / confirm-interest / motivation / urgency / vendor-history / budget / not-endless-free; end-call tool on (default off). Prompt "~30 min," expect to tune from logs. **Structured outputs** replace deprecated summary/success-eval; reusable across assistants; must **link** each field to this agent (status, budget, urgency, past experience, motivation, paid intent, …).
4. Create-call POST: bearer, assistant ID, **phoneNumberId**. Vapi-bought numbers have **daily outbound cap** → he hit the error, switched **Twilio**. `+1` hardcoded (US-only). `assistantOverrides.variableValues` fill the curly vars. Ethics: **introduce as AI**; optional human-transfer if upset (mentioned, not built). Create returns "initiated" only → wait ~60s → GET call by id → limit-1 (Vapi **26-item bug**) → if not `ended` wait 10s loop (demo **10 polls**). Then `endedReason == voicemail` → callback row; else log artifacts.structuredOutputs (buried under artifacts; he complains it's hard to find).
5. Skool **225,000** UNVERIFIED + prompts/JSON/sheet. Green Grass / $5–10k / UpAI = parked theater.
Gap: full prompt, exact seven fields. Timestamp UNKNOWN. Vapi/n8n/Twilio/Claude on-tape.

## B. Atomic Knowledge

### Wireframe; normalize; poll twice; never auto-dial a hive lead
- **Claim:** Outbound voice is form → clean E.164 → create-call with overrides → poll until ended → branch voicemail vs structured extract. Prompt is the product; structured outputs must be linked. Vendor numbers cap; import Twilio to scale (his). Say you are AI. A bad number must not hit the API. The live call is a send.
- **Reasoning:** "While you sleep" + form-to-dial is the operate-never. The steal is normalize / two-request / poll / buried extract / introduce-as-AI.
- **Mechanism:** wireframe → Claude-written normalizer → if valid → POST call + vars → wait/poll GET → endedReason → sheet. Human before production dial.
- **Evidence:** live Richard call; Vapi daily-limit error; 26-item bug; 9-digit incorrect-format; artifacts nest.
- **Conditions:** 30-min prompt, 225k, $5–10k theater UNVERIFIED.
- **Exceptions:** Hive does not install Vapi/n8n-cloud. No auto-call. Clients parked.
- **Action:** File two-request+poll, phone-normalize, introduce-as-AI, buried-structured-out. Do not auto-dial.
- **Confidence:** high as a voice-outbound anatomy
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Vapi number cap; 26-item dump; 9-digit proof
- **Speech ≠ behavior:** "while you sleep" vs he answers his own demo; "ethics introduce as AI" vs the product is still an unattended dial

## C. Mental Models
Wireframe before nodes. Create ≠ get. Poll until ended. Prompt is the voice. Cap on free numbers. Plus/Skool room.

## D. Procedures
1. Draw form → normalize → call → poll → voicemail branch.
2. One-shot the normalizer with explicit fail string.
3. Link every structured field to the assistant.
4. Overrides for name/company/request; say you are AI.
5. Poll GET, keep first item, loop until ended.
6. Do not production-activate on a public form.
Avoid: Vapi as hive; auto-call Green Grass; n8n-cloud; 225k as FACT.

## E. Examples
**Twilio swap:** Situation — Vapi number daily limit. Action — import Twilio id. Outcome — call goes. Lesson — "10 free numbers" ≠ outbound scale.

**9-digit:** Situation — prove the code node. Action — pin, drop a digit. Outcome — incorrect format, no call. Lesson — fail closed.

## F. Decision Rules
- IF phone ≠ expected shape → log, do not POST.
- IF create-call returned → you do not have a transcript yet.
- IF endedReason is voicemail → callback row, not a fake complete.
- Refuse: auto-dial; Vapi/n8n as hive; $5–10k as analog.

## G. Contrarian
Against silent human-sounding outbound (he at least names AI). Against one-request-and-done.

## H. Assumptions
Caption-only. Complements `y-cq_Qo4zVo` / `-cdexJWN8YA` / `zWLZ3bVVwD8`. Do not flatten ethics-line vs sleep-dial.

## I. Questions
Did anyone but him get the demo call? What is the real outbound cap?

## J. Connections
SYSTEM SYNTHESIS → `AYsg5gAMWyo` poll; `ask-principal`; send = call.

## K. Future-Use
Normalize-or-don't-call + create-then-poll + introduce-as-AI as atoms.

## Steal / Operate-never

### Machine: clean the number; two requests; human before the dial
- **Epistemic:** SOURCE
- **Workflow / loop:** wireframe → normalize → HITL approve dial → POST+overrides → poll ended → voicemail vs extract
- **Questions / signals:** Valid E.164? Create or get? Ended reason? Did we say we are AI?
- **Qualify / frame / objections:** Qualification extract is learnable. Unattended outbound is not a hive job.
- **Procedure:** D above.
- **Example that proves it:** cap error; 9-digit fail-closed.
- **Why it works:** The API is two doors; the phone is a send.
- **Conditions / exceptions:** Caps UNVERIFIED. Hive does not buy Twilio for this.
- **Operate-never payload:** Auto-call every form. Vapi/n8n-cloud as hive. Green Grass hunt. 225k as FACT.
- **Hive run:** File fail-closed phone. Do not stand the dialer.
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN

### Operate-never
- Vapi / n8n-cloud as hive. Auto-dial. Quote $5–10k / 225k as FACT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Upgrade old take: add two-request, 26-item bug, introduce-as-AI. Call = send. Clients parked.
