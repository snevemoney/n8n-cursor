# Career Strategist — 9IzGe0BBj_c
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (1:27, 361 words). Beats: (1) instance-level MCP is a game changer; how to connect ChatGPT / Claude / Lovable (2) old MCP: native MCP server triggers — you assign specific tools/workflows; a client (Claude or Cursor) talks to those servers (3) instance-level: client can search the *entire* n8n instance, read schemas, execute any workflow (4) metaphor: it is “just an AI agent” — ChatGPT as the agent that can see every workflow, knows what to send, knows when to call each (5) CTA to full. Cursor is named on tape as an MCP client — hive already is Cursor; we do not add ChatGPT/Lovable.

## B. Atomic Knowledge

### From assigned tools to searchable instance
- **Claim:** Old MCP exposed the workflows you assigned. Instance MCP lets the client search, understand, and execute any workflow in the instance.
- **Reasoning:** You already have “tons of workflows” you wish Claude/Lovable could just use.
- **Mechanism:** search instance → read schema → execute.
- **Evidence:** “letting our MCP clients search through our entire NAND instance and look at the workflows, understand the schemas… and actually execute any of them.” @ UNKNOWN
- **Conditions:** Instance MCP enabled; client connected.
- **Exceptions:** Workflows you must not expose (he does not dwell).
- **Action:** Treat instance-wide execute as a privilege explosion.
- **Confidence:** high as his distinction.
- **Source:** `9IzGe0BBj_c` @ UNKNOWN
- **Epistemic:** SOURCE

### Instance as a toolbelt the chat can see
- **Claim:** Easiest mental model: ChatGPT is the agent; each workflow is a tool with a schema.
- **Reasoning:** Same as an n8n agent picking tools from a request.
- **Mechanism:** request → pick workflow → fill fields → call.
- **Evidence:** “picture it as if Chatbt is the agent and it can see all of the different workflows in your instance.” @ UNKNOWN
- **Conditions:** Schemas are understandable.
- **Exceptions:** Ambiguous workflow names (not shown).
- **Action:** Name workflows like tools (one job each) if you ever expose them.
- **Confidence:** high as metaphor.
- **Source:** `9IzGe0BBj_c` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
MCP maturity = from “these few tools” to “the whole shop floor.” Convenience is the pitch; blast radius is the unspoken cost. Cursor is already a client in his list.

## D. Procedures
He points at connecting ChatGPT/Claude/Lovable (full video). On this short: understand old vs instance.  
Avoid (hive): enabling instance-wide execute on anything that can send/pay/book.

## E. Examples
**Situation:** You have many n8n workflows.  
**Action:** Instance MCP so a chat client can find and run them.  
**Reasoning:** Stop re-wiring MCP servers per tool.  
**Outcome:** Claimed; not demoed on this short (see `mPflFTQUCGk`).  
**Lesson:** Search-then-execute is the new loop. Implicit rule: if it can execute *any*, it can execute the send workflow.

## F. Decision Rules
- If a client can execute any workflow, assume it will find the send one.
- If you name Cursor as a client, still do not grant send.
- Optimize for one-job workflows (sister voice tape).

## G. Contrarian
Rejects “MCP is only the servers you hand-build.” Instance-level deletes that limit.

## H. Assumptions
**Theirs:** You want ChatGPT/Lovable on the whole instance. **Ours:** operate-never for send/email workflows; ChatGPT/Lovable not hive stack. Falsifier: a locked-down allowlist he does not mention here.

## I. Questions
- Is there an allowlist, or truly any workflow?
- Who authenticates the client?

## J. Connections
- SYSTEM SYNTHESIS → `mPflFTQUCGk` (he *sends* email via this).
- SYSTEM SYNTHESIS → `5p5cV0yVDvQ` (instance MCP long).
- SYSTEM SYNTHESIS → `send-removed` / HITL.

## K. Future-Use
Unassigned: “search the shop floor” as a desk metaphor — read-only catalog, not execute-any.

## Steal / Operate-never

### Machine: searchable toolbelt with an execute gate
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** catalog workflows (one job each) → client may *search* → execute only if the workflow is draft-safe → send/pay/book stay blocked
- **Questions / signals:** Can this workflow send? If yes, it is not MCP-executable.
- **Qualify / frame / objections:** “Just an agent over the instance” is the send trap wearing a metaphor.
- **Procedure:** Named desks, one tool each. No instance-wide send.
- **Example that proves it:** Any-workflow execute claim (E); sister short actually sends.
- **Why it works:** Schema-aware search removes the “I forgot to wire that tool” tax — and the safety tax (B/C).
- **Conditions / exceptions:** Enablement is a privilege. Ugly if a send workflow exists.
- **Operate-never payload:** ChatGPT/Lovable as hive; auto-execute send; quit-job.
- **Hive run:** `send-removed` · `ask-principal` · `agent-as-hire` (gated tools)
- **Source:** `9IzGe0BBj_c` @ UNKNOWN

### Operate-never
- Instance-wide execute on send/pay/book workflows.
- Install ChatGPT / Lovable as stack. Cursor + Grok only (Cursor as *our* client, not his send demo).
- Employment send, quit-job, unpark clients.
- Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: a recruiter/agent who can “see every workflow” is an intern with the keys — do not grant send. Vault can be searchable; applications stay HITL. Clients parked.
