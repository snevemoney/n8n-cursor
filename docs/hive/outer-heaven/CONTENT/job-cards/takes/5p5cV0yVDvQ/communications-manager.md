# Communications Manager — 5p5cV0yVDvQ
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** Unlock the Full Power of Your n8n Agents (new instance MCP)
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** tutorial · 3426 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Instance-level MCP: not only the workflows you wrap as servers — a client can search the instance, read schemas, execute any workflow you mark available. Needs n8n ≥1.21.2. Think: ChatGPT/Claude as the agent; your workflows are the tools.
- Settings → MCP access → enable; OAuth or access token; server URL. Claude (web): native n8n connector → OAuth; first time paste URL. Tools: execute workflow, get workflow details, search workflows.
- Demo 1: Claude writes an email then ‘use n8n to send to michael@dundermifflin.com.’ Search → details → always-allow → Gmail node fires; he shows it in the inbox. Native Claude/ChatGPT Gmail connectors search only — they don’t send. His point: instance MCP can send if you expose a send workflow.
- Demo 2: ClickUp — move ‘email Michael about PTO’ to complete; list today’s tasks (‘record n8n MCP video’). Executions show webhook body → agent → get-tasks. Update needs get-ID first.
- A workflow is MCP-visible only if active/published AND Settings → Available in MCP. Manual toggle is good: otherwise clients could see sensitive keys/data. Description text matters (what it does + fields). Triggers that work: webhook, schedule, chat, form.
- ChatGPT: no native n8n yet; Apps → developer mode (unverified connectors can modify/erase; memory off; orange chrome). Create connector + OAuth + server URL — broken for him live (and he thinks for everyone); workaround = old MCP-server trigger, no auth, paste actions. Security: be careful which workflows you expose.
- Lovable: paste server URL, SSO. Prompt: minimal gamified form for the AI opportunity-map workflow; loading + confirmation. Lovable searches, oneshots a landing page (describe process → roadmap + ROI to inbox). Landscaping report with ~$20k/mo / ~$250k/yr — UNVERIFIED, not the point. Old pain was hand-wiring webhook URL/method/body.
- When to use: interfaces you already live in (Claude → Drive/tasks/team). Voice/Vapi: he fell back to a regular server trigger. Challenge: keep it simple — many useful tools are 1–3 nodes (webhook + Gmail send). Plus ~200 — UNVERIFIED.

## B. Atomic Knowledge

### Instance MCP can search and fire any workflow you toggle on — including send
- **Claim:** Claude found a send-email workflow and mailed michael@dundermifflin.com. Native Gmail connectors cannot send; this can.
- **Reasoning:** Description + available-in-MCP + active are the three locks. Always-allow is how it becomes a silent sender.
- **Mechanism:** Enable MCP access → OAuth → search/get/execute. Only toggle safe workflows.
- **Evidence:** Dunder Mifflin send; ClickUp complete; Lovable form.
- **Conditions:** n8n ≥1.21.2 and a published workflow with a description.
- **Exceptions:** Send is SOURCE and our never. Always-allow is never. ChatGPT developer-mode unverified connectors are never.
- **Action:** Steal: description-as-schema + manual allowlist. Do not expose a Gmail-send workflow to any client.
- **Confidence:** high
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN
- **Epistemic:** SOURCE

### Simple 1–3 node tools in the interface you already live in
- **Claim:** You probably already have webhook+Gmail or get/update task. Don’t invent a platform. Voice may still want the old server trigger.
- **Reasoning:** Lovable’s win was not designing the webhook contract by hand.
- **Mechanism:** Write a description; toggle MCP; call from the host UI. Keep sensitive workflows off the list.
- **Evidence:** Opportunity-map landing oneshot; ClickUp three-tool agent.
- **Conditions:** A host you actually sit in.
- **Exceptions:** Lovable/ChatGPT/Claude as ours = never. ROI $20k/$250k UNVERIFIED.
- **Action:** If we ever expose tools, allowlist drafts not sends. Stack stays Cursor+Grok.
- **Confidence:** high
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Manual MCP toggle exists because a full-instance dump is dangerous. **SOURCE**
- Developer mode can permanently modify/erase; orange = warning. **SOURCE**
- Schedule/chat/form/webhook can all be MCP workflows. **SOURCE**

## D. Procedures
- Active + available-in-MCP + a real description. **SOURCE**
- Get before update when the tool needs an ID. **SOURCE**
- This desk: no send workflow on any MCP. Always-allow off. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Email drafted in Claude. → **Action:** ‘Use n8n to send…’ → search → details → execute Gmail. → **Reasoning:** Native connector can’t send. → **Outcome:** Mail in the inbox. → **Lesson:** That’s the product he shows and the never we keep. Implicit rule: always-allow is how it happens twice.

## F. Decision Rules
- If the workflow can send/pay/deploy → do not toggle Available in MCP.
- If the host asks always-allow → deny.
- If ChatGPT OAuth is broken → do not fall back to no-auth on a send tool.
- Refuse: Dunder-Mifflin send as ours. Quote $20k/$250k. Lovable/Vapi as stack. Plus 200.
- Optimize: allowlist read/draft tools only.

## G. Contrarian
- Field treats MCP as a buzzword wrapper. He treats it as ‘the host becomes an agent over your whole instance.’ **SOURCE**

## H. Assumptions
- ChatGPT path was broken on tape. ROI page is generated fiction. Falsifier: a client that executes a workflow you forgot to untoggle.

## I. Questions
- What is already toggle-shaped in hive that must never be MCP-visible?

## J. Connections
- **SYSTEM SYNTHESIS:** `QCjMBOEhpLE` (native tables). Gmail-send family. `ask-principal` on any execute.

## K. Future-Use
- Allowlist + description-as-schema as a future tool-exposing rule. Voice-fallback to old trigger as color.

## Steal / Operate-never

### Machine: Allowlist only; never expose a send workflow; never always-allow; never treat the Dunder Mifflin demo as ours
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** MCP mentioned → ask which workflows are visible → if any can send, they stay off → draft stays in the host → Evens → stop.
- **Questions / signals:** Can it send? Always-allow? Developer mode? Sensitive keys on the instance?
- **Qualify / frame / objections:** Qualify: search-inbox vs send. Frame: HITL. Objection: ‘Claude sent it for me’ → that is the never.
- **Procedure:** 1) No send toggle. 2) No always-allow. 3) No Lovable as ours. 4) No Plus.
- **Example that proves it:** michael@dundermifflin.com actually received the mail.
- **Why it works:** Instance MCP is a sender if you leave a sender on the list.
- **Conditions / exceptions:** n8n instance you control. Exceptions: we do not operate this.
- **Operate-never payload:** Gmail send via Claude/n8n MCP. No-auth ChatGPT workaround on a mailer. Quote $250k ROI page.
- **Hive run (existing skills only):** `ask-principal` · `playbook-before-send`. Stack Cursor + Grok.
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN


### Operate-never (this desk will not operate)
- Expose a Gmail-send workflow to MCP. Always-allow. ChatGPT developer-mode unverified connector. Quote $20k/$250k.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I treat instance-MCP send as a hard never. I do not draft ‘we’ll let Claude mail them.’ Clients parked.
