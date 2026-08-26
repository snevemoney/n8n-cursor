# Career Strategist — -Lo_SlSgtnA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Lo_SlSgtnA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Lo_SlSgtnA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (2:45, 622 words). Beats: (1) hook: agent that calls people while you sleep (2) pretend website / AI automation agency (3) form submit → auto-call → qualify → extra questions → log so you know more before *you* outreach (4) production pattern: UpAI form → webhook → n8n; demo uses native n8n form (5) mock Richard / Greengrass / gardening / company size (6) HTTP “call lead” fires; he answers (7) Elliot the agent: confirm identity, “good fit,” what prompted interest now, how soon (8) Richard: holidays slowed; when he stopped outreach himself the pipeline died; wants constant lead flow; wants something in a month (9) row appears: request, size, interest, motivation, urgency, past experience, budget, intent, status complete (10) now you have more than the form to go reach out to Richard. CTA to full video. Vapi is on-tape vendor. Auto-call is the payload.

## B. Atomic Knowledge

### Form is thin; the call is for fields the form will not get
- **Claim:** The point of the call is extra qualify fields so a human outreach later is informed.
- **Reasoning:** Form has name/phone/email/company/role/request/size. Call adds motivation, urgency, budget, intent, etc.
- **Mechanism:** submit → call → structured log → human outreach.
- **Evidence:** “qualify them, ask them a few more questions… log all of that information so that you know way more about this prospect before you actually make your outreach.” @ 0:14
- **Conditions:** They submitted a form (consent-ish on tape, not legal advice).
- **Exceptions:** He still frames human outreach as the next step — the agent is not the closer.
- **Action:** Steal the extra-fields log; do not operate the auto-dial.
- **Confidence:** high as stated design.
- **Source:** `-Lo_SlSgtnA` @ 0:14
- **Epistemic:** SOURCE

### While-you-sleep call is the hook
- **Claim:** The agent calls people while you sleep.
- **Reasoning:** Speed-to-lead as the product.
- **Mechanism:** webhook/form trigger → HTTP call lead → voice agent.
- **Evidence:** “calls people while you sleep” @ 0:01
- **Conditions:** A phone number on the form; a voice vendor.
- **Exceptions:** Demo is him calling himself as Richard.
- **Action:** Operate-never the dial; learn the trigger→log loop.
- **Confidence:** high as hook; demo is staged.
- **Source:** `-Lo_SlSgtnA` @ 0:01
- **Epistemic:** SOURCE

## C. Mental Models
Speed-to-lead matters. The agent is a qualifier, not the salesperson (“before you actually make your outreach”). Demo data can be mock. A gardening business is a fine pretend ICP — not a hive hunt.

## D. Procedures
Questions the agent asked (SOURCE): Is this Richard with Greengrass? You’re looking to automate lead gen — correct? What specifically prompted interest *now*? How soon are you looking to implement?  
Log fields: request, company size, interest, motivation, urgency, past experience, budget, intent, status.  
Avoid (hive): firing the call.  
When to change: if they did not submit a number, there is no call (obvious).

## E. Examples
**Situation:** Mock form for Richard, Greengrass gardening, wants lead-gen automation.  
**Action:** Workflow calls him; Elliot qualifies; row marked complete.  
**Reasoning:** Form missed motivation/urgency/budget.  
**Outcome:** A richer row for later human outreach.  
**Lesson:** Extra questions belong in a log before a human step. Implicit rule: the tape still assumes a human “go reach out to Richard.”

## F. Decision Rules
- If the form is thin, do not pretend you know intent.
- If a field is irreversible (the call), hive does not auto-fire it.
- Optimize for a complete row, not a closed deal on the call.

## G. Contrarian
Rejects “wait until morning to call the form.” Also, quietly, the closer is still a human — this is not fully lights-out sales.

## H. Assumptions
**Theirs:** Immediate call is wanted; mock phone is fine; Vapi/n8n. **Ours:** auto-dial is operate-never (doctrine + job card). Staged demo. Greengrass is not an ICP. Falsifier: real leads who rage at a bot call.

## I. Questions
- What happens when they do not answer?
- Budget field — how did the agent get it? Not in the spoken snippet.

## J. Connections
- SYSTEM SYNTHESIS → `whIp1SOahOM` (Jarvis: confirm-with-boss before book).
- SYSTEM SYNTHESIS → `BO-jFbN4p8Y` / `y-cq_Qo4zVo` (longer Vapi tapes).
- SYSTEM SYNTHESIS → `ask-principal` / `confirm-then-actuate`.

## K. Future-Use
Unassigned: the qualify question set (prompted now / how soon) as gym questions for any inbound — asked by Evens, not by a dialer.

## Steal / Operate-never

### Machine: thin form → extra qualify questions → log → human outreach
- **Epistemic:** SOURCE (loop) + SYSTEM SYNTHESIS (no dial)
- **Workflow / loop:** inbound form → *draft* extra questions → human places or skips the call → write motivation/urgency/budget/intent → then human outreach
- **Questions / signals:** What prompted interest *now*? How soon? Signal = form submit, not a scraped number.
- **Qualify / frame / objections:** Agent on tape is qualifier not closer. If they want while-you-sleep dial, refuse operate.
- **Procedure:** Keep the field list. Delete the auto HTTP “call lead” from anything we would run.
- **Example that proves it:** Richard / Greengrass demo (E).
- **Why it works:** Forms under-collect intent; a short conversation fills the row (B/C).
- **Conditions / exceptions:** Consent/form. Auto-dial / Vapi / Twilio stay never.
- **Operate-never payload:** Auto-call; Vapi install; quoting agency inbound as a hunt; quit-job.
- **Hive run:** `ask-principal` · `confirm-then-actuate` · `send-removed` · `interview-gym` (ask the qualify questions in a room)
- **Source:** `-Lo_SlSgtnA` @ 0:01–0:14

### Operate-never
- Auto-dial / Vapi / “calls while you sleep.”
- Unpark clients / new `icp_id` (gardening is pretend).
- Employment send, quit-job. Quote tape $ as FACT (none here; sister tapes).
- Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: an inbound interest is a thin form; gym the “why now / how soon” questions before Evens replies. The reply stays HITL. Do not stand up a night dialer. Clients parked.
