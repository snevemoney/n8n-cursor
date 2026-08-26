# Consultant — mPflFTQUCGk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Instance MCP how-to teaser (pair `9IzGe0BBj_c`, `5p5cV0yVDvQ`). Beats: n8n settings → enable MCP access. In Claude: add connectors → n8n native → connect (first time: paste server URL). Demo 1: after drafting an email, “use n8n to send that email to michael@dundermifflin.com” → search workflows → get details → always allow → sent; he shows it in the inbox. Demo 2: busy day, ClickUp “email Michael about PTO” urgent due today → “use n8n to move my task… to complete” → finds ClickUp task manager → always allow → task completed. CTA to the long. No VTT. UNKNOWN. ~515 words.

## B. Atomic Knowledge

### Chat finds the workflow and fills the schema
- **Claim:** Claude searches the instance, reads the email-send workflow’s three body fields and webhook, and calls it without the human building the POST.
- **Reasoning:** The steal is schema discovery. The payload is send + always-allow.
- **Mechanism:** Enable MCP → ask in chat → search workflows → get details → execute.
- **Evidence:** “We didn't have to actually go in here and configure everything with this post request. Claude was able to just find it and do it.”
- **Conditions:** A send-email workflow already exists. Claude on tape.
- **Exceptions:** Always-allow is on tape twice.
- **Action:** Steal discovery. Never always-allow send. Do not install Claude.
- **Confidence:** high
- **Source:** `mPflFTQUCGk` @ UNKNOWN — “always allow this tool as well”
- **Epistemic:** SOURCE
### Same chat, different workflow: complete a task
- **Claim:** He stays in Claude and completes a ClickUp task via a different n8n workflow instead of context-switching into ClickUp.
- **Reasoning:** The human socket stays in one chat; tools are the instance.
- **Mechanism:** Ask to move task X to complete → find task-manager workflow → execute.
- **Evidence:** On-tape: Email Michael about PTO marked complete.
- **Conditions:** The task existed. MCP enabled.
- **Exceptions:** Completing “email Michael” because you *sent* is different from completing because you *asked* — he just asked.
- **Action:** Do not mark real work done from chat without a human check.
- **Confidence:** medium
- **Source:** `mPflFTQUCGk` @ UNKNOWN — “use N to move my task called email Michael about PTO to complete”
- **Epistemic:** SOURCE


## C. Mental Models

He is selling the end of copy-paste and context-switch. He treats always-allow as convenience. He uses a sitcom email as the demo, which hides the cost of a wrong send. He is the smash version of `9IzGe0BBj_c`.

## D. Procedures

On-tape: enable MCP → always-allow → send; always-allow → complete task. Ours: discovery is learnable; send stays `send-removed`; complete stays HITL; no Claude connector.

## E. Examples

**Situation:** Draft exists; he wants it sent. **Action:** Claude finds the send workflow and sends. **Outcome:** Mail in the inbox. **Lesson:** Discovery works. Always-allow send is the never. Implicit rule: he says “instead of just writing it and then copy and pasting.”

## F. Decision Rules

If the workflow can send, do not always-allow. If the task complete is real work, a human confirms the send happened. If the connector is Claude, we do not add it.

## G. Contrarian

Field default: you must wire the POST. He lets the client discover it. Field default: approve each tool call. He always-allows.

## H. Assumptions

This is the operate-never showcase: auto-send + always-allow + Claude. Ugly useful tape. Do not skip it. Do not operate it.

## I. Questions

What other workflows were visible? Can it find a delete workflow? Who else has the server URL?

## J. Connections

**SYSTEM SYNTHESIS:** Pair `9IzGe0BBj_c` / `5p5cV0yVDvQ`. Directly contradicts `send-removed`. Maps to `input-required-gate` + `ask-principal`.

## K. Future-Use

Unassigned: always-allow as a named never; “found the webhook” as a security review item.

## Steal / Operate-never

### Machine: Schema discovery without always-allow send
- **Epistemic:** INFERENCE
- **Workflow / loop:** Enable a narrow MCP allowlist → chat may search schemas → human approves each execute → send/complete never always-allow → `send-removed` still holds
- **Questions / signals:** Did it ask to send? Did we always-allow? Which workflow did it find?
- **Qualify / frame / objections:** Qualify: they are tired of copy-paste. Frame: discovery, not send. Objection: “just send it” — that is his demo.
- **Procedure:** Search is ok to learn. Always-allow send is never. Do not install Claude.
- **Example that proves it:** Claude sends mail to michael@dundermifflin.com and completes a PTO task after always-allow.
- **Why it works:** Discovery removes wiring toil. Always-allow removes the hard step.
- **Conditions / exceptions:** Vendor on-tape. Live send on tape.
- **Operate-never payload:** Always-allow send. Install Claude MCP. Auto-complete tasks. Enable execute-any.
- **Hive run (existing skills only):** `send-removed` · `input-required-gate` · `ask-principal` · `warm-draft-hitl`
- **Source:** `mPflFTQUCGk` @ UNKNOWN


### Operate-never
- Always-allow send or task-complete.
- Install Claude as an n8n MCP client.
- Treat “email has been sent” as a success story to copy.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “unlock the full power of your agents.” Felt problem is not MCP send. Do not connect a parked client’s mailer to a chat.

**Four-blank after constraint:** Toddler stop = a draft the human still sends.

**Skeptical-customer:** Inbox screenshot is smash. Clients parked. This desk will not operate his demo.
