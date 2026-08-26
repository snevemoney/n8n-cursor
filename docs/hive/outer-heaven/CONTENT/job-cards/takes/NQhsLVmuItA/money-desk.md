# Money Desk — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (~339 words). Beats in order: n8n guardrail nodes: check text for violations (uses AI) vs sanitize text (no AI — encrypt/desensitize before LLM). Demo: block keywords password and system; three items — omelette passes; “update the system setting” and “enter your password” fail; pass branch can email/CRM; fail can Slack, throw error, stop the workflow; CTA full. Visual-only UI / music not in captions. json3 start 00:00. Caption ingest only.

## B. Atomic Knowledge
### Sanitize-before-LLM vs AI-check
- **Claim:** Sanitize text does not use AI and can desensitize before the model; violation-check uses AI.
- **Reasoning:** Cheaper/safer path exists that is not another model call.
- **Mechanism:** Two actions: check (AI) vs sanitize (no AI).
- **Evidence:** On-tape keyword block: password, system. 1 pass / 2 fail.
- **Conditions:** You know the sensitive tokens.
- **Exceptions:** AI-check is a second bill and can miss.
- **Action:** Prefer deterministic sanitize/block before any model. Do not send on fail.
- **Confidence:** high as a COGS/safety ladder
- **Source:** `NQhsLVmuItA` @ 00:00
- **Epistemic:** SOURCE
### Fail-stops-the-side-effect
- **Claim:** On fail you can Slack, error, or stop; on pass you may email/CRM.
- **Reasoning:** The guardrail is a hard stop, not a log line.
- **Mechanism:** Pass → side effect. Fail → notify or halt.
- **Evidence:** Three-item demo.
- **Conditions:** Keywords configured.
- **Exceptions:** Keyword lists miss paraphrases.
- **Action:** Never email/CRM from the fail branch. HITL on money-adjacent pass too.
- **Confidence:** high
- **Source:** `NQhsLVmuItA` @ 00:00
- **Epistemic:** SOURCE


## C. Mental Models
Belief: safer workflows are sellable (implied by “make your workflow safer”). Priority: control what happens on pass vs fail. Deterministic sanitize is “really nice” because it does not use AI.

## D. Procedures
Procedure: pick check vs sanitize; set keywords; run a pass and two fails; wire fail to stop/notify. Avoid: sending email on fail. When to change: if a bad string passes, add the keyword or stop shipping.

## E. Examples
**Situation:** Three test strings. **Action:** Block password/system; omelette passes; system-setting and password fail. **Reasoning:** Show pass/fail control. **Outcome:** 1 pass / 2 fail. **Lesson:** A keyword halt is a checkable stop; email-on-pass is still a hard step for us.

## F. Decision Rules
If text hits the LLM → sanitize first when you can. If fail → do not side-effect. If pass is email/CRM → HITL. Refuse: guardrail node as a SKU.

## G. Contrarian
Rejects “just send it to the LLM.” Field skips the cheap non-AI sanitize.

## H. Assumptions
Keyword block is brittle. One omelette joke. Full tape `oWdJMJp2HgM`.

## I. Questions
What else can sanitize encrypt? Does check-text catch synonyms of password?

## J. Connections
SYSTEM SYNTHESIS: teaser for `oWdJMJp2HgM`. API-then-cheap-path rhymes with `CB5bG4mvnS0` (API → macro → vision). Maps to `input-required-gate` on fail.

## K. Future-Use
Unassigned: sanitize-before-LLM as a default on any Path C that touches PII — observe only until Evens names the surface.

## Steal / Operate-never

### Machine: Deterministic-block then halt-on-fail
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: text about to hit a model or a send → action: sanitize/block keywords → checkable stop: fail = no email/CRM; pass still HITL if money-adjacent
- **Questions / signals:** “Does this string contain a token we must never send?”
- **Qualify / frame / objections:** Frame: safer workflow. Objection: “AI will catch it” — he also has a non-AI sanitize.
- **Procedure:** Wire fail to stop. Do not auto-email on pass. Keyword list is ours, not Nate’s.
- **Example that proves it:** Omelette pass; “system setting” / “enter your password” fail.
- **Why it works:** A cheap halt is cheaper than a model that sees a password.
- **Conditions / exceptions:** Exception: keywords miss paraphrases — still do not skip the halt.
- **Operate-never payload:** Auto-email on pass · n8n guardrail as a sold SKU · sending unsanitized PII.
- **Hive run (existing skills only):** `input-required-gate` · `ask-principal` · `golden-test-loop`
- **Source:** `NQhsLVmuItA` @ 00:00


### Operate-never (this desk will not operate)
- Auto-email/CRM on the pass branch.
- Send unsanitized passwords/system text to a model we pay for.
- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
PASS sanitize-before-LLM as a HOLD-gate. Do not analog the 1/2 demo. No send.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
