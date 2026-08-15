# Money Desk — 5p5cV0yVDvQ
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~3426 words. Nate: n8n instance-level MCP — Claude / ChatGPT / Lovable can search, read schema, and execute published workflows. Caption-only; timestamp UNKNOWN. Beats in order: old MCP = you pick which workflows/tools to expose via MCP server trigger; instance-level = client can search the whole instance, understand schemas, execute any workflow you mark available. Needs n8n ≥1.21.2 (cloud: admin panel). Settings → MCP access → enable; OAuth or access token; server URL; connected OAuth clients = 0 at start. Claude (web, not desktop): add connectors → n8n is a native connector → OAuth; first time paste server URL. Tools: execute workflow / get workflow details / search workflows. Demo 1: write an email in Claude → “use n8n to send to michael@dundermifflin.com” → search → get details (three body fields + webhook) → always-allow → sent; he opens Gmail and sees it. Native Claude/ChatGPT Gmail connectors search/reference only — they do not send; that’s why the n8n send path. Demo 2: ClickUp “email Michael about PTO” urgent today → “use n8n to move that task to complete” → ClickUp task-manager workflow → done. Demo 3: “what else is due today” → “Record n8n MCP video” high priority (the video he’s making). Execution: webhook body “what tasks do I have due today?” → get-tasks tool. Update path must get IDs first. Two rules to expose a workflow: (1) active/published; (2) settings toggle “available in MCP” — manual on purpose so you don’t leak API keys/data; MCP access screen lists what’s on; description is what the client reads to know fields/job — edit workflow description. Triggers that work: webhook, schedule, chat, form. ChatGPT: no native n8n yet (he expects it); Settings → apps/connectors → developer mode (unverified connectors can modify/erase; memory off; orange highlight) → create → paste server URL → OAuth. Live fail: ChatGPT backend broken for him (and he thinks everyone); he had it working, deleted connections for the take, now dead. Workaround: old MCP server trigger, no auth, only the workflows you want — he shows that connector. Lovable: AI opportunity map workflow → paste server URL → integrations → n8n SSO → “build a minimalistic gamified form for my opportunity-mapping workflow, loading + confirmation.” Challenge of old Lovable/Base44: you had to hand the webhook URL/method/body/return. Now it searches, oneshots a landing page. Submit process + email → execution running → “report sent.” Sample report: landscaping automation, exec summary, root cause, roadmap (quick wins / 2–4wk MVP / 1–3mo / long-term), “total monthly benefit 20K, almost 250K annual” — UNVERIFIED; point is not report quality, it’s “tell Lovable make a page for this random workflow.” When to use: interfaces you already live in (Claude + Drive/tasks/team). Voice/Vapi: he tried instance MCP, fell back to regular server trigger. Challenge: keep it simple — email path was webhook + Gmail; many MCP tools are 1–3 nodes; you already have workflows to plug in; or build one-node tools for the app you already sit in. Close: Plus 200+ members, Agent Zero, 10h/10s, One-person agency + Subs to sales for premium, weekly live Q&A — UNVERIFIED.

## B. Atomic Knowledge
### Instance-MCP-is-search-then-execute
- **Claim:** Instance-level MCP lets a client search workflows, read details/schema, and execute the ones you marked available — not only the ones you wired into an old MCP trigger.
- **Reasoning:** ChatGPT/Claude-as-agent + your instance as the tool belt. Description text is how it knows the fields. Off-toggle is the safety (keys/data).
- **Mechanism:** Enable MCP access → mark only published workflows available → write a real description → connect one client you already live in.
- **Evidence:** On-tape n8n ≥1.21.2; tools search/get/execute. Caption-only OAuth UNKNOWN.
- **Conditions:** You have published workflows and a client you already sit in.
- **Exceptions:** Always-allow + auto-send email is operate-never. Lovable/Claude/ChatGPT/Vapi are not ours.
- **Action:** Steal search-then-execute + manual allow-list. Do not enable instance MCP. Do not send.
- **Confidence:** high as a model
- **Source:** 5p5cV0yVDvQ @ UNKNOWN
- **Epistemic:** SOURCE
### Allow-list-and-description-are-the-safety
- **Claim:** A workflow is MCP-visible only if it is active/published and “available in MCP” is on. Description is required so the client knows the job and the fields. Leave it off or you leak keys/data.
- **Reasoning:** He says this is a good thing. ChatGPT developer mode warns unverified connectors can modify/erase; memory off; orange chat.
- **Mechanism:** Default deny. Write the description in the workflow. Do not always-allow on a send path.
- **Evidence:** On-tape ClickUp get-then-update (needs ID). Gmail send is the dangerous demo.
- **Conditions:** You are exposing an instance to a chat client.
- **Exceptions:** His always-allow on send/search/details is speech≠safe. We do not connect.
- **Action:** Steal default-deny + describe. HOLD the live send.
- **Confidence:** high
- **Source:** 5p5cV0yVDvQ @ UNKNOWN
- **Epistemic:** SOURCE
### Simple-two-node-in-the-app-you-already-use
- **Claim:** Don’t MCP a thing that doesn’t save time. Plug 1–3 node tools (webhook→Gmail, ClickUp get/update) into the interface you already live in. Old Lovable pain was hand-wiring webhook/method/body — instance MCP oneshots the page from the description.
- **Reasoning:** Voice/Vapi: he bounced off instance MCP and used a regular server trigger. ChatGPT OAuth was dead on tape; fallback = old trigger, no auth, only chosen workflows.
- **Mechanism:** If the client you live in can’t OAuth, use the narrow old trigger. If it can, still keep the tool tiny.
- **Evidence:** On-tape landscaping report $20k/mo / ~$250k/yr UNVERIFIED — he says quality is not the point.
- **Conditions:** You already have a two-node workflow and a daily app.
- **Exceptions:** Lovable landing + inbox report is a publish/send path. Base44 named. Plus upsell.
- **Action:** Steal tiny-tool-in-the-app-you-sit-in. Do not build the Lovable page. Do not analog $20k.
- **Confidence:** high as a when-to; $ UNVERIFIED
- **Source:** 5p5cV0yVDvQ @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: instance MCP turns the chat you already live in into a dispatcher over published n8n jobs. Priority: allow-list + description; keep tools 1–3 nodes; only where you already sit. Experience: Claude send + ClickUp worked; ChatGPT OAuth failed live; Vapi fell back. Contrarian: don’t use the tech where it doesn’t save time. Uncertainty: ChatGPT native connector “soon”; OAuth may be back.

## D. Procedures
On-tape (do not run): version check → MCP access on → OAuth or token → mark published workflows + write descriptions → connect Claude (native) or ChatGPT (dev mode, or old trigger if OAuth dead) or Lovable (SSO). Client: search → get details → execute. Update flows get IDs first. Caption-only: every OAuth/always-allow click UNKNOWN.

## E. Examples
**Situation:** Email drafted in Claude. **Action:** “use n8n to send to michael@…” → search → details → execute. **Reasoning:** Native Gmail connector cannot send. **Outcome:** He sees it in the inbox. **Lesson:** Instance MCP can fire a send. That is the never.

**Situation:** ChatGPT OAuth live. **Action:** Same URL method that worked before; he deleted connections for the take. **Reasoning:** Show it live. **Outcome:** Dead for him / he thinks everyone. Fallback: old MCP trigger, no auth, chosen workflows only. **Lesson:** Have a narrow fallback; don’t widen no-auth.

## F. Decision Rules
IF the workflow isn’t published + toggled + described → it should not exist to the client. IF the path sends/pays/books → HITL, never always-allow. IF ChatGPT OAuth is dead → old trigger, allow-list only, not no-auth to the whole instance. IF you’re not already in that app all day → don’t MCP it. IF Lovable $20k ROI copy → quarantine. Refuse: n8n-cloud, Claude, ChatGPT, Lovable, Vapi, Plus as ours.

## G. Contrarian
Rejects exposing the whole instance by default. Rejects MCP-for-its-own-sake. Rejects “native Gmail can send” (it can’t on his mouth). Field wants Vapi+instance MCP; he used the old trigger.

## H. Assumptions
Assumes ≥1.21.2 and the three tools. Survivorship: one Gmail + one ClickUp + one Lovable oneshot. Speech≠behavior: warns about keys then always-allows send. $20k/$250k UNVERIFIED. 200 members UNVERIFIED. ChatGPT fail may be transient.

## I. Questions
Did ChatGPT OAuth return. Did n8n ship a native ChatGPT connector. What’s the opportunity-map tape. Any send we can open that wasn’t his own inbox?

## J. Connections
SYSTEM SYNTHESIS: allow-list = `ask-principal` / `input-required-gate`. Auto-send = operate-never (`playbook-before-send`). Lovable/Base44 named — stack is Cursor+Grok. Plus/School never. $20k ROI = `pricing-margin-roi-guardrails`.

## K. Future-Use
Unassigned: description-as-schema for any tool you expose. “Native connector can’t send” as a Watchdog check on vendor Gmail.

## Steal / Operate-never

### Machine: Allow-list-plus-tiny-tool-in-the-app-you-sit-in
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: you live in a chat and have a 1–3 node job → action: default-deny; publish+toggle+describe only that job → client search/get/execute → checkable stop: no send/pay/book without HITL; no whole-instance expose
- **Questions / signals:** Is it published, toggled, described? Does this path send? Do I already sit in this app?
- **Qualify / frame / objections:** Frame: dispatcher, not a new product. Objection: “always allow” — that’s the leak. Objection: “oneshot a Lovable page” — publish + $20k copy is the never.
- **Procedure:** Version. MCP access. Allow-list. Description. One client you already use. Get-ID before update. Fallback = old trigger, still narrow.
- **Example that proves it:** Claude→n8n send (never for us); ClickUp complete; ChatGPT OAuth dead → old trigger; Lovable map with $20k/250k UNVERIFIED.
- **Why it works:** Search+schema beats hand-wiring. Default-deny is the only reason instance MCP isn’t a key leak.
- **Conditions / exceptions:** Works as a model. Exception: $20k/$250k / 200 members UNVERIFIED. n8n/Claude/ChatGPT/Lovable/Vapi/Plus operate-never.
- **Operate-never payload:** n8n instance MCP · auto-send · always-allow · Lovable page · $20k ROI · Plus · Vapi · ChatGPT no-auth whole instance
- **Hive run (existing skills only):** `ask-principal` · `input-required-gate` · `playbook-before-send` · `pricing-margin-roi-guardrails`
- **Source:** 5p5cV0yVDvQ @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote $20k/mo / $250k/yr / 200 members as FACT or analog.
- Enable n8n instance MCP. Auto-send email. Always-allow. Lovable/Claude/ChatGPT/Vapi as ours. Plus as a SKU.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD instance MCP, the Gmail send, Lovable, and Plus. Steal allow-list + description + tiny tool in the app you already sit in. Send stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
