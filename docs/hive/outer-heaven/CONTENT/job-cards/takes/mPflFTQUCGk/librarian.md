# Librarian — mPflFTQUCGk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Unlock the Full Power of Your AI Agents with n8n Instance MCP
**Channel:** Nate Herk | AI Automation
**Kind:** short (~1:55 / ~515 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Instance-level MCP: n8n settings → MCP access → enable toggle.
2. Claude: add connectors → n8n native connector → connect/give access. First time: paste server URL into Claude.
3. Pitch: not just write-and-copy an email — "we'll send that off now" if an n8n workflow that sends email is in MCP.
4. Demo: "use n8n to send that email to michael@dundermifflin.com" → searches workflows → found one → asks workflow details → always allow → knows three body fields + webhook → always allow → confirmation sent; he opens the email.
5. Then ClickUp: task "email Michael about PTO" due today urgent → "use n8n to move my task ... to complete" → finds ClickUp task manager → complete; ClickUp shows complete.
6. CTA: full breakdown.
Gap: auth blast radius. Timestamp UNKNOWN. Claude / n8n MCP / Gmail send / ClickUp. Dunder Mifflin joke.

## B. Atomic Knowledge

### Instance MCP = search + execute any exposed workflow
- **Claim:** Claude searches the instance, reads workflow details (fields, webhook), and executes send-email and ClickUp-complete.
- **Reasoning:** Same jump as `9IzGe0BBj_c`; this short shows send.
- **Evidence:** "search through your available workflows" / "email has been sent" / task moved to complete
- **Conditions:** MCP access enabled; connector allowed
- **Exceptions:** First-time URL paste
- **Action:** File search+execute; operate-never send-from-Claude
- **Confidence:** high as demo
- **Source:** `mPflFTQUCGk` @ UNKNOWN
- **Epistemic:** SOURCE

### Always-allow is the door
- **Claim:** He clicks always-allow on search details and on the send.
- **Reasoning:** The keep is that a client can be granted standing execute.
- **Evidence:** "I'm going to always allow this tool as well"
- **Action:** File always-allow as the operate-never
- **Confidence:** high
- **Source:** `mPflFTQUCGk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Stay in Claude; n8n is the hand. Write-then-copy is the old world. Always-allow is convenience and blast radius. Dunder Mifflin is a joke recipient.

## D. Procedures
On-tape: enable MCP → connect Claude → speak send/complete → allow search → allow execute. Hive: do not enable; do not always-allow send. Signals: three body fields; email visible; ClickUp complete.

## E. Examples
**Michael email + PTO task:** Situation — email written in Claude; busy day. Action — send via n8n MCP; complete ClickUp task via n8n. Outcome — email sent; task complete. Lesson — search+execute works; send is never.

## F. Decision Rules
- If MCP can send mail → treat as a public door (code-gate).
- If the human clicks always-allow on send → standing execute.
- Refuse: instance MCP on hive; Claude as sender; n8n-cloud.

## G. Contrarian
Against copy-paste as the last mile (his). We keep HITL send.

## H. Assumptions
Theirs: send-from-chat is the win. Ours: `send-removed`. Same family as `9IzGe0BBj_c` / `5p5cV0yVDvQ`. Do not flatten "native connector" with "first time paste URL."

## I. Questions
Which workflows were exposed? Can it send without always-allow? Long-tape allowlist?

## J. Connections
SYSTEM SYNTHESIS → `9IzGe0BBj_c`; `5p5cV0yVDvQ`; `send-removed`; `whIp1SOahOM` code-gate.

## K. Future-Use
Always-allow-on-send as an operate-never atom.

## Steal / Operate-never

### Machine: instance search+execute is a door; do not always-allow send
- **Epistemic:** SOURCE
- **Workflow / loop:** enable MCP → client searches workflows → reads schema → execute → checkable stop = hive: connector off or allowlist without send
- **Questions / signals:** Always-allow? Does a send workflow exist?
- **Qualify / frame / objections:** "Unlock full power" is the hook
- **Procedure:** settings toggle; Claude native connector; first-time URL
- **Example that proves it:** send to michael@dundermifflin.com + ClickUp complete
- **Why it works:** client can operate the instance — that is the risk
- **Conditions / exceptions:** Claude/n8n on-tape
- **Operate-never payload:** instance MCP on hive; auto-send; always-allow send
- **Hive run:** `send-removed` · `ask-principal`
- **Source:** `mPflFTQUCGk` @ UNKNOWN

### Operate-never
- n8n instance MCP on hive. Claude send. Always-allow execute. n8n-cloud.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File search+execute and always-allow. Do not connect Claude to a live instance. Send stays removed.
