# Librarian — -Lo_SlSgtnA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Lo_SlSgtnA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Lo_SlSgtnA/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** This Voice Agent Calls and Qualifies All Your Leads
**Channel:** Nate Herk | AI Automation
**Kind:** short (~2:45 / ~622 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Hook: agent that calls people while you sleep.
2. Pretend: AI automation agency site; form submit → auto-call, qualify, extra questions, intent, log — so you know more before outreach.
3. Practice: UPAI form → webhook in n8n. Demo uses native n8n form trigger so the template works.
4. Execute: mock Richard / phone / email / company / role / request / company size; HTTP "call lead" fires a phone call.
5. Call: Elliot from "up"; "Richard with Greengrass?"; thanks for the form; fit questions; gardening lead-gen automation; why now (holidays slow; stopped outreach); how soon (within a month).
6. Row pops: Richard / Green Grass / request / size / interest / motivation / urgency / past experience / budget / intent / status complete.
7. Claim: qualified beyond the form; now you have more to reach out and work with them.
8. CTA: full breakdown.
Gap: Vapi wiring, budget/intent capture not in the spoken clip. Timestamp UNKNOWN. Auto-dial. $ / UPAI on-tape.

## B. Atomic Knowledge

### Form → call → qualify → log before human outreach
- **Claim:** Form submit triggers a call that asks extra questions and writes a richer row so a human can outreach later.
- **Reasoning:** Sleep-call is the hook; the keep is log-before-outreach.
- **Mechanism:** Form (or webhook) → HTTP call-lead → voice qualify → sheet row + status complete.
- **Evidence:** "log all of that information so that you know way more about this prospect before you actually make your outreach"
- **Conditions:** Phone number on the form
- **Exceptions:** Demo uses native form, not the site webhook
- **Action:** File log-before-outreach; operate-never the auto-call
- **Confidence:** high as his loop
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN
- **Epistemic:** SOURCE

### Demo form ≠ production webhook
- **Claim:** Production would be site form → webhook; demo uses n8n form so the template works.
- **Evidence:** "for the sake of the demo and just so I can give you guys a template that works we are going to just be using a native NAN form submission trigger"
- **Action:** Persist demo-vs-prod; do not treat the template as the live door
- **Confidence:** high
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
The form is thin; the call thickens it. Status complete means the robot finished, not that a human should skip judgment. "While you sleep" is the payload. Gardening/Green Grass is mock.

## D. Procedures
On-tape: form fields → call-lead HTTP → voice: confirm identity, restated request, why now, how soon → write interest/motivation/urgency/budget/intent → complete. Hive: do not dial. Signals: row appears during the call.

## E. Examples
**Richard / Green Grass:** Situation — mock form for gardening lead-gen. Action — auto-call Elliot; why now / how soon. Reasoning — qualify beyond the form. Outcome — row with motivation (holidays/slow outreach) and urgency (one month). Lesson — thicker row is the steal; the dial is never.

## F. Decision Rules
- If you would dial a stranger from a form → operate-never.
- If the row is not richer than the form → the qualify step failed (his claim).
- If the template uses a native form → do not file it as the production webhook.
- Refuse: Vapi/auto-dial; UPAI as hive; gardening `icp_id`.

## G. Contrarian
Against waiting for a human to make the first call (his). We reject operating that; we keep the thicker-row idea.

## H. Assumptions
Theirs: sleep-calling is good. Ours: 18-corpus Jarvis / Glenn Coco — humans still pick up; auto-dial is never. Falsifier: `BO-jFbN4p8Y` long. Budget/intent listed in the row but not fully spoken — do not invent the questions.

## I. Questions
What were the budget/past-experience questions? Vapi or other? Long-tape HITL?

## J. Connections
SYSTEM SYNTHESIS → `BO-jFbN4p8Y`; `G9Ho8n4lD6I`; `whIp1SOahOM` (book after yes); `nS2FrgXN-EY` (human conversation moat).

## K. Future-Use
Log-before-outreach as an atom without the dialer. Unassigned: hive qualify stays HITL.

## Steal / Operate-never

### Machine: thicken the form into a qualify row; do not dial
- **Epistemic:** SOURCE (loop) / SYSTEM SYNTHESIS (operate-never dial)
- **Workflow / loop:** form in → (on-tape: auto-call) hive: human or no call → ask why-now + timing → write motivation/urgency/intent → checkable stop = row richer than the form, status complete
- **Questions / signals:** What prompted interest now? How soon? Identity match?
- **Qualify / frame / objections:** "Calls while you sleep" is the payload
- **Procedure:** demo native form vs prod webhook — label it
- **Example that proves it:** Richard/Green Grass → holidays/slow + one month → complete row
- **Why it works:** extra questions beat a thin form
- **Conditions / exceptions:** auto-dial is never for us
- **Operate-never payload:** auto-dial/Vapi; sleep-calling; UPAI SKU; gardening hunt
- **Hive run:** `send-removed` · `ask-principal` · `list-anneal-funnel` (qualify, no dial)
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN

### Operate-never
- Auto-dial / Vapi / "calls while you sleep." UPAI as hive. New `icp_id`.
- Merge `LESSONS-FROM-TAPE.md`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File thicker-row + demo-vs-prod. Do not delete this tape because the payload is ugly. Persist operate-never next to the stolen questions.
