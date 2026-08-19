# Big Boss — -Lo_SlSgtnA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Lo_SlSgtnA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Lo_SlSgtnA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Short (PACKET: 2:45, 622 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (json3 present; no VTT in the take). Visual-only gaps: the n8n canvas, the native form UI, the live phone UI, and the sheet row as it “pops” are described, not seen.

Beats, in order:

1. Hook: “build an AI agent that calls people while you sleep.”
2. Frame: pretend you have a website. Pretend the business is “an AI automation agency of some sort.”
3. Promise: form submit → workflow calls the lead, asks more questions, reads intent, logs the answers so you know more **before** outreach.
4. Production shape (narrated, not run): form at **UPAI** → data to a webhook in **NAND** (n8n) → this workflow.
5. Demo cheat: native n8n form trigger “so I can give you guys a template that works.”
6. Execute. Mock form: **Richard**, phone, email, company name, role, request, company size.
7. HTTP node labeled **call lead** fires. He answers. Voice: “Elliot, an AI agent calling from up.” Confirms “Richard with Greengrass.”
8. Qualify loop on tape: automate lead generation for a gardening business; holidays slowed; when he stopped outreach himself “foot off the gas”; wants a constant lead flow; wants something “within the next month.”
9. Sheet row appears mid-call: request, company size, interest, motivation, urgency, past experience, budget, intent, **status = complete**.
10. Claim: the agent got information the form did not; now you can “go reach out to Richard.”
11. CTA: play button to “the full breakdown.” Short ends.

Off-topic / not skipped: UPAI as his live form; “Greengrass” / “Green Grass” spelling drift; Elliot as the agent name; gardening as the prospect’s trade; budget and past-experience columns spoken as filled though the audible call only covers motivation and urgency.

## B. Atomic Knowledge

### Sleep-dial is the title, not the definition of done
- **Claim:** The short sells a qualifier that calls “while you sleep.”
- **Reasoning:** Night + unattended + phone is the magnet. The demo is a live pickup in daylight with the builder on the line.
- **Mechanism:** Title → form → HTTP “call lead” → voice agent → sheet.
- **Evidence:** First spoken line vs. him answering as Richard.
- **Conditions:** Magnet works if the viewer wants inbound handled without sitting the phone.
- **Exceptions:** He never leaves the room. No overnight run is shown.
- **Action:** Treat “while you sleep” as CTA copy, not a ship spec.
- **Confidence:** high
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN — “calls people while you sleep”
- **Epistemic:** SOURCE (title) / INFERENCE (demo ≠ title)

### Form is intake, not qualification
- **Claim:** The form captures identity + a request. The call is there to pull motivation, urgency, budget, intent.
- **Reasoning:** “Information that we wouldn’t have initially got from the form.”
- **Mechanism:** Form fields (name, phone, email, company, role, request, size) → voice questions → extra columns.
- **Evidence:** Audible questions: what prompted interest now; how soon. Sheet is said to also hold past experience, budget, intent, status.
- **Conditions:** Works when the form is thin and a human still does outreach after the row.
- **Exceptions:** Budget / past experience are named on the sheet and not heard in the call snippet.
- **Action:** Extra questions belong on a checklist. They do not require a night call.
- **Confidence:** high for the split; medium that every named column was actually asked
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN — “qualify them… we wouldn’t have initially got from the form”
- **Epistemic:** SOURCE

### Demo trigger is not the production trigger
- **Claim:** Live UPAI would webhook n8n. The template uses a native n8n form so the download works.
- **Reasoning:** A public form + webhook is the real pipe. A native trigger is a classroom prop.
- **Mechanism:** Two entry doors, one downstream HTTP call.
- **Evidence:** He says both shapes in order.
- **Conditions:** Template-that-works needs a trigger the viewer can click without his UPAI site.
- **Exceptions:** Webhook host, auth, and spam path are not shown.
- **Action:** Do not copy the native form as the client install. The machine is “submit → qualify log,” not “n8n form node.”
- **Confidence:** high
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN — “for the sake of the demo… native NAN form”
- **Epistemic:** SOURCE

### Voice agent restates the form, then asks why-now and when
- **Claim:** Elliot confirms identity and the written request, then asks the two audible qualify questions.
- **Reasoning:** Restate first so the prospect feels seen; then pull timing.
- **Mechanism:** Scripted opener (“Is this Richard with Greengrass?”) → “what specifically prompted… now” → “how soon.”
- **Evidence:** Richard: holidays slow + stopped doing outreach himself; “within the next month.”
- **Conditions:** Prospect picks up and plays along. Mock data, builder on both ends.
- **Exceptions:** No no-answer, wrong-number, or “do not call” path on this short.
- **Action:** Why-now + when are the stealable questions. The PSTN hop is not.
- **Confidence:** high for the two questions; low for a real pickup rate
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN — “what specifically prompted… how soon are you looking”
- **Epistemic:** SOURCE

### Completed row is the checkable stop before a human reaches out
- **Claim:** Status marked **complete** is when he says you now know enough to outreach.
- **Reasoning:** The sheet is the handoff. The agent does not close. A human still “go reach out.”
- **Mechanism:** Row fields listed; status = complete; CTA is human work, not auto-send.
- **Evidence:** “now we have a lot more information to actually go reach out to Richard.”
- **Conditions:** Someone reads the row. Complete ≠ booked, paid, or sent.
- **Exceptions:** He does not show a human using the row. Outreach is promised, not done.
- **Action:** Definition of done on a qualify slice: named row + extra fields + human still owns send.
- **Confidence:** high
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN — “status has been marked off as complete”
- **Epistemic:** SOURCE

### The prospect is a prop, not a hive ICP
- **Claim:** Builder plays an agency. Prospect is a gardener (Green Grass) who wants lead-gen automation.
- **Reasoning:** Teaching object. Not a client brief Evens named.
- **Mechanism:** Mock form + roleplay call.
- **Evidence:** “let’s pretend the business is an AI automation agency”; “gardening business, Green Grass.”
- **Conditions:** Fine as a demo story.
- **Exceptions:** UPAI is his real brand on tape; still not our lane.
- **Action:** Do not unpark Normand or open a gardener / agency hunt from this short.
- **Confidence:** high
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN — “gardening business, Green Grass”
- **Epistemic:** SOURCE

### Short withholds the recipe
- **Claim:** Setup, Vapi wiring, prompt, and failure paths live behind the play-button long.
- **Reasoning:** Impressed call + missing recipe = click.
- **Mechanism:** End card.
- **Evidence:** Last spoken lines.
- **Conditions:** Only works if a long exists.
- **Exceptions:** Viewer who wanted the build leaves empty.
- **Action:** Do not treat the short as a build spec. Pair later; do not invent the sibling id.
- **Confidence:** high for CTA; low for sibling id (PACKET does not bind one)
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN — “watch the full breakdown… click on that play button”
- **Epistemic:** SOURCE

### Unattended phone is the hidden risk the short does not show
- **Claim:** A form-triggered call can hit a bad number, a family phone, or a lead who did not expect a voice agent.
- **Reasoning:** “While you sleep” removes the human who would hear a bad call.
- **Mechanism:** HTTP “call lead” has no on-tape cap, quiet hours, or consent check.
- **Evidence:** Absence: no bad-number path, no daily cap, no “this is a recording” beyond the agent naming itself.
- **Conditions:** Risk is real when the trigger is a public form.
- **Exceptions:** Demo number is his own.
- **Action:** Auto-dial stays operate-never. Extra questions can live on the form or a HITL callback.
- **Confidence:** high as a hive rule; the failure is not shown (INFERENCE)
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN — title vs. missing failure path
- **Epistemic:** INFERENCE

## C. Mental Models

- **Call while they are hot.** Form submit is the moment; delay is the leak. **SOURCE**
- **Know more before you talk.** The sheet is for the human, not a closer. **SOURCE**
- **Template that works beats the real webhook.** He swaps production for a native form so the download runs. **SOURCE**
- **Agency-to-gardener is a classroom story.** He is not installing for Green Grass. **SOURCE**
- **Impressed audio is the close.** Recipe behind a click. **INFERENCE**
- **“While you sleep” is permission to leave the phone unmanned.** That is the part I refuse. **SYSTEM SYNTHESIS**

## D. Procedures

1. **Name the site + the form event.** On tape: website form (UPAI in production, native n8n in demo).
2. **Capture identity + request** (name, phone, email, company, role, request, size).
3. **Trigger the qualify step** (HTTP “call lead” on tape). Hive analog: do **not** dial; add the extra questions to the form or a HITL callback list.
4. **Ask why-now and when** (audible). Optionally budget / past experience / intent (named on sheet, not all heard).
5. **Write one row.** Checkable stop: status complete + the extra fields filled.
6. **Human outreach** after the row. Agent does not send the follow-up on this short.
7. **CTA to the long** if this is a magnet.

**Qualify / frame:** Content-ops / agency demo. Green Grass is a prop. UPAI is his brand.
**Objections:** “It calls them while you sleep” — answer with the missing bad-number path and the human still owning outreach.
**Avoid:** Vapi / n8n-cloud as hive stack. Auto-dial. Treating complete as booked.
**When to change:** If the form already has why-now, when, and budget, the call is leftover theater.

## E. Examples

**Situation:** Mock form for Richard / Green Grass with a lead-gen request.  
**Action:** Native form fires; HTTP calls him; Elliot restates the request; asks why-now and when.  
**Reasoning:** Form is thin; call is supposed to thicken the row.  
**Outcome:** Row marked complete; he says you can now outreach.  
**Lesson:** Thick row before human talk is the machine. Implicit rule: the phone is optional; the extra questions are not.

**Situation:** He wants a template viewers can run.  
**Action:** Swap UPAI webhook for a native n8n form.  
**Reasoning:** Demo must execute without his production site.  
**Outcome:** Form opens, mock data, call happens.  
**Lesson:** Classroom trigger ≠ install trigger. Implicit rule: do not ship the prop.

**Situation:** Title says sleep-dial.  
**Action:** He stays on the line and answers as the lead.  
**Reasoning:** Audio proof for the short.  
**Outcome:** Viewer hears a clean pickup; no missed-call, no wrong number.  
**Lesson:** Survivorship demo. Implicit rule: unattended PSTN is not proven.

## F. Decision Rules

- If the form is thin → add why-now / when / budget on the form or a HITL list; do not auto-dial.
- If a row is not complete → do not treat it as ready for outreach.
- If the trigger is a public form → assume bad numbers exist (not shown; still refuse unattended call).
- If the short is a magnet → do not build from the short alone.
- Optimize: information before the human talks.
- Refuse (on this desk): Vapi sleep-dial, auto-book, status-complete as a send.

## G. Contrarian

- Against “the AI should close”: he still “go reach out.”
- Against “production webhook in the template”: he ships a native form so it runs.
- Against “qualification = a long form”: he keeps the form short and moves questions to voice.
- Field assumes the short is the system. He treats the short as an ad for the long.

## H. Assumptions

**His:** An agency site + form + voice qualifier is the right OS; a completed sheet row is enough to outreach; Vapi/n8n is obvious; the long will teach the rest; gardeners will pick up for Elliot.

**Ours:** Captions are complete enough (622 words). Audio quality and sheet accuracy are **UNVERIFIED** (not seen). UPAI / Green Grass / budget figures are props. Domain-specific: inbound agency demo, not a plumber book-flow.

**Falsifiers:** Real pickup rate is near zero. Bad-number complaints kill the brand. Sheet columns are hallucinated. Long does not match the short.

**Disagreement (keep labeled):** Hive will not operate a form-to-PSTN qualifier. The **thick-row-before-human** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What does the long actually wire (Vapi prompt, hours, retries)? Do not invent the sibling id.
- Were budget and past experience asked off-mic, or written by the model?
- Daily cap, quiet hours, DNC — not on tape.
- Who reads the row, and how fast?
- Cost per call — not on tape. Any implied $ = **UNVERIFIED**.

## J. Connections

- **SYSTEM SYNTHESIS** → `missed-call-book` is the restaurant/local analog (missed call → book CTA + HITL). This tape is the inverse: outbound call from a form. Do not merge them into auto-dial.
- **SYSTEM SYNTHESIS** → `playbook-before-send` / `same-day-qa`: a completed row is a playbook input, not a send.
- **SYSTEM SYNTHESIS** → `ask-principal`: phone, send, book stay HITL.
- **SYSTEM SYNTHESIS** → `channel-walk`: short → long.
- **SYSTEM SYNTHESIS** → Consultant clog/leak: leak is slow follow-up after a form, not “we need Vapi.”
- Do not force a Path A client out of Green Grass or UPAI.

## K. Future-Use

- Why-now / when as default extra fields on any Path A form (unassigned until Evens names a client).
- Status-complete as a Watchdog checkable stop (unassigned).
- Demo-trigger vs production-trigger as a Forge don’t (unassigned).
- Sleep-dial title as a Publishing Engine magnet pattern (learn only; no publish).

## Steal / Operate-never

### Machine: Thin form → extra questions → completed row → human outreach
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (form submit) → capture identity + request → ask why-now + when (+ budget/intent if needed) → write one row → status complete (checkable stop) → human reads row → human outreach (HITL). On tape the ask-step is a phone call. Hive ask-step is the form or a callback list.
- **Questions / signals:** “What prompted this now?” “How soon?” “Is the row complete?” “Did a human approve a call?”
- **Qualify / frame / objections:** Agency classroom, gardener prop. “While you sleep” is the magnet, not done. Objection: we will miss hot leads — answer with a faster form / HITL callback, not Vapi.
- **Procedure:** D steps 1–6. Checkable stops: (1) identity + request stored, (2) extra fields filled, (3) status complete, (4) send still human.
- **Example that proves it:** Richard / Green Grass mock → Elliot asks why-now and “within a month” → row complete → “now… go reach out.” Lesson: thicken the row; do not let the agent send.
- **Why it works:** A thin form converts. Extra context makes the first human talk cheaper. Conditions: someone reads the row; questions are specified. Exceptions: no bad-number path on tape; budget columns unverified; short hides the recipe.
- **Conditions / exceptions:** Cursor + Grok only (n8n / Vapi / UPAI stay on tape). No auto-dial. Clients parked. Green Grass is a prop.
- **Operate-never payload:** Sleep-dial; Vapi as hive SKU; complete-row as auto-send; new gardener/agency hunt.
- **Hive run (existing skills only):** `ask-principal` (any call/send) · `playbook-before-send` (row before outreach) · `missed-call-book` (if the real leak is inbound missed calls — different machine) · `channel-walk` (short → long) · `slice-build` (thicker form, not a phone farm).
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-dial / while-you-sleep qualifier / Vapi as hive OS
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool / his n8n templates
- Quote any implied $ or “template” as FACT
- New `icp_id` / unpark Normand / Green Grass or UPAI hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not put Elliot on the night shift.

- **Done** on a qualify slice: thin form + why-now/when on the page or a HITL list + one complete row + Evens still owns outreach. A phone agent is not done.
- **Delegate without being asked:** Consultant names the clog (slow follow-up). Lead Hunter does not get a dialer. HITL holds the call. Watchdog checks the row, not the vibe.
- **Skeptical review:** “Calls while you sleep” is the short’s job, not ours. I will not approve a form-to-PSTN farm because a roleplay with Richard sounded polite.
- **One system this take:** extra questions on the form. Not a voice army.
- Live hunt stays parked. I do not rotate to gardeners or “AI agencies” because a short slapped.
