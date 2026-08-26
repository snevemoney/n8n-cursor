# Career Strategist — mPflFTQUCGk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (1:55, 515 words). Beats: (1) enable MCP access in n8n settings (2) Claude: add connectors → n8n native → connect; first time paste server URL (3) pitch: instead of AI-write-email then copy-paste, say “send that off now” if a send workflow exists (4) demo: “use n8n to send that email to michael@dundermifflin.com” (5) Claude searches workflows, gets details, always-allow tools, knows three body fields + webhook, sends (6) confirmation; email visible in his inbox (7) busy-day aside: ClickUp task “email Michael about PTO” urgent today (8) instead of context-switching, ask Claude to use n8n ClickUp task manager to mark that task complete (9) it finds the workflow, completes; ClickUp shows complete. This short is the send-trap demo of instance MCP.

## B. Atomic Knowledge

### Chat can fire the send workflow
- **Claim:** Once instance MCP is on, liking a drafted email plus “send that” is enough if a send workflow exists.
- **Reasoning:** Copy-paste is the old tax; search-and-execute removes it.
- **Mechanism:** search workflows → get details → fill fields → webhook/send.
- **Evidence:** “use Nitin to send that email to michael@dundermifflin.com” / “the email has been sent.” @ UNKNOWN
- **Conditions:** A send-capable workflow is in the instance; user clicks always-allow.
- **Exceptions:** If no send workflow exists, the pitch fails.
- **Action:** Do not keep a send workflow MCP-visible.
- **Confidence:** high as demo.
- **Source:** `mPflFTQUCGk` @ UNKNOWN
- **Epistemic:** SOURCE

### Always-allow is how the gate dies
- **Claim:** He clicks “always allow” on get-details and on the execute so he does not configure the POST himself.
- **Reasoning:** Convenience; Claude found the webhook.
- **Mechanism:** allow once → later calls pass.
- **Evidence:** “I’m going to always allow this tool as well.” @ UNKNOWN
- **Conditions:** First-time connect.
- **Exceptions:** Per-call allow would still be a gate (he skips it).
- **Action:** Never always-allow send.
- **Confidence:** high as shown.
- **Source:** `mPflFTQUCGk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Context-switch is the enemy. Chat is the control plane for email and task boards. Dunder Mifflin is joke data; PTO email is a real-looking task name. Confirmation in the inbox is the receipt he wants.

## D. Procedures
Enable MCP → connect Claude → (optional) paste URL → speak the send → always-allow → check inbox.  
Second loop: speak the ClickUp complete → check board.  
Hive inverse: draft in chat, Evens sends; task moves only after HITL.

## E. Examples
**Situation:** Email to Michael is written and liked.  
**Action:** “Use n8n to send it”; always-allow; inbox shows it.  
**Reasoning:** Stop copy-paste.  
**Outcome:** Sent.  
**Lesson:** This is the send trap with a smile. Implicit rule: if the workflow exists and allow is sticky, chat will send.

**Situation:** Urgent ClickUp “email Michael about PTO.”  
**Action:** Mark complete via MCP from Claude.  
**Reasoning:** Stay in the chat.  
**Outcome:** Task complete.  
**Lesson:** Status can move without looking at the board — also a lie risk if the email was not actually handled.

## F. Decision Rules
- If a send workflow is MCP-visible, assume it will be called.
- If you click always-allow on send, you have removed HITL.
- If you mark “email X” complete from chat, verify the email actually left HITL — he does not.

## G. Contrarian
Rejects copy-paste as the human duty. Hive rejects his conclusion: copy-paste (or principal send) *is* the duty.

## H. Assumptions
**Theirs:** Always-allow is fine; inbox confirmation = success. **Ours:** send is never; PTO/employment-adjacent mail is exactly the job-card never. Falsifier: a wrong-address send.

## I. Questions
- Can you scope MCP to non-send workflows? Not on this short.
- Did “email Michael about PTO” get sent, or only the task closed?

## J. Connections
- SYSTEM SYNTHESIS → `9IzGe0BBj_c` (the theory).
- SYSTEM SYNTHESIS → `nQtogLs_dlg` (Sonnet also sends to Michael Scott).
- SYSTEM SYNTHESIS → `send-removed` / `ask-principal`.

## K. Future-Use
Unassigned: ClickUp-complete-from-chat as a *draft* status change after Evens confirms the underlying hard step.

## Steal / Operate-never

### Machine: search-then-act, with send stripped
- **Epistemic:** SOURCE (loop) + SYSTEM SYNTHESIS (strip send)
- **Workflow / loop:** chat names an outcome → search workflows → if send/pay/book, stop and `ask-principal` → else execute draft-safe work → verify on the real surface
- **Questions / signals:** Does this workflow send? Did we always-allow? Is the task “email X” actually sent?
- **Qualify / frame / objections:** “Send that off now” is the never sentence.
- **Procedure:** Enable search. Disable execute-on-send. No always-allow on mail.
- **Example that proves it:** Michael@dundermifflin send (E).
- **Why it works:** Schema search finds the gun; always-allow pulls the trigger (B/C).
- **Conditions / exceptions:** Demo uses joke addresses; employment mail is worse.
- **Operate-never payload:** Auto-send; always-allow send; Claude as hive mailer; quit-job.
- **Hive run:** `send-removed` · `ask-principal` · `agent-as-hire`
- **Source:** `mPflFTQUCGk` @ UNKNOWN

### Operate-never
- “Send that off now.” Always-allow on mail.
- Employment / PTO email without HITL. Quit-job.
- Unpark clients. Install Claude as mailer.
- Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. This short is the career send-trap in one minute: a chat that can mail Michael about PTO. We draft; Evens sends; we do not mark the employment task done from a connector. Clients parked.
