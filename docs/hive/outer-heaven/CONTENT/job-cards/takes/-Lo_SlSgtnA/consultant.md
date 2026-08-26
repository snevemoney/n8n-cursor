# Consultant — -Lo_SlSgtnA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Lo_SlSgtnA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Lo_SlSgtnA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Voice-qualify-while-you-sleep teaser (long `BO-jFbN4p8Y`). Beats: website form → auto-call → qualify, ask more, log intent so outreach is informed. In practice UPAI form → webhook → n8n; demo uses native n8n form trigger so the template works. Execute → mock Richard / Greengrass / phone / email / company / role / request / company size → HTTP “call lead” → he answers as Richard. Elliot (AI) from “up”: confirm Richard at Greengrass? thanks for the form; looking to automate lead gen for gardening — correct? what prompted now? holidays slow, stopped outreach, wants a constant lead flow; how soon? within a month. Row appears: request, size, interest, motivation, urgency, past experience, budget, intent, status complete. Then humans outreach with more than the form. CTA to the long. No VTT. UNKNOWN. ~622 words. Visual: the call and the row.

## B. Atomic Knowledge

### Form-to-call is a qualify logger, not the close
- **Claim:** The call’s job is to ask what the form did not and log it so a human can outreach later.
- **Reasoning:** He does not say the agent books or closes. It fills a row.
- **Mechanism:** Form submit → place call → extra questions → write fields → human outreach.
- **Evidence:** “now we have a lot more information to actually go reach out to Richard”
- **Conditions:** Demo form + Vapi-class call (on-tape vendor in the long). Mock Richard.
- **Exceptions:** Title is “calls people while you sleep” / auto-dial — kill-list payload. Budget/intent fields appear without those questions on the clip.
- **Action:** Steal extra-questions-then-human-outreach. Do not auto-dial. Do not treat the row as a booked client.
- **Confidence:** high as a path; high operate-never on the dial
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN — “log all of that information so that you know way more about this prospect before you actually make your outreach”
- **Epistemic:** SOURCE
### Confirm identity and the form’s request before new questions
- **Claim:** Elliot confirms Richard / Greengrass and restates the form request (automate lead gen for gardening) before asking why now and how soon.
- **Reasoning:** A cold AI voice that skips confirm feels like a scam call.
- **Mechanism:** Confirm name+company → restate request → why now → timing.
- **Evidence:** On-tape dialogue.
- **Conditions:** Friendly demo, he is playing both sides.
- **Exceptions:** No angry caller, no DNC, no timezone. “While you sleep” implies nights — worse.
- **Action:** If a voice path is ever tabletopped, confirm-back stays. Live dial does not.
- **Confidence:** high
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN — “Is this Richard with Greengrass?” / “You're looking to automate lead generation”
- **Epistemic:** SOURCE
### Row fields exceed the questions we heard
- **Claim:** The logged row includes past experience, budget, intent, status complete — the clip only clearly asks why-now and timing after confirm.
- **Reasoning:** Either more questions were cut or the model filled holes.
- **Mechanism:** After the call, a row pops with more columns than the audible Qs.
- **Evidence:** “past experience, the budget, the intent, and the status has been marked off as complete.”
- **Conditions:** One demo row.
- **Exceptions:** Invented budget/intent is a skeptical-customer fail.
- **Action:** Only log answers that were asked. Status complete ≠ qualified.
- **Confidence:** high as a warning (INFERENCE on the gap)
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN — row fields listed after two audible extra questions
- **Epistemic:** INFERENCE


## C. Mental Models

He wants inbound forms to grow a richer CRM row via a phone agent. He is selling a template (native form trigger “so I can give you guys a template that works”). He treats the human outreach as still necessary. He is casual about calling immediately on submit. The title’s “while you sleep” is the smash; the body still ends on human outreach.

## D. Procedures

On-tape: form → HTTP call lead → confirm → why now → timing → log row → human outreach. Ours: tabletop the questions; no auto-dial; no night calls; do not write budget/intent that were not asked; UPAI/agency fiction is not a SKU.

## E. Examples

**Situation:** Richard submits a form for gardening lead-gen automation. **Action:** Immediate AI call; confirm; why now (holidays/slow outreach); timing (one month); row written. **Outcome:** He says you now know more before outreach. **Lesson:** Extra questions can enrich. Auto-dial is the payload. Implicit rule: he still needs a human to “start working with their business.”

## F. Decision Rules

If the next node is a live call, stop (auto-dial). If the row has budget/intent that were not asked, fail the log. If “while you sleep” is the feature, fail. If the form is an agency magnet, that is his shop, not ours.

## G. Contrarian

Field default: call to book. He calls to qualify-for-later-outreach. Field default: the form is enough. He wants more questions. Field default: hide that a human still outreachs. He says it.

## H. Assumptions

Auto-dial is on the hive kill list. Vapi/n8n on the long. Mock data. Field/question mismatch. Agency website fiction. Twin `BO-jFbN4p8Y`.

## I. Questions

Which questions actually filled budget/intent? Timezone/DNC? What does the long add for the HTTP “call lead”?

## J. Connections

**SYSTEM SYNTHESIS:** Long `BO-jFbN4p8Y`. Opposite of `private-book-install` (this is outbound-on-inbound). Kill auto-dial / auto-book-no-callback. Maps to `discovery-spiced-constraint` questions (why now, timing) as a tabletop, `warm-draft-hitl` for the later outreach.

## K. Future-Use

Unassigned: confirm-then-why-now-then-timing as a qualify script on a human call; “row fields must match audible questions” as a log audit.

## Steal / Operate-never

### Machine: Form enrich via extra questions — human outreach, no auto-dial
- **Epistemic:** INFERENCE
- **Workflow / loop:** Form lands → (human or scheduled, not night auto-dial) extra questions: confirm, why now, timing → log only asked fields → human outreach HITL
- **Questions / signals:** Did we confirm identity? Did we invent budget? Are we about to dial automatically?
- **Qualify / frame / objections:** Qualify: inbound form, not a purchased list. Frame: enrich then human. Objection: “call them while you sleep” — title smash, kill list.
- **Procedure:** Tabletop the Qs. Do not HTTP-call a live number. Do not mark complete as qualified.
- **Example that proves it:** Richard/Greengrass demo: confirm, holidays-slow, one-month urgency, row with extra fields, then human outreach.
- **Why it works:** Forms are thin. Extra questions help. Immediate AI dial is the ugly payload.
- **Conditions / exceptions:** Demo. Auto-dial. Field/question gap. Agency fiction.
- **Operate-never payload:** Auto-dial. Night calls. Install Vapi. Unpark a client. Log invented budget/intent. Start an agency magnet.
- **Hive run (existing skills only):** `discovery-spiced-constraint` · `warm-draft-hitl` · `ask-principal` · `send-removed`
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN


### Operate-never
- Auto-dial / call-while-you-sleep.
- Log budget/intent that were not asked.
- Install Vapi / the “call lead” HTTP.
- Treat the row as a closed or booked client.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “agent that calls people while you sleep.” Felt problem is a thin inbound form — if a named owner has one — not an auto-dialer. Do not stand this up for a parked Path A. Do not become UPAI.

**Four-blank after constraint:** Toddler stop = extra answers a human asked + a human outreach draft. Complete ≠ qualified.

**Skeptical-customer:** The live call is smash. Auto-dial stays operate-never. Clients parked. No new `icp_id`.
