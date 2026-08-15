# Product GTM — oWdJMJp2HgM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk. Title: “n8n JUST Leveled Up AI Agents With Guardrails.” Beats: (1) two native nodes (n8n ≥1.119): **check text** (AI, Open Router in his demo) vs **sanitize** (no AI — encrypt/redact *before* the model); pass/fail branches (send vs Slack/error/stop); (2) rails: keywords, jailbreak/injection, NSFW, PII, secret keys, topical alignment, URLs/schemas (phishing), custom prompt, regex; (3) keyword demo: block “password/system” — omelette passes, “update the system” / “enter your password” fail; feed = any text (email/Slack/SMS). Agentic Arena “tacos” clip as jailbreak sad-path. Timestamp UNKNOWN.

## B. Atomic Knowledge
### Fence in and out — sanitize before the model
- **Claim:** Guardrails are not a feature to sell. They are the intern fence: nothing sensitive in, nothing unreviewed out.
- **Reasoning:** Sanitize is deterministic and cheaper. AI-check is a second model with its own fails.
- **Mechanism:** Pass → next. Fail → notify/stop, do not send. Custom + regex for *this* business.
- **Evidence:** Keyword pass/fail split; he names PII/keys/URLs.
- **Conditions:** On-tape n8n. Hive does not install it.
- **Exceptions:** Jailbreak rail is a detector, not a guarantee (tacos clip).
- **Action:** Steal in/out fence + fail-closed. Do not productize n8n guardrails.
- **Confidence:** high as pattern.
- **Source:** `oWdJMJp2HgM` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
In-rail vs out-rail. Sanitize vs judge. Fail-closed. Detector ≠ proof.

## D. Procedures
Before a model: strip keys/PII. After a model: check before send. Fail stops the workflow.

## E. Examples
**Situation:** Three fake prompts. **Action:** Keyword rail. **Outcome:** One pass, two fail. **Lesson:** The branch *is* the product.

## F. Decision Rules
- If it can send/pay/book → fail-closed rail first.
- If the rail is AI-only → you added another model to trust.
- Refuse: n8n guardrail SKU; Open Router; Agentic Arena.

## G. Contrarian
Against “native rails = safe enough to auto-send.”

## H. Assumptions
Theirs: n8n 1.119. Ours: HITL already (`ask-principal`). Falsifier: a rail that never false-passes a key.

## I. Questions
Rest of per-rail demos after keywords. Sibling `ECfusvK5tEU` draft-queue.

## J. Connections
**SYSTEM SYNTHESIS:** Do-not-send-until-go = `vcU85OrwuV0`. Maps to `ask-principal`.

## K. Future-Use
Unassigned: “sanitize before, fail-closed after.” Keep.

## Steal / Operate-never

### Machine: sanitize in, fail-closed out — never auto-send
- **Epistemic:** SOURCE
- **Workflow / loop:** inbound text → sanitize/PII/keys → model → check → pass continues / fail stops
- **Questions / signals:** Could this contain a secret? Could the out go to a client?
- **Qualify / frame / objections:** “Guardrails leveled up agents” is the title.
- **Procedure:** Cursor + Grok. No n8n. Hard steps HITL.
- **Example that proves it:** Keyword fail branch; tacos jailbreak.
- **Why it works:** The branch is the intern fence.
- **Conditions / exceptions:** Detectors miss.
- **Operate-never payload:** n8n rails SKU; auto-send on pass
- **Hive run (existing skills only):** `ask-principal`
- **Source:** `oWdJMJp2HgM` @ UNKNOWN

### Operate-never
- Productize n8n guardrails
- Auto-send because a rail passed
- New hunt; merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Do not sell n8n rails. The fence is already this desk’s HITL. Clients parked.
