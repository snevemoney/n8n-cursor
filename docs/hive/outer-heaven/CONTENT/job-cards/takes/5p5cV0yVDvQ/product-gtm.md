# Product GTM — 5p5cV0yVDvQ
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/5p5cV0yVDvQ/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk. Title: “Unlock the Full Power of Your n8n Agents (new instance MCP).” Beats: (1) old MCP = you pick workflows; **instance MCP** (n8n ≥1.21.2) lets Claude/Cursor/Lovable **search the whole instance**, read schemas, **execute** any opted-in workflow; he frames MCP as “just an agent that can see your workflows”; (2) Settings → MCP access → OAuth or token; Claude native connector; tools: execute / get details / search; demo: “use n8n to send that email to michael@dundermifflin.com” → **always allow** → sent; ClickUp: complete “email Michael about PTO,” then list due-today (only “Record n8n MCP video”); (3) **must be published** + toggle **Available in MCP**; description is how the client knows fields; webhook/schedule/chat/form can be MCP; he says the toggle is good because otherwise keys leak; (4) ChatGPT: no native yet, developer-mode unverified connector (orange, “can modify or erase data”); his live ChatGPT OAuth **failed**; workaround = old MCP-server trigger, no auth; then Lovable frontend on an “AI opportunity map” workflow. Timestamp UNKNOWN.

## B. Atomic Knowledge
### Instance-wide execute is a send button, not a feature
- **Claim:** Search-then-execute across a live automation instance is a hard step. “Always allow” is the product risk.
- **Reasoning:** Native Gmail in Claude only *reads*. His win is *send*. That is why he built it — and why we do not.
- **Mechanism:** Opt-in + description + published. Fail-open = every workflow is a tool.
- **Evidence:** Live send to Dunder Mifflin; ClickUp complete; ChatGPT connector broken on tape.
- **Conditions:** On-tape n8n cloud. Hive does not add n8n-cloud.
- **Exceptions:** ChatGPT path failed live — do not treat as working.
- **Action:** Steal “opt-in + description or it is a leak.” Do not productize instance MCP.
- **Confidence:** high as demo.
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Discovery vs execute. Always-allow. Description = contract. Opt-in or leak. Chat client ≠ send.

## D. Procedures
If a client can execute workflows: list which are opted in; never always-allow send. Hard steps HITL.

## E. Examples
**Situation:** Email drafted in Claude. **Action:** “Use n8n to send.” **Outcome:** Sent. **Lesson:** The steal is the danger.

## F. Decision Rules
- If it can send/pay/book from a chat → HITL, no always-allow.
- If ChatGPT OAuth is broken on tape → do not sell it.
- Refuse: n8n instance MCP SKU; Lovable app-from-workflow; Dunder Mifflin as proof.

## G. Contrarian
Against “MCP = just an agent.” MCP here is a remote execute surface.

## H. Assumptions
Theirs: n8n instance full of workflows. Ours: Cursor + Grok; no n8n. Falsifier: Evens names Path A (still no auto-send).

## I. Questions
What the Lovable app actually shipped. Sibling `oWdJMJp2HgM` rails.

## J. Connections
**SYSTEM SYNTHESIS:** Always-allow vs draft-queue `ECfusvK5tEU`. Maps to `ask-principal`.

## K. Future-Use
Unassigned: “opt-in + description; never always-allow send.” Keep.

## Steal / Operate-never

### Machine: opt-in execute — never always-allow a send
- **Epistemic:** SOURCE
- **Workflow / loop:** chat → search workflows → get schema → execute only if opted-in and HITL
- **Questions / signals:** Can this send? Is always-allow on?
- **Qualify / frame / objections:** “Unlock the full power” is the magnet.
- **Procedure:** No n8n MCP. Send stays HITL.
- **Example that proves it:** Claude sent the email after always-allow.
- **Why it works:** The toggle exists because the default is a leak.
- **Conditions / exceptions:** ChatGPT live fail.
- **Operate-never payload:** n8n instance MCP; Lovable frontend; always-allow
- **Hive run (existing skills only):** `ask-principal`
- **Source:** `5p5cV0yVDvQ` @ UNKNOWN

### Operate-never
- Productize n8n MCP / ChatGPT connector / Lovable map
- Always-allow send
- New hunt; merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Do not anneal instance MCP. Clients parked.
