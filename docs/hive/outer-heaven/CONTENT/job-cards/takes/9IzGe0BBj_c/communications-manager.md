# Communications Manager — 9IzGe0BBj_c
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** n8n's New Instance Level MCP: What It Is and How It Works
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** short · 361 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Visual-only UI clicks not fully narrated. Caption ingest; some ASR errors (Naden/Nitn = n8n).

Beats, in order:
- Instance-level MCP is a “game changer”; how to connect ChatGPT / Claude / Lovable (on-tape).
- Prior: native MCP server triggers — you assign specific workflows/tools; a client (Claude or Cursor) talks to those servers.
- Now: client can search the entire n8n instance, understand schemas, execute any workflow — not limited to assigned tools.
- Mental model: it’s “just an AI agent.” ChatGPT as the agent that sees all workflows, knows what they do, what to send, when to call.
- CTA: full breakdown.

## B. Atomic Knowledge

### Instance MCP can execute any workflow
- **Claim:** Instance-level MCP lets a client search the whole n8n instance and execute any workflow, not only pre-assigned tools.
- **Reasoning:** Assigned MCP servers were limited; instance access is the whole box.
- **Mechanism:** Client searches workflows → reads schema → executes.
- **Evidence:** “execute any of them” / “Chatbt is the agent and it can see all of the different workflows.”
- **Conditions:** MCP access enabled. Client connected. Workflows exist.
- **Exceptions:** Execute-any includes send workflows. That is the danger.
- **Action:** Treat instance MCP as a god-key. Do not connect a sender workflow to it.
- **Confidence:** high as his claim; security implications INFERENCE
- **Source:** `9IzGe0BBj_c` @ UNKNOWN
- **Epistemic:** SOURCE

### MCP client as the agent
- **Claim:** He likes to think of instance MCP as an AI agent whose tools are your workflows.
- **Reasoning:** Same pattern: request in → pick tool → send the right payload.
- **Mechanism:** ChatGPT/Claude/Lovable/Cursor as the outer agent.
- **Evidence:** “the easiest way that I like to think about it is it's just an AI agent.” Cursor named as a possible MCP client.
- **Conditions:** A client that can call MCP.
- **Exceptions:** On-tape ChatGPT/Claude/Lovable are not a stack switch. Cursor is already ours — still no send.
- **Action:** Do not let an outer agent fire a send workflow.
- **Confidence:** high
- **Source:** `9IzGe0BBj_c` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Assigned tools vs whole-instance search is a permission jump. **SOURCE**
- “Whenever they want” is the product promise and the operate-never. **INFERENCE**

## D. Procedures
- Enable instance MCP → connect a client → it can list, understand, execute workflows. **SOURCE**
- This desk: if a listed workflow sends mail, it is not callable. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Lots of n8n workflows you’d like Claude/Lovable to use. → **Action:** Instance MCP so the client can search and execute any. → **Reasoning:** Not limited to assigned tools. → **Outcome:** Outer agent as dispatcher. → **Lesson:** God-key. Implicit rule: a send workflow in the instance is now one sentence away.

## F. Decision Rules
- If instance MCP is on → assume any workflow can be fired.
- If a workflow sends → it must not be reachable.
- Refuse: “use n8n to send that email” (`mPflFTQUCGk` demo).
- Optimize for read/classify/draft workflows only.

## G. Contrarian
- Field celebrates execute-any. This desk treats it as a send risk. **SYSTEM SYNTHESIS**

## H. Assumptions
- “Naden/Nident” = n8n. Cursor named as client — still HITL. Falsifier: MCP scoped read-only (not on this short).

## I. Questions
- Can instance MCP be scoped to non-send workflows? See `5p5cV0yVDvQ` / `mPflFTQUCGk`.

## J. Connections
- **SYSTEM SYNTHESIS:** `mPflFTQUCGk` (Claude sends via MCP). `5p5cV0yVDvQ` (full). `send-removed`.

## K. Future-Use
- Instance MCP allowlist: draft/classify only.

## Steal / Operate-never

### Machine: Instance MCP is a god-key — no send workflows reachable
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** MCP client can see workflows → inventory for send/ack → those stay off/unreachable → classify/draft only → **stop**.
- **Questions / signals:** Can it execute send? Is MCP scoped? Who allowed the tool?
- **Qualify / frame / objections:** Qualify: assigned tools vs whole instance. Frame: god-key. Objection: “just let Claude send” → refuse.
- **Procedure:** 1) List callable workflows. 2) Kill send paths. 3) Draft stays in Cursor. 4) Evens sends.
- **Example that proves it:** ChatGPT-as-agent sees all workflows and knows when to call each.
- **Why it works:** Execute-any collapses HITL if a sender exists. The short’s feature is the risk.
- **Conditions / exceptions:** Instance MCP on. Exceptions: no send workflows in the instance.
- **Operate-never payload:** Connect ChatGPT/Claude/Lovable to fire mail. “Whenever they want.”
- **Hive run (existing skills only):** `send-removed` · `warm-draft-hitl`. Stack Cursor + Grok; on-tape clients stay on-tape.
- **Source:** `9IzGe0BBj_c` @ UNKNOWN


### Operate-never (this desk will not operate)
- Let an MCP client execute a send workflow. Install ChatGPT/Claude/Lovable as the dispatcher.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I do not give any client a send workflow. I draft here. Evens sends. Clients parked.
