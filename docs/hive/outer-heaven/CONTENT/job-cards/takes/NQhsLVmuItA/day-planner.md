# Day Planner — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short: n8n guardrail nodes. Beats: two actions — check text for violations (uses AI) vs sanitize text (no AI; encrypt/desensitize before the LLM); keyword-block demo: three items, one pass / two fail; block list = “password” and “system”; pass = omelette order; fails = “update the system setting” / “enter your password”; pass branch can email/CRM; fail can Slack, throw error, stop the workflow. CTA to full (`oWdJMJp2HgM`). Timestamp UNKNOWN.

## B. Atomic Knowledge
### Two guardrails: AI check vs non-AI sanitize
- **Claim:** Check-text-for-violations uses AI; sanitize text does not — it can encrypt/desensitize before the model.
- **Reasoning:** Not every safety step should spend tokens or hallucinate a verdict.
- **Mechanism:** Two node actions, different cost/risk.
- **Evidence:** “sanitize text… doesn’t use AI… encrypt or desensitize certain info before you send it to a large language model.”
- **Conditions:** Text is about to hit a model or a send.
- **Exceptions:** Empty text → nothing to sanitize.
- **Action:** Prefer non-AI sanitize before a model call on money/PII paths.
- **Confidence:** high as his distinction.
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

### Pass/fail branches are the control
- **Claim:** You fully control pass vs fail: pass → email/CRM; fail → Slack, error, or stop the whole workflow.
- **Reasoning:** A flag without a stop is decoration.
- **Mechanism:** Keyword (or AI) check → two branches.
- **Evidence:** “you can make the whole workflow stop and just throw an error.”
- **Conditions:** A block list or violation policy exists.
- **Exceptions:** A pass that auto-sends is still operate-never for this desk.
- **Action:** Fail = stop. Pass ≠ send from this desk.
- **Confidence:** high.
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Safety is a node, not a hope. Non-AI sanitize is the cheaper first door. Priority: show a visible pass/fail. He is comfortable stopping the workflow. Uncertainty: keyword “system” will false-positive (he’s demoing that).

## D. Procedures
1. Decide: keyword/AI check vs sanitize-before-model.
2. Name the block list.
3. Run a three-row fixture (pass + two fails).
4. Fail → Slack or error or stop. Do not continue to send.
5. Pass → still HITL send.
Avoid: auto-email on pass; treating “system” as a smart policy.

## E. Examples
**Password/system keywords:** Situation → three strings. Action → block password + system. Reasoning → fail closed. Outcome → omelette passes; system-setting and password fails. Lesson → fixture with a known pass and known fails; stop on fail.

## F. Decision Rules
- If PII/secrets may hit a model → sanitize first (non-AI).
- If a keyword hits → stop, do not “flag and continue.”
- If pass would send → still Evens.

## G. Contrarian
Rejects “just prompt the agent to be careful.” Field assumption: the model is the guardrail. He puts a node in front, and one of them is not even AI.

## H. Assumptions
Theirs: keyword lists are enough for the demo. Ours: “system” is a clumsy token and will false-positive. Falsifier: sanitize that breaks legitimate copy. Survivorship: three rows.

## I. Questions
Full policy set in `oWdJMJp2HgM`? What does sanitize actually encrypt? Slack-on-fail — who is paged?

## J. Connections
- SYSTEM SYNTHESIS → `oWdJMJp2HgM` · `send-removed` · `ask-principal` · `golden-test-loop` (pass/fail fixture).

## K. Future-Use
Non-AI sanitize-before-model as a default on any future money path. Unassigned.

## Steal / Operate-never

### Machine: sanitize-or-check → pass/fail → stop on fail
- **Epistemic:** SOURCE
- **Workflow / loop:** text about to move → sanitize (no AI) and/or check → fail stops · pass still HITL
- **Questions / signals:** Will this hit a model? What are the block words? Who is notified on fail?
- **Qualify / frame / objections:** “The agent will be careful” is the fail frame. A stop branch is the pass.
- **Procedure:** Three-row fixture. Fail = error. Pass ≠ send.
- **Example that proves it:** Situation → three texts. Action → block password/system. Reasoning → visible branches. Outcome → 1 pass / 2 fail. Lesson → fixture + stop.
- **Why it works:** A deterministic fail is cheaper than hoping the model refuses.
- **Conditions / exceptions:** Keyword lists false-positive. AI-check costs tokens.
- **Operate-never payload:** Auto-email on pass; n8n-cloud; secrets into the model.
- **Hive run (existing skills only):** `send-removed` · `golden-test-loop`.
- **Source:** `NQhsLVmuItA` @ UNKNOWN

### Operate-never
- Auto-send on pass.
- Paste passwords into chat/model.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as fail-closed on one dry-run path. Clients parked — I do not put a guardrail-auto-email on the weekday board.
