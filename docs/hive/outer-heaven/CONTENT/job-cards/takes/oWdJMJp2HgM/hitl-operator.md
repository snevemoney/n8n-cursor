# HITL Operator — oWdJMJp2HgM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/LEARNED.md`
**ICP:** parked unless Evens named one.

Evens is the visionary. Operate ≠ learn. Role did not filter what was learned. Stack stays Cursor + Grok. Clients parked. No send / pay / deploy / book / publish. Tape $ UNVERIFIED.

## A. Source Map

**Title (PACKET):** n8n JUST Leveled Up AI Agents With Guardrails: Here's How It Works
**Speaker / channel:** Nate Herk | AI Automation
**Kind / words:** guardrails node walkthrough · 3464 words
**Gaps:** No VTT cited in this take. Timestamps UNKNOWN. Visual-only UI clicks inferred only as INFERENCE.

Beats in order:

- Native guardrails (n8n 1.119): do not send sensitive data into a model; check outputs before you send them off. Two ops: AI 'check text for violations' vs non-AI sanitize.
- Catalog: keywords, jailbreak, NSFW, PII, secret keys, topical alignment, URLs, custom prompt, regex. Can stack in one node.
- Keyword demo: block password/system — omelette passes; 'enter your password' / 'update the system setting' fail. SOURCE: if it passes you can send your email or update the CRM; if it fails Slack or throw an error and stop the workflow.
- Jailbreak / NSFW / PII / topical / URL demos with thresholds. Secret-keys missed 'use my password blank' even on strict — looks for API-key shapes. Sanitize PII/keys/URLs without sending to a model; placeholder + he still has the real value in a log.
- Free workflow in Skool; Plus CTA (200 members, four courses) UNVERIFIED.

## B. Atomic Knowledge

### Guardrail-pass is not a send gate
- **Claim:** Pass branch is where he says send the email or update the CRM. Fail branch can Slack or throw and stop.
- **Reasoning:** Guardrail is a check. Guardrail-pass is not Evens. Sanitize-before-model is the steal.
- **Mechanism:** Text in → sanitize (no AI) → check → fail: stop/Slack → pass: still a card before Send
- **Evidence:** On-tape: 'if it passes, you can go ahead and send your email or update the CRM.' Secret-keys still passed a password sentence.
- **Conditions:** On-tape demo / short captions.
- **Exceptions:** Tape $ and vendor names stay on-tape.
- **Action:** Steal fail-stop + sanitize-before-model. Never treat pass as send.
- **Confidence:** medium — caption ingest, timestamp UNKNOWN
- **Source:** `oWdJMJp2HgM` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models

- Comfort from a node is not a lock.
- Non-AI sanitize is the cheaper, safer first hop because it does not ship the secret to a model.
- A check that misses 'use my password' is why pass ≠ Evens.

## D. Procedures

- Sanitize before any model. Stack keyword + PII + keys if needed.
- Fail → stop or Slack Evens. Pass → still a send/book card.
- Do not use guardrail-pass as always-allow.
- Do not join Skool for the template.

## E. Examples

- **On-tape run** — Situation: Three keyword rows → Action: Block password/system → Reasoning: Show pass/fail → Outcome: Omelette passes; password/system fail → Lesson: He then says pass can send email — that sentence is the trap

- **On-tape run** — Situation: Secret keys on strict → Action: Look for API-key shapes → Reasoning: Balanced vs strict → Outcome: 'use my password blank' still passes → Lesson: The miss is why pass is not Evens

## F. Decision Rules

- If pass-branch has Gmail/CRM → strip Send; keep the check.
- If a secret-key check missed a password → do not trust it as the only lock.
- If sanitize can keep the raw value in a log → treat that log as sensitive.

## G. Contrarian

- Field treats native guardrails as the lock. He also says pass can send. We keep the fail-stop and refuse the pass-send.

## H. Assumptions

- n8n 1.119 / OpenRouter / Skool 200 members UNVERIFIED or on-tape.
- Sibling short `NQhsLVmuItA` already named pass ≠ send.

## I. Questions

- Did anyone in comments ship pass→Gmail in production?
- Can sanitize regex catch the password miss that secret-keys dropped?

## J. Connections

- SOURCE sibling: `NQhsLVmuItA`. SYSTEM SYNTHESIS → `send-removed` · `confirm-then-actuate` · `input-required-gate`.

## K. Future-Use

- Sanitize-before-model + fail-stop as a reusable check in front of any draft. Parked.

## Steal / Operate-never

Informed by A–K. Auto-send / auto-book stay operate-never. The machine is still stolen.

### Machine: Sanitize + fail-stop; pass still cards
- **Epistemic:** SYSTEM SYNTHESIS
- **Workflow / loop:** text in → sanitize (no AI) → check violations → fail: stop/Slack Evens → pass: draft only → Evens sends → stop
- **Questions / signals:** Did it fail? Did secret-keys miss a password-shaped string? Is Send on the pass branch?
- **Qualify / frame / objections:** Pass = send is a no. Guardrail-as-only-lock is a no.
- **Procedure:** Keep fail-stop and sanitize. Strip Gmail/CRM from pass. Card anyway.
- **Example that proves it:** **On-tape run** — Situation: Keyword pass → Action: He says send email or update CRM → Reasoning: Demo the happy path → Outcome: Omelette would have sent → Lesson: Pass is not Evens
- **Why it works:** The useful machine is fail-stop + sanitize-before-model. The operated sentence is pass-then-send.
- **Conditions / exceptions:** Hard steps stay HITL.
- **Operate-never payload:** Pass-branch Gmail/CRM as a gate. Treat guardrail as the only lock. Auto-send.
- **Hive run (existing skills only):** `send-removed` · `confirm-then-actuate` · `input-required-gate` · `ask-principal`
- **Source:** `oWdJMJp2HgM` @ UNKNOWN

### Operate-never (this desk will not operate)

- Pass-branch Gmail/CRM as a gate. Treat guardrail as the only lock.
- Auto-send / auto-book / auto-voice-book / auto-publish / auto-pay / auto-deploy.
- Quote tape $ / student counts / job-loss % / token burns as FACT.
- Install on-tape vendors (Claude Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool) as our stack. Cursor + Grok only.
- New `icp_id`. Unpark Normand. Outreach / hunt because a tape was interesting.
- Always-allow MCP / classifier / guardrail-pass as Evens.
- Merge `LESSONS-FROM-TAPE.md`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications

ACTION = fail-stop + sanitize; REJECT pass-then-send. Guardrail is a check. Clients parked.
