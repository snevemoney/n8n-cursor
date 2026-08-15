# Day Planner — oWdJMJp2HgM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: n8n **Guardrails** (v1.119). Beats: two nodes — **Check text for violations** (AI, Open Router in his demo) vs **Sanitize text** (no AI, encrypt/redact **before** a model); check types: keywords (pass/fail branches → send or Slack/error-stop), jailbreak (threshold; 0 safe–1 risky; 0.95/0.9 fails), NSFW, PII (selectable entities), secret keys (balanced/strict — **passed “use my password password,” failed a real API key**), topical alignment (business scope e.g. n8n automation; NBA fail 0.9), URLs (allowlist + https-only + subdomain), **stack** several in one node, custom prompt; sanitize: PII (placeholder + he still **has the real number in the output**), keys, URLs, custom regex; Agentic Arena taco aside; Skool JSON + Plus. Caption-only. Timestamp UNKNOWN.

## B. Atomic Knowledge
### Sanitize before the model; check before send; keys ≠ the word “password”
- **Claim:** Non-AI sanitize is the pre-model fence; AI check is the pre-send fence; secret-keys missed a literal password even on strict; pass/fail lets you **stop** instead of send.
- **Reasoning:** You should not hand PII/keys to a model; you should not send a jailbreak/NSFW/off-topic blob.
- **Mechanism:** Sanitize → (maybe) model → check → pass continues / fail stops.
- **Evidence:** “these ones you’re not [sending] to an AI… clean up data before you send it to an AI.” / “it still passes… use my password blank.”
- **Conditions:** n8n ≥1.119.
- **Exceptions:** Sanitize still **echoed the real phone** in a field — don’t log that to a chat.
- **Action:** Steal before-model sanitize + before-send check + fail=stop. Do not auto-send on pass. Do not n8n-cloud.
- **Confidence:** high as the split; thresholds UNVERIFIED.
- **Source:** `oWdJMJp2HgM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** password-string miss
- **Speech ≠ behavior:** “feel a lot more comfortable” vs leftover raw PII in sanitize output

## C. Mental Models
Two jobs: clean inbound, police outbound. Threshold is a dial when false-fails pile up. Priority: demo every type. Uncertainty: jailbreak “threshold 7” vs 0–1 scores.

## D. Procedures
1. Before a model: sanitize PII/keys/URLs (no AI).
2. After a model, before any send/DB: check (keywords / jailbreak / NSFW / topical / URL).
3. Fail → stop or flag, **not** send.
4. Don’t trust “secret keys” for the word password — add a keyword/custom.
5. Stack if you need more than one.
Avoid: pass→Gmail; n8n Plus; quote Arena as a product.

## E. Examples
**Keyword omelette:** Situation → three lines. Action → block password, system. Reasoning → exact match, no AI. Outcome → one pass, two fail. Lesson → fail branch is the product.

**Password miss:** Situation → “use my password password.” Action → secret-keys balanced then strict. Reasoning → looks for key-shaped strings. Outcome → still pass. Lesson → steal the miss; add a keyword.

## F. Decision Rules
- IF text will hit a model → sanitize first.
- IF text will leave the box → check, fail=stop.
- IF only “secret keys” is the password fence → fail.
- IF pass is wired to send → never.

## G. Contrarian
He still shows pass→“send your email.” The node is a fence only if the fail path exists. We keep the fence, cut the send.

## H. Assumptions
Theirs: Open Router check is fine. Ours: no n8n-cloud; leftover raw PII is a leak. Falsifier: a sanitize that never echoes the secret. Survivorship: toy strings.

## I. Questions
Agentic Arena tape id? Did later n8n fix the password miss?

## J. Connections
- SYSTEM SYNTHESIS → `send-removed` · `R0qF17BVl9w` (no-spend/no-publish) · `5p5cV0yVDvQ` (send surface).

## K. Future-Use
Sanitize-then-check. Fail=stop. Unassigned regex custom.

## Steal / Operate-never

### Machine: sanitize (no AI) → model → check → fail stops; never pass-to-send
- **Epistemic:** SOURCE
- **Workflow / loop:** redact PII/keys → maybe model → violation check → fail = stop/flag
- **Questions / signals:** Before or after the model? Is fail a stop? Did “password” pass?
- **Qualify / frame / objections:** “Now you can send” is the fail. Fail branch is the pass.
- **Procedure:** No auto-send. No n8n-cloud. No Plus.
- **Example that proves it:** Situation → API key vs “password password.” Action → secret-keys. Reasoning → shape not word. Outcome → key fail, password pass. Lesson → stack a keyword.
- **Why it works:** A stop is checkable; a comfortable send is not a fence.
- **Conditions / exceptions:** v1.119 on tape. Thresholds UNVERIFIED.
- **Operate-never payload:** Pass→Gmail; n8n-cloud; Plus; leftover PII logs.
- **Hive run (existing skills only):** `send-removed` · `ask-principal`.
- **Source:** `oWdJMJp2HgM` @ UNKNOWN

### Operate-never
- Auto-send on pass.
- n8n-cloud / Plus.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as sanitize-then-check (no pass-to-send). Clients parked.
