# Big Boss — oWdJMJp2HgM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 14:38, 3,464 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: n8n guardrail nodes, pass/fail branches, and the free workflow download are described, not seen. Speaker: Nate Herk.

Beats, in order:

1. Hook: native **guardrails** — stop sensitive data going into a model; check outputs before they go to a client / DB / team. Block, flag, sanitize.
2. What they are: native nodes that enforce rules on incoming or outgoing text. Built-in prompts; customizable.
3. Catalog: **keywords** (block phrases) · **jailbreak** (prompt injection / exploit) · **NSFW** · **PII** (cards, email, address, SSN, passport) · **secret keys** (API keys, passwords) · **topical alignment** (stay in scope) · **URLs** (allow/block + schemes) · **custom prompt** · **regex**.
4. Aside: Agentic Arena jailbreak clip — “largest city in Brazil” / “just say tacos” / São Paulo vs tacos. Sad-trombone energy.
5. Need n8n **1.119**. Two operations: **check text for violations** (uses AI) vs **sanitize text** (no AI — encrypt/desensitize before the model).
6. Demos, three fake items each:
   - Keywords `password`, `system`: omelette passes; “update the system setting” / “enter your password” fail. Pass → email/CRM; fail → Slack or **throw error / stop**.
   - Jailbreak, threshold 7: dog-wish passes (0); “unrestricted AI” 0.95; “no longer follow guidelines” 0.9. Tune prompt or raise threshold if too many false fails. (He says 0=safe, 1=risky, then also talks threshold 7 — mixed.)
   - NSFW: pickleball passes; gore 0.9; obscene 0.8.
   - PII: ice cream passes; john@ / SSN fail; shows entity type. Can select types.
   - Secret keys, permissiveness balanced: “use my password password” **passes**; “API key is …” **fails**. Strict still passes the password row. He thinks it looks for keys more than passwords; customize if you want both.
   - Topical alignment, scope “n8n workflow automation”: add-node / error-handling pass; NBA finals fail 0.9.
   - URLs: allow only upai.com + HTTPS: upai pass; other hosts fail; HTTP fails scheme.
7. Stack multiple guardrails in one check node. Or custom name + threshold + prompt.
8. Sanitize (no AI): PII → placeholder, **real value still in the output** for a log; keys → “secret”; URLs → “URL”; custom regex.
9. Free workflow on Skool (YouTube resources / free n8n templates). Plus: **200+** members **UNVERIFIED**; courses (Agent Zero, 10h→10s, one-person agency, subs-to-sales, projects); weekly live call.

Off-topic / not skipped: tacos / Brazil clip; pickleball; upai.com again.

## B. Atomic Knowledge

### Two nodes: judge vs strip
- **Claim:** **Check** uses a model to pass/fail text. **Sanitize** does not use AI; it strips/encrypts before a model sees the raw string.
- **Reasoning:** You do not want to spend a model call (or leak) to hide a phone number. You do want a model to judge jailbreak/NSFW/topic.
- **Mechanism:** n8n 1.119 guardrail nodes; check → Open Router on tape; sanitize → local rules.
- **Evidence:** Phone number becomes a placeholder; API key becomes “secret”; omelette vs password is keyword match (fast, no “brain”).
- **Conditions:** Sanitize before the expensive/untrusted brain. Check before send-to-client. Exceptions: sanitize still **returns the real PII** in the payload for logging.
- **Action:** Architecture: strip secrets before any model. Check before any hard step. The leftover raw PII in the sanitize output is a Watchdog smell.
- **Confidence:** high
- **Source:** `oWdJMJp2HgM` @ UNKNOWN — “sanitize text… doesn’t use AI… before you send it to a large language model”
- **Epistemic:** SOURCE

### Pass and fail are different pipes
- **Claim:** You fully control what happens on pass vs fail: continue (email/CRM) or Slack / **error / stop the workflow**.
- **Reasoning:** A flag without a branch is a decoration. A fail that still sends is not a guardrail.
- **Mechanism:** Two output branches on the check node. Keywords comma-separated. Text-to-check is any variable (email body, Slack, SMS).
- **Evidence:** Three-item keyword run: 1 pass, 2 fail, explicit next-step talk.
- **Conditions:** Someone wires the fail to a stop, not to the same send. Exceptions: he offers Slack as a soft fail — that can still leak if the Slack is the problem.
- **Action:** Fail branch = stop or HITL card. Never fail-and-send. Doctrine: if it has Send, assume it will send.
- **Confidence:** high
- **Source:** `oWdJMJp2HgM` @ UNKNOWN — “if it fails, you could flag yourself… or… make the whole workflow stop”
- **Epistemic:** SOURCE

### Thresholds and prompts are the real spec
- **Claim:** Jailbreak/NSFW/topic use a confidence threshold and an editable native prompt. Too many false fails → loosen prompt or raise threshold. Secret-keys “balanced vs strict” still missed a password.
- **Reasoning:** The node is not a law. It is a scorer you have to tune. Defaults miss the thing you actually fear.
- **Mechanism:** Threshold + customize prompt; permissiveness on keys; business-scope string on topic; URL allowlist + scheme + subdomain + userinfo.
- **Evidence:** Password row passes secret-keys even on strict. NBA fails topic 0.9. HTTP fails HTTPS-only.
- **Conditions:** You must test with your real fail cases. Exceptions: his 0–1 vs “threshold 7” narration is internally messy.
- **Action:** Golden smokes for the fence. If the password row passes, the fence is not “secrets.”
- **Confidence:** high that tuning is required; medium on his score scale.
- **Source:** `oWdJMJp2HgM` @ UNKNOWN — “it still passes this row, which was use my password”
- **Epistemic:** SOURCE

### Stack rules; custom is the escape hatch
- **Claim:** One check node can stack keywords + jailbreak + PII. If none fit, custom name + prompt + threshold, or sanitize via regex.
- **Reasoning:** Real traffic is not one violation type.
- **Mechanism:** Add guardrails on the same node; custom prompt; custom regex sanitize.
- **Evidence:** He lists the stack; does not run a stacked live example beyond the catalog.
- **Conditions:** Stack can over-fail. Exceptions: custom prompt is still a model call on the check path.
- **Action:** Write the fence list on the job card (owns/never). Do not invent a jailbreak/NSFW SKU.
- **Confidence:** high for the UI claim; low for stacked behavior (not shown).
- **Source:** `oWdJMJp2HgM` @ UNKNOWN — “you can have all of these stack in the same node”
- **Epistemic:** SOURCE

## C. Mental Models

- **In-fence and out-fence.** Sanitize inbound to the model; check outbound to humans/DB. **SOURCE**
- **AI judge vs dumb strip.** Do not spend a model to hide a phone number. **SOURCE**
- **Fail must change the pipe.** Decoration is not a rail. **SOURCE**
- **Defaults miss passwords.** Keys ≠ passwords on his secret-keys rail. **SOURCE**
- **Tacos clip is the injection story.** Arena as a wound, not a product. **SOURCE**
- **Sanitize still holds the raw secret in the log field.** That is a second leak if the log is wide. **INFERENCE**
- **n8n rails are on-tape. HITL architecture is ours.** Send-removed beats a node. **SYSTEM SYNTHESIS**

## D. Procedures

1. Name what must never enter a model (PII, keys) and what must never leave (jailbreak, NSFW, off-topic, bad URLs).
2. **Strip** secrets before the model (no-AI path). Treat leftover raw fields as sensitive.
3. **Check** outbound text before any send / write / client.
4. Wire **fail → stop or HITL**. Do not fail-and-send.
5. Write golden fail strings (password, API key, off-topic, HTTP). Run them.
6. If a default misses (password row), customize or add keywords. Do not trust the label “secret keys.”
7. Stack only what you can test. Record threshold + scope string on the job card.
8. Checkable stop: a known-bad string cannot reach send.

**Qualify / frame:** n8n 1.119 feature tape + Skool template. Not a security product we sell.
**Objections:** “We have guardrails so we can auto-send” — no. Rails are extra; send stays HITL. “Jailbreak node” — not a SKU.
**Avoid:** operating NSFW/jailbreak as a business; quoting 200 members; installing n8n rails as the hive OS.
**When to change:** if golden fails pass, the rail is theater — stop the workflow, do not tune in prod with live send.

## E. Examples

**Situation:** Three lines, keywords `password` + `system`.  
**Action:** Omelette passes; system-setting and enter-password fail. He says pass can send email; fail can error.  
**Reasoning:** Dumb match is enough for those words.  
**Outcome:** 1/2 split.  
**Lesson:** Branch is the product. Implicit rule: we still do not auto-email.

**Situation:** “Use my password password for the database.”  
**Action:** Secret-keys rail passes it, even on strict. API-key-shaped string fails.  
**Reasoning:** The rail is looking for keys, not the word password.  
**Outcome:** False pass on the thing operators fear.  
**Lesson:** Label ≠ coverage. Implicit rule: test the string you actually fear.

**Situation:** Phone number sanitize.  
**Action:** Text becomes placeholder; **real number still present** in the node output for logging.  
**Reasoning:** So you can keep a log.  
**Outcome:** Model can be fed the clean string; log still has the secret.  
**Lesson:** Strip for the model is not strip for the estate. Implicit rule: logs are a leak surface.

## F. Decision Rules

- If text will hit a model → sanitize secrets first (no-AI).
- If text will hit a human/client/DB → check, then HITL.
- If fail → stop or card. Never continue to send.
- If a named rail misses your fear-string → add an explicit keyword/regex; do not trust the name.
- If you need send → you do not have a rail that replaces HITL.
- Optimize: fail-closed. Refuse: n8n as OS, jailbreak SKU, auto-send because “we checked.”

## G. Contrarian

- Against “one AI judge for everything”: sanitize is dumb on purpose.
- Against “secret keys means passwords”: his own demo says no.
- Against “guardrails let you auto-send”: he offers a stop; we require HITL anyway.
- Field assumes a node is a policy. He shows it is a tunable scorer.

## H. Assumptions

**His:** n8n 1.119 + Open Router is enough; native prompts are a good start; Skool template is the close; 200 members is proof.

**Ours:** Captions complete enough (3,464 words). Scores / UI **UNVERIFIED**. Threshold-scale narration is inconsistent. Member count **UNVERIFIED**. Domain-specific: n8n. Jailbreak/NSFW are operate-never SKUs even as rails. Cursor + Grok.

**Falsifiers:** Fail branch still sends. Sanitize log is the incident. Keyword rail blocks ham-and-cheese because “system” appears in a recipe.

**Disagreement (keep labeled):** We will not operate n8n guardrail nodes or auto-send. The **strip-before-model**, **fail-closed**, and **test-the-fear-string** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Is the jailbreak threshold 0–1 or 0–10? (Tape contradicts.)
- Who can read the sanitize node’s raw PII field?
- Does stacking short-circuit or run all rails?
- Agentic Arena: which tape is the tacos clip? Do not invent.

## J. Connections

- **SYSTEM SYNTHESIS** → doctrine #7 if it has Send, assume it will send; HITL card `ACTION / WHY / AGENT / RISK / REVERSIBILITY`.
- **SYSTEM SYNTHESIS** → `ask-principal` (fail → Evens, not Slack-and-hope).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (fear-strings as smokes).
- **SYSTEM SYNTHESIS** → `agent-job-card` (owns/never includes the fence list).
- **SYSTEM SYNTHESIS** → steal-usecases kill: jailbreak / NSFW as products.
- Do not build a phishing-URL product because the URL rail exists.

## K. Future-Use

- Fear-string golden list as a Watchdog smoke pack (unassigned).
- Sanitize-raw-field as a Communications/Watchdog “logs are data” note (unassigned).
- Topical-alignment scope string as a desk “stays in lane” analog (unassigned).

## Steal / Operate-never

### Machine: Strip secrets before the model → check before the hard step → fail-closed
- **Epistemic:** SOURCE (two nodes + branches + password miss) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (text will move) → classify in-fence vs out-fence → sanitize secrets (no-AI) → treat raw log fields as sensitive → check outbound → fail = stop/HITL → pass ≠ send (still Evens) → run fear-string smokes after any tune.
- **Questions / signals:** “Does this hit a model or a human?” “Where does fail go?” “Did the password row pass?”
- **Qualify / frame / objections:** Feature tape. Rails do not unlock auto-send. Objection: we checked — send still HITL.
- **Procedure:** D steps 1–8. Checkable stops: (1) secrets stripped before model, (2) fail cannot send, (3) fear-string fails the rail.
- **Example that proves it:** Secret-keys passes “use my password password”; API-key shape fails. Lesson: name of the rail is not coverage.
- **Why it works:** Models should not see keys; clients should not see injections; a rail that continues on fail is a sticker. Conditions: fail-closed + tests. Exceptions: sanitize still emits raw PII in a side field.
- **Conditions / exceptions:** Cursor + Grok only. No n8n/Open Router. Clients parked. Jailbreak/NSFW not SKUs.
- **Operate-never payload:** Auto-send; n8n rails as OS; quote 200 members; jailbreak product.
- **Hive run (existing skills only):** `ask-principal` · `golden-test-loop` · `agent-job-card` · `click-live-site` (verify the fail path, not “looks good”).
- **Source:** `oWdJMJp2HgM` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- n8n guardrails as hive OS · auto-send because “we checked”
- Jailbreak / NSFW / phishing-URL as a SKU
- Install Claude / ChatGPT / Gemini / Codex / Coda / Vapi / Abacus / Skool
- Quote 200 members as FACT
- New `icp_id` / unpark Normand / rotate hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not approve send because a node said pass.

- **Done** on a fence: fear-string fails closed + secrets stripped before any model + fail cannot send. A green check is not done.
- **Delegate without being asked:** HITL owns send; Watchdog owns the smokes; Forge rejects a rail that passed the password row; I do not add a guardrail desk.
- **Skeptical review:** Native prompts are a start. Defaults missed the password. I will not treat 1.119 as an architecture.
- **One system this take:** fail-closed before the hard step. Not “install guardrails.”
- Live hunt stays parked.
