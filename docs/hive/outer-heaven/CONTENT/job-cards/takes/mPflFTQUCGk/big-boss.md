# Big Boss — mPflFTQUCGk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mPflFTQUCGk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Short (PACKET: 1:55, 515 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt`. Visual-only gaps: n8n Settings → MCP access toggle, Claude connectors UI, workflow search, ClickUp “email Michael about PTO” card. ASR: NINDN/NAND/Nitin/N.

Beats, in order:

1. Hook: “how to use n8n’s new instance level MCP.”
2. Settings → MCP access → enable / toggle on.
3. Starts with Claude. Icon → add connectors. n8n is “already a native connector.” Click connect, grant access.
4. First-time path: copy server URL into Claude. “As easy as that.”
5. Use-case: AI wrote an email; instead of copy-paste, “we’ll send that off now” — **if** an n8n workflow that sends email is available on MCP.
6. Command: “use n8n to send that email to michael@dundermifflin.com.”
7. Claude: search available workflows → found one → asks to get workflow details → he **always allow**s that tool too.
8. It learns three body fields, webhook address, etc. He always-allows again. “We didn’t have to… configure everything with this post request.”
9. Confirmation: email has been sent. He opens his inbox; it is “right here.”
10. Second loop: busy day, ClickUp to-do “email Michael about PTO” due today, urgent. Instead of context-switching into ClickUp, talk to the ClickUp task-manager agent through MCP inside Claude.
11. Command: “use n8n to move my task called email Michael about PTO to complete.”
12. Finds ClickUp task manager, gets details, “shoot that off.” Claims finished.
13. He opens ClickUp; the task is complete.
14. CTA: play button to the full breakdown.

Off-topic / not skipped: Dunder Mifflin / Michael as the joke recipient; “always allow”; first-time URL paste; copy-paste as the old world.

## B. Atomic Knowledge

### Instance MCP turns named workflows into chat verbs
- **Claim:** Enable MCP on the n8n instance, connect Claude (native connector or paste server URL), then a sentence can find and run a workflow (send email, complete a ClickUp task).
- **Reasoning:** The operator stays in one chat. The instance is the toolbag.
- **Mechanism:** Settings toggle → connector → natural language → search workflows → get details → invoke.
- **Evidence:** Two live verbs: send to michael@…, move “email Michael about PTO” to complete.
- **Conditions:** A matching workflow already exists on the instance. Chat cannot invent a sender if none is published to MCP.
- **Exceptions:** He does not show a miss (no matching workflow).
- **Action:** Steal “named workflow as a verb.” Do not enable instance MCP into Claude. Cursor + Grok only.
- **Confidence:** high for the demo shape
- **Source:** `mPflFTQUCGk` @ UNKNOWN — “let me search through your available workflows”
- **Epistemic:** SOURCE

### Always-allow is the smell
- **Claim:** Claude asks to get workflow details; he clicks **always allow** twice (details, then the invoke).
- **Reasoning:** Convenience trains a standing yes. Doctrine 7: if it has Send, assume it will send.
- **Mechanism:** Permission prompts in the connector UI.
- **Evidence:** Spoken “I’m going to always allow this tool as well” / “always allow” again.
- **Conditions:** Demo speed. Production this is how a discount email hits 150k (doctrine 7 story).
- **Exceptions:** He does not revoke. He does not show a deny.
- **Action:** Never always-allow a send tool. Architecture removes send; prose cannot save it.
- **Confidence:** high that he always-allowed
- **Source:** `mPflFTQUCGk` @ UNKNOWN — “I’m going to always allow this tool as well”
- **Epistemic:** SOURCE

### Confirmation in chat is not the receipt
- **Claim:** After each run he leaves Claude and opens the inbox / ClickUp to look.
- **Reasoning:** “Email has been sent” and “finished everything up” are claims. The inbox and the board are receipts.
- **Mechanism:** Chat confirm → switch app → look.
- **Evidence:** “If I head over to my email, you can see that it is right here.” Same for ClickUp complete.
- **Conditions:** He still looks. Many operators will stop at the chat toast.
- **Exceptions:** He does not read the email body on tape. Task complete could be the wrong card.
- **Action:** Open the destination. Chat toast is 70% done.
- **Confidence:** high
- **Source:** `mPflFTQUCGk` @ UNKNOWN — “we got confirmation that the email has been sent. And if I head over to my email…”
- **Epistemic:** SOURCE

### Stay-in-chat vs context switch is the pitch
- **Claim:** He could go back to ClickUp, or he can finish the urgent PTO task from Claude because he is “right here.”
- **Reasoning:** MCP’s product is not power; it is not moving windows.
- **Mechanism:** Same chat, second verb, different workflow.
- **Evidence:** Spoken “really busy day” / “context switch all the way back.”
- **Conditions:** Only if the ClickUp workflow is already on MCP.
- **Exceptions:** Staying in chat is how send becomes casual.
- **Action:** Learn the pitch. Do not optimize the hive for “send without leaving.”
- **Confidence:** high for his pitch
- **Source:** `mPflFTQUCGk` @ UNKNOWN — “I could context switch all the way back into ClickUp or I could just use my ClickUp task manager AI agent through MCP”
- **Epistemic:** SOURCE

## C. Mental Models

- **One chat, many instance tools.** Claude is the seat; n8n is the bag. **SOURCE**
- **Always-allow is a one-time tax.** He pays it to go faster. **SOURCE**
- **Copy-paste is the enemy.** Written email should just send. **SOURCE**
- **Inbox/board glance is enough proof.** He looks, does not read aloud. **SOURCE**
- **Dunder Mifflin is a joke, still a send.** **INFERENCE**
- **“Native connector” lowers the fear of the URL paste.** **INFERENCE**

## D. Procedures

1. **Inventory:** which workflows are published to MCP? If send-email is among them, treat the instance as armed.
2. **Connect** is a pay/secrets/deploy-shaped step — `ask-principal`. We do not toggle MCP into Claude.
3. **Verb test (learn only):** “use {system} to {named workflow}.”
4. **Search → details → invoke.** Each hop is a permission. Deny send. Do not always-allow.
5. **Receipt:** leave the chat; open the inbox or the board; read the object, not the toast.
6. **Second verb** on a different system (ClickUp) only after the first receipt.
7. **Busy-day pitch** is a trap: urgency is how send skips HITL (doctrine 7, 150k mail).

**Qualify / frame:** instance-MCP demo. Michael/Dunder Mifflin is a prop. Send is the point of the tape and the never of the hive.
**Objections:** “We didn’t configure the POST” — the workflow was already built; chat only found it. “Always allow is easier” — that is the incident.
**Avoid:** Claude + n8n MCP as OS. Cursor + Grok only. Communications Manager: draft only.
**When to change:** if a send workflow is visible to the chat, remove it from the toolbag (architecture), do not write “never send.”

## E. Examples

**Situation:** An email is already written in Claude.  
**Action:** “Use n8n to send that email to michael@dundermifflin.com.” Search workflows → always-allow details → always-allow invoke → toast → he opens the inbox.  
**Reasoning:** Skip copy-paste.  
**Outcome:** Mail claimed sent. Body unread on tape.  
**Lesson:** Named workflow as a verb. Implicit rule: always-allow + send = the incident shape. Hive stops before invoke.

**Situation:** Urgent ClickUp card “email Michael about PTO.”  
**Action:** Same chat: “use n8n to move… to complete.” Find task-manager workflow → invoke → open ClickUp → complete.  
**Reasoning:** Avoid context switch.  
**Outcome:** Card complete on his telling.  
**Lesson:** Stay-in-chat is the pitch. Implicit rule: completing “email Michael” because you sent from chat is two hard steps glued together.

**Situation:** First-time connect.  
**Action:** Native connector, or paste server URL. Toggle MCP access first.  
**Reasoning:** Instance must opt in.  
**Outcome:** Connected.  
**Lesson:** A toggle arms the instance. Implicit rule: off is the safe default.

## F. Decision Rules

- If MCP is on and a send workflow is published → the chat can send. Remove send from the bag.
- If the UI offers always-allow on a write → deny.
- If the chat says sent/complete → open the destination app.
- If the pitch is “you’re already here” → that is the send trap.
- If the workflow was not found → do not let the model invent a POST (he is proud it did not — keep that).
- Optimize: named verbs, receipts in the real app, send removed.
- Refuse: Claude connector; always-allow; sending to Michael; new hunt.

## G. Contrarian

- Against copy-paste as the human gate (he wants send from the writer).
- Against configuring the webhook by hand — let the model read the workflow (true on tape; dangerous if send is exposed).
- Against context-switching to the system of record — he treats it as waste; we treat it as the receipt.
- Field assumes instance MCP is “unlock full power.” Power here is send.

## H. Assumptions

**His:** Claude is the right seat; native connector is safe; always-allow is fine; inbox presence = success; ClickUp complete = the PTO email is done; Dunder Mifflin is harmless.

**Ours:** 515 words. Inbox/board **UNVERIFIED**. Domain-specific: his MCP launch short. Doctrine 7 is the disagreement, kept labeled.

**Falsifiers:** Wrong workflow invoked. Email went to a real Michael. Always-allow later sends without a prompt. ClickUp card completed without the mail existing.

**Disagreement (keep labeled):** Hive will not operate instance MCP into Claude or send from chat. The **named-workflow-as-verb**, **deny-always-allow**, and **open-the-destination** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What are the three body fields? Named, not listed.
- Sibling: `9IzGe0BBj_c` / `5p5cV0yVDvQ` — confirm bind.
- Is MCP access instance-wide (every workflow) or allowlisted? He says “available in MCP.”
- Did he send to a real inbox or a catch-all?

## J. Connections

- **SYSTEM SYNTHESIS** → doctrine 7 (send trap, 150k mail) and Communications Manager: draft only.
- **SYSTEM SYNTHESIS** → `nQtogLs_dlg` (research → email Michael Scott). Same joke recipient, same send.
- **SYSTEM SYNTHESIS** → `ask-principal` / HITL card: ACTION/WHY/AGENT/RISK/REVERSIBILITY.
- **SYSTEM SYNTHESIS** → `agent-job-card`: owns draft; never send.
- **SYSTEM SYNTHESIS** → `hN58VkYLie4`: stay-in-tracker vs stay-in-chat — opposite surfaces, same “don’t switch” pitch.
- Do not give Lead Hunter Gmail because a connector was on screen.

## K. Future-Use

- MCP allowlist (which workflows are verbs) as a Watchdog inventory (unassigned).
- Always-allow as a Forge never-checkbox (unassigned).
- “Open the inbox” as click-live-site analog for mail (unassigned).
- Urgent-PTO story as HITL training: urgency ≠ send (unassigned).

## Steal / Operate-never

### Machine: Named workflow as a verb + deny always-allow + receipt in the real app
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (chat wants a system action) → inventory which verbs are published → if send is published, remove it → model searches named workflows (do not invent POST) → details permission = once, not always → invoke only on non-send → leave chat → open inbox/board → read the object → stop.
- **Questions / signals:** “Is send in the bag?” “Did we always-allow?” “Did we open the destination?” “Are we sending because we’re ‘already here’?”
- **Qualify / frame / objections:** MCP launch short. Objection: “didn’t configure the POST” — workflow preexisted. Objection: “easier” — always-allow is the incident.
- **Procedure:** D steps 1–7. Checkable stops: (1) send not published to the chat, (2) no always-allow on writes, (3) destination opened, (4) Claude connector not installed.
- **Example that proves it:** “Send to michael@dundermifflin.com” → always-allow ×2 → inbox glance; then ClickUp PTO card completed from the same chat. Lesson: the verb+receipt machine is real; the send is the never.
- **Why it works:** Names beat raw HTTP. Receipts beat toasts. Conditions: workflows already built, a human who will leave the chat. Exceptions: always-allow on tape; send executed on tape; we will not repeat it.
- **Conditions / exceptions:** Cursor + Grok only (Claude / n8n MCP stay on tape). Clients parked. No tape $.
- **Operate-never payload:** Enable instance MCP into Claude; always-allow; send the mail; complete-and-forget; Gmail to Lead Hunter.
- **Hive run (existing skills only):** `ask-principal` · HITL send-removal (doctrine 7) · `agent-job-card` · `golden-test-loop` / `click-live-site` analog (open inbox) · `warm-draft-hitl` (draft only).
- **Source:** `mPflFTQUCGk` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Instance MCP into Claude; always-allow; send to Michael; auto-complete tickets as proof of send
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- New `icp_id` / unpark Normand / “MCP email agent” hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not always-allow a send tool because Dunder Mifflin is funny.

- **Done** on this teach: send removed from the bag + always-allow denied + destination-open written as the receipt. “Email has been sent” is not done.
- **Delegate without being asked:** Communications drafts only; HITL holds send; Watchdog inventories which verbs are published; I do not approve Claude as the seat.
- **Skeptical review:** “Unlock the full power” is the short’s job. Full power here is send. I will not arm the instance.
- **One system this take:** named verbs with send ripped out. Not a Claude desktop.
- Live hunt stays parked. I do not rotate to “email Michael” as a SKU.
