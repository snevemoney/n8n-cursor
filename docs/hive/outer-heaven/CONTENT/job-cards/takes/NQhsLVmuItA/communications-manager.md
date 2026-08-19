# Communications Manager — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** n8n's NEW Guardrail Node is a Gamechanger for AI Agents
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** short · 339 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Visual-only UI clicks not fully narrated. Caption ingest; some ASR errors (Naden/Nitn = n8n).

Beats, in order:
- Guardrail nodes: two actions — check text for violations (uses AI) vs sanitize text (no AI; encrypt/desensitize before LLM).
- Demo: block keywords `password` and `system`. Three items: omelette passes; “update the system setting” and “enter your password” fail.
- Pass/fail branches are fully controllable: pass → send email / update CRM; fail → Slack flag, throw error, stop the workflow.
- CTA: full breakdown. Long-form `oWdJMJp2HgM`.

## B. Atomic Knowledge

### Sanitize before the model; keyword block as a hard fail
- **Claim:** Sanitize text does not use AI and can desensitize info before it hits an LLM. Keyword check can fail a row and stop the workflow.
- **Reasoning:** You do not need a model to strip secrets. You do need a stop when blocked words appear.
- **Mechanism:** Check or sanitize → pass/fail branch → next action or error.
- **Evidence:** Omelette pass; password/system fail. “you can make the whole workflow stop.”
- **Conditions:** Keywords are listed. Sanitize rules exist.
- **Exceptions:** Keyword lists miss paraphrases. AI-check-for-violations is a second, softer path.
- **Action:** Secrets never go to a model. Fail = stop, not “send anyway.”
- **Confidence:** high
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

### Pass branch is where he puts send
- **Claim:** On pass he names “send your email or update the CRM” as the happy path.
- **Reasoning:** Guardrail is the gate in front of side effects.
- **Mechanism:** Pass → side effect. Fail → Slack or error.
- **Evidence:** “if it passes, you can go ahead and send your email or update the CRM.”
- **Conditions:** A send node exists downstream.
- **Exceptions:** This desk: pass ≠ send. Pass = may draft.
- **Action:** Map pass → draft card. Map fail → stop + flag Evens.
- **Confidence:** high he said send-on-pass; we invert operate
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Two rails: deterministic sanitize vs AI violation check. **SOURCE**
- Fail should be louder than pass. **SOURCE** (Slack/error/stop)
- Omelette vs password is the toy set. **SOURCE**

## D. Procedures
- Before LLM: sanitize / desensitize. **SOURCE**
- Keyword block → fail branch → notify or throw. **SOURCE**
- This desk: fail = stop. Pass = draft, not send. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Three strings, block password/system. → **Action:** Run guardrail; omelette passes; two fails. → **Reasoning:** Deterministic keywords. → **Outcome:** Controlled branches. → **Lesson:** Stop is a first-class path. Implicit rule: do not send on fail; this desk also does not send on pass.

## F. Decision Rules
- If secrets might be in the text → sanitize first.
- If fail → stop. Do not continue to CRM/mail.
- Refuse: send-on-pass as our default.
- Optimize for a visible fail.

## G. Contrarian
- Field uses guardrails so they can auto-send safely. Tape even names send-on-pass. We still do not send. **SYSTEM SYNTHESIS**

## H. Assumptions
- Keyword lists are complete. AI violation check quality UNVERIFIED. Falsifier: secret that isn’t the word “password.”

## I. Questions
- What does sanitize actually encrypt? Long-form?

## J. Connections
- **SYSTEM SYNTHESIS:** `oWdJMJp2HgM`. `send-removed`. `9mqsVK6Iqoc` (inbox router).

## K. Future-Use
- Keyword + sanitize card in front of every draft that touched a raw inbox.

## Steal / Operate-never

### Machine: Sanitize and keyword-fail before any draft leaves the desk
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Raw text → sanitize secrets → keyword/violation check → fail: stop + flag → pass: draft only → **stop**. No send-on-pass.
- **Questions / signals:** Any password/system/secret? Did we sanitize before a model? Who gets the fail flag?
- **Qualify / frame / objections:** Qualify: pass vs fail. Frame: stop is success. Objection: “it passed, send it” → refuse.
- **Procedure:** 1) Sanitize. 2) Block list. 3) Fail stops. 4) Pass is still HITL.
- **Example that proves it:** Omelette pass; password/system fail; he allows send-on-pass — we do not operate that half.
- **Why it works:** Deterministic rails catch the dumb leaks. Send-on-pass is how a missed keyword becomes a letter.
- **Conditions / exceptions:** A block list exists. Exceptions: empty list → hold.
- **Operate-never payload:** Send-on-pass. CRM-write-on-pass. Continue after fail.
- **Hive run (existing skills only):** `send-removed` · `warm-draft-hitl` · `ask-principal`.
- **Source:** `NQhsLVmuItA` @ UNKNOWN


### Operate-never (this desk will not operate)
- Send-on-pass. Continue after a fail. Put secrets in a model.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I treat fail as stop. I treat pass as “may draft.” I do not send. Clients parked.
