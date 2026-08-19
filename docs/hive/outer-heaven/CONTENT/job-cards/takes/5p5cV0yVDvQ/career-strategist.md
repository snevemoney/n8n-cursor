# Career Strategist — 5p5cV0yVDvQ
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Video (13:37, 3426 words). Caption ingest. Beats in order: (1) instance-level MCP: clients can search/understand/execute **any enabled** workflow, not only ones you wired as a server (2) think of ChatGPT as the agent that can see the instance (3) n8n ≥1.21.2; settings → MCP access → enable; OAuth or token; server URL (4) Claude web: native n8n connector; first time paste URL; tools = search / get details / execute (5) **demo: “use n8n to send that email to michael@dundermifflin.com” — Always Allow ×3 — email sent** (6) ClickUp: complete “email Michael about PTO”; list today’s tasks (7) executions show webhook body from Claude (8) to expose a workflow: **active/published** + settings toggle **Available in MCP** — manual on purpose so secrets are not wide open; write a description (fields + what it does) (9) triggers that work: webhook, schedule, chat, form (10) ChatGPT: no native n8n; developer mode (orange, memory off, can erase data); OAuth **broken live**; workaround = old MCP-server trigger, no auth (11) Lovable: paste URL, SSO, one-shot form for “AI opportunity map” → inbox ROI story; he says the landing copy matches the consultant agent (12) rest: more of the same connect/allow pattern. Visual/click: UNKNOWN.

## B. Atomic Knowledge

### Instance MCP is a send surface if you Always-Allow
- **Claim:** Once a send-email workflow is MCP-available, Claude can search it, read the schema, and send. He clicks Always Allow and shows the sent mail.
- **Reasoning:** The career risk is not “MCP is cool.” It is execute + always-allow.
- **Mechanism:** Search → details → execute; webhook body from the chat.
- **Evidence:** “use nodn to send that email… confirmation that the email has been sent.” @ UNKNOWN
- **Conditions:** Workflow active + Available in MCP + client allowed.
- **Exceptions:** Native Claude Gmail connector (he says) cannot send — only search. Instance MCP can, if you built send.
- **Action:** Never Always-Allow execute on a send/pay/deploy workflow.
- **Confidence:** high as demo
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** ChatGPT OAuth dead on tape
- **Speech ≠ behavior:** he warns about sensitive access, then Always-Allows send

### Manual enable + description are the only brakes
- **Claim:** You must toggle Available in MCP per workflow because otherwise clients could see keys and data. Description is how the client knows fields and purpose. Unpublished workflows stay dark.
- **Reasoning:** The instance is larger than the workflows you remember.
- **Mechanism:** Settings list of exposed workflows; edit description in the workflow.
- **Evidence:** “this is actually a really good thing that you have to manually enable these because otherwise… sensitive API keys” @ UNKNOWN
- **Conditions:** Instance MCP on.
- **Exceptions:** Old per-workflow MCP server is the ChatGPT workaround (no auth — worse).
- **Action:** Inventory what is toggled; write descriptions as if a stranger will execute them.
- **Confidence:** high
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** ChatGPT live fail
- **Speech ≠ behavior:** none

## C. Mental Models
MCP as “the agent can see my building.” Developer mode is orange for a reason. Lovable one-shot is a frontend on a webhook, not a new brain. Opportunity-map landing is a sales page (ROI to inbox) — parked. Always-allow is how a demo becomes a send.

## D. Procedures
1. Version ≥1.21.2. Enable MCP access.
2. Per workflow: publish, toggle Available in MCP, write description.
3. Do not expose send/pay/delete unless you want a chat to fire them.
4. Client: search → details → execute. Prefer ask-every-time, not Always Allow.
5. If ChatGPT OAuth is dead: he used an unauthenticated MCP trigger — treat as a warning, not a pattern.
6. Lovable/Base44: instance URL is enough for a form if the workflow is described.

Questions: Is send on the allow list? What is in the description? Developer mode on? Signals: orange chat; Always Allow. Qualify: published + toggled.

## E. Examples
**Situation:** Draft in Claude, send via n8n.  
**Action:** Always Allow search, details, execute.  
**Reasoning:** Demo convenience.  
**Outcome:** Mail in the inbox.  
**Lesson:** Instance MCP is a send button.

**Situation:** ChatGPT connector.  
**Action:** Developer mode + OAuth.  
**Reasoning:** No native n8n.  
**Outcome:** Broken live; unauthenticated workaround.  
**Lesson:** New surface, flaky auth, worse fallback.

## F. Decision Rules
- IF the workflow can send/pay/deploy → do not MCP-enable it (hive).
- IF the client asks Always Allow → no.
- IF a workflow has keys → keep the toggle off.
- IF OAuth is down → do not “just drop auth.”
- IF you expose it → write the description like a contract.

## G. Contrarian
Rejects “native Gmail in Claude is enough to send” (he says it is not). Also his own warning vs Always-Allow send — keep the mismatch.

## H. Assumptions
**Theirs:** Instance MCP is a game changer; Lovable one-shot is enough; ChatGPT will be native soon. **Ours:** On-tape n8n/Claude/Lovable stay on-tape. Sent demo email is not a hive pattern. Falsifier: a client executes a workflow you forgot was toggled. Speech≠behavior: security speech vs Always Allow.

## I. Questions
- Which workflows were toggled besides mail and ClickUp?
- Did “always allow” stay on after the take?
- What did the opportunity-map email actually contain?

## J. Connections
- SYSTEM SYNTHESIS → `send-removed` / `ask-principal` (this tape is the anti-pattern demo).
- SYSTEM SYNTHESIS → `oWdJMJp2HgM` (fail branch vs always-allow).
- SYSTEM SYNTHESIS → `tFFKuq2t0rI` (Base44 sister).

## K. Future-Use
Unassigned: “Available in MCP” as a career checklist item — what can a chat fire? Not a hunt. Not a Lovable opportunity-map SKU.

## Steal / Operate-never

### Machine: inventory execute-surfaces; never Always-Allow send
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** new connector → list what it can execute → if send/pay/deploy, do not enable → if enabled, ask every time → write descriptions as contracts
- **Questions / signals:** Always Allow? Developer mode orange? Toggle on a secret workflow?
- **Qualify / frame / objections:** Manual toggle exists because the blast radius is the instance. Objection to unauthenticated workaround: worse.
- **Procedure:** Publish + toggle + description. Prefer deny-by-default.
- **Example that proves it:** Always-Allow sent Michael’s mail; ChatGPT OAuth died (E).
- **Why it works:** Search+schema+execute is a send API with a chat UI (B/C).
- **Conditions / exceptions:** Demo used a fake Dunder Mifflin address; still a send.
- **Operate-never payload:** Enabling instance MCP; Always Allow; sending; Lovable public form; quoting “game changer” as FACT.
- **Hive run (existing skills only):** `send-removed` · `ask-principal` · `info-gain-cite`
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN

### Operate-never
- Connect n8n MCP to Claude/ChatGPT/Lovable.
- Always-Allow execute. Send / pay / deploy / book / publish.
- Unpark clients / new `icp_id`.
- Install on-tape vendors. Cursor + Grok only.
- Auto-write `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
Employment still covers baseline. The career lesson is “a chat that can execute is a send surface.” Gym deny-by-default. Do not recreate the Michael email. Opportunity-map frontend stays parked.
