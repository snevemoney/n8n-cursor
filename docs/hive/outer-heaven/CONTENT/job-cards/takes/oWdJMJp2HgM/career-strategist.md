# Career Strategist — oWdJMJp2HgM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Video (14:38, 3464 words). Caption ingest. Beats in order: (1) n8n native guardrails: keep sensitive data off models; check outputs before they leave (2) two nodes: check text (AI) vs sanitize text (no AI — encrypt/desensitize before the model) (3) need n8n ≥1.119 (4) catalog: keywords, jailbreak (Agentic Arena taco fail clip), NSFW, PII, secret keys, topical alignment, URLs, custom prompt, regex (5) check-text demos, three items each, pass/fail branches: keywords “password/system”; jailbreak threshold 0–1 (0.95 / 0.9 fail); NSFW; PII all vs selected; secret keys — “use my password” **passed**, API key failed (even on strict); topical “n8n workflow” fails NBA; URLs allow-list + HTTPS-only (6) you can stack checks in one node or write a custom (7) sanitize (no model): PII → placeholder but **real value still in the node output** for a log; keys; URLs → “URL”; custom regex (8) free workflow in Skool; Plus CTA. Visual/click: UNKNOWN.

## B. Atomic Knowledge

### Sanitize before the model; check before it leaves
- **Claim:** Two jobs: strip/encrypt secrets **before** a model sees them (no-AI sanitize), and judge outputs **before** email/CRM/client (AI check). Pass continues; fail can Slack, error, or stop.
- **Reasoning:** Comfort is a branch, not a vibe.
- **Mechanism:** n8n 1.119+ guardrail nodes; stackable.
- **Evidence:** “clean up or encrypt sensitive data before you send it to an AI model, or you can use an AI guardrail to check all of your outputs before you send it to a client” @ UNKNOWN
- **Conditions:** Text is about to enter or leave a model.
- **Exceptions:** Sanitize still returns the raw PII in the node — a log risk.
- **Action:** Before-model sanitize; after-model check; decide the fail branch.
- **Confidence:** high as his split
- **Source:** `oWdJMJp2HgM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** secret-keys missed “password”
- **Speech ≠ behavior:** none

### Defaults miss; thresholds and prompts are the job
- **Claim:** Jailbreak/NSFW/topical need a threshold; secret-keys looked for API keys not the word password; URL schema (HTTP vs HTTPS) can be the fail reason. Tune or you drown in false fails.
- **Reasoning:** A guardrail that always fails is unused.
- **Mechanism:** Confidence 0 safe–1 risky; custom prompt; permissiveness.
- **Evidence:** “even if I… made this strict… it still passes… use my password” @ UNKNOWN
- **Conditions:** You turned the node on.
- **Exceptions:** Keyword match is dumb and fast; jailbreak is slow and “uses its brain.”
- **Action:** Test the miss (password, HTTP) before you trust the node.
- **Confidence:** high as demo
- **Source:** `oWdJMJp2HgM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** he names the password miss
- **Speech ≠ behavior:** none

## C. Mental Models
Guardrails are native now — version-gate them. Fail branch is the product. Sanitize ≠ delete (raw may still sit in the output). Stack beats one magic check. Arena jailbreak is why jailbreak exists. Fishing URLs are a URL-schema problem.

## D. Procedures
1. Confirm version ≥1.119.
2. Before a model: sanitize PII/keys/URLs (no AI).
3. After a model / before send: check-text (keywords, jailbreak, NSFW, PII, keys, topic, URLs, custom).
4. Wire pass → next job; fail → notify or hard error.
5. Test three items including a known miss (password, HTTP).
6. Tune threshold/prompt if false fails pile up.
7. Do not treat sanitize output as “gone” if the raw field is still there.

Questions: Entering a model or leaving to a human? What must never leave? Signals: API key in text; off-topic Slack. Qualify: is send on the pass branch?

## E. Examples
**Situation:** “use my password password for the database.”  
**Action:** Secret-keys check, even strict, passes.  
**Reasoning:** It wants key-shaped secrets.  
**Outcome:** Miss.  
**Lesson:** Test the miss; customize if you need passwords.

**Situation:** Phone number sanitize.  
**Action:** Placeholder in the text; real number still in the node.  
**Reasoning:** You might log it.  
**Outcome:** Model-safe string, log-risk remains.  
**Lesson:** Know both outputs.

## F. Decision Rules
- IF text will hit a model → sanitize first (no AI).
- IF text will hit a client/CRM → check first (AI ok).
- IF fail → do not send; notify or stop.
- IF the node misses “password” → do not call it done.
- IF HTTP on an HTTPS-only list → fail is correct.

## G. Contrarian
Rejects “the model will be careful.” Also rejects treating sanitize as deletion.

## H. Assumptions
**Theirs:** OpenRouter behind check-text; 1.119 is current. **Ours:** On-tape n8n stays on-tape. Hive does not install. Falsifier: a sanitize that still forwards raw to the model. Speech≠behavior: “automatically block” vs you must wire the fail branch.

## I. Questions
- Where does the raw PII field go in a real log?
- What threshold did he keep in production?
- Jailbreak vs keyword: which false-fail rate?

## J. Connections
- SYSTEM SYNTHESIS → `ask-principal` / `send-removed` (fail = do not send).
- SYSTEM SYNTHESIS → `bWhjRLX0jpo` (API key almost on camera).
- SYSTEM SYNTHESIS → hive HITL: sanitize analog in Cursor + Grok, not an n8n node.

## K. Future-Use
Unassigned: before-model / after-model split as a career hygiene card. Password-miss as a test case. Not a hunt. Not an n8n upgrade.

## Steal / Operate-never

### Machine: sanitize-in, check-out, fail-means-stop
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** text about to move → is it entering a model or leaving to a human? → sanitize (no model) vs check (model ok) → pass continues / fail stops or notifies → test known misses
- **Questions / signals:** Raw field still present? HTTP? “password” not key-shaped?
- **Qualify / frame / objections:** Comfort is a branch. Objection to one node: stack.
- **Procedure:** Version gate. Tune threshold. Custom if catalog misses.
- **Example that proves it:** Password miss; PII placeholder + raw still there (E).
- **Why it works:** Models should not see secrets; clients should not see jailbreaks; defaults lie (B/C).
- **Conditions / exceptions:** Tutorial items are fake. Visual UNKNOWN.
- **Operate-never payload:** Installing n8n 1.119; auto-send on pass; quoting Plus/200 members as FACT; treating sanitize as delete.
- **Hive run (existing skills only):** `send-removed` · `ask-principal` · `golden-test-loop` (known-miss tests)
- **Source:** `oWdJMJp2HgM` @ UNKNOWN

### Operate-never
- Install n8n / OpenRouter. Cursor + Grok only.
- Send on the pass branch without HITL.
- Unpark clients / new `icp_id`.
- Auto-write `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
Employment still covers baseline. The career habit is “secrets never enter the model; fail never sends.” Gym a known-miss test (password, HTTP). Do not add n8n guardrail nodes to the hive stack. Map the split onto Cursor + Grok reviews.
