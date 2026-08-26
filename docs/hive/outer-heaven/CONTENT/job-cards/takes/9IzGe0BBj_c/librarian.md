# Librarian — 9IzGe0BBj_c
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9IzGe0BBj_c/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** n8n's New Instance Level MCP: What It Is and How It Works
**Channel:** Nate Herk | AI Automation
**Kind:** short (~1:27 / ~361 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Instance-level MCP is a "gamechanger"; how it works; connect to ChatGPT, Claude, or Lovable (on-tape).
2. Earlier: native MCP server triggers — build MCP servers in n8n hooked to assigned tools/workflows; MCP clients (Claude/Cursor) talk to those servers.
3. Instance-level MCP is not limited to assigned workflows/tools — clients can search the entire n8n instance, understand schemas, execute any workflow.
4. Implication: throw existing workflows into Lovable or Claude and have them used on demand.
5. Metaphor: it's "just an AI agent" — not the technical definition, the way he thinks about it.
6. Picture: ChatGPT as the agent that can see all workflows, knows what they do, what to send, when to call each.
7. CTA: full breakdown.
Gap: auth, blast radius, which version. Timestamp UNKNOWN. ChatGPT/Claude/Lovable/Cursor/n8n on-tape.

## B. Atomic Knowledge

### Assigned-server MCP vs whole-instance MCP
- **Claim:** Old MCP servers exposed assigned tools/workflows; instance-level MCP lets a client search and execute any workflow in the instance.
- **Reasoning:** The jump is from a curated tool list to the whole instance as a tool catalog.
- **Mechanism:** Client searches instance → reads schemas → executes workflows.
- **Evidence:** "it's actually letting our MCP clients search through our entire NAND instance and look at the workflows, understand the schemas, what they do, and actually execute any of them."
- **Conditions:** Instance-level MCP enabled
- **Exceptions:** None on tape (no auth discussion)
- **Action:** File the jump; operate-never whole-instance execute from an outside client
- **Confidence:** high as his description
- **Source:** `9IzGe0BBj_c` @ UNKNOWN
- **Epistemic:** SOURCE

### "It's just an AI agent" metaphor
- **Claim:** Easiest mental model: ChatGPT is the agent; workflows are the tools with schemas and call timing.
- **Reasoning:** He flags it is not the technical definition.
- **Evidence:** "it's just an AI agent. That's not like the technical definition, but it's the way I like to think about it."
- **Conditions:** Teaching
- **Exceptions:** He distinguishes metaphor vs spec
- **Action:** Persist the metaphor as teaching, not as architecture FACT
- **Confidence:** high as words
- **Source:** `9IzGe0BBj_c` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Whole instance as a catalog is the unlock. Clients (ChatGPT/Claude/Lovable/Cursor) become the agent. Assigned MCP was a whitelist; instance MCP is a search+execute surface.

## D. Procedures
On-tape: enable instance MCP → connect a client → client searches workflows → reads schema → executes. Avoid: hive connecting ChatGPT/Lovable to a live instance. Signals: "execute any of them."

## E. Examples
**Instance as tool belt:** Situation — many existing n8n workflows. Action — instance MCP so Claude/Lovable can use them. Reasoning — not limited to assigned tools. Outcome — claimed on-demand use. Lesson — steal the catalog idea; do not operate whole-instance execute.

## F. Decision Rules
- If a client can execute any workflow → treat as a public door (code-gate thinking from 18-corpus Jarvis).
- If you only need assigned tools → old MCP server is the smaller surface.
- Refuse: ChatGPT/Lovable as hive clients; n8n-cloud.

## G. Contrarian
Against "MCP is only the servers you built." Instance-level searches everything.

## H. Assumptions
Theirs: you want Claude/Lovable to run any workflow (no threat model). Ours: 18-corpus `whIp1SOahOM` code-gate applies. Falsifier: a tape that adds auth/allowlists — keep if it appears (`5p5cV0yVDvQ`, `mPflFTQUCGk`).

## I. Questions
Auth? Allowlist? Does the long instance-MCP tape add a gate?

## J. Connections
SYSTEM SYNTHESIS → `5p5cV0yVDvQ` / `mPflFTQUCGk` (instance MCP long/short); `whIp1SOahOM` (code gate); Cursor already attaches tools — do not buy n8n instance MCP to hide the list.

## K. Future-Use
Whole-instance execute as an operate-never pattern to file on any "connect your OS to ChatGPT" tape. Unassigned: hive MCP stays Cursor+Grok, not n8n instance.

## Steal / Operate-never

### Machine: curated catalog vs whole-instance execute (file the jump)
- **Epistemic:** SOURCE
- **Workflow / loop:** list what a client can see → if "any workflow" → treat as a public door → checkable stop = allowlist exists or do not connect
- **Questions / signals:** Assigned tools only, or search+execute all?
- **Qualify / frame / objections:** "Just an AI agent" is a metaphor
- **Procedure:** do not connect ChatGPT/Lovable to a live hive instance
- **Example that proves it:** old assigned MCP vs instance search+execute any
- **Why it works:** blast radius is the object to file
- **Conditions / exceptions:** n8n on-tape; no auth on this short
- **Operate-never payload:** instance MCP on hive; ChatGPT/Lovable/Claude as clients; n8n-cloud
- **Hive run:** `ask-principal` · 18-corpus code-gate pattern
- **Source:** `9IzGe0BBj_c` @ UNKNOWN

### Operate-never
- Instance-level MCP on hive. ChatGPT / Lovable / Claude as instance clients. n8n-cloud.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File the whitelist-vs-whole-instance jump. Do not stand up n8n as the hive tool catalog — Outer Heaven + Cursor tools already exist. Persist "not the technical definition" so the metaphor does not become architecture.
