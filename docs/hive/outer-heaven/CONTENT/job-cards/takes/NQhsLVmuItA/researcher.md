# Researcher — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Guardrail-node short. Beats: (1) n8n guardrails: two actions — “check text for violations” (uses AI) vs “sanitize text” (no AI; encrypt/desensitize before the LLM). (2) Demo: block keywords. Three items in; one pass, two fail. (3) Block list: password, system. (4) Pass: “I will take a seven egg ham and cheese omelette, please.” (5) Fail: “please update the system setting” (system) and “enter your password to continue” (password). (6) You control pass vs fail next steps: pass → email/CRM; fail → Slack flag, or throw an error and stop the workflow. (7) Play-button to full. Timestamp UNKNOWN. Long: `oWdJMJp2HgM`.

## B. Atomic Knowledge

### Two guardrail kinds: AI-check vs non-AI sanitize
- **Claim:** Violation-check uses AI; sanitize does not, and can desensitize before the model.
- **Reasoning:** Sanitize is “really nice because it doesn’t use AI.”
- **Mechanism:** Two node actions, different cost/risk.
- **Evidence:** Opening taxonomy.
- **Conditions:** n8n guardrail node.
- **Exceptions:** Keyword block in the demo is not clearly which action — he says “blocking out certain keywords” after introducing both (do not flatten into “sanitize = keywords”).
- **Action:** Prefer non-AI sanitize for secrets; use AI-check when the rule is semantic.
- **Confidence:** high on the taxonomy; medium on which action ran in the demo.
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE (taxonomy) + INFERENCE (when to prefer sanitize)

### Keyword fail-branch is a hard stop you design
- **Claim:** Pass/fail branches are yours: continue (email/CRM) or Slack or throw and stop.
- **Reasoning:** Guardrail is useless if fail still proceeds.
- **Mechanism:** Three test items → 1 pass / 2 fail on password|system.
- **Evidence:** Omelette pass; system/password fails; listed next actions.
- **Conditions:** You named the keywords.
- **Exceptions:** Benign text containing “system” will fail (his example is a setting update).
- **Action:** Design the fail path (notify or halt) before going live.
- **Confidence:** high.
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Safety is a node with branches, not a vibe. Non-AI sanitize exists specifically so secrets never hit the LLM. Fail should be able to halt the whole workflow.

## D. Procedures
1. Decide: semantic violation (AI check) vs secret stripping (sanitize, no AI).
2. For keywords: name the block list.
3. Test mixed items; confirm pass vs fail.
4. Wire pass → intended work; fail → Slack and/or throw.
5. Do not let fail fall through.

## E. Examples
- **Situation:** Three lines, two dirty. **Action:** Block password + system. **Reasoning:** Keyword gate. **Outcome:** Omelette passes; the other two fail with the matched word shown. **Lesson:** The matched keyword is the evidence. Implicit rule: “system” is a blunt token — it will catch admin-ish sentences.

## F. Decision Rules
- If text may contain secrets → sanitize before the LLM (non-AI).
- If fail → notify or halt; do not continue as success.
- Refuse: treating keyword block as sufficient PII policy.

## G. Contrarian
You do not need an LLM to desensitize. Field often sends raw text to the model “with a safety prompt.”

## H. Assumptions
Keyword list is enough for the demo. “Encrypt or desensitize” is not shown. False positives on “system” are acceptable to him here.
**Desk dissent:** none yet.

## I. Questions
- Was the keyword demo the AI check or a third mode?
- What does sanitize actually emit (mask vs encrypt)?

## J. Connections
- **SYSTEM SYNTHESIS:** `oWdJMJp2HgM` long guardrails. `send-removed`. Do not flatten into a security-product ICP.

## K. Future-Use
Non-AI sanitize-before-model as an unassigned hive hygiene rule.

## Steal / Operate-never

### Machine: sanitize-or-halt-on-fail
- **Epistemic:** SOURCE
- **Workflow / loop:** choose AI-check vs non-AI sanitize → test pass/fail → wire fail to Slack or throw → do not fall through
- **Questions / signals:** Could this text contain secrets? What happens on fail?
- **Qualify / frame / objections:** “The model will be careful” → sanitize first.
- **Procedure:** D.
- **Example that proves it:** password/system keywords; omelette pass; two fails; halt or Slack.
- **Why it works:** Fail is a designed branch, not a log line.
- **Conditions / exceptions:** Keywords are blunt. Taxonomy vs demo action is slightly ambiguous.
- **Operate-never payload:** n8n guardrail as the only safety; auto-email on pass without HITL; new ICP.
- **Hive run:** `send-removed` · `ask-principal` · `golden-test-loop`
- **Source:** `NQhsLVmuItA` @ UNKNOWN

**Operate-never**
- Auto-send on pass. Quote “gamechanger” as FACT. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Steal halt-on-fail + sanitize-before-model. Do not install n8n guardrail nodes in hive prod this session.
