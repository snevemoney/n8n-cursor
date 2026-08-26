# Product GTM — 9IzGe0BBj_c
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (title: “n8n's New Instance Level MCP” 1:27). Beats: (1) instance MCP is a “gamechanger”; how to use; connect to ChatGPT / Claude / Lovable (on-tape); (2) history: native MCP server triggers = you assign specific workflows/tools, then a client (Claude or Cursor) talks to those servers; (3) instance-level MCP is not limited to assigned tools — clients can search the whole instance, read schemas, execute any workflow; (4) metaphor: it is “just an AI agent” — ChatGPT as the agent that sees every workflow, knows what to send, knows when to call each; (5) play-button full breakdown. Timestamp UNKNOWN. Long: `5p5cV0yVDvQ` / `mPflFTQUCGk`.

## B. Atomic Knowledge
### Instance MCP = search-and-run the whole canvas
- **Claim:** Unlike per-workflow MCP servers, instance MCP lets a client search all workflows, understand schemas, and execute any of them.
- **Reasoning:** People already have “tons of workflows” they wish Claude/Lovable could just use.
- **Mechanism:** Client sees the instance the way an agent sees tools.
- **Evidence:** Contrast paragraph + “Chatbt is the agent” picture.
- **Conditions:** A populated n8n instance.
- **Exceptions:** He admits this is not the technical definition of MCP.
- **Action:** Learn the shape (catalog + execute). Do not connect hive to ChatGPT/Lovable.
- **Confidence:** high as his metaphor.
- **Source:** `9IzGe0BBj_c` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
A pile of workflows is useless until something can find and call them. The client-as-agent is the unlock. Cursor is named as an existing MCP client (on-tape history) — hive already sits there; do not add ChatGPT/Lovable.

## D. Procedures
None operational beyond “connect a client to instance MCP.” Avoid executing *any* workflow from a chat without a HITL gate.

## E. Examples
**Situation:** Many workflows sitting unused. **Action:** Instance MCP so a chat client can search/run them. **Reasoning:** Same as an agent picking tools. **Outcome:** Promised, not proven on this short. **Lesson:** Catalog-then-call is the machine; “any of them” is the danger. Implicit rule: unbounded execute is not a GTM feature.

## F. Decision Rules
- If the client can run *any* workflow → that is operate-never without a gate.
- If you only need one tool → old per-workflow MCP is enough (his history).
- Refuse: Lovable/ChatGPT as hive clients.

## G. Contrarian
Against hand-wiring every tool to the client. (Hive disagreement: unbounded execute is the risk, not the prize.)

## H. Assumptions
Theirs: you want Claude/Lovable to run everything. Ours: Cursor + Grok only; execute-any is a Watchdog issue. Falsifier: a client fires the wrong workflow.

## I. Questions
Auth? Which workflows are excluded? Long may say. Not here.

## J. Connections
**SYSTEM SYNTHESIS:** Longs `5p5cV0yVDvQ`, `mPflFTQUCGk`. Maps to hive job cards (named tools, not “any”). Do not install Lovable.

## K. Future-Use
Unassigned: instance catalog as an internal index (Librarian), not a public agent. Keep.

## Steal / Operate-never

### Machine: catalog of named jobs a client can call — with a gate
- **Epistemic:** SOURCE (catalog+execute) + SYSTEM SYNTHESIS (gate required)
- **Workflow / loop:** list workflows with schemas → client searches → proposes a call → human allows or denies → execute
- **Questions / signals:** Which workflows are callable? What must never auto-run?
- **Qualify / frame / objections:** “Execute any” without a deny-list is not safer
- **Procedure:** Named desks / named tools only. Hard steps HITL
- **Example that proves it:** He pictures ChatGPT seeing every workflow like tools on an agent
- **Why it works:** Find-then-call beats a dead pile; unbounded call is why we add a gate
- **Conditions / exceptions:** Demo metaphor. Vendor clients stay off-stack
- **Operate-never payload:** Instance-MCP SKU; ChatGPT/Claude/Lovable clients; auto-execute any workflow
- **Hive run (existing skills only):** `hive-spawn-desks` (named jobs) · `ask-principal`
- **Source:** `9IzGe0BBj_c` @ UNKNOWN

### Operate-never
- Productize n8n instance MCP; connect ChatGPT/Lovable
- Auto-execute instance workflows; switch stack; new hunt
- Merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Do not sell “your instance is an agent.” Talk track stays 17 *named* employees, not “run anything.” Path C proof is a clicked path, not a chat that can fire every workflow. Clients parked.
