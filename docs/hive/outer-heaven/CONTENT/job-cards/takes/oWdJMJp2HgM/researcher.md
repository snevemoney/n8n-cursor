# Researcher — oWdJMJp2HgM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~3464 words). Title: n8n native guardrails. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Two jobs: don’t send sensitive **into** a model; check AI **outputs** before they go to a client/DB/team. Block / flag / sanitize. (2) Guardrail nodes (n8n **1.119+**): enforce rules on incoming/outgoing text; stock prompts + custom. Catalog: **keywords, jailbreak, NSFW, PII, secret keys, topical alignment, URLs, custom prompt, regex**. Agentic Arena aside: “tacos” jailbreak clip. (3) Two operations: **Check text for violations** (uses AI — he uses OpenRouter) vs **Sanitize text** (no AI; encrypt/desensitize **before** the LLM). (4) Check demos (3 items each, pass/fail branches → continue vs Slack/error/stop): keywords `password,system`; jailbreak threshold (0 safe–1 risky; 0.95/0.9 fail; tune prompt or threshold if too many false fails); NSFW; PII (select entity types; shows which entity); secret keys (balanced/strict/permissive) — **observation: passed “use my password password,” failed a real-looking API key; even strict still passed the password line** — keys ≠ passwords unless you customize; topical (business scope e.g. “n8n workflow automation”; NBA finals 0.9 fail); URLs (allowlist `upai.com`, HTTPS-only, block userinfo, subdomains). **Stack** several checks in one node; or custom named prompt+threshold. Text-to-check = any field (email/Slack/SMS). (5) Sanitize (no AI): PII → placeholder, **original still in output** for logs; keys; URLs → `URL` token; custom regex. Use sanitize **before** the model. (6) Free workflow Skool; Plus 200 UNVERIFIED. Steal: sanitize-in, check-out. Guardrail ≠ permission to auto-send (`send-removed`).

## B. Atomic Knowledge

### Two nodes: AI-check vs no-AI sanitize
- **Claim:** Check-text uses a model (threshold/prompt) and branches pass/fail. Sanitize does not call a model; it redacts PII/keys/URLs (or regex) **before** you send text to an LLM. Original values can still appear beside placeholders (log risk).
- **Reasoning:** Don’t spend tokens / leak secrets into the model; still inspect outbound.
- **Mechanism:** 1.119+ Guardrails node; two operations.
- **Evidence:** “these ones you’re not actually send[ing] the data here to AI.”
- **Conditions:** His OpenRouter check path. Version pin.
- **Exceptions:** Sanitize is not a send-gate. Fail branch is yours to wire (Slack vs throw).
- **Action:** Steal sanitize-before-model + check-before-leave. Hive: still HITL send.
- **Confidence:** high as tour.
- **Source:** `oWdJMJp2HgM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none.

### Secret-keys missed “password password”
- **Claim:** Secret-keys guardrail (even **strict**) passed “use my password password for the database” and failed a pasted API key. He reads it as key-shaped secrets, not passwords, unless you customize the prompt.
- **Reasoning:** Name ≠ behavior; test the guard.
- **Mechanism:** Balanced vs strict permissiveness; custom system message if you want passwords too.
- **Evidence:** “it still passes this row… looking more for keys rather than just passwords.”
- **Conditions:** His three-row fixture.
- **Exceptions:** PII node is the other place for some secrets. Don’t assume one node covers both.
- **Action:** Steal “test the miss.” Don’t treat secret-keys as a password wall.
- **Confidence:** high as his observation; n=1.
- **Source:** `oWdJMJp2HgM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** password line passed on retry
- **Speech ≠ behavior:** none.

### Threshold and stack are how you tune false fails
- **Claim:** Jailbreak/NSFW/topical use 0–1 risk; if too many fails, loosen prompt or raise threshold. Stack keywords+jailbreak+PII in one check node. Custom if the catalog doesn’t fit.
- **Reasoning:** AI checks are confidence, not boolean keywords.
- **Mechanism:** Pass/fail outputs; you choose Slack vs error vs stop.
- **Evidence:** 0.95/0.9 jailbreak fails; NBA 0.9 off-topic.
- **Conditions:** His demo strings. Threshold semantics as he states them.
- **Exceptions:** Keyword check is non-AI and faster — he says so.
- **Action:** Steal tune-then-wire-the-fail. No auto-stop as enough for send.
- **Confidence:** high as UI tour.
- **Source:** `oWdJMJp2HgM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none.

## C. Mental Models
In-bound clean, out-bound check. Keywords are cheap; jailbreak is a brain. A named guardrail can miss (passwords). Placeholders ≠ gone if the original is still in the payload. Stack > one magic node. Arena jailbreak is why he wanted this.

## D. Procedures
1. n8n ≥1.119; add Guardrails.
2. Before LLM: sanitize PII/keys/URLs (know originals may still be in the item).
3. After LLM / before leave: check (stack what you need); wire fail → notify or throw — hive: do not send on pass either without HITL.
4. Test each guard with known-good and known-bad (include a password line).
5. If false fails: threshold/prompt; if miss: custom.
6. No Skool template as hive install.

## E. Examples
- **Situation:** password/system keywords. **Action:** 3 strings. **Outcome:** omelette pass; system/password fail. **Lesson:** Cheap exact match.
- **Situation:** “unrestricted AI / confidential commands.” **Action:** Jailbreak check. **Outcome:** 0.95/0.9 fail. **Lesson:** Thresholded AI.
- **Situation:** “use my password password.” **Action:** Secret-keys even strict. **Outcome:** Pass. **Lesson:** Test the miss.
- **Situation:** Phone number sanitize. **Action:** Block all PII. **Outcome:** Placeholder + original still present. **Lesson:** Log leakage.

## F. Decision Rules
- IF text will enter a model → sanitize first.
- IF text will leave to a human/DB → check; hive still HITL.
- IF secret-keys passes a password → add custom/PII; don’t trust the label.
- IF false fails pile up → raise threshold or edit prompt, don’t rip the node.
- IF one check isn’t enough → stack.
- Refuse: n8n-cloud; treat pass as send-OK; quote Plus 200 as FACT; new ICP.

## G. Contrarian
Native guardrails still miss “password.” Sanitize keeps the secret in the payload for logs. He sells comfort; the miss is the lesson.

## H. Assumptions
1.119, OpenRouter, all confidence numbers = tape-dated. Caption-only.
**Desk dissent:** Guardrail pass ≠ send. Do not install his JSON.

## I. Questions
- Does sanitize-original stay if you drop the field?
- Jailbreak prompt text (native) — not in `full.txt`.
- Sibling tapes on Agentic Arena?

## J. Connections
- **SYSTEM SYNTHESIS:** `5p5cV0yVDvQ` (execute/send) · `QCjMBOEhpLE` (filter before model) · `vcU85OrwuV0` (don’t send until go). Skills: `send-removed` · `ask-principal` · `golden-test-loop`.

## K. Future-Use
Sanitize-in / check-out. Secret-keys≠password. Stack + threshold. Original-still-in-item.

## Steal / Operate-never

### Machine: sanitize-in-check-out
- **Epistemic:** SOURCE
- **Workflow / loop:** inbound text → sanitize (no AI) → model → check (stack) → fail: notify/throw · pass: hive HITL, not auto-send
- **Questions / signals:** Did secret-keys miss a password? Is the original still on the item? False-fail rate?
- **Qualify / frame / objections:** Comfort ≠ ACL. Pass ≠ send.
- **Procedure:** D.
- **Example that proves it:** Password line passed secret-keys; phone placeholder + original; tacos jailbreak motivation.
- **Why it works:** Splits cheap redact from judged check; forces you to test misses.
- **Conditions / exceptions:** 1.119+. OpenRouter on his check path.
- **Operate-never payload:** Auto-send on pass; n8n-cloud; Skool JSON; treat secret-keys as password-safe; new ICP.
- **Hive run (existing skills only):** `send-removed` · `ask-principal` · `golden-test-loop`
- **Source:** `oWdJMJp2HgM` @ UNKNOWN

**Operate-never**
- Send because a guardrail passed. Install his workflow. Quote tape $ as FACT. New `icp_id`.

## L. Role-Specific Applications
File sanitize-in/check-out and the password miss. Do not treat n8n guardrails as hive send policy.
