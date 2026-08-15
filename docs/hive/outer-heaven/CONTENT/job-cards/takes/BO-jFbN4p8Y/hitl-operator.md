# HITL Operator — BO-jFbN4p8Y
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/LEARNED.md`
**ICP:** parked unless Evens named one.

Evens is the visionary. Operate ≠ learn. Role did not filter what was learned. Stack stays Cursor + Grok. Clients parked. No send / pay / deploy / book / publish. Tape $ UNVERIFIED.

## A. Source Map

**Title (PACKET):** I Built a Voice Agent That Calls Every New Lead (n8n + Vapi)
**Speaker / channel:** Nate Herk | AI Automation
**Kind / words:** outbound voice + n8n walkthrough · 6445 words
**Gaps:** No VTT cited in this take. Timestamps UNKNOWN. Visual-only UI clicks inferred only as INFERENCE.

Beats in order:

- Build an agent that makes phone calls while you sleep. n8n for logic, Vappy for voice; free templates. Use cases: surveys, reviews, reactivate leads; today = outbound lead qualification.
- Form submit (UPAI-style) → webhook → whole workflow. Demo: mock form, HTTP 'call lead,' he hears Elliot call him from Upet. Qualifies what prompted interest, budget, urgency, paid-discovery openness. On-tape answers: 5–10K, free intro then paid consulting. Agent offers free 30-minute discovery if a fit.
- Poll until the call is done; then branch: pickup vs voicemail. Log to Google Sheet (phone, email, company, role, request, size, status, budget, urgency). Normalize the phone number before the API or Vapi fails. Wrong-number path logs and stops.
- Vapi assistant: dynamic variables from the form; if no/wrong number, apologize and end; end-call tool off by default until enabled; after-call payload back to n8n. Production note: constantly monitor and tweak the prompt. Transfer-to-human if upset or they ask for a human.
- Steal on tape is qualify + log + voicemail/wrong-number branches + transfer-to-human. The operated demo is still auto-dial on form submit.

## B. Atomic Knowledge

### Log the call, then Evens dials
- **Claim:** Form submit automatically calls the lead while you sleep. That is the world action.
- **Reasoning:** Qualify questions and the sheet are useful. The HTTP 'call lead' node is the trap.
- **Mechanism:** Form in → normalize phone → log fields → Evens dials or cards → stop
- **Evidence:** Open: 'make phone calls for you while you sleep.' Demo HTTP node labeled call lead.
- **Conditions:** On-tape demo / short captions.
- **Exceptions:** Tape $ and vendor names stay on-tape.
- **Action:** Steal qualify + log + voicemail branch. Operate-never Vapi / auto-dial.
- **Confidence:** medium — caption ingest, timestamp UNKNOWN
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN
- **Epistemic:** SOURCE

### Transfer-to-human is the steal inside the trap
- **Claim:** He names a transfer-to-human fallback if they are upset or ask for a human. Voicemail and bad-number paths already stop the dial.
- **Reasoning:** Those branches are the HITL spine hiding inside an auto-dial canvas.
- **Mechanism:** Call state → pickup / voicemail / bad number / transfer-request → log → Evens
- **Evidence:** On-tape: transfer if upset or requested; voicemail log; incorrect-format filter.
- **Conditions:** On-tape demo / short captions.
- **Exceptions:** Tape $ and vendor names stay on-tape.
- **Action:** Keep the branches. Do not keep the sleep-dial.
- **Confidence:** medium — caption ingest, timestamp UNKNOWN
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models

- More form fields after a live conversation is the value, not the fact that a robot called at 2 a.m.
- Production voice = monitor and rewrite the prompt. Not set-and-forget.
- Vapi is on-tape only. Cursor + Grok.

## D. Procedures

- Keep: intent / budget / urgency questions, sheet columns, phone normalize, voicemail log, wrong-number stop, transfer-to-human.
- Strip: call-lead HTTP, Vapi assistant, while-you-sleep trigger, free-discovery book from the agent's mouth.
- If they ask for a human or sound upset → card Evens. Do not transfer via Vapi.
- 5–10K and free 30-min discovery stay UNVERIFIED / on-tape.

## E. Examples

- **On-tape run** — Situation: Mock form submit → Action: HTTP call lead → Elliot rings Nate → Reasoning: Demo must sound live → Outcome: Sheet row for Richard / green grass → Lesson: The row is the steal; the ring is never

- **On-tape run** — Situation: Lead asks for a human or is upset → Action: He says add a transfer fallback → Reasoning: Voice will fail the room → Outcome: Not shown as a live transfer → Lesson: Name the fallback; Evens takes the call

## F. Decision Rules

- If a node is named call lead → strip it.
- If the pitch is while-you-sleep → REJECT auto-dial.
- If they request a human → Evens, not Vapi transfer.
- If tape $5–10K or free discovery → UNVERIFIED.

## G. Contrarian

- Field ships outbound voice as the product. He still logs so a human can reach out later — that second sentence is the hive.

## H. Assumptions

- Vapi / UPAI / Elliot / 5–10K UNVERIFIED or on-tape.
- Transfer-to-human is spoken, not fully demoed as a live handoff.

## I. Questions

- Did any production run book a calendar slot, or only qualify?
- Who owns the 'free 30-minute discovery' the agent offered?

## J. Connections

- Siblings: `G9Ho8n4lD6I` · `glM8godEcic` · `-Lo_SlSgtnA` · `y-cq_Qo4zVo` · `zWLZ3bVVwD8` · `7siRW0My05o`.
- SYSTEM SYNTHESIS → `ask-principal` · `missed-call-book` (log only) · `confirm-then-actuate`.

## K. Future-Use

- Qualify-question list + voicemail/wrong-number branches for a named Path A later. Parked.

## Steal / Operate-never

Informed by A–K. Auto-send / auto-book stay operate-never. The machine is still stolen.

### Machine: Qualify + log + transfer-request (no sleep-dial)
- **Epistemic:** SYSTEM SYNTHESIS
- **Workflow / loop:** form/lead in → questions (intent/budget/urgency) → normalize phone → log sheet → voicemail/bad-number stop → Evens dials or books → stop
- **Questions / signals:** Did they ask for a human? Pickup or voicemail? Is the number valid?
- **Qualify / frame / objections:** While-you-sleep is a no. Vapi is a no. Free discovery from the agent's mouth is a no.
- **Procedure:** Keep the sheet and the questions. Strip call-lead. Card Evens on transfer-request.
- **Example that proves it:** **On-tape run** — Situation: Form submit at UPAI → Action: He auto-calls then logs Richard → Reasoning: More fields than the form → Outcome: Sheet row; he will reach out → Lesson: Reach-out is Evens, not the HTTP node
- **Why it works:** The useful machine is qualify-then-log. The operated machine is a robot that rings people at night.
- **Conditions / exceptions:** Hard steps stay HITL.
- **Operate-never payload:** Auto-dial / while-you-sleep / Vapi as stack / agent-offered free book. Quote 5–10K as FACT.
- **Hive run (existing skills only):** `ask-principal` · `confirm-then-actuate` · `input-required-gate` · `missed-call-book`
- **Source:** `BO-jFbN4p8Y` @ UNKNOWN

### Operate-never (this desk will not operate)

- Auto-dial / call-while-you-sleep. Vapi as a hive SKU.
- Quote 5–10K / free discovery as FACT.
- Auto-send / auto-book / auto-voice-book / auto-publish / auto-pay / auto-deploy.
- Quote tape $ / student counts / job-loss % / token burns as FACT.
- Install on-tape vendors (Claude Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool) as our stack. Cursor + Grok only.
- New `icp_id`. Unpark Normand. Outreach / hunt because a tape was interesting.
- Always-allow MCP / classifier / guardrail-pass as Evens.
- Merge `LESSONS-FROM-TAPE.md`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications

ACTION = log qualify fields; REJECT call-lead and while-you-sleep. Transfer-to-human means Evens. Clients parked.
