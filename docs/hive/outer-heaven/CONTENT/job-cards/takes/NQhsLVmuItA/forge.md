# Forge — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Guardrail-node teaser. Beats: two actions — **check text for violations** (uses AI) vs **sanitize text** (no AI; encrypt/desensitize before the LLM) → keyword-block demo: three items → one pass, two fail → blocked keywords `password` and `system` → pass: “seven egg ham and cheese omelette” → fail: “update the system setting” / “enter your password” → you control pass vs fail next steps: pass → email/CRM; fail → Slack flag **or throw an error and stop the workflow** → play-button to `oWdJMJp2HgM`. Timestamp UNKNOWN.

## B. Atomic Knowledge

### Two guardrails: AI check vs deterministic sanitize
- **Claim:** Violation check uses AI; sanitize does not, and can strip/encrypt before the model.
- **Reasoning:** Not everything needs a model.
- **Mechanism:** Two node actions.
- **Evidence:** Opening.
- **Conditions:** Text about to enter an LLM or a send.
- **Exceptions:** None stated.
- **Action:** Prefer sanitize when the job is “strip secrets,” AI-check when the job is “policy.”
- **Confidence:** high.
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

### Fail can halt the whole workflow
- **Claim:** On fail you can Slack yourself or trigger an error that stops the run.
- **Reasoning:** Pass/fail are first-class branches.
- **Mechanism:** Keyword list → pass/fail → next node or throw.
- **Evidence:** Omelette vs password/system.
- **Conditions:** You chose the keywords.
- **Exceptions:** A sentence that uses “system” innocently fails (shown).
- **Action:** Steal halt-on-fail. Tune the keyword list or you will false-positive.
- **Confidence:** high.
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Safety is a branch, not a vibe. Deterministic sanitize is cheaper than an AI cop. A halt is a legal next step.

## D. Procedures
1. Pick check vs sanitize. 2. Name keywords (or patterns). 3. Run a three-row set you expect to split. 4. On fail: notify or throw. 5. Do not send on fail.

## E. Examples
**Situation:** Three lines, block password/system.  
**Action:** Run guardrail.  
**Reasoning:** Show pass vs fail.  
**Outcome:** 1 pass / 2 fail; omelette clean; “system setting” false-positive-ish.  
**Lesson:** Keyword lists bite innocents. Halt is still the right default for secrets.

## F. Decision Rules
- If secrets may enter the model → sanitize first (no AI).
- If policy language → AI check.
- If fail → do not continue to send/CRM (his example allows it only on pass).

## G. Contrarian
Field puts the LLM first and hopes. He can encrypt before the LLM and throw.

## H. Assumptions
n8n Guardrails node as shown. Falsifier: sanitize that still leaks; keywords that block all real tickets.

## I. Questions
What does sanitize actually encrypt? Long-tape list of built-in detectors?

## J. Connections
SYSTEM SYNTHESIS: `oWdJMJp2HgM` long. `error-heal-notify` (halt + alert). `ask-principal` on send. `9mqsVK6Iqoc` router.

## K. Future-Use
Throw-on-secret as a Forge precondition on any write path.

## Steal / Operate-never

### Machine: sanitize-or-check → pass/fail → halt on fail
- **Epistemic:** SOURCE
- **Workflow / loop:** choose node → run text → pass continues / fail Slack-or-throw → stop
- **Questions / signals:** Does this need AI or a strip? Which words halt?
- **Qualify / frame / objections:** “System” in a breakfast order vs a settings leak — tune the list.
- **Procedure:** Never send on the fail branch.
- **Example that proves it:** Omelette pass; password/system fail.
- **Why it works:** A secret that never reaches the model cannot be logged by the model.
- **Conditions / exceptions:** Keyword false positives. Teaser.
- **Operate-never payload:** Install n8n for the node; auto-email on pass without HITL.
- **Hive run:** `slice-build` (one halt) + `ask-principal` + existing error-heal alert shape.
- **Source:** `NQhsLVmuItA` @ UNKNOWN

### Operate-never
- Send on a fail branch. Quote “gamechanger” as FACT.
- New hunt. Prod deploy of a guardrail mill.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not ship a secret into a model to “see if it notices.” Strip or halt first. Fail = stop, then Evens. Deploy HITL.
