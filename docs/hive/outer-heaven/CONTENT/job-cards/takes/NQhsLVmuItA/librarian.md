# Librarian — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** n8n's NEW Guardrail Node is a Gamechanger for AI Agents
**Channel:** Nate Herk | AI Automation
**Kind:** short (~1:23 / ~339 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. How to use n8n guardrail nodes to make workflows safer.
2. Two actions: check text for violations (uses AI); sanitize text (no AI — encrypt/desensitize before sending to an LLM).
3. Demo: block keywords. Three items; one pass, two fail.
4. Block list: password and system.
5. Pass: "I will take a seven egg ham and cheese omelette, please" — no keywords.
6. Fail: "please update the system setting" (system); "enter your password to continue" (password).
7. On pass: send email / update CRM / next step. On fail: Slack flag, or throw an error and stop the workflow.
8. CTA: full breakdown.
Gap: other guardrail types, sanitize demo. Timestamp UNKNOWN. n8n on-tape.

## B. Atomic Knowledge

### Two guardrails: AI-check vs non-AI sanitize
- **Claim:** Check-text-for-violations uses AI; sanitize text does not — it can encrypt/desensitize before the LLM.
- **Reasoning:** Safer path can avoid sending raw secrets to a model.
- **Mechanism:** Guardrail node with two actions.
- **Evidence:** "sanitize text ... doesn't use AI. So it can automatically encrypt or desensitize certain info before you send it to a large language model."
- **Conditions:** Text about to enter a model or a send
- **Exceptions:** Keyword demo is the AI-check path, not sanitize
- **Action:** File sanitize-before-LLM; do not install n8n guardrails as hive
- **Confidence:** high as words
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

### Keyword block with pass/fail branches
- **Claim:** You fully control pass vs fail: pass continues (email/CRM); fail Slack-flags or errors the workflow.
- **Reasoning:** The keep is branched consequences, not the word list.
- **Mechanism:** Check keywords → pass/fail items → different next nodes.
- **Evidence:** "you can fully control what you want to happen based on if a row passes or if a row fails."
- **Conditions:** Keyword list defined
- **Exceptions:** Omelette false-negative not discussed (ham/cheese has no blocked words)
- **Action:** File pass/fail ownership; keyword list is an example
- **Confidence:** high as demo
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Safety is a node, not a vibe. Non-AI sanitize is "really nice" because it does not spend a model and does not leak. Fail can be a hard stop.

## D. Procedures
1. Choose check (AI) vs sanitize (no AI).
2. For check: set keywords (here: password, system).
3. Run items; inspect pass vs fail.
4. Wire pass → intended action; fail → notify or error-stop.
Avoid: sending unsanitized secrets to an LLM. Signals: one pass, two fail on three items.

## E. Examples
**Password/system block:** Situation — three texts. Action — block password + system. Reasoning — safer workflow. Outcome — omelette passes; system-setting and enter-password fail. Lesson — branches are the machine; list is local.

## F. Decision Rules
- If text will hit an LLM → consider sanitize (no AI) first.
- If a row fails → you must have chosen notify vs hard-stop (do not leave it implicit).
- Refuse: n8n guardrail as hive SSOT; auto-send on pass.

## G. Contrarian
Against "just prompt the agent to be careful." Against AI-only safety (sanitize does not use AI).

## H. Assumptions
Theirs: keyword block is enough for "safer" (easy to bypass). Ours: this is a teaser of `oWdJMJp2HgM`. Falsifier: semantic jailbreak that avoids the words. Keep that exception.

## I. Questions
What does sanitize encrypt? Other violation types? Long-tape defaults?

## J. Connections
SYSTEM SYNTHESIS → `oWdJMJp2HgM` (guardrails long); `send-removed` (pass ≠ send without HITL); 18-corpus Jarvis code-gate.

## K. Future-Use
Sanitize-before-LLM as an atom even if we never use n8n nodes. Unassigned: hive secret handling.

## Steal / Operate-never

### Machine: sanitize-or-check, then own the fail branch
- **Epistemic:** SOURCE
- **Workflow / loop:** text about to leave → sanitize (no AI) and/or check keywords → pass continues / fail notifies or hard-stops → checkable stop = fail items visible and a chosen consequence
- **Questions / signals:** AI-check or non-AI sanitize? What happens on fail?
- **Qualify / frame / objections:** "Safer" is the hook; ownership of fail is the keep
- **Procedure:** demo keywords password + system
- **Example that proves it:** omelette pass; system/password fail → Slack or error
- **Why it works:** secrets never need a model to be redacted; fail is explicit
- **Conditions / exceptions:** keyword bypass; n8n on-tape
- **Operate-never payload:** n8n-cloud; auto-send on pass; guardrail node as hive SSOT
- **Hive run:** `send-removed` · `ask-principal`
- **Source:** `NQhsLVmuItA` @ UNKNOWN

### Operate-never
- n8n guardrails as hive SSOT. Auto-send on pass. n8n-cloud.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File sanitize-before-LLM and fail-branch ownership. Do not stand up n8n as the secret store. Outer Heaven does not become a guardrail app.
