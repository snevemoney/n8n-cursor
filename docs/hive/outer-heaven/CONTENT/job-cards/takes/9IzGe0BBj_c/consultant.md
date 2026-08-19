# Consultant — 9IzGe0BBj_c
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Instance-level MCP teaser. Beats: old way = native MCP server triggers for assigned workflows/tools that Claude/Cursor can call. New = instance-level MCP lets clients search the whole n8n instance, read schemas, execute any workflow. Metaphor: ChatGPT/Claude as the agent; every workflow is a tool it can see, understand, and call with the right payload. CTA to the long. No VTT. UNKNOWN. ~361 words.

## B. Atomic Knowledge

### From assigned tools to searchable instance
- **Claim:** Instance-level MCP is not limited to workflows you assigned; the client can search the instance, understand schemas, and execute any of them.
- **Reasoning:** The jump is discoverability + blanket execute, not a new node type.
- **Mechanism:** Enable instance MCP → client searches workflows → reads what they do / what to send → executes.
- **Evidence:** “it's actually letting our MCP clients search through our entire NAND instance… and actually execute any of them.”
- **Conditions:** You already have many workflows. Client is Claude/ChatGPT/Lovable/Cursor on tape.
- **Exceptions:** “Any of them” includes dangerous ones (send, delete, pay).
- **Action:** Learn the discoverability machine. Do not enable blanket execute on a live inbox.
- **Confidence:** high as a description; high risk if operated
- **Source:** `9IzGe0BBj_c` @ UNKNOWN — “execute any of them”
- **Epistemic:** SOURCE
### Chat client as the agent, workflows as tools
- **Claim:** He wants you to picture ChatGPT as the agent that sees all workflows, knows what they do, what to send, and when to call each.
- **Reasoning:** The orchestration brain moves to the chat product; n8n becomes a tool farm.
- **Mechanism:** Request in chat → pick workflow → fill schema → run.
- **Evidence:** “picture it as if Chatbt is the agent and it can see all of the different workflows in your instance.”
- **Conditions:** Mental model, not a measured win.
- **Exceptions:** Chat vendors on-tape are not our stack. Cursor is named as an MCP client — our stack may listen; we still do not enable send.
- **Action:** Keep a human on execute for anything that leaves the building.
- **Confidence:** high as his metaphor
- **Source:** `9IzGe0BBj_c` @ UNKNOWN — “Chatbt is the agent”
- **Epistemic:** SOURCE


## C. Mental Models

He is enthusiastic (“gamechanger”). He thinks the pain is “I wish Claude/Lovable could just use my existing workflows.” He collapses MCP to “it’s just an AI agent” while admitting that is not the technical definition. He is selling the long (`5p5cV0yVDvQ` / `mPflFTQUCGk`).

## D. Procedures

1. Understand old: you assign tools. 2. Understand new: client can search + run all. 3. Decide which workflows are even allowed to exist as executable. Avoid: always-allow send (`mPflFTQUCGk` shows that smash).

## E. Examples

**Situation:** Instance full of workflows you’d like a chat client to use. **Action:** Instance MCP so the client can search schemas and execute. **Outcome:** Promised on the teaser; demo is on the long. **Lesson:** Discoverability is the steal; blanket execute is the payload. Implicit rule: he says “any of them” out loud — that is the risk.

## F. Decision Rules

If a workflow can send, pay, or delete, it must not be visible to an always-allow client. If you only needed two tools, assigned MCP may be enough. If the chat vendor is not Cursor+Grok, do not install it.

## G. Contrarian

Field default: wrap each workflow in a custom MCP server. He says the instance is now the server. Field default: keep execute narrow. He advertises wide.

## H. Assumptions

“Any workflow” is the operate-never payload. Vendors: ChatGPT, Claude, Lovable, Cursor. Schema understanding is asserted. Teaser has no demo of a run.

## I. Questions

Which workflows should be invisible? Who authorizes execute? What does “understand the schemas” fail on?

## J. Connections

**SYSTEM SYNTHESIS:** Longs `5p5cV0yVDvQ` / `mPflFTQUCGk`. Maps to `agent-as-hire` (tools with schemas) + `ask-principal` / `input-required-gate` on execute. Opposite of `send-removed` if someone always-allows mail.

## K. Future-Use

Unassigned: an allowlist of executable workflows as a consultant artifact; instance-MCP as a future-use, not this week’s install.

## Steal / Operate-never

### Machine: Searchable tool farm with a human execute gate
- **Epistemic:** INFERENCE
- **Workflow / loop:** Inventory workflows → mark which may be called → client may search schemas → execute only the allowlisted / HITL ones → stop on send/pay/delete
- **Questions / signals:** Which workflows exist? Which are lethal? Did the client ask to send?
- **Qualify / frame / objections:** Qualify: they already have workflows worth calling. Frame: chat as router, n8n as tools. Objection: “just let it run anything” — that is his ad, our never.
- **Procedure:** Steal search-the-schemas. Do not steal blanket execute.
- **Example that proves it:** Teaser promises Claude/Lovable can use any instance workflow.
- **Why it works:** Discoverability removes “I forgot we had that workflow.” Blanket execute removes the hard step.
- **Conditions / exceptions:** Teaser only. Vendors on-tape. “Any” includes send.
- **Operate-never payload:** Enable instance MCP with execute-any on a live instance. Always-allow send. Install Claude/ChatGPT/Lovable.
- **Hive run (existing skills only):** `agent-as-hire` · `input-required-gate` · `send-removed` · `ask-principal`
- **Source:** `9IzGe0BBj_c` @ UNKNOWN


### Operate-never
- Enable execute-any on a live instance.
- Always-allow send/pay/delete via MCP.
- Install Claude / ChatGPT / Lovable as the brain.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “connect my instance to Claude.” Felt problem is not MCP. Do not open a parked client’s workflows to a chat vendor.

**Four-blank after constraint:** If Evens ever wants a tool farm, toddler stop = allowlist + HITL on anything that leaves the building.

**Skeptical-customer:** “Execute any of them” is the smash. Clients parked.
