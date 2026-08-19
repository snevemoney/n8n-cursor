# Librarian — oWdJMJp2HgM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** n8n JUST Leveled Up AI Agents With Guardrails: Here's How It Works
**Channel:** Nate Herk | AI Automation
**Kind:** video (~3464 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Two native nodes (n8n ≥1.119): **Check text** (AI — OpenRouter in his graph) vs **Sanitize text** (no AI — encrypt/desensitize before a model). Incoming or outgoing. Stock prompts + custom + regex.
2. Menu: keywords; jailbreak (he needed it in Agentic Arena — “tacos” clip as a failed jailbreak story); NSFW; PII (card/email/address/SSN/passport…); secret keys; topical alignment; URLs (allow/block/schema — phishing); custom prompt; regex.
3. Check-text demos (3 items each, pass/fail branches you own — send/CRM vs Slack/error/stop):
   - Keywords `password,system` — omelette passes; “update the system” / “enter your password” fail.
   - Jailbreak threshold 7 (he also says 0=safe 1=risky — keep both): dog-wish 0 pass; unrestricted/confidential 0.95; ignore guidelines 0.9. Tune prompt or threshold if too many false fails.
   - NSFW: pickleball pass; gore 0.9 / obscene 0.8 fail.
   - PII: pick entity types or all; ice-cream pass; email+SSN fail + entity labels.
   - Secret keys: permissiveness balanced/strict/permissive.
4. Sanitize is the non-AI path for secrets **before** the model. You still own pass/fail. (Rest of tape walks remaining types — same branch pattern.)
Gap: remaining sanitize runs, URL/topical demos. Timestamp UNKNOWN. n8n/OpenRouter on-tape. Completes `NQhsLVmuItA`.

## B. Atomic Knowledge

### AI-check vs no-AI sanitize; you own the fail branch
- **Claim:** Guardrails are two nodes, not a vibe. Sanitize before the model (no tokens); check after/before send with AI. Fail is a first-class path (notify / error / stop), not a log line. Thresholds and custom prompts are how you fight false fails.
- **Reasoning:** Keywords are cheap exact; jailbreak/NSFW need a model; PII/secrets can be typed.
- **Mechanism:** Split items → guardrail → pass continues / fail branches. Version gate 1.119.
- **Evidence:** Keyword/jailbreak/NSFW/PII runs; tacos Arena aside.
- **Conditions:** Check-text costs model calls and is slower. Threshold scale described both as 7 and 0–1 — do not flatten.
- **Exceptions:** False fails → loosen prompt or raise threshold.
- **Action:** Steal two-node split + owned fail branch. Do not treat OpenRouter as hive. No jailbreak operate.
- **Confidence:** high as a node map; threshold wording messy
- **Source:** `oWdJMJp2HgM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Arena jailbreak (“tacos”)
- **Speech ≠ behavior:** none

## C. Mental Models
Comfort is a branch you designed. Sanitize is cheaper than hoping the model ignores secrets. Threshold is a product decision.

## D. Procedures
1. Update to 1.119+; add check and/or sanitize.
2. Secrets/PII **before** the model → sanitize (no AI).
3. Outputs before send/DB → check-text; wire fail to stop/notify.
4. Start with stock prompt; tune threshold only after false fails.
5. Keywords comma-separated; PII pick entities; URLs allow/block schema.
Avoid: jailbreak practice; n8n-cloud; ignoring the 0–1 vs 7 wording.

## E. Examples
**Keywords:** Situation — three lines. Action — block password/system. Outcome — 1 pass / 2 fail. Lesson — exact match is a branch.

**Jailbreak scores:** Situation — unrestricted prompts. Action — threshold 7 / 0–1 scores. Outcome — 0.9+ fail. Lesson — tune if safe text fails.

## F. Decision Rules
- IF data hits a model → sanitize first when it may contain secrets/PII.
- IF the next step is send → check-text and own the fail.
- IF too many false fails → prompt or threshold, not “turn it off.”
- Refuse: Arena jailbreak as a how-to; n8n-cloud.

## G. Contrarian
Against “the model will be careful.” Against guardrail-as-a-single-node.

## H. Assumptions
Threshold 7 vs 0–1 kept as a labeled mess. Complements `NQhsLVmuItA`. Caption-only.

## I. Questions
Exact sanitize encrypt behavior? URL schema demo result?

## J. Connections
SYSTEM SYNTHESIS → `NQhsLVmuItA`; hive HITL.

## K. Future-Use
Two-node split + owned fail + threshold-tune as atoms.

## Steal / Operate-never

### Machine: sanitize-before-model; check-before-send; fail is a path
- **Epistemic:** SOURCE
- **Workflow / loop:** pick check vs sanitize → set types/threshold → pass continues / fail stops or notifies → checkable stop = a known fail item took the fail wire
- **Questions / signals:** Before the model or before send? False fail rate?
- **Qualify / frame / objections:** Comfort = designed branches.
- **Procedure:** D above.
- **Example that proves it:** password/system keywords; 0.95 jailbreak.
- **Why it works:** Exact and scored checks beat hope.
- **Conditions / exceptions:** Threshold wording messy; check-text costs.
- **Operate-never payload:** Jailbreak practice; n8n-cloud; send on fail.
- **Hive run:** `ask-principal` on send. Cursor + Grok.
- **Source:** `oWdJMJp2HgM` @ UNKNOWN

### Operate-never
- Jailbreak payloads. Send on fail. n8n-cloud. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File two-node + fail-path. Keep threshold 7 vs 0–1 unflattened.
