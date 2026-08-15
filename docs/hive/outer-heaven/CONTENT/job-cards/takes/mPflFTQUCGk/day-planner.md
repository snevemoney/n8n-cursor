# Day Planner — mPflFTQUCGk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short: enable instance MCP and use it from Claude. Beats: n8n settings → MCP access toggle; Claude add connector → n8n native (or paste server URL first time); demo 1: “send that email to michael@dundermifflin.com” — Claude searches workflows, gets details (three body fields + webhook), always-allow, **email sent**, he shows the inbox; demo 2: busy day, ClickUp “email Michael about PTO” urgent due today — “use N to move… to complete” without context-switching; task moves. CTA to full (`5p5cV0yVDvQ`). Timestamp UNKNOWN. Completes `9IzGe0BBj_c`. Vendor: Claude — on-tape.

## B. Atomic Knowledge
### Toggle + connector, then it can find send workflows
- **Claim:** After MCP access is on and Claude is connected, it can search the instance, read a send-email workflow’s fields/webhook, and fire it.
- **Reasoning:** No manual POST config.
- **Mechanism:** Search workflows → get details → always-allow → execute.
- **Evidence:** “confirmation that the email has been sent.”
- **Conditions:** A send workflow is visible to MCP.
- **Exceptions:** If no send workflow exists, this demo dies — that is the safe state.
- **Action:** This tape is the blast-radius proof for `9IzGe0BBj_c`. Do not enable.
- **Confidence:** high he sent.
- **Source:** `mPflFTQUCGk` @ UNKNOWN
- **Epistemic:** SOURCE

### Chat-complete a board task without switching apps
- **Claim:** He marks a ClickUp task complete from Claude via an n8n task-manager workflow so he does not context-switch.
- **Reasoning:** Stay in the chat.
- **Mechanism:** NL → find ClickUp manager → complete.
- **Evidence:** “this task was moved to complete.”
- **Conditions:** A task-manager workflow exists.
- **Exceptions:** Completing without doing the email is a lie — the task was “email Michael.”
- **Action:** Context-switch save is real; auto-complete is a conflict flag if the work was not done.
- **Confidence:** high as the demo; the email-to-Michael may already have been the prior send.
- **Source:** `mPflFTQUCGk` @ UNKNOWN
- **Epistemic:** SOURCE + INFERENCE (order of demos)

## C. Mental Models
Convenience > blast radius. “Always allow” is clicked twice. Priority: show send, then show board. Dunder Mifflin is a joke recipient — still a send. Uncertainty: whether Michael is a real inbox.

## D. Procedures
1. Inventory send-capable workflows (do not enable MCP).
2. If a connector asks always-allow on send → deny.
3. Completing a “send X” task is only honest after Evens sent.
Avoid: Claude connector; instance MCP on; always-allow.

## E. Examples
**Send to michael@dundermifflin.com:** Situation → email already written. Action → “use n8n to send.” Reasoning → skip copy-paste. Outcome → sent. Lesson → this is the footgun `9IzGe0BBj_c` warned in analogy.

**PTO task complete:** Situation → urgent ClickUp row. Action → NL complete via MCP. Reasoning → no context switch. Outcome → done. Lesson → steal “don’t switch apps”; never auto-complete a send task.

## F. Decision Rules
- If MCP can see a send workflow → do not enable.
- If the tool asks always-allow on send → deny.
- If we complete a send-task → only after HITL send.

## G. Contrarian
He rejects copy-paste-the-email as the workflow. We reject his replacement (chat-send). Store both.

## H. Assumptions
Theirs: always-allow is fine. Ours: one forgotten send workflow is enough. Falsifier: wrong Michael. Survivorship: two happy fires.

## I. Questions
Auth scopes? Deny list? Full `5p5cV0yVDvQ`?

## J. Connections
- SYSTEM SYNTHESIS → `9IzGe0BBj_c` (theory) · `5p5cV0yVDvQ` · `send-removed` · `morning-day-plan` (do not complete a send-task from chat).

## K. Future-Use
Always-allow-on-send as a named never. Unassigned sandbox with zero send nodes.

## Steal / Operate-never

### Machine: inventory send nodes; deny always-allow; complete only after HITL
- **Epistemic:** SOURCE (he sent) + INFERENCE (our stop)
- **Workflow / loop:** list MCP-visible workflows → mark send/pay → do not enable → if a send-task exists, Evens sends then we mark complete
- **Questions / signals:** Is MCP on? Did it ask always-allow? Is the task a send?
- **Qualify / frame / objections:** “Skip copy-paste” is the sales line. Sent-from-chat is the fail.
- **Procedure:** Do not toggle MCP. Do not connect Claude.
- **Example that proves it:** Situation → written email. Action → Claude finds send workflow and fires. Reasoning → convenience. Outcome → inbox shows sent. Lesson → this is why we do not flip instance MCP.
- **Why it works (as warning):** Search+execute will find the send node you forgot.
- **Conditions / exceptions:** Assigned-only MCP with no send nodes is the only maybe.
- **Operate-never payload:** Instance MCP on a send box; Claude connector; always-allow; auto-complete send-tasks.
- **Hive run (existing skills only):** `send-removed` · `ask-principal`.
- **Source:** `mPflFTQUCGk` @ UNKNOWN

### Operate-never
- Enable instance MCP / Claude connector.
- Chat-send / always-allow on send.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as the send-footgun proof (no toggle). Clients parked.
