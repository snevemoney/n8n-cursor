# Product GTM — mPflFTQUCGk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (title: “Unlock the Full Power of Your AI Agents with n8n Instance MCP” 1:55). Beats: (1) settings → MCP access → enable; (2) Claude: add connectors → n8n native → connect (first time: paste server URL); (3) instead of write-email-and-copy-paste, “we’ll send that off now” if an MCP workflow sends mail; (4) “use n8n to send that email to michael@dundermifflin.com” → searches workflows → get details → always-allow → knows three body fields + webhook → confirmation sent; he opens the inbox and sees it; (5) busy day: ClickUp “email Michael about PTO” urgent today → “use n8n to move task … to complete” → finds ClickUp task manager → ClickUp shows complete. Timestamp UNKNOWN. Long: `5p5cV0yVDvQ`. **Auto-send on tape.**

## B. Atomic Knowledge
### Instance MCP finds a send workflow and fires it
- **Claim:** After connect, Claude can search instance workflows, read schema (three fields + webhook), and send mail to a named address; then mark a ClickUp task complete the same way.
- **Reasoning:** Stay in one chat; no context-switch; no manual POST.
- **Mechanism:** Enable MCP → connect client → natural language → search → always-allow → execute.
- **Evidence:** Sent mail visible; task moved to complete.
- **Conditions:** A send-mail workflow already exists and is exposed.
- **Exceptions:** First-time URL paste. “Always allow” is his click.
- **Action:** Steal search-then-fill-schema. Do not always-allow send. Do not install Claude.
- **Confidence:** high.
- **Source:** `mPflFTQUCGk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Copy-paste is the old world; chat-that-sends is the new — that is exactly the hive hard-step line. Always-allow is convenience theater. ClickUp complete is a second verb on the same machine.

## D. Procedures
His: enable MCP → connect → name the verb and the object → allow tools → check the destination system.
Hive: same until execute; send/complete of anything client-facing stays HITL. Never “always allow” a send tool.

## E. Examples
**Situation:** Email written, he likes it. **Action:** “Send to michael@dundermifflin.com” via n8n MCP. **Reasoning:** Don’t copy-paste. **Outcome:** Mail in the inbox. **Lesson:** The machine works; operate-never is the send. Implicit rule: always-allow is how a send sneaks out.

**Situation:** PTO task due today. **Action:** “Move to complete” from the same chat. **Reasoning:** No context switch. **Outcome:** ClickUp complete. **Lesson:** Second verb, same search-and-fire.

## F. Decision Rules
- If the workflow sends → do not always-allow; Evens sends.
- If the client can see the inbox → that is a hard step.
- Refuse: instance-MCP SKU; Claude connector.

## G. Contrarian
Against staying in the canvas to POST by hand. Hive disagrees on auto-send, not on search-schema.

## H. Assumptions
Theirs: always-allow is fine; Dunder Mifflin is a safe demo. Ours: `send-removed`. Falsifier: wrong recipient, still “confirmation sent.”

## I. Questions
Can you deny-list send workflows at instance level? Long may say.

## J. Connections
**SYSTEM SYNTHESIS:** Sibling `9IzGe0BBj_c`; long `5p5cV0yVDvQ`. Maps to `send-removed` + `ask-principal`.

## K. Future-Use
Unassigned: schema-discovery as an internal admin tool with a deny-list. Keep.

## Steal / Operate-never

### Machine: search instance → read schema → human allow per verb (never always-allow send)
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS (gate)
- **Workflow / loop:** enable catalog → ask for a named job → client finds workflow + fields → human allows *this* call → verify in the destination app
- **Questions / signals:** Does this workflow send? Always-allow or once?
- **Qualify / frame / objections:** “I’m busy” is not a reason to always-allow send
- **Procedure:** Draft in chat. Evens sends. Check the inbox only after HITL
- **Example that proves it:** michael@dundermifflin.com sent; PTO task completed
- **Why it works:** Schema search removes manual POST; always-allow is the failure mode
- **Conditions / exceptions:** Demo addresses. Vendor Claude
- **Operate-never payload:** Auto-send via MCP; Claude connector; n8n-cloud
- **Hive run (existing skills only):** `send-removed` · `ask-principal`
- **Source:** `mPflFTQUCGk` @ UNKNOWN

### Operate-never
- Auto-send / always-allow send tools
- Productize instance MCP; install Claude
- New hunt; merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Do not sell “unlock full power.” Path C never auto-sends a waitlist or a book. Clients parked.
