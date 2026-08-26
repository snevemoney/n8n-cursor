# Day Planner — 5p5cV0yVDvQ
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: n8n **instance-level MCP** (≥1.21.2). Beats: old = you pick workflows as an MCP server; new = client can **search / get details / execute any opted-in workflow**; he thinks of ChatGPT as the agent over the whole instance; Settings → MCP access (OAuth or token); Claude web native connector; tools: execute / get details / search; **writes an email then “use n8n to send… michael@dundermifflin.com”** — **Always allow** search, details, execute → “email has been sent”; ClickUp: complete “email Michael about PTO,” then list due today; executions show webhook body; must be **active/published** + settings **Available in MCP** (he says this is good — else keys/data leak); **description** is how the client knows fields; triggers: webhook / schedule / chat / form; ChatGPT: no native, developer mode “unverified… modify or erase,” orange chat — **his live OAuth was broken**; workaround = old MCP-server trigger, **no auth**, paste workflows; Lovable: paste server URL, one-shot form for “AI opportunity map,” landscaping report **~$20k/mo / ~$250k yr** (UNVERIFIED); use MCP only in interfaces you already live in; Vapi aside (he used old trigger); keep tools **1–3 nodes**; Plus. Caption-only. Timestamp UNKNOWN.

## B. Atomic Knowledge
### Instance execute + always-allow is a send blast radius
- **Claim:** A client that can search the instance and execute opted-in workflows will send mail and close tasks if you click Always allow; the only fence he names is the per-workflow toggle + a description.
- **Reasoning:** Native Gmail connectors “only search”; instance MCP is how he **sends**.
- **Mechanism:** Enable MCP → OAuth → Always allow → execute.
- **Evidence:** “use nodn to send that email… Always allow… the email has been sent.”
- **Conditions:** Opted-in, active workflows.
- **Exceptions:** A search-only connector is a different (still vendor) machine.
- **Action:** Steal blast-radius + never-always-allow. Do not enable instance MCP. Do not send.
- **Confidence:** high as the demo; ROI $ UNVERIFIED.
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** ChatGPT OAuth live-fail
- **Speech ≠ behavior:** “you are in full control” vs Always allow

## C. Mental Models
MCP = the agent can see the factory. Live in Claude → plug the factory in. Simple beats clever. Priority: convenience. We care about the send. Uncertainty: ChatGPT native coming.

## D. Procedures
1. If a client can **execute** instance workflows → treat as send/pay capable.
2. Never Always allow.
3. Per-workflow opt-in is the minimum fence (his) — still not enough for us.
4. Description = the schema the model will fill (including to:).
Avoid: instance MCP; Lovable front-end for a send workflow; no-auth workaround; Vapi; Plus.

## E. Examples
**Dunder Mifflin send:** Situation → drafted email. Action → “use n8n to send,” Always allow ×3. Reasoning → skip copy-paste. Outcome → sent. Lesson → the click is the hard step; we never.

**ChatGPT broken:** Situation → live connect. Action → OAuth fails; he pastes a **no-auth** MCP trigger. Reasoning → keep the tape moving. Outcome → actions appear. Lesson → workaround **removes** the fence.

## F. Decision Rules
- IF the tool is `execute workflow` → assume send.
- IF the UI offers Always allow → deny.
- IF the workaround is no-auth → never.
- IF Lovable “oneshots a landing page” that emails a roadmap → publish/send risk.

## G. Contrarian
He celebrates instance-wide execute. Field: more MCP. We store the same never as `9IzGe0BBj_c` / `mPflFTQUCGk`.

## H. Assumptions
Theirs: opt-in + description = control. Ours: Always allow voided it. Falsifier: execute with a human confirm that cannot be “always.” Survivorship: one demo send.

## I. Questions
Same workflows as the short MCP tapes? Did he revoke Always allow?

## J. Connections
- SYSTEM SYNTHESIS → `9IzGe0BBj_c` · `mPflFTQUCGk` · `send-removed` · `-Lo_SlSgtnA`.

## K. Future-Use
Instance-execute = blast radius. Description is a schema. Unassigned Lovable pattern.

## Steal / Operate-never

### Machine: instance-execute = send surface; never Always allow; no-auth workaround is worse
- **Epistemic:** SOURCE
- **Workflow / loop:** if a client can search+execute the instance → deny → if it asks Always allow → deny → if someone pastes a no-auth server → deny
- **Questions / signals:** Execute tool? Always allow? Opt-in list include Gmail?
- **Qualify / frame / objections:** “You’re in full control” is the fail. The sent inbox is the tell.
- **Procedure:** No instance MCP. No Lovable. No Vapi. No Plus.
- **Example that proves it:** Situation → Michael PTO. Action → Always allow send. Reasoning → busy day. Outcome → mail left. Lesson → steal the never.
- **Why it works:** Execute + always is how a draft becomes a send without a headed block.
- **Conditions / exceptions:** $20k/$250k UNVERIFIED.
- **Operate-never payload:** Instance MCP; Always allow; Gmail send; Lovable; Vapi; Plus.
- **Hive run (existing skills only):** `send-removed` · `ask-principal`.
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN

### Operate-never
- Enable instance MCP / Always allow / no-auth MCP.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as instance-execute-never. Clients parked.
