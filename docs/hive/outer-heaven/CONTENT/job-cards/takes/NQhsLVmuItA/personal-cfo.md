# Personal CFO — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.
**Walk:** VIDEO-FIRST from `full.txt` (339 words, short 1:23). json3 present. Tape $ UNVERIFIED. No spend. Clients parked. Stack Cursor + Grok.

## A. Source Map
1. Guardrail nodes: check text for violations (uses AI) vs sanitize text (no AI; encrypt/desensitize before LLM). **SOURCE**
2. Keyword demo: block 'password' and 'system'; omelette passes; two fails. **SOURCE**
3. Fail → Slack or throw error / stop; pass → email/CRM/next. **SOURCE**

## B. Atomic Knowledge

### Sanitize without an LLM
- **Claim:** Sanitize does not use AI; it can desensitize before the model sees the text.
- **Reasoning:** Cheaper + less leakage than asking a model to be careful.
- **Mechanism:** Non-AI node before the LLM.
- **Evidence:** 'it doesn't use AI' / 'before you send it to a large language model.'
- **Conditions:** Known patterns (keywords, PII-shaped strings).
- **Exceptions:** Keyword lists miss novel leaks.
- **Action:** Steal pre-LLM sanitize + fail-closed. Do not buy n8n for it.
- **Confidence:** high
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Speaker treats safety as a node, not a vibe in the prompt, and distinguishes AI-check vs deterministic sanitize. **SOURCE**

## D. Procedures
- Block keywords; sanitize before LLM. **SOURCE**
- On fail: notify or halt; do not continue to send. **SOURCE**

## E. Examples
**Situation:** Three strings, two contain password/system. **Action:** Keyword guard; one pass, two fail. **Reasoning:** Deterministic. **Outcome:** Fail branch visible. **Lesson:** Cheap check before expensive/risky model. Implicit rule: do not pay an LLM to see a password.

## F. Decision Rules
- If text may contain secrets → sanitize or halt before the model. **SOURCE**
- If a node can send → it sits after pass. **SYSTEM SYNTHESIS**

## G. Contrarian
Field prompt-engineers 'don't leak.' He uses a non-AI sanitize. **SOURCE**

## H. Assumptions
Theirs: keyword lists are enough. Falsifier: PII that does not match keywords. Disagreement: none on fail-closed.

## I. Questions
- Encrypt vs redact? Not specified.
- Token $ of the AI violation-check? Not priced.

## J. Connections
- `oWdJMJp2HgM` · `send-removed`. **SYSTEM SYNTHESIS**

## K. Future-Use
Pre-LLM sanitize as default before any paid call. Unassigned.

## Steal / Operate-never

### Machine: sanitize-then-maybe-model
- **Epistemic:** SOURCE
- **Workflow / loop:** text in → deterministic sanitize/keyword → fail = halt → pass = optional model → checkable stop = secrets never go to a paid API; no send
- **Questions / signals:** Password / system / account numbers?
- **Qualify / frame / objections:** 'The model will be careful' → tape added a node.
- **Procedure:** Fail-closed. Do not buy n8n-cloud for guardrails.
- **Example that proves it:** Omelette passes; password/system fail → Lesson: cheap gate.
- **Why it works:** Tokens and leaks are both bills.
- **Operate-never payload:** n8n-cloud; sending the fail branch anyway.
- **Hive run:** `send-removed` · `ask-principal`
- **Source:** `NQhsLVmuItA` @ UNKNOWN

### Operate-never
- Move money, approve a charge, buy a seat, or cancel a lock-in.
- Quote tape $ / hours / student counts as FACT or household income.
- Install on-tape vendors. Cursor + Grok only.
- Auto-send / auto-pay / auto-book / auto-deploy / auto-publish / auto-dial.
- New hunt / unpark client / new `icp_id`. Merge `LESSONS-FROM-TAPE.md`. Auto-write `SKILL.md`.


## L. Role-Specific Applications
Guardrails are a token-and-leak control, not a vendor reason. Do not put secrets in a paid model.

Employment covers baseline (OPERATOR_MEMORY). No dated runway-months number — I will not fake one. Career Strategist owns quit math; this desk owns the months.
