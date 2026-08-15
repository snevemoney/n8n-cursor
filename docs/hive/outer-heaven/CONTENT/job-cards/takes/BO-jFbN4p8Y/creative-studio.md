# Creative Studio — BO-jFbN4p8Y
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: **Voice agent that calls every new lead (n8n + Vapi)**. Caption-only. Visual/click UNKNOWN. Beats: outbound qualify after form (surveys/reviews/reactivation named, not built); live mock **Richard / Green Grass** — Elliot (Vapi voice) discloses **“AI agent”**, BANT-ish (why now, timing, past AI, budget **5–10K** UNVERIFIED, paid discovery vs free 30); poll until call ended → Sheet (interest/motivation/urgency/experience/budget/intent/status); **wireframe before nodes**; normalize phone (code node via Claude oneshot: 10 digits or `incorrect format` → log, do not call); Vapi: wait-for-user-first, `{{lead_name}}` etc., structured outputs replace deprecated summary/success; HTTP create-call (assistant id, phoneNumberId, +1 hardcoded, assistantOverrides); Vapi numbers = **daily outbound cap** → he switched to Twilio after error; get-call poll (60s then 10s, status=`ended`, endedReason=`voicemail` vs assistant-ended); artifacts.structuredOutputs buried; Plus hour-long breakdown; Skool **225,000** UNVERIFIED. n8n / Vapi / Claude / Twilio / Skool on tape. **Auto-call every lead = operate-never for us.**

## B. Atomic Knowledge

### Disclose AI on the first line
- **Claim:** Outbound voice should say it is an agent. Ethics + fallback-to-human if they want a person.
- **Evidence:** “Hey, this is Elliot, an AI agent calling from Upet… I think that it’s just best practice when it comes to AI voice ethics.”
- **Conditions:** Unsolicited / form-follow-up calls.
- **Exceptions:** He allows exploring transfer-to-human; does not hide the bot in the demo.
- **Action:** If we ever script a voice, disclose. We do not run Vapi.
- **Confidence:** SOURCE.
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN (caption-only)
- **Failed / retried:** Vapi number daily-limit error → Twilio.
- **Speech ≠ behavior:** none

### Create-call ≠ get-call
- **Claim:** One POST starts the call and returns almost nothing useful. A second GET + poll is the transcript/structured fields. Voicemail is a different Sheet row, not a qualified lead.
- **Evidence:** “it takes one request to call the lead and then it takes a second request to get back the call details.” endedReason=voicemail → call-back log.
- **Conditions:** Vapi-style hosts.
- **Exceptions:** None on tape.
- **Action:** Learn the two-hop; do not operate auto-dial.
- **Confidence:** SOURCE.
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN
- **Epistemic:** SOURCE

### Bad phone never dials
- **Claim:** Parentheses/dashes/country codes crash the API. Normalize to 10 digits or write `incorrect format` and stop.
- **Evidence:** Claude oneshot from incoming JSON; nine-digit pin demo logs “incorrect phone” with empty qualify columns.
- **Conditions:** Forms you do not fully control.
- **Exceptions:** If the form forces E.164, skip the code node.
- **Action:** Gate before any call tool.
- **Confidence:** SOURCE.
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Wireframe the hops before n8n. Voice prompt is the product (30 min draft, then monitor forever). Structured outputs are reusable across assistants. Vendor free numbers are capped. +1 hardcoded = US-only assumption. Form fields are thin; the call is supposed to grow BANT.

## D. Procedures
(Learn, do not run.) Form → normalize phone → if bad, Sheet only → else create-call with overrides → wait → GET until ended → if voicemail, callback row → else map structured outputs to Sheet.
Avoid: Vapi / n8n / Twilio / Claude / Skool; auto-dial; 5–10K / 225k as FACT.

## E. Examples
**Situation:** Richard, gardening, holidays slow.  
**Action:** Elliot confirms request, why-now, 1-month, no prior AI, 5–10K, free 30 then paid.  
**Outcome:** Sheet complete.  
**Lesson:** The plate is the filled row, not the voice acting.

**Situation:** Vapi-bought number.  
**Action:** Daily outbound limit error.  
**Outcome:** Switch to imported Twilio id.  
**Lesson:** “10 free numbers” ≠ unlimited outbound.

**Situation:** Nine-digit pin.  
**Action:** Code node → incorrect format → no HTTP call.  
**Lesson:** The still of the empty qualify columns is the win.

## F. Decision Rules
- If number ≠ 10 digits → do not call.
- If create-call returns “initiated” only → poll; do not invent a transcript.
- If endedReason=voicemail → not qualified.
- If $ / 225k from this tape → UNVERIFIED.
- If the script hides that it is AI → reject.

## G. Contrarian
He says this is not “the optimal way to run an AI agency” — it is a template. Wait-for-user-first is more natural than the bot talking into silence. Buried `artifacts.structuredOutputs` is a host smell.

## H. Assumptions
5–10K budget / 225k Skool / 10 free numbers UNVERIFIED. On-tape Vapi / n8n / Claude. Clients parked. Caption-only: call audio, Sheet row, API error = unobserved.

## I. Questions
Visual of the Vapi daily-limit error? Did Richard’s 5–10K get typed as a number or a sentence? Transfer-to-human ever built?

## J. Connections
- SYSTEM SYNTHESIS → `HNKlFTd1maM` (draft-not-send; here: draft-not-dial).
- SYSTEM SYNTHESIS → `Vb1SwBAn9cQ` (tool can act, loop still broken).
- SYSTEM SYNTHESIS → `ask-principal` (call = hard step).

## K. Future-Use
Normalize-then-gate + disclose-AI as a voice ethic card. Unassigned.

## Steal / Operate-never

### Machine: wireframe → normalize → disclose → structured log (never auto-dial)
- **Epistemic:** SOURCE
- **Workflow / loop:** form → 10-digit gate → (learn) two-hop call → poll ended → voicemail vs fields → Sheet
- **Questions / signals:** Incorrect format? Daily cap? Ended reason?
- **Qualify / frame / objections:** Form is thin; call is BANT — we still do not dial
- **Procedure:** Variables in prompt; structured outputs linked to assistant; US +1 is an assumption
- **Example that proves it:** Richard row; nine-digit stop; Vapi cap → Twilio
- **Why it works:** Bad numbers and voicemail are first-class states, not crashes
- **Conditions / exceptions:** $ UNVERIFIED
- **Operate-never payload:** Vapi/n8n/Twilio/Skool; auto-call; 5–10K as FACT
- **Hive run:** `ask-principal`
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN

### Operate-never
- Auto-call leads. Install Vapi / n8n / Twilio / Claude. Join Skool.
- Hide that the caller is AI. Quote 5–10K / 225k as FACT.
- New hunt. Merge `LESSONS-FROM-TAPE.md`. Game-studio / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: plate the **Sheet row** and the **incorrect-phone empty columns**, not a cinematic robot-phone. If we ever write a voice line, disclose AI on beat one. We do not ship Vapi. HITL. Clients parked.
