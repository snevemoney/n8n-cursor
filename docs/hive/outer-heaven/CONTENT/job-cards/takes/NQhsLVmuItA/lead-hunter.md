# Lead Hunter — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.
**Tape:** n8n's NEW Guardrail Node is a Gamechanger
**Walk:** full.txt entire. Role did not filter A–K. Hunt skipped. No clients. No new `icp_id`. No `HUNT_LOG`. No Normand.

## A. Source Map
- Two guardrail actions: check text for violations (uses AI) vs sanitize text (no AI — encrypt/desensitize before an LLM).
- Demo: keyword block for “password” and “system.” Three items: omelette line passes; “update the system setting” and “enter your password” fail.
- Branch control: pass → email/CRM/next; fail → Slack flag, or throw an error and stop the workflow.
- CTA: full breakdown.
- **Gaps:** Captions only in full.txt; visual UI / audio demos not fully described. Timestamps UNKNOWN unless a quote locus is marked. CTA “play button / full breakdown” is capture, not a second source.

## B. Atomic Knowledge
### Fail-closed keyword guard before the next side effect
- **Claim:** A non-AI keyword guard can pass/fail rows (password/system) and the fail branch can stop the workflow or page a human — sanitize-without-AI exists for PII before an LLM.
- **Reasoning:** He wants control of what happens on fail, not a smarter model.
- **Mechanism:** Check keywords or sanitize → pass/fail branches → side effect only on pass.
- **Evidence:** SOURCE: “sanitize text… doesn't use AI… encrypt or desensitize certain info before you send it to a large language model.” Fail examples: system / password. Pass: omelette order.
- **Conditions:** You know the words that must not proceed.
- **Exceptions:** Keyword guards miss paraphrases. AI-check is the other action — he demos keywords.
- **Action:** Put the side effect on the pass branch. Fail = notify or hard stop.
- **Confidence:** high
- **Source:** `NQhsLVmuItA` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- SOURCE: Not every guard needs a model.
- SOURCE: Fail can be a hard stop.
- INFERENCE: Omelette pass is the negative control.

## D. Procedures
- List block-words. Run a pass item and two fail items. Wire pass to the side effect. Wire fail to Slack-or-error. Sanitize PII before any LLM.

## E. Examples
- Situation: three test strings. Action: block password/system. Reasoning: those words must not proceed. Outcome: 1 pass / 2 fail. Lesson: fail branch is the product.

## F. Decision Rules
- If the side effect is on both branches, there is no guard.
- If PII goes to an LLM unsanitized, the AI-check is the wrong first move.

## G. Contrarian
- Rejects “just prompt the agent to be careful” as the safety story.

## H. Assumptions
- Keyword lists are brittle. Slack-on-fail is on-tape, not a hive auto-page.

## I. Questions
- What is the full sanitize list? Not on this clip.

## J. Connections
- SYSTEM SYNTHESIS: hive HITL / `send-removed` — fail = do not send.
- SYSTEM SYNTHESIS: `oWdJMJp2HgM` is the longer guardrails tape.

## K. Future-Use
- Unassigned: sanitize-before-LLM as a default on any inbound lead text.

## Steal / Operate-never

### Machine: Pass-only side effects; fail stops or pages
- **Epistemic:** SYSTEM SYNTHESIS
- **Workflow / loop:** Define block/sanitize → run known pass + fail → checkable stop = fail did not email/CRM-write.
- **Questions / signals:** Which words must never proceed? Does fail stop or only notify?
- **Qualify / frame / objections:** Frame: stop, not “safer AI.” Objection: “the model won’t do that” → show the password row.
- **Procedure:** Never put send on the fail branch. HITL any notify that leaves the box.
- **Example that proves it:** Situation: password/system test. Action: 1 pass 2 fail; fail can error the workflow. Reasoning: control. Outcome: demo. Lesson: side effect only on pass.
- **Why it works:** From B: he built the lesson around the fail branch.
- **Conditions / exceptions:** Works with known tokens. Exception: paraphrase attacks — do not claim completeness.
- **Operate-never payload:** Do not hunt “guardrail node” as an ICP. Do not auto-Slack spam.
- **Hive run (existing skills only):** `send-removed`. `ask-principal`. Watchdog owns secrets.
- **Source:** `NQhsLVmuItA` @ UNKNOWN


### Operate-never
- New `icp_id`, named client, `HUNT_LOG` row, or unpark Normand. Learning ≠ hunt.
- Auto-dial, OTP / Instagram farms, fake identity, mass-DM, betting, OFM.
- MUST-score a raw 50. Send / pay / deploy / book / publish without HITL.
- Quote on-tape $ / student counts / job-loss % as FACT. Tape money stays UNVERIFIED.
- Install on-tape vendors (Vapi, Claude Code, Codex, ChatGPT, Gemini, Hostinger, School, n8n-cloud). Stack stays Cursor + Grok.
- Auto-write a new `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`. Grok Bot / `sendPrompt`.
- Auto-send on a pass without HITL. Treat keyword guards as complete safety.

## L. Role-Specific Applications
- Hunt is skipped this walk. Do not open a 50, a named URL, or a Path A from this tape.
- Keep A–K global. Do not hide the stolen machine in L.
- Steal pass-only side effects. Do not hunt guardrail buyers. Lead text that looks like credentials fails closed.
- Hard step stays HITL: this desk drafts; Evens sends.
