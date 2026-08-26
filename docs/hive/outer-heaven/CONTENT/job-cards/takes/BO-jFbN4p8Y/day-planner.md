# Day Planner — BO-jFbN4p8Y
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: n8n + **Vapi** agent that **calls while you sleep**. Use case: outbound **lead qualification** after a form (Uppet / AI agency). Demo: Richard / Greengrass / gardening → HTTP “call lead” → Elliot discloses AI, confirms request, asks motivation / timeline / experience / budget, offers **free 30-minute discovery**, “a team member will follow up.” Wireframe first. **Normalize phone** (10 digits or `incorrect format`) before the API or the call fails. Vapi = **two requests**: start call, then **poll** until `status = ended` (~10s waits). Branch: voicemail → log “call back”; human → structured fields (interest, motivation, urgency, budget, paid intent) into a Sheet. Wait-for-user-first on pickup. Variables `{{lead_name}}` etc. in the Vapi prompt. Pin dummy JSON to test the code node without more calls. Close: Skool templates. Caption-only. Timestamp UNKNOWN. Clients parked.

## B. Atomic Knowledge
### Auto-dial is never; poll-until-ended and fail-closed phone are the steal
- **Claim:** Form → instant call is a sleep dialer. The useful spine is: wireframe → normalize or stop → poll until a real end reason → log, then a human. Structured output lives buried under `artifacts` and is easy to miss.
- **Reasoning:** Wrong-number / voicemail / “not a good time” must end, not loop. Disclose AI. Book stays Evens. Same poll family as Fireflies wait-until-field.
- **Mechanism:** Draft qual questions → dummy form → never arm HTTP call → if we ever log, fail-closed on format → human follow-up only.
- **Evidence:** “automatically going to call them” / “infinite polling loop until status equals ended” / “I am going to delete that path because I don’t want to make more calls.”
- **Conditions:** Dummy numbers only. Clients parked.
- **Exceptions:** Vapi / Uppet / free 30-minute / Skool = magnet. Member counts UNVERIFIED.
- **Action:** Steal poll-until-ended + fail-closed-format + disclose-then-human. Do not Vapi. Do not auto-dial.
- **Confidence:** high as the sleep-call never.
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** voicemail branch; nine-digit pin test → incorrect format
- **Speech ≠ behavior:** “while you sleep” vs he deletes the call path to avoid more dials

## C. Mental Models
A phone API is two hops (start + poll), not one. Priority: never arm the first hop. Uncertainty: 225k members.

## D. Procedures
1. Whiteboard: trigger → normalize → (HITL) → log. Do not draw “call.”
2. Phone format fail-closed before any API.
3. Poll until a terminal status; branch voicemail vs human.
4. Qual sheet is a draft. Discovery book is Evens.
5. Pin dummy JSON so you do not re-dial to test.
Avoid: Vapi; auto-dial; auto-book 30-minute; Skool; unpark.

## E. Examples
**Richard demo:** Situation → form fire. Action → Elliot calls, qualifies, offers free 30. Reasoning → sleep dialer. Outcome → operate-never. Lesson → steal the log, not the ring.

**Nine-digit pin:** Situation → he does not want more calls. Action → pin, drop a digit. Reasoning → fail-closed. Outcome → Sheet row “incorrect phone.” Lesson → steal the pin-test.

## F. Decision Rules
- IF the next node can ring a human → delete the path.
- IF format ≠ 10 digits → log and stop.
- IF ended reason = voicemail → do not loop-call.
- IF the script offers a calendar → that is a book.

## G. Contrarian
Rejects “call every new lead.” Field: speed-to-lead. He still hands to a human after qualify. We never dial.

## H. Assumptions
Theirs: form intent = consent to an AI call. Ours: book/call stay HITL. Falsifier: a live number in the form. Survivorship: one mock Richard.

## I. Questions
Same poll-until-field as `KGXFkUlBHxw`? Same auto-dial never as `-Lo_SlSgtnA` / `7siRW0My05o`?

## J. Connections
- SYSTEM SYNTHESIS → `-Lo_SlSgtnA` · `7siRW0My05o` · `Qt3zMBH-FNg` (never voice+calendar).

## K. Future-Use
Fail-closed phone. Poll-until-ended. Unassigned: Vapi.

## Steal / Operate-never

### Machine: wireframe → normalize-or-stop → poll-until-ended → log → human (never dial)
- **Epistemic:** SOURCE
- **Workflow / loop:** draft qual fields → dummy submit → pin-test format → stop before HTTP call
- **Questions / signals:** Can this node ring? Is status ended? Voicemail or human?
- **Qualify / frame / objections:** Sleep-call is the fail. Log-then-human is the pass.
- **Procedure:** No Vapi. No auto-dial. No discovery book. No Skool.
- **Example that proves it:** Situation → more tests needed. Action → delete call path, pin JSON. Reasoning → each execute is a ring. Outcome → format branch only. Lesson → steal the pin, not the dialer.
- **Why it works:** Ended-reason and a nine-digit fail are checkable; “while you sleep” is a magnet.
- **Conditions / exceptions:** Clients parked. Tape $ / member counts UNVERIFIED.
- **Operate-never payload:** Vapi; auto-dial; auto-book 30-minute; quote 225k as FACT; Skool; unpark.
- **Hive run (existing skills only):** `ask-principal` · `send-removed`.
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN

### Operate-never
- Vapi / auto-dial / auto-book / Skool / quote members as FACT / unpark.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as auto-dial-never + poll-until-ended. Clients parked.
