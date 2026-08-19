# Researcher — 9IzGe0BBj_c
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Instance-MCP short. Beats: (1) Old MCP: native MCP server triggers — you assign specific tools/workflows; a client (Claude/Cursor on-tape) calls those. (2) New instance-level MCP: client can search the whole n8n instance, read schemas, execute any workflow. (3) Metaphor: your instance’s workflows become tools for ChatGPT-as-agent — it knows what they do, what to send, when to call. (4) Play-button. Timestamp UNKNOWN. Long: `5p5cV0yVDvQ`. Sibling: `mPflFTQUCGk`.

## B. Atomic Knowledge

### Assigned-MCP vs instance-MCP
- **Claim:** Assigned MCP is a allow-list of tools/workflows; instance MCP lets the client see and run the whole instance.
- **Reasoning:** People already have many workflows they wish Claude/Lovable could just use.
- **Mechanism:** Search instance → understand schemas → execute any.
- **Evidence:** Contrast paragraph on tape.
- **Conditions:** An n8n instance with many workflows; an MCP client.
- **Exceptions:** “Any of them” is the danger — no allow-list.
- **Action:** Learn the distinction; operate-never wide-open instance exec.
- **Confidence:** high as his description.
- **Source:** `9IzGe0BBj_c` @ UNKNOWN
- **Epistemic:** SOURCE

### Instance as an agent’s toolbelt
- **Claim:** Easiest mental model: ChatGPT is the agent; each workflow is a tool with a schema.
- **Reasoning:** Same as an n8n agent picking tools.
- **Mechanism:** Request → pick workflow → send required fields → execute.
- **Evidence:** “picture it as if Chatbt is the agent and it can see all of the different workflows.”
- **Conditions:** Schemas are good enough for the client to fill.
- **Exceptions:** Bad names/schemas → wrong workflow called (INFERENCE).
- **Action:** If we ever expose tools, name schemas as if a stranger will call them.
- **Confidence:** high as metaphor.
- **Source:** `9IzGe0BBj_c` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
MCP progressed from “publish selected tools” to “publish the building.” He likes the convenience; he does not, in this clip, discuss blast radius. Clients named: ChatGPT, Claude, Lovable, Cursor — on-tape only. Hive stack stays Cursor + Grok, and we do not turn Grok loose on “execute any workflow.”

## D. Procedures
1. Know which MCP you turned on (assigned vs instance).
2. If assigned: list the tools/workflows you mean.
3. If instance: assume the client can search and run everything.
4. Hive: do not enable instance-wide exec.

## E. Examples
- **Situation:** Lots of workflows you’d “throw into Lovable or Claude.” **Action:** Instance MCP so they can use them whenever. **Reasoning:** Convenience. **Outcome:** Claimed: client sees, understands, executes any. **Lesson:** The machine is discovery+exec across the whole instance. Implicit rule: convenience trades away the allow-list.

## F. Decision Rules
- If you need a stranger model to call one job → assigned MCP / named tool.
- If instance MCP is on → treat every workflow as publicly callable by that client.
- Refuse: “execute any” as a hive default.

## G. Contrarian
Old MCP (assign tools) is the conservative design; the “gamechanger” is the less conservative one.

## H. Assumptions
Schemas are accurate. “Execute any” is desirable. Auth of the MCP client is not discussed.
**Desk dissent:** Researcher marks instance-wide exec as operate-never even though the speaker celebrates it. Do not flatten that dissent.

## I. Questions
- Authn/authz? Can it activate workflows? Undo?
- What is hidden (credentials, prod vs draft)?

## J. Connections
- **SYSTEM SYNTHESIS:** `5p5cV0yVDvQ`, `mPflFTQUCGk`. `send-removed`. Cursor-as-client is on-tape, not a reason to open our instance.

## K. Future-Use
“Named schema as if a stranger will call it” even for assigned tools.

## Steal / Operate-never

### Machine: assigned-tools-not-whole-instance
- **Epistemic:** SOURCE (the distinction) + INFERENCE (prefer assigned)
- **Workflow / loop:** list the jobs a client may call → expose those schemas only → refuse instance-wide exec
- **Questions / signals:** Assigned or instance? Can it run everything?
- **Qualify / frame / objections:** “Gamechanger / use any workflow” → blast radius.
- **Procedure:** D.
- **Example that proves it:** He contrasts assigned triggers vs search-and-run-any.
- **Why it works:** Allow-list is a checkable stop; “any” is not.
- **Conditions / exceptions:** Speaker likes instance MCP; hive does not operate it.
- **Operate-never payload:** Instance-level MCP on hive n8n; ChatGPT/Claude/Lovable as operators; new ICP.
- **Hive run:** `send-removed` · `ask-principal`
- **Source:** `9IzGe0BBj_c` @ UNKNOWN

**Operate-never**
- Instance-wide execute. On-tape vendors as hive brains. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Keep the dissent: we learn instance MCP; we do not turn it on. Do not write a new skill.
