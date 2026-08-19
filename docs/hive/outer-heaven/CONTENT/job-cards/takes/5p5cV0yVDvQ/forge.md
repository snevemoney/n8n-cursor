# Forge — 5p5cV0yVDvQ
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **n8n instance-level MCP** tape (v **1.21.2+**). Beats: old MCP = you pick which workflows are servers; **instance** MCP = client can **search / get details / execute** anything you toggle on → he thinks of it as ChatGPT-as-agent over the whole instance → Claude.ai native n8n connector + OAuth (or paste server URL) → three tools: **search workflows, get workflow details, execute workflow** → demo 1: write email, **always allow** search/details/execute, send to **michael@dundermifflin.com** — mail lands (he shows inbox) → demo 2: ClickUp “email Michael PTO” → complete via n8n agent (get id then update); list today’s tasks (“record n8n MCP video”) → **must be active/published** + settings **Available in MCP** (he says the manual toggle is good — otherwise keys/data leak to “random clients”) → **description** is the contract (fields + what it does); triggers that work: webhook / schedule / chat / form → ChatGPT: no native n8n; developer mode (unverified connectors can **modify/erase**; memory off; orange chrome); live OAuth **broken** this taping; workaround = old MCP **server trigger, no auth**, paste into ChatGPT → Lovable: paste instance URL, OAuth, “build a gamified form for my opportunity-map workflow” **one-shot** landing; submit process+email; report to inbox; landscaping ROI **~$20k/mo / ~$250k/yr** UNVERIFIED — point is the one-shot, not the quality → when to use: interfaces you already live in (Drive move, tasks, team message); **Vapi / voice** “will be cool” — he used a regular server trigger instead → keep it **simple**: many MCP tools are **1–3 nodes** (webhook + Gmail send) → Plus **200+** / agency courses. Timestamp UNKNOWN. n8n / Claude / ChatGPT / Lovable / Vapi / ClickUp / Plus on-tape.

## B. Atomic Knowledge

### Search → details → human allow per execute; never always-allow send
- **Claim:** Instance MCP is an agent over every toggled workflow. The useful ladder is search, then details (schema), then execute. He clicks **always allow** on send — that is the fail.
- **Reasoning:** Description + details replace hand-wiring the POST. Always-allow turns a demo into an unsupervised mailer.
- **Mechanism:** OAuth client + three tools; per-workflow MCP toggle; active/published only.
- **Evidence:** Dunder Mifflin send; ClickUp get-then-update; Lovable one-shot form.
- **Conditions:** n8n 1.21.2+ instance MCP as taped.
- **Exceptions:** ChatGPT OAuth was down; unauthenticated trigger is worse, not a workaround we use.
- **Action:** Steal search→details + manual toggle as fence. Refuse execute-any and always-allow send. No n8n-cloud / Claude / Lovable / Vapi.
- **Confidence:** high on the ladder and the fail; ROI $ UNVERIFIED.
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN
- **Epistemic:** SOURCE

### Description is the contract; 1–3 node tools in the app you already live in
- **Claim:** If the workflow has no description, the client guesses the body. Simple webhook+Gmail is enough. Don’t MCP a thing you aren’t in all day.
- **Reasoning:** Time-save is staying in Claude/ChatGPT, not a new UI. Complex MCP for its own sake doesn’t save time (he says).
- **Mechanism:** Edit workflow description; enable MCP only on the ones you’d let a client see.
- **Evidence:** Opportunity-map description → Lovable form fields matched.
- **Conditions:** You accept that client seeing the instance.
- **Exceptions:** Sensitive keys — don’t toggle those on (he warns).
- **Action:** Steal “description before expose.” We still don’t expose the hive instance.
- **Confidence:** high.
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Instance MCP = execute-any with a toggle costume. Always-allow is how a demo becomes a send. Native Gmail connectors that **can’t** send are the safer default; he bypasses them on purpose. Unauthenticated ChatGPT workaround is a hole. Vapi is a future-he-didn’t-ship. Plus is the close.

## D. Procedures
1. Do not enable instance MCP on anything we run. 2. If a tool ladder exists: search → details → **ask Evens** before execute. 3. Never always-allow send/pay/book/publish. 4. Don’t use no-auth MCP as a ChatGPT fix. 5. Don’t one-shot a Lovable front for a hive workflow. 6. Don’t wire Vapi.

## E. Examples
**Situation:** “Send this email via n8n.”  
**Action:** Search → details → execute; always-allow all three.  
**Reasoning:** Show the magic.  
**Outcome:** Mail sent.  
**Lesson:** The demo is the operate-never.

**Situation:** “Move PTO task to complete.”  
**Action:** Get id, then update.  
**Reasoning:** Update needs an id.  
**Outcome:** ClickUp flips.  
**Lesson:** Details before mutate.

**Situation:** Lovable + opportunity-map.  
**Action:** One-shot form; landscaping report with $20k/mo.  
**Reasoning:** Client can read the schema.  
**Outcome:** Page + email. Quality not the point.  
**Lesson:** One-shot landing ≠ ship. Tape $ UNVERIFIED.

## F. Decision Rules
- If the tool is execute-any → refuse.
- If the click is always-allow on send → refuse.
- If ChatGPT needs no-auth MCP → refuse.
- If Vapi/voice → park.
- If $20k / $250k / 200 Plus appear → UNVERIFIED.

## G. Contrarian
Field wants instance-wide MCP because it’s a “game changer.” He still says manually toggle (the fence) and keep tools to 1–3 nodes. Native Gmail can’t send; he adds send anyway.

## H. Assumptions
OAuth/Claude connector as demoed. Falsifier: “available in MCP” is ignored and the client lists everything. We do not run n8n-cloud. Lovable stay parked (hive rule: don’t switch to Lovable).

## I. Questions
Do `9IzGe0BBj_c` / `mPflFTQUCGk` already lock this steal, or does this tape add the always-allow send receipt?

## J. Connections
SYSTEM SYNTHESIS: `9IzGe0BBj_c` / `mPflFTQUCGk` search→details, refuse execute-any. `CB5bG4mvnS0` draft≠publish. `ask-principal` on send. No Claude / ChatGPT / Lovable / Vapi / n8n-cloud. `-Lo_SlSgtnA` voice.

## K. Future-Use
Per-execute allow as the only mutate path. Description-as-contract if we ever expose a tool.

## Steal / Operate-never

### Machine: search → details → human allow once; description is the contract; 1–3 node tools
- **Epistemic:** SOURCE
- **Workflow / loop:** need a workflow → search → read details/schema → Evens allows **this** execute → never always-allow send
- **Questions / signals:** Is this execute-any? Is send/pay/book in the body? Is the workflow even toggled on purpose?
- **Qualify / frame / objections:** Instance MCP is a loaded gun. No-auth ChatGPT is worse. Vapi is not a reason.
- **Procedure:** No n8n instance MCP. No Lovable front. No always-allow.
- **Example that proves it:** Dunder Mifflin always-allow send; ClickUp get-then-update; Lovable $20k report (UNVERIFIED).
- **Why it works:** Details replace hand-wired POSTs. A human on execute keeps a demo from becoming a mailer. A description is the only schema the client has.
- **Conditions / exceptions:** His ChatGPT OAuth was down. Tape $ UNVERIFIED.
- **Operate-never payload:** execute-any; always-allow send; no-auth MCP; Vapi; Lovable; quote $20k/$250k as FACT.
- **Hive run:** `ask-principal` on send. Existing MCP hygiene only. No new skill.
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN

### Operate-never
- Enable instance MCP / always-allow send / no-auth ChatGPT connector.
- Install Claude / ChatGPT / Lovable / Vapi / n8n-cloud.
- Quote landscaping $ as FACT.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not wire instance MCP. Search→details only; Evens on execute. Deploy HITL.
