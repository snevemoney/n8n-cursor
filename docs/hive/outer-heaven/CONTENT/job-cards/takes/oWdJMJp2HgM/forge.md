# Forge — oWdJMJp2HgM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **n8n 1.119 guardrail** nodes. Beats: two ops — **check text for violations** (AI, OpenRouter on tape) + **sanitize text** (no AI; encrypt/desensitize before the model) → types: **keywords, jailbreak, NSFW, PII, secret keys, topical alignment, URLs, custom prompt, regex** → Agentic Arena “tacos” jailbreak clip (comedy) → keywords: block `password`/`system`; omelette **pass**; “update the system” / “enter your password” **fail**; pass → email/CRM; fail → Slack **or stop/error** → jailbreak threshold (0 safe–1 risky): dog-wish **0** pass; “unrestricted AI” **0.95** / “no longer follow guidelines” **0.9** fail; tune prompt or raise threshold if too many false fails → NSFW: pickleball pass; gore **0.9** / obscene **0.8** fail → PII: pick entity types or all; ice-cream pass; email+SSN fail + **which entity** → secret keys: **balanced/strict/permissive**; caught a real API key; **passed “use my password password” even on strict** — he says it’s keys not the word password; customize prompt if you want passwords too → topical: set **business scope** (“n8n workflow automation”); node-how-to pass; NBA finals **0.9** fail → URLs: allow-list (only upai.com), **HTTPS-only**, block userinfo, allow subdomains; HTTP and off-list fail with reason → **stack** several checks in one node + custom named prompt → sanitize (no LLM): PII → placeholder, **raw still in the log**; keys → “secret”; URLs → “URL”; custom regex → Skool free workflow + Plus **200+**. Timestamp UNKNOWN. n8n / OpenRouter / Skool / Plus on-tape.

## B. Atomic Knowledge

### Sanitize before the model; check before send; fail can halt
- **Claim:** Deterministic sanitize (no LLM) on the way in. AI/keyword check on the way out. Fail is Slack-or-**stop**, not “continue anyway.”
- **Reasoning:** You don’t want secrets in the model. You don’t want a jailbreak/PII row to email a client.
- **Mechanism:** Two nodes; pass/fail branches; stackable checks; threshold + custom prompt.
- **Evidence:** Keyword/jailbreak/NSFW/PII/keys/topic/URL demos; password-word miss.
- **Conditions:** n8n 1.119+ as taped.
- **Exceptions:** Secret-keys node missed “password password.” Sanitize still **keeps the raw value in the output** for logging — that’s a leak if you forward the whole item.
- **Action:** Steal two-layer + stop-on-fail. Do not require their node. Regex+human still matter.
- **Confidence:** high on the physics; Plus counts UNVERIFIED.
- **Source:** `oWdJMJp2HgM` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Guardrail is a branch, not a vibe. Threshold is a false-positive knob. “Secret keys” ≠ “the word password.” Allow-list URLs (HTTPS) is phishing hygiene. Stack beats one magic check. Arena tacos is comedy, not a SKU.

## D. Procedures
1. Before a model: strip PII/keys/URLs without an LLM if a pattern can. 2. After a model: check before send. 3. Fail → stop, not send. 4. Don’t forward the sanitize item’s raw field. 5. Don’t trust “password” to a key-detector. 6. No n8n-cloud / Plus template as ours.

## E. Examples
**Situation:** Three fake prompts, keywords password/system.  
**Action:** Split pass/fail.  
**Reasoning:** Show the branch.  
**Outcome:** Omelette passes; the other two fail.  
**Lesson:** Fail can halt.

**Situation:** “use my password password.”  
**Action:** Secret-keys even on strict.  
**Reasoning:** Looks for key-shaped secrets.  
**Outcome:** Pass.  
**Lesson:** Regex+human still matter.

**Situation:** Sanitize phone.  
**Action:** Placeholder to the model; raw number still on the item.  
**Reasoning:** Log vs send.  
**Outcome:** Model doesn’t see it **if you only pass the sanitized string**.  
**Lesson:** Don’t ship the whole item.

## F. Decision Rules
- If it might send → check first; fail stops.
- If it might hit a model → sanitize first, no LLM if possible.
- If the detector is “secret keys” → still block the word password yourself.
- If tacos/Arena is the pitch → comedy, not a product.
- If Plus / free JSON CTA → park.

## G. Contrarian
Field sprays text at the model then hopes. He puts a no-AI sanitize in front. Field treats a pass as send; he shows a stop branch.

## H. Assumptions
1.119 behavior as demoed. Falsifier: sanitize raw field gets logged to Slack. We do not run n8n-cloud. OpenRouter as the check-brain stays on-tape.

## I. Questions
Do we already halt a draft path on keyword/API-shaped strings, or only hope?

## J. Connections
SYSTEM SYNTHESIS: `golden-test-loop` + send-removed. `5p5cV0yVDvQ` never always-allow send. `lokbsA5VXOk` allow-list. No n8n Guardrail as required stack. `ask-principal` on send.

## K. Future-Use
Two-layer card on any draft→send path. Password-word as a regex even when a “secrets” detector exists.

## Steal / Operate-never

### Machine: sanitize (no LLM) → model → check → stop-on-fail (pass ≠ send)
- **Epistemic:** SOURCE
- **Workflow / loop:** inbound text → deterministic strip → model → check (keyword/PII/jailbreak/URL allow-list) → fail stops → pass still HITL if it’s a send
- **Questions / signals:** Would this row email a client? Is the raw secret still on the item? Did “password” get through a key detector?
- **Qualify / frame / objections:** Their node is optional. Tacos is comedy. Threshold is a knob, not truth.
- **Procedure:** No n8n 1.119 requirement. No Plus JSON. Don’t forward raw sanitize fields.
- **Example that proves it:** Keyword halt; password-word miss; phone placeholder + raw still present.
- **Why it works:** Secrets shouldn’t enter the model. A fail that continues is theater. Detectors lie about “password.”
- **Conditions / exceptions:** AI-check itself uses a model (OpenRouter). Tape Plus UNVERIFIED.
- **Operate-never payload:** n8n Guardrail as required; send-on-pass; Arena SKU; quote student counts as FACT.
- **Hive run:** `golden-test-loop` + `ask-principal`. Deploy HITL.
- **Source:** `oWdJMJp2HgM` @ UNKNOWN

### Operate-never
- Require n8n Guardrail / OpenRouter as hive stack.
- Send because the check passed.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will put a fail-stop on a draft path and sanitize secrets without an LLM when a regex can. Pass ≠ send. Deploy HITL.
