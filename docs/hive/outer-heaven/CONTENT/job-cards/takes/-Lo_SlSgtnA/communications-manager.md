# Communications Manager — -Lo_SlSgtnA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Lo_SlSgtnA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Lo_SlSgtnA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** This Voice Agent Calls and Qualifies All Your Leads (n8n + Vapi)
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** short · 622 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Hook: agent that calls people while you sleep.
- Website form → auto-call, qualify, extra questions, intent, log so you know more before outreach.
- Typically: Uppit form → webhook → n8n. Demo uses native n8n form.
- Mock Richard / Greengrass / gardening lead-gen; HTTP “call lead” fires; Elliot (AI) calls; confirms form; asks what prompted now; holidays slow / stopped outreach; implement within a month.
- Row appears: request, size, interest, motivation, urgency, past experience, budget, intent, status complete.
- Now you have more than the form to reach out to Richard. CTA: full. Long-form `BO-jFbN4p8Y`.

## B. Atomic Knowledge

### Sleep-call qualify then human outreach
- **Claim:** Form submit triggers an immediate qualify call; logs motivation/urgency/budget/intent; a human is supposed to reach out later with more than the form.
- **Reasoning:** The call is the enrichment. Outreach is later.
- **Mechanism:** Form → call lead → conversation → sheet row complete.
- **Evidence:** “calls people while you sleep” / “now we have a lot more information to actually go reach out to Richard.”
- **Conditions:** A phone number was on the form.
- **Exceptions:** Auto-dial + while-you-sleep is operate-never (hive kill: auto-dial). Qual questions are the steal.
- **Action:** Steal the question list. Do not auto-dial. Draft the later outreach. Do not send.
- **Confidence:** high
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Form is thin; the call is the qualify. **SOURCE**
- Sleep is the hook; the honest job is enrichment before outreach. **INFERENCE**
- Elliot / Uppit / Greengrass are theater. **INFERENCE**

## D. Procedures
- Questions on tape: what prompted now? how soon? (plus budget/intent/past on the row). **SOURCE**
- This desk: put those questions on a card for a human call. No Vapi. No night dial. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Richard submits gardening-automation form. → **Action:** Instant call; qualify; log complete. → **Reasoning:** Know more before outreach. → **Outcome:** Row with motivation/urgency. → **Lesson:** Questions yes, auto-dial no. Implicit rule: complete means logged, not closed.

## F. Decision Rules
- If it dials without a human → never.
- If we use the questions → human call, draft after.
- Refuse: Vapi. Sleep-dial. Auto-outreach after the row.
- Optimize: qualify card, later one draft.

## G. Contrarian
- Field wants the night dialer. Hive already kills auto-dial. Tape still teaches the questions. **SYSTEM SYNTHESIS**

## H. Assumptions
- While-you-sleep is the never. Falsifier: wrong-person call.

## I. Questions
- Did Richard consent to an immediate AI call? Not on tape.

## J. Connections
- **SYSTEM SYNTHESIS:** `BO-jFbN4p8Y`. Steal-sheet kill: auto-dial. `warm-draft-hitl`.

## K. Future-Use
- Qualify-question card for a human callback.

## Steal / Operate-never

### Machine: Qualify questions on a card; the night dialer stays dead
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Form in → draft qualify questions (prompted now, timing, budget, intent) → human may call → then one outreach draft → **stop**. No auto-dial. No sleep agent.
- **Questions / signals:** Did a bot dial? Consent? Who reaches out?
- **Qualify / frame / objections:** Qualify: enrichment vs dialer. Frame: questions. Objection: “call them while you sleep” → operate-never.
- **Procedure:** 1) Keep the questions. 2) Do not dial. 3) Draft later outreach. 4) Dual gate empty.
- **Example that proves it:** Elliot calls Richard; holidays/slow; one-month urgency; row complete.
- **Why it works:** The form is thin. A bot at midnight is how you burn the number. Questions still work on a human call.
- **Conditions / exceptions:** Voice-qualify tapes. Exceptions: none for auto-dial.
- **Operate-never payload:** Vapi. Auto-dial. Sleep-call. Auto-outreach. Uppit as ours.
- **Hive run (existing skills only):** `warm-draft-hitl` · `ask-principal`. Auto-dial stays killed.
- **Source:** `-Lo_SlSgtnA` @ UNKNOWN


### Operate-never (this desk will not operate)
- Auto-dial. While-you-sleep caller. Auto-outreach after qualify. Vapi.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I steal the questions. I do not dial. I do not send the later note. Clients parked.
