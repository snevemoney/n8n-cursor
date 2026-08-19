# Career Strategist — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (1:24, 339 words). Guardrail nodes. Beats: (1) type “guard” — two actions (2) **check text for violations** = AI check (3) **sanitize text** = no AI; encrypt/desensitize before the LLM (4) keyword block demo: block “password” and “system”; three items; omelette passes; “update the system setting” and “enter your password” fail (5) pass branch: send email / update CRM (his example) (6) fail branch: Slack flag, or throw an error and stop the workflow (7) CTA. Sister long `oWdJMJp2HgM`.

## B. Atomic Knowledge

### Two gates: model-judge vs deterministic sanitize
- **Claim:** Violation-check uses AI; sanitize does not — it strips/encrypts before the model sees the text.
- **Reasoning:** Some secrets should never reach the LLM.
- **Mechanism:** sanitize → then (maybe) model.
- **Evidence:** “sanitize text… doesn’t use AI… encrypt or desensitize certain info before you send it to a large language model.” @ UNKNOWN
- **Conditions:** You know which fields are sensitive.
- **Exceptions:** Keyword block is brittle (omelette vs “system”).
- **Action:** Sanitize before any model; do not rely only on an AI judge.
- **Confidence:** high as node split.
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

### Fail must be able to halt
- **Claim:** On fail you can Slack yourself or error-stop the whole workflow — not only log-and-continue.
- **Reasoning:** A leak should not proceed to send.
- **Mechanism:** pass/fail branches.
- **Evidence:** “you can make the whole workflow stop and just throw an error.” @ UNKNOWN
- **Conditions:** You wire the fail path.
- **Exceptions:** He also offers Slack-only (weaker).
- **Action:** Hard-stop on secrets; do not “send email” on pass as the default we operate.
- **Confidence:** high as his menu.
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Safer = a gate before the model and a halt after a miss. Keywords are a first demo, not a complete policy. Pass is where he puts send — that is the trap.

## D. Procedures
Pick keywords or sanitize rules → run items → inspect pass/fail → on fail, error-stop (preferred) or Slack.  
Avoid: pass → auto-send.  
Qualify: is this a secret or an omelette?

## E. Examples
**Situation:** Three strings; block password/system.  
**Action:** Omelette passes; two fail.  
**Reasoning:** Exact keywords.  
**Outcome:** Visible branches.  
**Lesson:** A halt path must exist. Implicit rule: “system” as a keyword is clumsy — sanitize still matters.

## F. Decision Rules
- If text may contain secrets, sanitize before the model.
- If a row fails, stop — do not send.
- Keyword-only is not enough for employment data.

## G. Contrarian
Rejects “just prompt the agent to be careful.” Also rejects (implicitly) always using AI to police AI — sanitize is the non-AI path.

## H. Assumptions
**Theirs:** Keyword list is illustrative. **Ours:** employment/PII is exactly what must halt; his pass→email is operate-never. Falsifier: synonym that bypasses keywords.

## I. Questions
- What does sanitize actually encrypt in the long?
- Allowlists vs blocklists?

## J. Connections
- SYSTEM SYNTHESIS → `oWdJMJp2HgM` (guardrails long).
- SYSTEM SYNTHESIS → `send-removed` / HITL.
- SYSTEM SYNTHESIS → eFOTQpbGcy8 “don’t throw AI at sensitive data.”

## K. Future-Use
Unassigned: fail-closed on employment drafts.

## Steal / Operate-never

### Machine: sanitize → check → fail-closed
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** strip secrets → optional AI check → if fail, stop → if pass, still HITL on send
- **Questions / signals:** Password/system/PII present? Is the fail path a halt or a shrug?
- **Qualify / frame / objections:** Pass≠send.
- **Procedure:** Deterministic sanitize first. Keywords are a demo.
- **Example that proves it:** Omelette vs password (E).
- **Why it works:** Models should not see the secret (B/C).
- **Conditions / exceptions:** Brittle keywords. Employment mail always HITL.
- **Operate-never payload:** Pass-branch auto-email; leaking offer letters into a model; quit-job.
- **Hive run:** `send-removed` · `ask-principal` · Watchdog
- **Source:** `NQhsLVmuItA` @ UNKNOWN

### Operate-never
- Auto-send on pass. Put employment/PII in an unapproved model.
- Quit-job. Unpark clients. Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: offer letters and salary notes get sanitized/fail-closed before any model; Evens still sends. “Password” in a draft is a halt, not a Slack shrug. Clients parked.
