# Librarian — 5p5cV0yVDvQ
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Unlock the Full Power of Your n8n Agents (new instance MCP)
**Channel:** Nate Herk | AI Automation
**Kind:** video (~3426 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Instance MCP vs assigned-server MCP: clients can **search / get details / execute** workflows across the instance, not only the ones you wired as tools. Metaphor: ChatGPT/Claude is the agent; workflows are tools. Needs n8n ≥1.21.2. Settings → MCP access → enable; OAuth or access token; server URL.
2. Claude (web, not desktop): native n8n connector → OAuth; first time paste server URL. Tools: execute / get details / search. Demo: write email then “use n8n to send to michael@dundermifflin.com” → search → **always allow** → details → always allow → sent (Gmail confirmation). ClickUp: “move email Michael about PTO to complete” → found task manager → complete. Then “what else due today?” → “Record n8n MCP video.” Execution: webhook body is the ask; agent uses get/update/create. To update it must **get ID first**.
3. Two gates: workflow **active/published** + settings toggle **Available in MCP**. Manual toggle is the safety (keys/data you do not want every client to see). Description is what the client reads — edit workflow description. Triggers that work: webhook, schedule, chat, form.
4. ChatGPT: no native n8n; Apps & connectors → developer mode (unverified connectors can modify/erase; memory off; orange chrome). Create + server URL + OAuth — **broken on tape** (he deleted connections to demo live; others’ tutorials also failing; “ChatGPT backend”). Workaround: old **MCP server trigger** with only the workflows you want, no auth — he got actions that way.
5. Lovable: native n8n; paste URL; SSO. Prompt: minimal gamified form for the AI opportunity-map workflow (business blurb → automated roadmap). On-tape Lovable — not hive.
Gap: Lovable UI finish, remaining connector list. Timestamp UNKNOWN. n8n/Claude/ChatGPT/Lovable/ClickUp on-tape.

## B. Atomic Knowledge

### Instance search+execute is a door; toggle + description + never always-allow
- **Claim:** Instance MCP lets a chat client find and fire any **opted-in** active workflow. Description is the schema. Always-allow is a standing door. ChatGPT native path failed on tape; assigned-server is the fallback. Update needs get-ID first.
- **Reasoning:** Assigned-server was one-by-one tools; instance is search-the-shop. Manual MCP toggle exists because keys live in the instance.
- **Mechanism:** Enable MCP → OAuth client → search/details/execute → pass/fail is the client’s allow prompt.
- **Evidence:** Sent mail; ClickUp moved; ChatGPT OAuth fail; Lovable SSO.
- **Conditions:** ≥1.21.2; published + available-in-MCP; webhook/schedule/chat/form.
- **Exceptions:** ChatGPT native broken at filming.
- **Action:** Steal opt-in + description-as-schema + get-before-update. Always-allow and auto-send = operate-never. n8n-cloud / Lovable not hive.
- **Confidence:** high as a door map
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** ChatGPT OAuth live-fail
- **Speech ≠ behavior:** “AI agent” metaphor vs technical MCP

## C. Mental Models
Instance = the agent can see the shop. Toggle is the lock. Description is the label on the jar. Developer mode is orange for a reason.

## D. Procedures
1. Update n8n; enable MCP; copy server URL.
2. Per workflow: publish + Available in MCP + write a description.
3. Connect via OAuth; allow **once per tool**, not always, if you keep HITL.
4. If ChatGPT native fails → assigned-server with only the workflows you mean.
5. Get before update when the tool needs an ID.
Avoid: always-allow; exposing key-bearing workflows; Lovable as hive; auto-send.

## E. Examples
**Send Michael:** Situation — drafted mail in Claude. Action — search/execute send workflow; always-allow. Outcome — mail in inbox. Lesson — the door worked; always-allow is the payload.

**ChatGPT live:** Situation — developer-mode OAuth. Action — create connector. Outcome — broken. Lesson — keep the assigned-server fallback.

## F. Decision Rules
- IF a workflow has secrets → do not toggle Available in MCP.
- IF the client asks to send → HITL, not always-allow.
- IF native ChatGPT dies → assigned-server, fewer tools.
- Refuse: n8n-cloud; Lovable; auto-send; Dunder Mifflin as a client.

## G. Contrarian
Against “MCP = assign every workflow.” Against treating the metaphor as the spec.

## H. Assumptions
Complements `9IzGe0BBj_c` / `mPflFTQUCGk` (this is the long how-to). Caption-only.

## I. Questions
Did ChatGPT native return? What did the Lovable form actually post?

## J. Connections
SYSTEM SYNTHESIS → `9IzGe0BBj_c`; `mPflFTQUCGk`; hive HITL.

## K. Future-Use
Opt-in toggle + description-as-schema + get-before-update + always-allow door as atoms.

## Steal / Operate-never

### Machine: opt-in instance MCP; describe; get-then-update; never always-allow send
- **Epistemic:** SOURCE
- **Workflow / loop:** enable MCP → mark only safe published workflows + descriptions → OAuth client → search/details/execute → checkable stop = the named workflow ran and send still needed a human if it leaves the box
- **Questions / signals:** Available in MCP? Description good? Does update need an ID?
- **Qualify / frame / objections:** “It’s just an AI agent” is a metaphor.
- **Procedure:** D above.
- **Example that proves it:** Mail send; ClickUp complete; ChatGPT fail.
- **Why it works:** Search needs labels; the toggle is the lock.
- **Conditions / exceptions:** ChatGPT native broken; assigned-server fallback.
- **Operate-never payload:** Always-allow send; n8n-cloud; Lovable; expose secret workflows.
- **Hive run:** `ask-principal` on send. Cursor + Grok.
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN

### Operate-never
- Auto-send. Always-allow. n8n-cloud. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File always-allow as a Librarian door. Do not flatten with assigned-server MCP.
