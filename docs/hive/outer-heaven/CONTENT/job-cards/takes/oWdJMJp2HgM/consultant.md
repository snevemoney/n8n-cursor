# Consultant — oWdJMJp2HgM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

n8n native guardrails (v1.119+). Beats: two nodes — **check text** (AI, OpenRouter) vs **sanitize** (no AI, encrypt/desensitize before the model). Types: keywords, jailbreak (Arena tacos clip), NSFW, PII, secret keys (caught API key, **passed** “password password”), topical alignment, URLs/schemes, custom prompt, regex. Pass → continue (email/CRM); fail → Slack or **hard stop**. Threshold 0–1. Sanitize is the consultant-relevant one: don’t send secrets to the model. Pair Arena `c0kaKxM2pHg`. No VTT. UNKNOWN. ~3464 words.

## B. Atomic Knowledge

### Sanitize before the model; fail-closed is a stop not a vibe
- **Claim:** Keyword/PII/URL can be deterministic. Secret-key missed a password. Jailbreak/NSFW are scored. Pass/fail branches are the product.
- **Reasoning:** n8n-cloud is vendor. Auto-email on pass is still send.
- **Mechanism:** If text leaves the box, sanitize first. Fail = stop or human Slack, not send anyway.
- **Evidence:** “make sure that you're not sending any sensitive data to something like an AI model.”
- **Conditions:** v1.119. Arena tacos. Threshold examples.
- **Exceptions:** Guardrail ≠ permission to auto-send the pass branch.
- **Action:** Steal sanitize-then-model + fail-closed. Do not install n8n-cloud. Do not send.
- **Confidence:** high
- **Source:** `oWdJMJp2HgM` @ UNKNOWN — sanitize vs check
- **Epistemic:** SOURCE


## C. Mental Models

He is teaching a safety node after the Arena humiliation. He shows every type. He still draws a send-on-pass arrow.

## D. Procedures

1. Sanitize secrets before any model. 2. Fail-closed. 3. Don’t trust secret-key for passwords. Avoid: n8n-cloud. Avoid: send-on-pass.

## E. Examples

**Situation:** Three dummy lines, keyword “password/system.” **Action:** omelette passes; the other two fail. **Outcome:** You choose Slack vs hard stop. **Lesson:** Branch is the product. Implicit rule: sanitize is the no-AI node.

## F. Decision Rules

If PII hits the model, we skipped sanitize. If fail still sends, the guardrail is theater.

## G. Contrarian

Field default: prompt the model to be careful. He puts a node in front. Field default: secret-key catches passwords. His test passed one.

## H. Assumptions

n8n on-tape. Pair `c0kaKxM2pHg` / `playbook-before-send` / `mPflFTQUCGk`.

## I. Questions

Does sanitize encrypt in a way we can reverse for the owner?

## J. Connections

**SYSTEM SYNTHESIS:** Maps to `playbook-before-send` + `input-required-gate` + `golden-test-loop`.

## K. Future-Use

Unassigned: sanitize-before-model; secret-key-missed-password; fail-closed branch.

## Steal / Operate-never

### Machine: Sanitize before the model; fail-closed to a human or a hard stop
- **Epistemic:** SOURCE
- **Workflow / loop:** Before any model call, strip/encrypt secrets → check the rest → pass continues a draft path → fail Slack or stop → never send from the fail branch
- **Questions / signals:** Did secrets hit the model? What happens on fail? Are we treating pass as send?
- **Qualify / frame / objections:** Qualify: they want safer agents. Frame: node in front. Objection: “the model is careful” — Arena tacos.
- **Procedure:** No n8n-cloud. No send-on-pass. Clients parked.
- **Example that proves it:** Keyword pass/fail; jailbreak 0.95; secret-key missed password; URL scheme block.
- **Why it works:** A guardrail you can branch on is real. A prompt that says “be safe” is not.
- **Conditions / exceptions:** Vendor node. Password miss on tape.
- **Operate-never payload:** Install n8n-cloud. Auto-send on pass. Skip sanitize. Unpark.
- **Hive run (existing skills only):** `playbook-before-send` · `input-required-gate` · `golden-test-loop` · `ask-principal`
- **Source:** `oWdJMJp2HgM` @ UNKNOWN


### Operate-never
- Install n8n-cloud guardrails as hive stack.
- Auto-send the pass branch.
- Skip sanitize and hope the model is careful.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “add guardrails / safer agents.” Felt problem is still a leak. Do not bolt n8n-cloud onto a parked Path A.

**Four-blank after constraint:** Toddler stop = fail does not send.

**Skeptical-customer:** Native guardrails are smash. Password slipping past secret-key is the honest demo. Clients parked.
