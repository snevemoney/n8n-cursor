# Day Planner — 9IzGe0BBj_c
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short: n8n instance-level MCP. Beats: old MCP = you expose chosen workflows/tools as a server for Claude/Cursor; new instance-level MCP = client can search the whole instance, read schemas, execute any workflow; he analogizes ChatGPT as the agent that can see every workflow, what to send, when to call; mentions Claude, Cursor, Lovable, ChatGPT as clients. CTA to full (`5p5cV0yVDvQ` / `mPflFTQUCGk`). Timestamp UNKNOWN. On-tape vendors stay on-tape.

## B. Atomic Knowledge
### From assigned tools to whole-instance execute
- **Claim:** Instance-level MCP is not limited to workflows you assign — a client can search the instance, understand schemas, and execute any of them.
- **Reasoning:** You already have “tons of workflows” you wish Claude/Lovable could just use.
- **Mechanism:** MCP client → list/understand/execute any workflow.
- **Evidence:** “execute any of them.”
- **Conditions:** An n8n instance with many workflows.
- **Exceptions:** Assigned-only MCP is the older, narrower machine.
- **Action:** Learn the widen. Do not flip whole-instance execute on a live box from this desk.
- **Confidence:** high as his claim; risk high.
- **Source:** `9IzGe0BBj_c` @ UNKNOWN
- **Epistemic:** SOURCE

### “It’s just an AI agent” is his teaching analogy
- **Claim:** Easiest mental model: the chat client is the agent; instance workflows are the tools with schemas.
- **Reasoning:** People already know tool-calling.
- **Mechanism:** Request → pick workflow → send the right payload.
- **Evidence:** “picture it as if Chatbt is the agent and it can see all of the different workflows.”
- **Conditions:** Teaching, not a security review.
- **Exceptions:** An agent that can see everything can also fire everything.
- **Action:** Keep the analogy. Add a CUT: any-execute is a conflict flag.
- **Confidence:** high as analogy; we reject it as an operate rule.
- **Source:** `9IzGe0BBj_c` @ UNKNOWN
- **Epistemic:** SOURCE (analogy) + INFERENCE (risk)

## C. Mental Models
More surface = more leverage in his telling. He wants ChatGPT/Claude/Lovable/Cursor to drive n8n. Priority: convenience. He does not spend the short on auth, blast radius, or send nodes hiding in those workflows. That absence is the weekday problem.

## D. Procedures
1. Inventory which workflows a client could execute.
2. Prefer assigned-only MCP (old machine) over any-execute until Evens says.
3. If a workflow can send/pay/publish → it must not be visible to any-execute.
Avoid: connecting ChatGPT/Lovable; flipping instance MCP on prod.

## E. Examples
**Whole instance as toolbelt:** Situation → many n8n workflows. Action → instance MCP so a chat client can search and run any. Reasoning → “just an agent.” Outcome → he says now you can. Lesson → steal the inventory question; never the any-execute flip.

## F. Decision Rules
- If the client can execute any workflow → CUT until blast radius is named.
- If a visible workflow sends/pays → do not expose it.
- If the client is ChatGPT/Lovable/Claude → on-tape; stack stays Cursor + Grok.

## G. Contrarian
Rejects “MCP only for the tools you wired.” He celebrates the widen. We store the rejection of the operate: hive will not any-execute a live instance.

## H. Assumptions
Theirs: you want every workflow callable. Ours: that is a send/pay footgun. Falsifier: one forgotten “send campaign” workflow. Survivorship: no incident on tape.

## I. Questions
Auth model? Per-workflow deny? Full tape `5p5cV0yVDvQ`? How does this interact with guardrails (`NQhsLVmuItA`)?

## J. Connections
- SYSTEM SYNTHESIS → `5p5cV0yVDvQ` · `mPflFTQUCGk` · `send-removed` · `ask-principal`.
- SYSTEM SYNTHESIS → stack rule: Cursor may talk to tools; we do not install ChatGPT/Lovable.

## K. Future-Use
Assigned-only MCP as the safe subset. Unassigned: instance-level on a sandbox with no send nodes.

## Steal / Operate-never

### Machine: inventory blast radius before any-execute
- **Epistemic:** INFERENCE informed by SOURCE (he shows any-execute)
- **Workflow / loop:** list workflows a client could run → mark send/pay/publish → deny those → only then consider a narrow MCP
- **Questions / signals:** Can it execute any? Which workflows send?
- **Qualify / frame / objections:** “It’s just an agent” is the sales analogy, not a go. Any-execute on prod is the fail.
- **Procedure:** Inventory. Do not flip. Do not connect ChatGPT/Lovable.
- **Example that proves it:** Situation → tons of workflows. Action → instance MCP. Reasoning → convenience. Outcome → any can run. Lesson → inventory first; do not operate the widen.
- **Why it works (as a warning):** The same convenience is how a send node fires from chat.
- **Conditions / exceptions:** Assigned-only MCP is the older, narrower steal. Sandbox with no send nodes is the only maybe.
- **Operate-never payload:** Instance-level any-execute on a box that can send/pay; ChatGPT/Lovable/Claude as stack; n8n-cloud.
- **Hive run (existing skills only):** `send-removed` · `ask-principal`.
- **Source:** `9IzGe0BBj_c` @ UNKNOWN

### Operate-never
- Flip instance MCP on a live/send-capable box.
- Install ChatGPT / Claude / Lovable / switch stack.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as a blast-radius inventory (no flip). Clients parked — I do not put instance-MCP-on on the weekday board.
