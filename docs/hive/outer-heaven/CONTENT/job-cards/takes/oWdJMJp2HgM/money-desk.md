# Money Desk — oWdJMJp2HgM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~3464 words. Nate: n8n native Guardrails (v1.119+). Caption-only; timestamp UNKNOWN; visual/click UNKNOWN. Beats in order: cold open — two nodes so you do not send sensitive text to a model and you check AI output before it leaves. Slides: enforce rules on incoming/outgoing text; built-in prompts + custom. Catalog: keywords (block phrases); jailbreak (prompt-injection / “unrestricted AI”); NSFW; PII (CC, email, SSN, passport, address); secret keys (API keys/passwords); topical alignment (stay in scope); URLs (allow/block schemas); custom prompt + regex. Need 1.119; type “guard”; two ops: Check text for violations (AI, OpenRouter in his graph) vs Sanitize text (no AI — encrypt/desensitize before the LLM). Keywords demo: 3 items; block “password” and “system”; omelette passes; “update the system setting” / “enter your password” fail; pass→email/CRM, fail→Slack or throw error; keywords comma-separated; text-to-check can be email/Slack/SMS variable. Jailbreak: threshold 7; native prompt customizable; 0=safe 1=risky; dog-before-school = 0 pass; “act as unrestricted AI / confidential commands” 0.95 fail; “no longer follow company guidelines” 0.9 fail; too many false fails → loosen prompt or raise threshold. NSFW: pickleball 24h pass; graphic violence 0.9 / obscene language 0.8 fail. PII: all vs selected types (IP, location, CC, datetime); ice-cream pass; john@ + SSN fail + entity type shown. Secret keys: permissiveness balanced/strict/permissive; “use my password password” and “connect to n8n” still pass even on strict; fails the actual API-key string — keys ≠ passwords unless you customize the system message. Topical alignment: business scope “n8n workflow automation”; add-node / error-handling pass; NBA finals 0.9 fail. URLs: allow only upai.com + HTTPS; block user-info; allow subdomains optional; HTTP vs HTTPS blocks even the “right” host. Stack guardrails in one Check node; or custom named + threshold + prompt. Sanitize (3 + custom, no model): PII → phone becomes placeholder but raw number still in node output for a log; keys → “API key is secret”; URLs → “visit URL”; custom regex. Close: free School JSON; Plus 200 members, Agent Zero, 10h/10s, One-person agency (annual), Subs to sales, Projects, weekly live — UNVERIFIED.

## B. Atomic Knowledge
### Sanitize-before-the-model-check-after
- **Claim:** Sanitize text is the no-AI node: strip PII/keys/URLs before the LLM. Check text for violations is the AI node: keywords/jailbreak/NSFW/PII/keys/topic/URLs/custom on the way out (or in).
- **Reasoning:** You do not want the model to see the SSN. You also do not want a jailbroken reply to hit Slack. Two different jobs, two nodes.
- **Mechanism:** Incoming: sanitize → then model. Outgoing: check → pass branch vs fail branch (Slack / throw / stop).
- **Evidence:** On-tape: omelette pass vs password/system fail; jailbreak 0 vs 0.95; phone placeholder still exposes raw number in the node.
- **Conditions:** You have a text hop before or after a model.
- **Exceptions:** n8n 1.119+ / OpenRouter / School JSON are not ours. Auto-send on the pass branch is operate-never.
- **Action:** Steal sanitize-then-check. Do not install n8n-cloud. Do not always-allow send.
- **Confidence:** high as a procedure
- **Source:** oWdJMJp2HgM @ UNKNOWN
- **Epistemic:** SOURCE
### Threshold-and-permissiveness-are-knobs-not-morals
- **Claim:** Jailbreak/NSFW/topic use a 0–1 confidence; raise threshold if too many false fails. Secret-keys ‘strict’ still passed ‘use my password password’ — it hunts key-shaped strings, not the word password.
- **Reasoning:** A 0.9 NBA-finals fail is only a fail because the scope was ‘n8n workflow automation.’ Same text would pass under a sports scope.
- **Mechanism:** Set scope + threshold + (optional) custom prompt. If secrets must include passwords, say so in the system message.
- **Evidence:** On-tape 0.95 / 0.9 jailbreak; 0.9 gore; 0.8 obscene; NBA 0.9; password-row still pass on strict.
- **Conditions:** You are tuning a classifier, not a law.
- **Exceptions:** Caption-only: we did not see the slider UI. Scores UNVERIFIED as our bench.
- **Action:** Steal tune-threshold. Do not treat 0.7 as a hive default.
- **Confidence:** high as his card
- **Source:** oWdJMJp2HgM @ UNKNOWN
- **Epistemic:** SOURCE
### Fail-branch-is-the-product
- **Claim:** Pass can continue (email/CRM). Fail can Slack, flag, or throw and stop the workflow. Stack keywords+jailbreak+PII in one Check node.
- **Reasoning:** A guardrail that only logs is a comment. The branch is the control.
- **Mechanism:** Define pass next-step and fail next-step before you turn the node on.
- **Evidence:** On-tape keyword three-item split; URL HTTP blocked even when host was ‘right.’
- **Conditions:** You own the next node.
- **Exceptions:** Auto-email / auto-Slack to a client is HITL. Sanitize still returns the raw phone for a log — do not ship that log.
- **Action:** Steal named fail-branch. HITL any send.
- **Confidence:** high
- **Source:** oWdJMJp2HgM @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: native guardrails make ‘comfortable’ workflows. Priority: sanitize before the model, check before the world; fail-branch over a green check. Experience: Agentic Arena jailbreak clip (tacos / São Paulo) as the wound. Contrarian: secret-keys ≠ password-words. Uncertainty: thresholds are toys; 200 members UNVERIFIED.

## D. Procedures
Order: confirm n8n ≥1.119 → Guardrails → Check (AI) vs Sanitize (no AI). Check: pick one or stack; set keywords/scope/allow-list/threshold; map text-to-check from the prior node; wire pass vs fail (continue / Slack / throw). Sanitize: PII all-or-selected / keys permissiveness / URLs / custom regex; treat placeholder output as the model input; do not forward the raw field. Caption-only: every click UNKNOWN.

## E. Examples
**Situation:** Three fake prompts, keywords password+system. **Action:** Check. **Reasoning:** exact match, no model. **Outcome:** omelette pass; system-setting and password fail. **Lesson:** Fail-branch is the product.

**Situation:** “Use my password password for the database” vs a real API key. **Action:** Secret-keys balanced then strict. **Reasoning:** he expected password to fail. **Outcome:** password rows pass; key string fails. **Lesson:** Customize the prompt if passwords matter.

**Situation:** Phone number through Sanitize PII. **Action:** block all PII. **Reasoning:** model must not see it. **Outcome:** placeholder in the text; raw number still in the node. **Lesson:** Sanitize ≠ delete. Do not ship the log.

## F. Decision Rules
IF text goes to a model → sanitize first. IF text leaves the workflow → check + named fail-branch. IF too many false fails → raise threshold or loosen prompt. IF you need passwords blocked → do not trust secret-keys default. IF URL allow-list → also lock schema (HTTPS). IF School / Plus / 200 / annual agency → not a SKU. Refuse: n8n-cloud as ours; always-allow send.

## G. Contrarian
Rejects ‘just prompt the model to be safe.’ Rejects treating secret-keys as a password filter. Field still ships raw PII in the sanitize sidecar.

## H. Assumptions
v1.119+ only. Demo strings are toys. OpenRouter is his Check brain. Survivorship: one instance. Falsifier: production false-fail rate kills the pass branch. Speech≠behavior: free School then Plus. 200 members UNVERIFIED.

## I. Questions
Did Guardrails GA with the same two ops? Any receipt that sanitize cut a real leak we can open? What’s the false-fail rate on jailbreak at 0.7?

## J. Connections
SYSTEM SYNTHESIS: fail-branch = `playbook-before-send`. Sanitize-before-model = `token-receipt` / filter-then-calc (`QCjMBOEhpLE`). Instance MCP always-allow (`5p5cV0yVDvQ`) is the anti-pattern. n8n / School / Plus operate-never.

## K. Future-Use
Unassigned: HTTP-vs-HTTPS as a schema lock even when the host is allow-listed. Raw-PII-still-in-node as a log-footgun.

## Steal / Operate-never

### Machine: Sanitize-in-check-out-named-fail-branch
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: text hop → action: sanitize (no AI) before the model; check (AI or keyword) before send → checkable stop: pass continues, fail Slack/throw, raw PII not in the outbound
- **Questions / signals:** Is this inbound to a model or outbound to a human? What’s the fail next-step? Do secret-keys need a password custom prompt?
- **Qualify / frame / objections:** Frame: two nodes, two jobs. Objection: ‘strict will catch passwords’ — it didn’t on his card.
- **Procedure:** ≥1.119. Stack checks if needed. Scope + threshold. Allow-list + schema. Never forward the sanitize sidecar.
- **Example that proves it:** Omelette pass / password fail; jailbreak 0 vs 0.95; phone placeholder + raw still present. UNVERIFIED as our bench.
- **Why it works:** The model should not see the SSN. The client should not see the jailbreak. A log that still holds the phone is not a delete.
- **Conditions / exceptions:** Works as a pattern. Exception: n8n / OpenRouter / School / Plus / auto-send operate-never. Scores UNVERIFIED.
- **Operate-never payload:** n8n-cloud · School JSON · Plus / 200 members · always-allow send · treat secret-keys as password-block
- **Hive run (existing skills only):** `playbook-before-send` · `ask-principal` · `input-required-gate` · `pricing-margin-roi-guardrails`
- **Source:** oWdJMJp2HgM @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote 200 members / Plus courses as FACT or as our analog.
- n8n-cloud / School JSON / Plus as a SKU. Auto-send on the pass branch. Ship the sanitize raw-PII sidecar.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD n8n Guardrails, School, and Plus. Steal sanitize-then-check and named fail-branch. Any send stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
