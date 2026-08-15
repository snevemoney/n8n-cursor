# Product GTM — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (title: “n8n's NEW Guardrail Node is a Gamechanger” 1:23). Beats: (1) two actions: check text for violations (uses AI) vs sanitize text (no AI — encrypt/desensitize before the LLM); (2) keyword-block demo: three items → one pass, two fail; (3) block list = “password” and “system”; pass = omelette order, no keywords; fail = “update the system setting” and “enter your password”; (4) you control pass vs fail next steps: pass → email/CRM; fail → Slack flag, or throw an error and stop the workflow; (5) play-button full breakdown. Timestamp UNKNOWN. Long: `oWdJMJp2HgM`.

## B. Atomic Knowledge
### Two guardrail kinds: AI-check vs non-AI sanitize
- **Claim:** Violations-check uses AI; sanitize does not, and can encrypt/desensitize before the model sees the text.
- **Reasoning:** Not everything should pay an LLM or leak secrets into one.
- **Mechanism:** Keyword block is deterministic; sanitize is pre-LLM.
- **Evidence:** He names both actions and runs the keyword test.
- **Conditions:** You know what must never pass (password, system).
- **Exceptions:** None.
- **Action:** Prefer non-AI sanitize for secrets; AI-check is a different job.
- **Confidence:** high.
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

### Fail branch must be designed (flag or hard stop)
- **Claim:** Pass and fail are both designed: pass can email/CRM; fail can Slack or error-stop the whole workflow.
- **Reasoning:** A guardrail with no fail action is decoration.
- **Mechanism:** Three test rows → 1 pass / 2 fail → inspect flagged keywords.
- **Evidence:** Omelette vs system/password.
- **Conditions:** Block list is explicit.
- **Exceptions:** None.
- **Action:** Write the fail action before selling “safer.”
- **Confidence:** high.
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Safer = a designed stop, not a vibe. Deterministic keyword blocks are teachable. Sanitize-before-LLM is the interesting one (no AI). Pass is not “send” as hive policy — that is his example.

## D. Procedures
1. Pick check-violations vs sanitize.
2. Name blocked keywords (or secret types).
3. Run mixed rows. Confirm pass/fail counts.
4. Bind fail → notify or hard error. Do not leave fail empty.
- Avoid: treating pass as auto-send (hive HITL).

## E. Examples
**Situation:** Three texts, block password+system. **Action:** Run guardrail. **Reasoning:** Safer workflow. **Outcome:** Omelette passes; system-setting and password fail. **Lesson:** Fail is the product. Implicit rule: you can stop the whole workflow on fail.

## F. Decision Rules
- If secrets may hit an LLM → sanitize (non-AI) first.
- If a keyword must never proceed → fail = error stop or human flag, not continue.
- Refuse: “gamechanger guardrail” as an offer name.

## G. Contrarian
Against sending everything to the model. Against AI-for-everything (sanitize “doesn’t use AI” is the praise).

## H. Assumptions
Theirs: keyword lists are enough; email/CRM on pass is fine. Ours: pass ≠ auto-send; n8n-cloud not installed. Falsifier: synonym that evades “password”/“system.”

## I. Questions
What does sanitize encrypt in the long? Can users override a fail? Not here.

## J. Connections
**SYSTEM SYNTHESIS:** Long `oWdJMJp2HgM`. Maps to `ask-principal` / HITL on send. Watchdog lane: fail → flag, not silent continue.

## K. Future-Use
Unassigned: non-AI sanitize as a Path A intake constraint. Keep.

## Steal / Operate-never

### Machine: named block-list → designed fail (flag or hard stop)
- **Epistemic:** SOURCE
- **Workflow / loop:** name forbidden tokens → run text → pass continues / fail flags or errors → inspect which keyword fired
- **Questions / signals:** What must never reach the model or the send step?
- **Qualify / frame / objections:** “Safer” without a fail action is not safer
- **Procedure:** Sanitize secrets without an LLM when possible. Hive send stays HITL even on pass
- **Example that proves it:** Omelette pass; “system” and “password” fail
- **Why it works:** Checkable rows; fail is visible
- **Conditions / exceptions:** Keyword evasion exists. His pass→email is not our operate
- **Operate-never payload:** Guardrail-node SKU; auto-email on pass
- **Hive run (existing skills only):** `ask-principal` · `send-removed`
- **Source:** `NQhsLVmuItA` @ UNKNOWN

### Operate-never
- Productize n8n guardrails; auto-send on pass
- Switch stack; new hunt; merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Steal designed-fail. Do not sell “safer agents.” If a Path A ever needs a secret boundary, write the fail action in the four-blank (what stops the job). Clients parked.
