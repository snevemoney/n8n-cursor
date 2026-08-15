# Money Desk — BO-jFbN4p8Y
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/BO-jFbN4p8Y/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~6445 words. Nate: n8n + **Vapi** outbound voice — ‘calls while you sleep,’ School JSON. Caption-only; timestamp UNKNOWN. Beats in order: use-cases (survey/review/reactivate); today = **auto-qualify after a form**. Live: n8n form (not the real UpAI webhook) — Richard, Green Grass gardening, lead-gen, company size. HTTP ‘call lead’ → Elliot (GPT-4o, Vapi voice ‘Elliot’) waits for ‘hello,’ then: confirm Green Grass, why now (holiday slowdown / he stopped outreach), timeline (~1 month), past AI (none), budget **$5–10k**, free 30-min then paid scope, goodbye. Poll until Vapi returns; sheet: interest/motivation/urgency/experience/budget/intent/status complete. Wireframe first (Plus pitch): form → **normalize phone** → create-call → poll get-call → pickup vs voicemail. Code node: paste JSON to Claude — 10 digits, no punctuation; +1/wrong length → `incorrect format` → if → log, don’t call. Vapi assistant: no tools, extract-only; first-message wait; system: identity UpAI, style, **{{lead_name}} {{lead_company_name}} {{lead_request}}**; wrong-number / not-a-good-time; topics: interest, motivation, urgency, vendor history, budget, **not endless free discovery**. Prompt is 30-min draft — prod = watch calls and rewrite. End-call toggle on. Structured outputs (summary/success deprecated): status, budget, urgency, past, motivation, paid-intent… each a named field, linked to this assistant. Create-call POST: bearer, assistant ID, **phoneNumberId** (Vapi-bought numbers have a **daily outbound cap** — he hit it, switched Twilio), `+1` hardcoded US, `assistantOverrides.variableValues`. Create returns initiated only → wait ~60s → GET call by id → limit first item (Vapi 26-item bug) → if status≠ended wait 10s loop → if endedReason=voicemail log callback else write structured fields (buried under `artifacts`). Ethics: **say you’re AI**; optional human-transfer if upset — not built. Bad-number demo: 9 digits → incorrect format row. Close: School 225k UNVERIFIED + sheet + prompts. **Vapi is on-tape only (stack rule). Auto-dial / $5–10k / Green Grass as a client / n8n as ours = operate-never.** Clients parked.

## B. Atomic Knowledge
### Form-is-not-consent-to-a-sleep-dial
- **Claim:** Submit → Elliot calls now. Demo is a self-call as Richard. Voicemail = log callback, still a dial machine. Vapi free numbers cap outbound; Twilio to ‘scale without limits.’
- **Reasoning:** He says introduce as AI (ethics) and maybe transfer — transfer isn’t in the graph.
- **Mechanism:** Do not stand up Vapi/n8n. Do not auto-dial. HITL every call. Clients parked.
- **Evidence:** On-tape Green Grass $5–10k; daily cap error; voicemail branch.
- **Conditions:** A form phone.
- **Exceptions:** Vapi / n8n / Twilio as ours operate-never. $5–10k UNVERIFIED.
- **Action:** Steal don’t-auto-dial. HOLD Vapi (on-tape only).
- **Confidence:** high as a never
- **Source:** BO-jFbN4p8Y @ UNKNOWN
- **Epistemic:** SOURCE
### Normalize-then-poll-then-voicemail-fork
- **Claim:** 10-digit or don’t call. Create-call ≠ transcript. Wait 60s, GET until `ended`, take first item, fork voicemail vs structured write. Variables fill {{name/company/request}}.
- **Reasoning:** Same poll as `AYsg5gAMWyo` / `KGXFkUlBHxw`. Claude-wrote the code node oneshot.
- **Mechanism:** Steal normalize+poll+fork as a shape. Do not analog 60s. Do not dial.
- **Evidence:** On-tape 10 GET loops; artifacts.structuredOutputs; 9-digit fail row.
- **Conditions:** A call WF.
- **Exceptions:** Vapi / n8n operate-never.
- **Action:** Steal the fork. HOLD the dial.
- **Confidence:** high as a procedure
- **Source:** BO-jFbN4p8Y @ UNKNOWN
- **Epistemic:** SOURCE
### Structured-out-is-not-a-close
- **Claim:** Budget/urgency/paid-intent land in the sheet so a human can outreach. $5–10k is the actor. ‘Not a tire kicker’ is the last question. 30-min prompt is a draft.
- **Reasoning:** 225k School is a slide. Plus hour-build is the upsell.
- **Mechanism:** HITL the follow-up. Tape $ UNVERIFIED. No new ICP (gardening/Green Grass parked).
- **Evidence:** On-tape holiday-slowdown motivation; free 30 then paid.
- **Conditions:** A qualify sheet.
- **Exceptions:** Auto-outreach / $5–10k as analog operate-never.
- **Action:** Steal sheet-then-human. Do not analog $.
- **Confidence:** high
- **Source:** BO-jFbN4p8Y @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: form + voice extract = a warmer sheet. Priority: never auto-dial, Vapi on-tape only, normalize or don’t call, HITL follow-up. Experience: self-call Richard; daily cap; 9-digit fork. Contrarian: say you’re AI. Uncertainty: 225k; $5–10k; 26-item bug.

## D. Procedures
His order: form → normalize → create-call → poll → voicemail fork → sheet. Our order: do not install Vapi (on-tape only). Steal normalize+poll. Caption-only: clicks UNKNOWN.

## E. Examples
**Situation:** Richard form. **Action:** Elliot dials. **Reasoning:** qualify before outreach. **Outcome:** $5–10k, 1 month, no AI yet. **Lesson:** Demo ≠ consent.

**Situation:** Vapi number. **Action:** outbound cap. **Reasoning:** scale. **Outcome:** switch Twilio. **Lesson:** Free numbers aren’t a factory.

**Situation:** 9 digits. **Action:** incorrect format. **Reasoning:** Vapi would 500. **Outcome:** log, no dial. **Lesson:** Normalize or stop.

## F. Decision Rules
IF phone → HITL, never sleep-dial. IF Vapi/n8n/Twilio → not ours (Vapi on-tape only). IF $5–10k / 225k → UNVERIFIED. Refuse: auto-call; Green Grass client; analog $.

## G. Contrarian
Rejects silent AI caller (he at least names it). Rejects calling a bad number. Rejects endless free discovery (in the prompt).

## H. Assumptions
Self-call. $5–10k is acted. Survivorship: already on Vapi+Twilio. Falsifier: TCPA/consent. Speech≠behavior: ‘while you sleep’ + ethics-say-AI + transfer-not-built.

## I. Questions
What’s live Vapi outbound cap? Any checkout we can open from a sleep-dial? Did anyone keep the human-transfer?

## J. Connections
SYSTEM SYNTHESIS: Vapi on-tape only (stack rule). Auto-dial = `playbook-before-send`. Poll = `AYsg5gAMWyo`. Green Grass = `KGXFkUlBHxw` parked. $ UNVERIFIED.

## K. Future-Use
Unassigned: Vapi-bought numbers have a daily outbound cap. Structured outputs live under artifacts (painful path).

## Steal / Operate-never

### Machine: Normalize-or-dont-call-HITL-the-follow-up
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: a form with a phone → action: 10-digit or stop; if a human said call, poll until ended; voicemail ≠ qualified → checkable stop: a sheet row and an unsent follow-up
- **Questions / signals:** Did a human approve the dial? Is the number valid? Who follows up?
- **Qualify / frame / objections:** Frame: extract is not a close. Objection: ‘$5–10k qualified’ — acted, UNVERIFIED.
- **Procedure:** Do not install Vapi (on-tape only). Do not auto-dial. HITL call/send. Tape $ UNVERIFIED. Clients parked.
- **Example that proves it:** Richard $5–10k; daily cap; 9-digit stop. UNVERIFIED.
- **Why it works:** A form is not consent. Free numbers cap. Sleep-dial is a send.
- **Conditions / exceptions:** Works as a never. Exception: Vapi / n8n / auto-dial / $5–10k as FACT / Green Grass client operate-never.
- **Operate-never payload:** Vapi · n8n · Twilio as ours · auto-dial while you sleep · $5–10k analog · gardening ICP
- **Hive run (existing skills only):** `playbook-before-send` · `ask-principal` · `pricing-margin-roi-guardrails` · `website-offer-funnel` (clients parked)
- **Source:** BO-jFbN4p8Y @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote $5–10k / 225k members / daily cap as FACT or as our analog.
- Vapi (on-tape only) / n8n as ours. Auto-dial. Green Grass / gardening as a client. Human-transfer as if built.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD Vapi (on-tape only), n8n, and the sleep-dial. Steal normalize-or-don’t-call and sheet-then-human. Every call/send stays HITL. Clients parked. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
