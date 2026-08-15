# Communications Manager — mPflFTQUCGk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** Unlock the Full Power of Your AI Agents with n8n Instance MCP
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** short · 515 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Settings → MCP access → enable. Claude: add connectors → n8n native → connect (first time: server URL).
- Demo 1: instead of copy-paste a written email, “use n8n to send that email to michael@dundermifflin.com.” Claude searches workflows, gets details (three body fields, webhook), always-allow; “email has been sent”; he shows it in the inbox.
- Demo 2: busy day; ClickUp “email Michael about PTO” urgent; “use n8n to move my task… to complete.” Finds ClickUp task manager; task moves complete.
- CTA: full. Sister `9IzGe0BBj_c` / `5p5cV0yVDvQ`.

## B. Atomic Knowledge

### Instance MCP send is the cautionary demo
- **Claim:** He shows Claude finding a send workflow and actually sending, then completing a ClickUp task, so you don’t context-switch.
- **Reasoning:** The feature is execute-any, including send.
- **Mechanism:** Enable MCP → Claude connector → natural language → search workflows → allow → side effect.
- **Evidence:** “you can go ahead and just say we’ll send that off now… confirmation that the email has been sent.”
- **Conditions:** A send workflow exists in the instance.
- **Exceptions:** This is the operate-never we already flagged on `9IzGe0BBj_c`. Always-allow is the second never.
- **Action:** Do not enable a send workflow on MCP. Do not always-allow. Do not write “just tell Claude to send.”
- **Confidence:** high
- **Source:** `mPflFTQUCGk` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Context-switch avoidance is the why. **SOURCE**
- Always-allow is how a god-key stays open. **SOURCE**
- Dunder Mifflin is the tell. **INFERENCE**

## D. Procedures
- On-tape: enable MCP, connect Claude, allow tools, send/complete. **SOURCE**
- This desk: invert — MCP must not see send. First Gmail = read+draft. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Email written in Claude; ClickUp PTO task. → **Action:** MCP send to Michael; MCP complete the task. → **Reasoning:** Don’t copy-paste / don’t switch apps. → **Outcome:** Mail in inbox; task complete. → **Lesson:** This is the failure mode. Implicit rule: if send exists, NL will fire it.

## F. Decision Rules
- If MCP can see a send workflow → disable that workflow or MCP.
- If the client asks to always-allow → no.
- Refuse: Claude connector. “Send that off now.”
- Optimize: draft in Cursor; Evens sends.

## G. Contrarian
- He thinks the win is skipping copy-paste. We think that’s the hole. **SYSTEM SYNTHESIS**

## H. Assumptions
- Claude + n8n MCP on-tape. Falsifier: scoped MCP without send (not shown).

## I. Questions
- Can always-allow be limited per tool in his full video?

## J. Connections
- **SYSTEM SYNTHESIS:** `9IzGe0BBj_c` · `5p5cV0yVDvQ`. `send-removed`.

## K. Future-Use
- Always-allow as a named never on any connector.

## Steal / Operate-never

### Machine: No send workflow on MCP; no always-allow; no “send that off now”
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** NL client can see workflows → inventory send/complete-with-side-effects → unplug those → draft only → **stop**.
- **Questions / signals:** Can it send? Did we always-allow? Did mail leave?
- **Qualify / frame / objections:** Qualify: convenience vs hard step. Frame: send-removed. Objection: “don’t copy-paste, just send” → refuse.
- **Procedure:** 1) Disable send-on-MCP. 2) Never always-allow. 3) Draft here. 4) Evens sends.
- **Example that proves it:** Claude sends to michael@dundermifflin.com and completes the PTO task.
- **Why it works:** Natural language plus a reachable sender is a send. Always-allow removes the last pause.
- **Conditions / exceptions:** Instance MCP demos. Exceptions: none.
- **Operate-never payload:** Claude MCP send. Always-allow. ClickUp-complete as a hidden send.
- **Hive run (existing skills only):** `send-removed` · `warm-draft-hitl` · `confirm-then-actuate`.
- **Source:** `mPflFTQUCGk` @ UNKNOWN


### Operate-never (this desk will not operate)
- Claude/n8n MCP send. Always-allow. “Send that off now.”
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I will not write “use n8n to send.” I draft. Evens sends. Clients parked.
