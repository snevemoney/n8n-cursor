# Wealth Manager — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.
**Tape:** n8n's NEW Guardrail Node is a Gamechanger for AI Agents · short · 1:23 · 339w · Channel: Nate Herk | AI Automation
**Upgrade:** old short steal/never → A–K global reconstruct, then Steal / Operate-never, then L. Clients parked. Do not allocate tape SKUs.

## A. Source Map
1. Two guardrail actions: check text for violations (uses AI) vs sanitize text (no AI — encrypt/desensitize before the LLM).
2. Keyword block demo: three items; one pass (“seven egg ham and cheese omelette”); two fail (“update the system setting”, “enter your password”) on keywords system/password.
3. On fail: Slack flag or throw error and stop the workflow. On pass: continue to email/CRM.
4. CTA: full `oWdJMJp2HgM`.
**Gaps:** full.txt has no inline timestamps. json3 exists for most Nate packets; cites below use json3 when a locus is recoverable, else `UNKNOWN`. Visual-only UI is described in speech, not seen here.

## B. Atomic Knowledge
### Sanitize before the model when you can
- **Claim:** Sanitize does not use AI; it strips/encrypts sensitive info before the LLM.
- **Reasoning:** You cannot un-send a password into a model log.
- **Mechanism:** Non-AI sanitize node → then model.
- **Evidence:** Spoken contrast.
- **Conditions:** Any inbox/CRM that may contain secrets.
- **Exceptions:** AI-check is for policy/tone, not for secrets.
- **Action:** Secrets path = sanitize/stop, not “ask the model if this is bad.”
- **Confidence:** high
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

### Fail must be able to halt
- **Claim:** He shows throw-error as a first-class fail path.
- **Reasoning:** A guardrail that only logs is a decoration.
- **Mechanism:** Pass → continue. Fail → Slack or error stop.
- **Evidence:** Keyword demo 1 pass / 2 fail.
- **Conditions:** Send-adjacent graphs.
- **Exceptions:** —
- **Action:** If it can send, fail must halt.
- **Confidence:** high
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Safety as a node, not a vibe. He likes that sanitize is cheap (no AI). He still offers “send your email” on the pass path — hive keeps send HITL.

## D. Procedures
List block keywords. Run sanitize before LLM. On fail, stop. Do not use the AI checker as the only secret gate.

## E. Examples
- **password/system keywords** — Situation → Three texts, two contain password/system. Action → Keyword guardrail. Reasoning → Deterministic block. Outcome → Omelette passes; the other two fail. Lesson → Deterministic beats a model for known secret words.

## F. Decision Rules
If text contains password/system (or our secret list) → halt. If sanitize exists → use it before the model. If pass path sends → still HITL.

## G. Contrarian
Rejects (implicitly) “just prompt the agent not to leak.”

## H. Assumptions
Keyword list is toy. Not a compliance program. n8n-cloud stay on tape.

## I. Questions
Does sanitize cover card numbers / SSNs on the long tape?

## J. Connections
**SYSTEM SYNTHESIS:** `oWdJMJp2HgM`. `send-removed`. Hermes intern-scopes on `gb5TlGw6Uks`.

## K. Future-Use
Halt-on-secret is future-use on any graph that can see an inbox. Unassigned.

## Steal / Operate-never

### Machine: Sanitize/halt before the model
- **Epistemic:** SOURCE
- **Workflow / loop:** Inbound text → keyword/sanitize → fail halt or pass → model. Send still HITL.
- **Questions / signals:** Is there a secret shape? Can fail throw?
- **Qualify / frame / objections:** Guardrail is a stop, not a suggestion.
- **Procedure:** Non-AI sanitize for secrets. AI-check only for soft policy.
- **Example that proves it:** Omelette passes; password/system fail.
- **Why it works:** Model logs are a leak surface.
- **Conditions / exceptions:** Known keywords/patterns. Fails on novel secret shapes without sanitize.
- **Operate-never payload:** Rely on the model to “be careful.” Auto-send on pass.
- **Hive run (existing skills only):** `send-removed` · `ask-principal`
- **Source:** `NQhsLVmuItA` @ UNKNOWN

### Operate-never
- Autonomous trades, transfers, or account changes. L4 human only.
- Quote tape $ / student counts / minutes / prizes as FACT or NAV.
- Treat the tape as a sector or allocate a tape SKU.
- Book YouTube income, community size, or a demo as portfolio proof.
- Install Claude Code / Codex / ChatGPT / Gemini / Vapi / n8n-cloud / switch stack as ours. Cursor + Grok only.
- New `icp_id`. Unpark Normand. Start Path A. Learning ≠ hunt. Clients parked.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Overwrite `takes/wealth-manager.md`. Merge `LESSONS-FROM-TAPE.md`.
- Auto-send on guardrail pass. Treat the node as compliance.

## L. Role-Specific Applications
A guardrail is not a security to buy off a short. It is a halt pattern this desk wants on anything account-adjacent. Clients parked.
