# Publishing Engine — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** n8n's NEW Guardrail Node is a Gamechanger for AI Agents
**Channel:** Nate Herk | AI Automation

## A. Source Map
1. How to use n8n guardrail nodes to make a workflow safer.
2. Two actions: check text for violations (uses AI) and sanitize text (no AI — encrypt/desensitize before the LLM).
3. Demo: block keywords password and system. Three items: one pass (omelette order), two fail (update the system setting; enter your password).
4. Pass/fail branches are fully controllable: pass → email/CRM; fail → Slack flag or throw and stop the workflow.
5. CTA: full breakdown.
Timestamp UNKNOWN (no VTT unless noted). Tape $ / student counts / job-loss % = UNVERIFIED.

## B. Atomic Knowledge

### Sanitize without a model
- **Claim:** Sanitize text does not use AI; it encrypts or desensitizes before the LLM.
- **Reasoning:** You do not want a model to see the secret in order to hide the secret.
- **Mechanism:** Sanitize node → redacted/encrypted payload → then the model.
- **Evidence:** Sanitize text… doesn't use AI. So it can automatically encrypt or desensitize certain info before you send it to a large language model.
- **Conditions:** Secrets or regulated fields exist in the payload.
- **Exceptions:** Keyword-block is a different node (AI check).
- **Action:** If a pack mentions PII, show sanitize-before-model, not a prompt that says 'be careful.'
- **Confidence:** high
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

### Pass/fail is a hard stop
- **Claim:** Keyword check splits pass vs fail; fail can Slack or throw and stop the whole workflow.
- **Reasoning:** A warning the model can ignore is not a guardrail.
- **Mechanism:** Three test items → one pass, two fail on password/system → branch.
- **Evidence:** You can make the whole workflow stop and just throw an error.
- **Conditions:** You have named blocked tokens.
- **Exceptions:** A synonym the list misses will pass — list is brittle.
- **Action:** Package pass/fail with a stop, not a vibe filter.
- **Confidence:** high
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
- Safer means stoppable, not 'the prompt is nice.'
- Non-AI sanitize is the interesting half.
- Omelette pass is the control.

## D. Procedures
- Name blocked keywords. Run a three-item set (one clean, two dirty).
- Wire fail to stop or to a human flag — not to send.
- Sanitize before the model when PII is in the payload.

## E. Examples
- Situation: Three strings, two contain password/system. Action: Keyword guardrail. Reasoning: Block before send. Outcome: 1 pass, 2 fail. Lesson: The pack is the fail branch that can throw.

## F. Decision Rules
- If fail still sends → not a guardrail.
- If PII hits the model raw → fail the pack.
- Do not treat keyword lists as complete safety.

## G. Contrarian
- Field puts safety in the system prompt. He puts a node that can throw.

## H. Assumptions
- Theirs: password+system is enough. Brittle.
- Ours: we do not install their node. We steal stop-on-fail.
- Falsifier: sanitize still leaks in logs.

## I. Questions
- What does encrypt mean here — reversible?
- Who owns the Slack fail ping?
- Does check-text-for-violations hallucinate a violation?

## J. Connections
- **SYSTEM SYNTHESIS:** HITL publish gate = fail branch.
- **SYSTEM SYNTHESIS:** Inbox send path in `9mqsVK6Iqoc` should hit this first.

## K. Future-Use
- Unassigned: sanitize-before-model as a report/PII checklist.
- Unassigned: throw-on-fail as the publish analog.

## Steal / Operate-never

### Machine: stop-on-fail-guardrail
- **Epistemic:** SOURCE
- **Workflow / loop:** name blocked tokens / PII fields → sanitize before model → check → pass continues / fail flags or throws → checkable stop = dirty item never sent
- **Questions / signals:** What tokens? Does fail throw? Did PII hit the model?
- **Qualify / frame / objections:** 'The prompt says don't share passwords' is not a guardrail.
- **Procedure:** This desk packages the fail branch. Evens decides if anything sends.
- **Example that proves it:** Omelette passes; system-setting and password fail.
- **Why it works:** A third party can see the dirty item stopped.
- **Conditions / exceptions:** Keyword lists miss synonyms. Sanitize is the stronger half.
- **Operate-never payload:** Auto-send on pass; treat guardrail as a security audit; install n8n-cloud.
- **Hive run (existing skills only):** `ask-principal` · `input-required-gate`
- **Source:** `NQhsLVmuItA` @ UNKNOWN

**Operate-never**
- Publish / schedule live / paid boost without Evens.
- Republish Nate or any source creator.
- Quote tape $ / hours×rate as FACT or as our price.
- Send / pay / deploy / book.
- New icp_id / unpark a client.
- Install on-tape vendors (n8n-cloud, Skool, Vapi, Claude, ChatGPT, Gemini).
- Auto-send on the pass branch.
- Call a keyword list a security program.

## L. Role-Specific Applications
- I package a pass/fail contact sheet. I do not send the pass.
- Sanitize-before-model is the line I write hardest on any pack that mentions PII.
- Evens publishes. I do not.
