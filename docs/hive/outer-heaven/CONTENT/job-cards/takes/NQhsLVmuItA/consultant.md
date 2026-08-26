# Consultant — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Guardrail-node teaser (short twin of `oWdJMJp2HgM`). Beats: two actions — check text for violations (uses AI) vs sanitize text (no AI; encrypt/desensitize before the LLM). Demo: keyword block for “password” and “system.” Three items: omelette order passes; “update the system setting” and “enter your password” fail. You control pass vs fail: pass → email/CRM; fail → Slack, or throw an error and stop the workflow. CTA to the long. No VTT. UNKNOWN. ~339 words.

## B. Atomic Knowledge

### Two guardrail shapes: judge vs strip
- **Claim:** Check-for-violations uses AI; sanitize strips/encrypts sensitive info without an LLM.
- **Reasoning:** Not every safety step should pay a model or trust a model.
- **Mechanism:** Pick judge (AI) or strip (deterministic) before the main LLM.
- **Evidence:** “sanitize text… doesn't use AI. So it can automatically encrypt or desensitize certain info before you send it to a large language model.”
- **Conditions:** n8n guardrail node. Keyword demo is the judge path.
- **Exceptions:** Keyword lists miss paraphrases; AI judges miss too.
- **Action:** Prefer deterministic strip for secrets. Do not treat the node as a complete safety program.
- **Confidence:** high
- **Source:** `NQhsLVmuItA` @ UNKNOWN — “sanitize text, which is really nice because it doesn't use AI”
- **Epistemic:** SOURCE
### Pass/fail must be wired to a stop
- **Claim:** A fail can Slack you or error the whole workflow; a pass can continue to email/CRM.
- **Reasoning:** A flag without a stop is a log line.
- **Mechanism:** Run guardrail → branch pass/fail → fail stops or alerts; pass continues.
- **Evidence:** “you can make the whole workflow stop and just throw an error.”
- **Conditions:** Three-item keyword test.
- **Exceptions:** Stopping the workflow can be right; emailing on pass can be the send we refuse.
- **Action:** Wire fail to a hard stop. Do not wire pass to auto-send.
- **Confidence:** high
- **Source:** `NQhsLVmuItA` @ UNKNOWN — “if it fails… trigger an error in the workflow”
- **Epistemic:** SOURCE


## C. Mental Models

He wants safer workflows to look like a node you type “guard” to find. He is proud that sanitize is non-AI. He likes full control of the branches. He uses a toy keyword list (password/system) that would also flag innocent “system” talk — he does not discuss false positives beyond the omelette pass.

## D. Procedures

1. Decide judge vs strip. 2. Name the forbidden tokens or the PII types. 3. Run a few items. 4. Wire fail to stop/alert. 5. Keep pass away from send unless HITL. Avoid: calling the workflow “safe” because a node exists.

## E. Examples

**Situation:** Three strings, block “password” and “system.” **Action:** One pass (omelette), two fails. **Outcome:** Branches visible. **Lesson:** Fail must do something. Implicit rule: sanitize-before-LLM is a separate, non-AI path.

## F. Decision Rules

If fail only logs, you do not have a guardrail. If “system” is a blocked keyword, expect false positives. If pass sends mail, that is a different product.

## G. Contrarian

Field default: stuff safety into the system prompt. He uses a node with branches. Field default: all safety is AI. He shows a non-AI sanitize.

## H. Assumptions

Keyword demo is toy. False-positive design thin. Email-on-pass is a smash we will not operate. n8n-specific node.

## I. Questions

What does the long add (PII types, jailbreaks, rate limits)? Who tunes the keyword list?

## J. Connections

**SYSTEM SYNTHESIS:** Long `oWdJMJp2HgM`. Maps to `send-removed` + `input-required-gate` + `golden-test-loop` (test the fail rows).

## K. Future-Use

Unassigned: non-AI sanitize-before-LLM as a default; fail-must-stop as a consultant accept test.

## Steal / Operate-never

### Machine: Judge-or-strip, then fail-must-stop
- **Epistemic:** SOURCE
- **Workflow / loop:** Choose AI-judge vs deterministic sanitize → name what is forbidden → run examples → fail alerts or errors (hard stop) → pass continues only to safe/HITL steps
- **Questions / signals:** Is this a secret (strip) or a policy (judge)? What happens on fail? Does pass send?
- **Qualify / frame / objections:** Qualify: they have text that must not hit an LLM or a customer. Frame: two actions. Objection: “the prompt says be safe” — he wants a node and a branch.
- **Procedure:** Wire the fail. Do not auto-email on pass. Do not claim “safer” from a toy list.
- **Example that proves it:** password/system keywords: omelette pass; system-setting and enter-password fail.
- **Why it works:** Safety that cannot stop the workflow is decoration. Non-AI strip covers the cases you should not trust a model to see.
- **Conditions / exceptions:** Toy keywords. n8n node. Pass→email is operate-never.
- **Operate-never payload:** Auto-send on pass. Treat guardrails as done. Install nothing new for a parked client.
- **Hive run (existing skills only):** `send-removed` · `input-required-gate` · `golden-test-loop` · `ask-principal`
- **Source:** `NQhsLVmuItA` @ UNKNOWN


### Operate-never
- Auto-email/CRM on pass.
- Call a keyword node a safety program.
- Skip a hard stop on fail.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “make the workflow safer.” Felt problem is a leak (secrets out, wrong send) — if named. Do not drop a guardrail node on a parked client as the project.

**Four-blank after constraint:** Toddler stop = a fail row that actually stops. Pass does not send.

**Skeptical-customer:** Omelette vs password is a classroom. Clients parked.
