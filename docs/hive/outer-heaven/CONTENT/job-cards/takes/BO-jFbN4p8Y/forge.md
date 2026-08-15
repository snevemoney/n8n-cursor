# Forge — BO-jFbN4p8Y
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **n8n + Vapi outbound qualifier**. Form (name/phone/email/company/role/request/size) → normalize 10-digit US (Claude-oneshot code; else log “incorrect format”) → HTTP **create call** (assistant id, Twilio number id — Vapi-bought numbers hit **daily outbound cap**) → `assistantOverrides` fill `{{lead_name}}` / company / request → wait ~60s → **GET call** poll until `status=ended` (limit first item; Vapi multi-item bug) → if `endedReason=voicemail` log callback else write **structured outputs** (interest, motivation, urgency, past AI, budget, paid-intent) to Sheets. Live: “Elliot” (GPT-4o, wait-for-hello, disclose AI) vs “Richard / Green Grass”; $5–10k + free 30 then paid — tape $ UNVERIFIED. Wireframe first. Prompt is the product; monitor + tweak. Ethics: say you’re AI; human-transfer if asked. No tools — extract only. Skool template + Plus hour-build. Timestamp UNKNOWN. Vapi / n8n / Twilio / Claude / Skool on-tape. Caption-only: dashboards unobserved beyond his words.

## B. Atomic Knowledge

### Don’t auto-call; if you ever poll a voice vendor, normalize the number and wait for `ended`
- **Claim:** The useful spine is form → clean phone → start → poll → branch voicemail vs extract. Vapi is the vendor. Free Vapi DIDs throttle outbound. Structured fields beat a transcript dump.
- **Reasoning:** Bad E.164 kills the HTTP. Create ≠ details. Disclose-AI is the ethics line he draws.
- **Mechanism:** Filter bad numbers → POST call + overrides → poll GET → sheet.
- **Evidence:** Live qualify; 9-digit → incorrect path; voicemail branch; artifacts.structuredOutputs buried.
- **Conditions:** US `+1` hardcoded. His $5–10k script is an example.
- **Exceptions:** Global numbers need a country field. Tape $ UNVERIFIED.
- **Action:** Steal normalize + poll + voicemail branch + disclose-AI. **Do not install Vapi.** Do not auto-call leads. Clients parked.
- **Confidence:** high on the spine; vendor is operate-never.
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Create ≠ get. Poll until ended. Phone is a contract. Prompt is the agent. Say you’re a machine.

## D. Procedures
1. Don’t install Vapi / Twilio-for-this. 2. Don’t auto-dial. 3. Don’t quote $5–10k. 4. Don’t send Skool. 5. Don’t skip disclose-AI if a human ever green-lights voice.

## E. Examples
**Situation:** Form has dashes/`+1`.  
**Action:** Strip to 10 or “incorrect format.”  
**Reasoning:** Vapi dies on junk.  
**Outcome:** Bad rows never call.  
**Lesson:** Normalize before the vendor.

**Situation:** Create-call returns only “initiated.”  
**Action:** Wait + GET until ended.  
**Reasoning:** Details are a second request.  
**Outcome:** Then sheet.  
**Lesson:** Poll is the product.

## F. Decision Rules
- If the job is outbound voice → refuse (Vapi).
- If a number isn’t E.164-clean → don’t call.
- If endedReason is voicemail → don’t invent a qualify.
- If tape $ appears as ours → UNVERIFIED.

## G. Contrarian
Field hides the bot. He opens as AI and still ships a qualifier — we still don’t.

## H. Assumptions
Vapi API as taped. Falsifier: we already banned Vapi. Clients parked.

## I. Questions
None. Don’t add Vapi.

## J. Connections
SYSTEM SYNTHESIS: `AYsg5gAMWyo` poll pattern. Hive rule: **Vapi operate-never**. No n8n-cloud as hive DB.

## K. Future-Use
Normalize + poll + disclose. Don’t buy Vapi.

## Steal / Operate-never

### Machine: clean the number; start; poll `ended`; branch voicemail; never install the voice vendor
- **Epistemic:** SOURCE
- **Workflow / loop:** (his) form → normalize → create → poll → sheet
- **Questions / signals:** Valid phone? Ended or VM? Did we say AI?
- **Qualify / frame / objections:** Free DID cap. Buried structured outputs.
- **Procedure:** No Vapi. No auto-dial. No $ as FACT.
- **Example that proves it:** Richard live; 9-digit reject.
- **Why it works:** The second request is the truth.
- **Conditions / exceptions:** US +1. Tape $ UNVERIFIED.
- **Operate-never payload:** Vapi; auto-call; quote $5–10k; Skool send.
- **Hive run:** none. Deploy HITL.
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN

### Operate-never
- Install Vapi. Auto-call. New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not add Vapi. I will not auto-call. Deploy HITL.
