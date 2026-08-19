# Creative Studio — 5p5cV0yVDvQ
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
n8n **instance-level MCP** (≥1.21.2). Beats: old world = you pick which workflows are MCP servers; new world = client can **search / get details / execute** any workflow you toggle “available in MCP”; he analogizes ChatGPT-as-agent over the whole instance; Claude web native n8n connector + OAuth (first time paste server URL); demo: write email → “use n8n to send to michael@dundermifflin.com” → search → details → send (always-allow); ClickUp: complete “email Michael about PTO,” then list today’s tasks (“record n8n MCP video”); executions show webhook body in; must be **active/published** + settings toggle; description is how the client knows fields; allowed triggers: webhook / schedule / chat / form; ChatGPT = no native yet, developer mode (orange, memory off, unverified-connector warning) — **OAuth was broken live**, fallback = old MCP-server trigger, no auth; Lovable: paste URL, one-shot “minimalistic gamified form” for AI opportunity-map workflow → landscaping report, **~$20k/mo / ~$250k/yr** on-tape (UNVERIFIED, “not the point”); native Gmail connectors search-only, cannot send — that is why the n8n send path matters; keep it one–three nodes; use MCP in the interface you already live in; Vapi aside failed, he used a regular server trigger; Plus ~200 (UNVERIFIED). Visual: MCP icons on workflows, Lovable form, Dunder Mifflin email.

## B. Atomic Knowledge

### Toggle + description is the API
- **Claim:** Instance MCP can see the whole box, but only workflows you mark available, and only if the description teaches fields and purpose.
- **Reasoning:** Default-all would leak keys and data — the toggle is the safety.
- **Evidence:** “you have to… available in MCP… otherwise… sensitive API keys… you are in full control still.”
- **Conditions:** Active/published; webhook/schedule/chat/form.
- **Exceptions:** Old per-workflow MCP server still exists (he used it when ChatGPT OAuth died).
- **Action:** Learn the toggle; do not open the instance to a vendor.
- **Confidence:** SOURCE.
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN
- **Epistemic:** SOURCE

### Live where you already are
- **Claim:** MCP pays when it removes a context switch (Claude → send mail / move ClickUp), not when it is a new toy.
- **Evidence:** “think about interfaces that you are in a lot… you probably already have lots of workflows… simple two or three or even one node.”
- **Conditions:** Client must be allowed to execute.
- **Exceptions:** Voice/Vapi — he bounced to a regular trigger.
- **Action:** One-node tools in the daily surface; hive does not connect Claude/Lovable.
- **Confidence:** SOURCE.
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN
- **Epistemic:** SOURCE

### Frontend can oneshot the webhook contract
- **Claim:** Lovable searched the instance, read the opportunity-map workflow, and built a form without him pasting URL/method/body — the old pain of every prior Lovable/Base44 tape.
- **Evidence:** “one of the challenges is actually giving this interface, the webhook configuration… it’s basically just going to search… and oneshot a landing page.”
- **Conditions:** n8n already a Lovable integration.
- **Exceptions:** Roadmap $ / quality “not the point.”
- **Action:** Steal the “search the instance, don’t paste the contract” lesson; do not stand up Lovable.
- **Confidence:** SOURCE.
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
MCP = agent-over-your-box, not a protocol lecture. Always-allow is a demo choice, not a policy. Developer-mode orange is a warning. Native Gmail in Claude/ChatGPT is read-only — send still needs your workflow. Simple beats clever.

## D. Procedures
1. Version ≥1.21.2; Settings → MCP access on; OAuth or token.
2. Per workflow: publish + available-in-MCP + write a real description.
3. Client: search → get details → execute (approve).
4. If vendor OAuth is dead → old MCP-server trigger, least privilege.
5. Frontend: connect instance, ask for the form, watch executions.
Avoid: always-allow in prod; ChatGPT/Claude/Lovable as hive; auto-send; 20k/250k as FACT; Plus.

## E. Examples
**Situation:** Email drafted in Claude.  
**Action:** “Use n8n to send to michael@…”  
**Outcome:** Mail in the inbox.  
**Lesson:** Send is a one-webhook + Gmail node, not a native connector.

**Situation:** Lovable + opportunity-map workflow.  
**Action:** One prompt, gamified form, email report.  
**Outcome:** Landscaping roadmap with big $ (unverified).  
**Lesson:** The win is the contract-discovery, not the ROI slide.

## F. Decision Rules
- If the workflow is not toggled + described → the client will guess wrong or see nothing.
- If you would always-allow → stop (demo only).
- If ChatGPT OAuth fails → do not widen to no-auth on the whole instance.
- If $ / 200 Plus from this tape → UNVERIFIED.

## G. Contrarian
Instance-wide search sounds like a game-changer; he immediately says most people will use it where it does not save time. Voice was not ready; he did not force it.

## H. Assumptions
1.21.2, OAuth-outage, 20k/250k, 200 Plus UNVERIFIED. On-tape n8n / Claude / ChatGPT / Lovable / ClickUp. Clients parked.

## I. Questions
Is ChatGPT native n8n shipped yet? Visual of the MCP icons / orange developer mode? What was in the opportunity-map agent?

## J. Connections
- SYSTEM SYNTHESIS → `QCjMBOEhpLE` (in-instance data, no extra API).
- SYSTEM SYNTHESIS → `w9-gfaV5vlM` (destination, not the connector).
- SYSTEM SYNTHESIS → `ask-principal` (send is HITL).

## K. Future-Use
“Description is the schema” for any tool-exposed workflow. Unassigned.

## Steal / Operate-never

### Machine: toggle-describe-search-execute, least privilege
- **Epistemic:** SOURCE
- **Workflow / loop:** publish → MCP toggle → write description → client search/details/execute → watch executions
- **Questions / signals:** Are we in the daily surface? Is send actually allowed by the native connector? Did OAuth die?
- **Qualify / frame / objections:** Whole-instance default is a leak
- **Procedure:** One–three nodes; fallback to a single-server trigger
- **Example that proves it:** Dunder Mifflin send; ClickUp complete; Lovable form without a pasted contract
- **Why it works:** The client can read the description and fill the webhook
- **Conditions / exceptions:** ChatGPT OAuth broken on tape; $ UNVERIFIED
- **Operate-never payload:** Claude/ChatGPT/Lovable/n8n-cloud; auto-send; always-allow; 20k/250k as FACT
- **Hive run:** `ask-principal`; `click-live-site`; `info-gain-cite`
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN

### Operate-never
- Connect hive n8n to Claude/ChatGPT/Lovable.
- Auto-send mail. Always-allow tools.
- Quote landscaping $ as FACT. Join Plus. New hunt.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: the **Lovable form + inbox confirmation** is the plate. Do not ship the opportunity-map $ as FACT. If we ever plate MCP, plate the toggle and the description field. HITL. Clients parked.
