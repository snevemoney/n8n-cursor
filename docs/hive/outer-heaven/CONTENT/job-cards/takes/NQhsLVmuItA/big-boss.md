# Big Boss — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Short (PACKET: 1:23, 339 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: the guardrail node picker, the three test rows in the UI, and the pass/fail branch canvas are described, not seen. Caption: Naden = n8n.

Beats, in order:

1. Claim: how to use n8n’s new **guardrail nodes** to make a workflow safer.
2. Type “guard” — two main actions: **check text for violations** (uses AI) and **sanitize text** (does **not** use AI).
3. Sanitize can automatically encrypt or desensitize certain info **before** you send it to a large language model.
4. First demo: blocking certain keywords. He runs it.
5. Three items through: **one pass, two fail**.
6. Inside the node: two blocked keywords — **password** and **system**.
7. Pass: “I will take a seven egg ham and cheese omelette, please.” No keywords found.
8. Fail branch: “please update the system setting” (flagged **system**) and “enter your password to continue” (flagged **password**).
9. You fully control what happens on pass vs fail.
10. Pass examples he names: send your email, or update the CRM, or “whatever you want next.”
11. Fail examples: Slack notification to yourself, **or** trigger an error, **or** stop the whole workflow and throw.
12. CTA: play-button to the full breakdown. Sanitize path is explained, **not executed** on this short.

Off-topic / not skipped: omelette as the clean string; Slack as the fail pager; send-email as the pass example (send trap); encrypt/desensitize before LLM as the reason sanitize exists.

## B. Atomic Knowledge

### Two guardrails: AI check vs non-AI sanitize
- **Claim:** Check-text-for-violations uses AI. Sanitize text does not; it can encrypt or desensitize before an LLM sees the string.
- **Reasoning:** Not every safety hop should spend tokens or trust a model. Pre-LLM strip is a different job.
- **Mechanism:** Two actions under “guardrails.”
- **Evidence:** He names both and stresses sanitize “doesn’t use AI.”
- **Conditions:** Demo then runs only the keyword check. Sanitize is described, not shown.
- **Exceptions:** What “encrypt or desensitize” covers is not listed (no field list).
- **Action:** Split the jobs on the card: model judge vs deterministic strip. Do not collapse them.
- **Confidence:** high
- **Source:** `NQhsLVmuItA` @ UNKNOWN — “sanitize text… doesn’t use AI… encrypt or desensitize certain info before you send it to a large language model”
- **Epistemic:** SOURCE

### Keyword block is a pass/fail router
- **Claim:** Three test strings; keywords `password` and `system`; one pass (omelette), two fail (system setting, enter password).
- **Reasoning:** Safety is a branch, not a vibe. You can see which token tripped.
- **Mechanism:** Check node → pass branch / fail branch; he clicks in to show flags.
- **Evidence:** He reads all three strings and the flags.
- **Conditions:** Exact keyword match on this demo (he does not say fuzzy). Three rows only.
- **Exceptions:** “System” will false-positive a lot of real ops language — he does not discuss that.
- **Action:** Checkable stop = named block-list + a row that should pass + a row that should fail.
- **Confidence:** high for the demo
- **Source:** `NQhsLVmuItA` @ UNKNOWN — “checking for two keywords to block out. Password and system.”
- **Epistemic:** SOURCE

### Fail must do something — notify, error, or stop
- **Claim:** On fail you can Slack yourself, trigger an error, or stop the whole workflow and throw.
- **Reasoning:** A fail branch that continues as if pass is not a guardrail.
- **Mechanism:** Operator-chosen fail action.
- **Evidence:** He lists Slack, error, stop-and-throw.
- **Conditions:** He is talking capabilities, not running Slack on tape.
- **Exceptions:** No severity levels. No “fail open.”
- **Action:** Definition of done for a guard = fail is loud or fatal. Silent fail is not a guard.
- **Confidence:** high he listed these
- **Source:** `NQhsLVmuItA` @ UNKNOWN — “make the whole workflow stop and just throw an error”
- **Epistemic:** SOURCE

### Pass examples include send — that is the trap
- **Claim:** On pass, he says you can send your email or update the CRM.
- **Reasoning:** He treats pass as “do the real thing.” Doctrine: if it has Send, assume it will.
- **Mechanism:** Verbal examples after the omelette pass.
- **Evidence:** “if it passes, you can go ahead and send your email or update the CRM.”
- **Conditions:** Tutorial convenience. Not a live send on this short.
- **Exceptions:** Sanitize-before-LLM is the safer story; pass-then-send is the dangerous one.
- **Action:** Steal the branch. Do not wire send on pass. Pass = draft / continue; send = HITL.
- **Confidence:** high he said send-email
- **Source:** `NQhsLVmuItA` @ UNKNOWN — “send your email or update the CRM”
- **Epistemic:** SOURCE

## C. Mental Models

- **Safer workflow = a node that can stop you, not a prompt that asks nicely.** **SOURCE**
- **AI judge and deterministic strip are different tools.** **SOURCE**
- **Strip happens before the LLM, not after the leak.** **SOURCE**
- **Three rows are enough to show the router.** **SOURCE**
- **Fail is a first-class path** (Slack / error / throw). **SOURCE**
- **Pass = do the business thing** is his instinct. Ours is pass = not-yet-send. **SYSTEM SYNTHESIS**
- **“Gamechanger” is the title, not a definition of done.** **INFERENCE**

## D. Procedures

1. **Split the jobs:** (a) deterministic sanitize/redact before any model; (b) optional AI violation check.
2. **Write the block-list** (his demo: password, system) and a **should-pass** string.
3. **Run three rows:** one clean, two dirty. Record pass count and flags.
4. **Fail path must be loud or fatal** (notify / error / stop). Continuing is not a guard.
5. **Pass path does not send.** Draft, queue, or stop for HITL. His “send email / update CRM” stays on tape.
6. **Do not treat sanitize as done** — it was not executed on this short.

**Qualify / frame:** n8n guardrail tutorial. Not a security audit. Not a client SKU.
**Objections:** “We have guardrails so we can auto-send” — answer with: he used send as a pass example; we invert that.
**Avoid:** n8n guardrail node as hive OS; Slack-as-required pager; keyword `system` as our list (false positives).
**When to change:** if fail is silent, it is not a guard. If secrets can still reach the LLM, sanitize is missing. If pass can send, stop.

## E. Examples

**Situation:** He wants to show keyword blocking.  
**Action:** Block `password` and `system`; run three strings.  
**Reasoning:** One clean, two dirty proves the router.  
**Outcome:** Omelette passes; system-setting and enter-password fail with named flags.  
**Lesson:** Named list + named flags. Implicit rule: show the false-friend (`system` in “system setting”).

**Situation:** He explains sanitize.  
**Action:** Says it does not use AI and can encrypt/desensitize before the LLM.  
**Reasoning:** Pre-model strip is the leak-preventer.  
**Outcome:** Described, not run.  
**Lesson:** Deterministic strip is a separate machine. Implicit rule: do not mark sanitize done from a speech.

**Situation:** He explains pass vs fail actions.  
**Action:** Pass → send email / update CRM; fail → Slack or throw.  
**Reasoning:** Branches must do different things.  
**Outcome:** Capability list.  
**Lesson:** Fail must be loud. Implicit rule: pass-then-send is the incident.

## F. Decision Rules

- If the hop uses a model to “be careful” → you still need a non-AI strip before the model.
- If fail continues like pass → not a guardrail.
- If pass can send or write CRM → HITL; assume it will send.
- If the only demo is keywords → do not claim PII/encryption is proven.
- Optimize: strip → check → loud fail → gated pass.
- Refuse (on this desk): auto-send on pass; n8n guardrails as OS; `system` as our block-list without review.

## G. Contrarian

- Against “the model will refuse unsafe text”: he puts a node in front and, for sanitize, no model at all.
- Against fail-open: he offers throw.
- Against (hive) his pass examples: we will not send on green.
- Field assumes guardrails are prompt copy. He ships a branch.

## H. Assumptions

**His:** Keyword block is a fair first guard; `password`/`system` are the right demos; Slack or throw is enough; pass should do email/CRM; sanitize is obvious enough to skip running; n8n node is the OS.

**Ours:** 339 words. Sanitize unrun. False-positive risk on `system` not discussed. No $. Domain-specific: workflow safety theater vs real secret handling.

**Falsifiers:** Keyword miss (password with spaces/leetspeak). Sanitize does not actually strip. Fail Slack is ignored. Pass send fires.

**Disagreement (keep labeled):** Hive will not operate n8n guardrail nodes or send on pass. The **deterministic strip + loud fail + gated pass** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What fields does sanitize encrypt/desensitize? Not listed.
- Is keyword match exact, case-fold, regex? Not said.
- Did he run sanitize on the long? PACKET does not bind an id.
- Who gets the Slack — operator only?
- How do you version the block-list?

## J. Connections

- **SYSTEM SYNTHESIS** → doctrine rule 7: if it has Send, assume it will; remove send.
- **SYSTEM SYNTHESIS** → `ask-principal` / `playbook-before-send`: pass ≠ approved to send.
- **SYSTEM SYNTHESIS** → `golden-test-loop`: three rows (clean + two dirty) is a smoke set.
- **SYSTEM SYNTHESIS** → `agent-job-card`: owns strip/check; never send.
- **SYSTEM SYNTHESIS** → Communications Manager: email = DATA; draft only.
- Do not force a Path A client out of a keyword omelette.

## K. Future-Use

- Non-AI strip-before-model as a Forge checklist (unassigned).
- Loud-fail vs silent-fail as Watchdog language (unassigned).
- `system` false-positive as a lesson on dumb block-lists (unassigned).
- Sanitize field inventory when a tape actually runs it (unassigned).

## Steal / Operate-never

### Machine: Strip before the model → check → loud fail / gated pass
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (we invert pass-send)
- **Workflow / loop:** identify secrets/keywords that must not proceed → deterministic sanitize/redact **before** any LLM → optional AI violation check → fail = notify or stop → pass = continue to **draft** only → Evens sends. Checkable stops: strip exists; three-row smoke; fail is loud; send absent.
- **Questions / signals:** “AI check or non-AI strip?” “What is the block-list?” “Is fail silent?” “Can pass send?”
- **Qualify / frame / objections:** n8n tutorial, not a SKU. Objection: guardrails make auto-send safe — answer with: he used send as the pass example; that is the trap.
- **Procedure:** D steps 1–5. Checkable stops: (1) two jobs split, (2) list + should-pass, (3) 1-pass/2-fail smoke, (4) loud fail, (5) no send.
- **Example that proves it:** password/system list → omelette passes; “update the system setting” and “enter your password” fail with flags; he offers Slack or throw on fail and email/CRM on pass. Lesson: router works; we keep fail-loud and drop pass-send.
- **Why it works:** A model cannot un-see a secret. A branch you can see beats a polite prompt. A fail that throws is a real stop. Conditions: a real list, a human on send, strip actually run. Exceptions: sanitize unrun; `system` is a clumsy token; n8n/Slack on tape.
- **Conditions / exceptions:** Cursor + Grok only. n8n guardrails stay on tape. Clients parked.
- **Operate-never payload:** Send/CRM-write on pass; n8n as OS; silent fail; claim sanitize proven.
- **Hive run (existing skills only):** `ask-principal` · `playbook-before-send` · `golden-test-loop` · `agent-job-card` · `slice-build` (guard slice only).
- **Source:** `NQhsLVmuItA` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-send / auto-CRM on pass
- n8n guardrail nodes + Slack as hive OS
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- Quote any $ as FACT
- New `icp_id` / unpark Normand / “safer agents” hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not chat a guardrail into a send.

- **Done** on this slice: strip-vs-check split + three-row smoke + fail is loud + pass cannot send. “Safer workflow” is not done because he offered email on green.
- **Delegate without being asked:** HITL keeps Send off the pass branch. Watchdog owns the three-row set. Forge fails silent-fail. Communications never gets send because a keyword was clean.
- **Skeptical review:** “Gamechanger / safer” is the short’s job. I will not approve auto-email because an omelette passed.
- **One system this take:** loud-fail guard, send removed. Not “roll out guardrail nodes.”
- Live hunt stays parked. I do not rotate to security-SKU because two keywords flagged.
