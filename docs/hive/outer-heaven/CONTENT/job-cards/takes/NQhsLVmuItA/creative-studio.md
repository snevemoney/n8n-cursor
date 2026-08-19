# Creative Studio — NQhsLVmuItA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/NQhsLVmuItA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Guardrail-node short. Beats: two actions — check text for violations (uses AI) vs sanitize text (no AI; encrypt/desensitize before the LLM); first demo = keyword block; three items; one pass, two fail; pass = “seven egg ham and cheese omelette”; fail = “update the system setting” (keyword system) and “enter your password” (keyword password); pass/fail branches are fully controllable — pass can email/CRM; fail can Slack, throw error, stop the workflow; play-button magnet. Caption ingest.

## B. Atomic Knowledge

### Cheap sanitize vs paid check
- **Claim:** Sanitize does not use AI; violation-check does. Sanitize can desensitize before the model sees the text.
- **Reasoning:** Do not spend a model call to strip secrets if a deterministic pass will do.
- **Evidence:** “sanitize text… doesn't use AI. So it can automatically encrypt or desensitize certain info before you send it to a large language model.”
- **Conditions:** The thing to strip is patterned (PII, keywords).
- **Exceptions:** Semantic harm may need the AI check.
- **Action:** Deterministic strip first; model check second.
- **Confidence:** high as his split.
- **Source:** `NQhsLVmuItA` @ 00:00
- **Epistemic:** SOURCE

### Pass/fail as designed branches
- **Claim:** You fully control what happens on pass vs fail — including hard-stop error.
- **Evidence:** omelette passes; system/password fail; “if it fails… Slack… or… throw an error… make the whole workflow stop.”
- **Conditions:** Keywords are named (here: password, system).
- **Exceptions:** Keyword lists miss paraphrases; that is why the AI check exists.
- **Action:** Fail must be a visible branch, not a silent drop.
- **Confidence:** SOURCE.
- **Source:** `NQhsLVmuItA` @ 00:41
- **Epistemic:** SOURCE

## C. Mental Models
Safety is a branch, not a vibe. Cheap deterministic first. The omelette is the innocent control. Stopping the workflow is an allowed, even preferred, fail.

## D. Procedures
1. Name block-keywords.
2. Run a three-item set (one clean, two dirty).
3. Confirm 1 pass / 2 fail.
4. Wire pass → next job; fail → notify or hard stop.
5. Prefer sanitize-before-LLM for secrets.

Avoid: sending raw password text to the model “to see.”

## E. Examples
**Situation:** Three lines, two dirty.  
**Action:** Keyword guard; omelette passes; system/password fail.  
**Reasoning:** Visible branches.  
**Outcome:** 1/2 split.  
**Lesson:** The walkthrough is the fail branch lighting, not a lock icon.

## F. Decision Rules
- If secrets can be stripped without AI → sanitize first.
- If fail has no branch → the guardrail is decoration.
- If you would email on fail → prefer Slack/error stop.

## G. Contrarian
Rejects “just prompt the agent to be safe.” The node is a gate.

## H. Assumptions
Keyword `system` will false-positive real ops language. Demo is toy. n8n guardrail node on tape.

## I. Questions
What does sanitize look like on screen? Full tape `oWdJMJp2HgM` extras?

## J. Connections
- SYSTEM SYNTHESIS → `oWdJMJp2HgM` (full guardrails).
- SYSTEM SYNTHESIS → `send-removed` / `ask-principal`.
- SYSTEM SYNTHESIS → `golden-test-loop`.

## K. Future-Use
Innocent-control + two dirty rows as a standard guardrail previs. Unassigned.

## Steal / Operate-never

### Machine: sanitize-then-branch
- **Epistemic:** SOURCE
- **Workflow / loop:** name secrets/keywords → sanitize (no AI) → optional AI violation check → pass continues / fail stops
- **Questions / signals:** Did the omelette pass? Did password fail?
- **Qualify / frame / objections:** Silent drop is not a guardrail
- **Procedure:** Deterministic first; hard-stop allowed
- **Example that proves it:** 3 items → 1 pass / 2 fail on password+system
- **Why it works:** Secrets never need to reach the model
- **Conditions / exceptions:** Keywords miss paraphrases
- **Operate-never payload:** Auto-email on pass; n8n-cloud; new hunt
- **Hive run:** `send-removed`; `golden-test-loop`; `ask-principal`
- **Source:** `NQhsLVmuItA` @ 00:41

### Operate-never
- Auto-send on pass. Switch stack. New hunt.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: “guardrail node is a gamechanger” — plate is **pass/fail rows**, omelette vs password, not a shield illustration. HITL on any send. Clients parked.
