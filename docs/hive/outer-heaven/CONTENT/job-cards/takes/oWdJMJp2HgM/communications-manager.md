# Communications Manager — oWdJMJp2HgM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/oWdJMJp2HgM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** n8n JUST Leveled Up AI Agents With Guardrails
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** tutorial · 3464 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Native n8n Guardrails (v1.119+): enforce rules on incoming/outgoing text. Two nodes: Check text for violations (AI, OpenRouter in his demo) and Sanitize text (no AI — encrypt/desensitize before the model). Built-in prompts; customizable.
- Check types: keywords (comma list); jailbreak (injection/exploit; Agentic Arena ‘tacos’ clip); NSFW; PII (CC, email, address, SSN, passport — selectable); secret keys (API keys/passwords); topical alignment (stay in a business scope); URLs (allowlist/blocklist + schemes); custom prompt; regex. Stack several in one Check node.
- Pass/fail branches: pass → email/CRM; fail → Slack flag or throw and stop the workflow. Text-to-check can be email body, Slack, SMS, or a set node.
- Demos: keywords password/system — omelette passes, ‘update the system’ / ‘enter your password’ fail. Jailbreak threshold 7 (0 safe–1 risky): dog-wish = 0; unrestricted-AI = 0.95; ignore-guidelines = 0.9; tune prompt or raise threshold if too many false fails. NSFW: pickleball passes; gore 0.9 / obscene 0.8 fail. PII: ice-cream passes; john@ + SSN fails and names the entity type. Secret keys: ‘use my password password’ and ‘connect to n8n’ passed even on strict; a real-looking API key failed — he thinks it hunts keys more than the word password; customize if you want passwords too. Topical scope ‘n8n workflow automation’: add-node / error-handling pass; NBA finals 0.9 fail. URLs: allow only upi.com + HTTPS; HTTP and other hosts fail with a reason.
- Sanitize (no model): PII → placeholder but also emits the real value (you could log it — he notes that); keys → ‘secret’; URLs → ‘URL’; custom regex. Point: clean before the LLM sees it.
- School template + Plus ~200 — UNVERIFIED.

## B. Atomic Knowledge

### Check outbound before it leaves; sanitize inbound before the model
- **Claim:** Two jobs: don’t send sensitive text to a model, and don’t send a bad model output to a client/DB/Slack.
- **Reasoning:** Pass/fail is a branch, not a vibe. Sanitize does not need a model.
- **Mechanism:** Pick the rail (keyword/jailbreak/NSFW/PII/keys/topic/URL/custom) → threshold → pass continues, fail flags or throws. Stack rails. Sanitize PII/keys/URLs first if the next hop is an LLM.
- **Evidence:** Password/system keyword split; jailbreak 0.95; API-key vs the word password.
- **Conditions:** n8n ≥1.119.
- **Exceptions:** Pass → send email is on his diagram and our never. Real PII still appears on the sanitize output — don’t log it into a public thread. School JSON never.
- **Action:** Steal pass/fail before leave. Do not wire fail-to-send or pass-to-Gmail.
- **Confidence:** high
- **Source:** `oWdJMJp2HgM` @ UNKNOWN
- **Epistemic:** SOURCE

### Secret-keys rail may miss the word password; thresholds are knobs
- **Claim:** A sentence with ‘password password’ passed even on strict. A key-shaped string failed. Jailbreak/NSFW/topic use 0–1 confidence.
- **Reasoning:** False fails → loosen prompt or raise threshold. False passes → customize the system message.
- **Mechanism:** Test with your real fail-strings before you trust the default.
- **Evidence:** His password vs API-key observation.
- **Conditions:** When you think the rail is ‘on.’
- **Exceptions:** We do not run n8n guardrails as ours. Don’t treat a pass as permission to send.
- **Action:** If we ever check a draft, don’t assume ‘password’ is caught. Evens still reads.
- **Confidence:** high
- **Source:** `oWdJMJp2HgM` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Sanitize can still emit the raw PII next to the placeholder — a log risk. **SOURCE**
- Keyword match is fast; jailbreak uses a model and is slower. **SOURCE**
- You control stop-the-workflow vs Slack-flag. **SOURCE**

## D. Procedures
- Update to 1.119. Check vs sanitize. Stack rails. Branch fail to a human, not to send. **SOURCE**
- This desk: the fail branch is Evens, not Gmail. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Three fake prompts through keyword rail. → **Action:** omelette passes; system/password fail. → **Reasoning:** Exact tokens. → **Outcome:** You choose send vs Slack vs throw. → **Lesson:** The steal is the branch, not the send. Implicit rule: defaults miss some password talk.

## F. Decision Rules
- If the next hop is an LLM → sanitize first.
- If the next hop is a client → check the output.
- If fail → do not continue to send.
- Refuse: School template as ours. Pass-to-Gmail. Quote Plus 200. Log raw SSN ‘for later.’
- Optimize: fail = human.

## G. Contrarian
- Field ships the agent and hopes. He puts a native rail before the leave. **SOURCE**

## H. Assumptions
- OpenRouter in the check node is his demo, not a requirement. Thresholds are toys. Falsifier: a jailbreak that scores 0.2 and still injects.

## I. Questions
- What is our Cursor-side equivalent of sanitize-before-model on a letter that quotes a client email?

## J. Connections
- **SYSTEM SYNTHESIS:** `5p5cV0yVDvQ` (MCP send). `QCjMBOEhpLE` (filter then draft). `playbook-before-send`.

## K. Future-Use
- Pass/fail-before-leave as a standing comms rail. Sanitize-emits-raw as a warning.

## Steal / Operate-never

### Machine: Rail before leave; sanitize before the model; fail goes to a human, never to Gmail
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Draft exists → check (PII/keys/off-topic/jailbreak) → fail = stop/flag → pass = Evens still reads → stop. No send.
- **Questions / signals:** Did we sanitize before a model? Did pass auto-send? Raw PII in a log?
- **Qualify / frame / objections:** Qualify: check vs sanitize. Frame: HITL on fail and on pass. Objection: ‘the rail passed so send’ → pass is not Evens.
- **Procedure:** 1) Sanitize inbound. 2) Check outbound. 3) Fail ≠ send. 4) No School JSON.
- **Example that proves it:** Keyword split + API-key vs the word password.
- **Why it works:** A branch you control is the product. Send is optional on his slide and forbidden on this desk.
- **Conditions / exceptions:** n8n ≥1.119. Exceptions: we do not operate the node.
- **Operate-never payload:** Pass-to-Gmail. Log raw SSN. Plus CTA.
- **Hive run (existing skills only):** `playbook-before-send` · `ask-principal` · `golden-test-loop`.
- **Source:** `oWdJMJp2HgM` @ UNKNOWN


### Operate-never (this desk will not operate)
- Wire pass → Gmail send. Treat School guardrail JSON as ours. Store raw PII from the sanitize node.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I treat fail as stop. I treat pass as still-HITL. I do not send. Clients parked.
