# Librarian — HN0oWxbF2bM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/HN0oWxbF2bM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/HN0oWxbF2bM/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** From Zero to Inbox Agent (Full Beginner's Course, No-Code)
**Channel:** Nate Herk | AI Automation
**Kind:** video (~8953 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Beginner inbox: classify + label, then "scale to a manager." Wireframe first. Stack: n8n (**14-day** then ~**$25/mo**), Gmail (Outlook "same idea, different clicks"), OpenRouter. Trigger: message received, poll **every minute**. Four buckets: **customer support / finance-billing / high priority / promotion**. After classify you choose: label everyone; then reply vs draft vs notify vs ignore — "what do you want?"
2. Gmail OAuth (self-host Google guide in Skool). **Simplify OFF** or you only get a snippet. **Pin** the test mail. Text classifier: subject + `text` body as expression. Create the **four Gmail labels first**. Paste sheet definitions (issue keywords, etc.); tune when it over/under-fires. First execute fails — no model. OpenRouter: add **~$5**, key named inbox-demo (he will delete). **4.1 mini** to classify. Pin the CS branch.
3. CS path: Gmail **add label** via trigger **message ID** (not classifier). AI agent: define-below subject/body; system prompt from ChatGPT whisper (Nate's AI assistant, AIS, fallback `nateherk88@gmail.com`). Same OpenRouter cred, **Claude 3.7 Sonnet** for the letter. Gmail **reply** (not send) + ID + text + **strip n8n attribution**. Bold in the prompt → bold sign-off; he strips markdown. Unpin, second CS sample, full run **~15s**. Mentions RAG later, not in this class.
4. Finance sample ("incorrect charge"): copy the label node, fix name (he misspells finance). **No LLM** — template Gmail to `billing@ample.com`: subject "new billing email from {from.name}", body `$now.format` date+time + from + address + subject. First send still has attribution; he turns it off. High priority: copy labels for HP + promo. Agent **Mr. Doomsday** (rude) — he almost keeps the CS prompt for jokes. **Create draft** + **thread ID** + later **To** (first draft has no recipient). Subject "test" does not show on a reply-thread. Promo: label + **mark as read** (speech says unread / "mark as red"). Edit: **activate** or the minute-poll never runs; executions tab is the night view.
5. Scale: sheet logger (time / path / reply) to see patterns. Template + samples in Skool. Plus **200**. Courses: Agent Zero, 10h→10s, one-person agency (annual / 6-month).
Gap: full category defs, RAG. Timestamp UNKNOWN. $25 / $5 / 15s UNVERIFIED. n8n/Gmail/OpenRouter on-tape. AIS inbox ICP parked.

## B. Atomic Knowledge

### Wireframe four doors; pin; simplify off; draft the rude one; activate is the cron
- **Claim:** One classifier, four labels, four different exits. Variables beat retyping. Pin so you don't re-spend. Simplify hides the body. Descriptions are living. Cheap model classifies; dearer model writes. Template notify can skip an LLM. Auto-reply is what he **does** on CS; draft is what he **recommends** for Doomsday. Draft needs thread ID **and** To. Attribution is a tell. Inactive = dead trigger. A sheet is how you see the miss.
- **Reasoning:** Same draft-vs-send as `pxzo2lXhWJE` / `bxGE_LXPyAU`. He sends the CS path — operate-never. Hive does not run n8n inbox.
- **Mechanism:** wireframe → Gmail poll → classify → label by ID → branch (reply / template notify / draft / mark-read) → activate → sheet log → HITL on any send.
- **Evidence:** simplify snippet; no-model error; bold sign-off; 15s second CS; billing@ bounce; draft without To; activate edit.
- **Conditions:** $25 / $5 / Plus 200 UNVERIFIED.
- **Exceptions:** Do not activate auto-reply on a real inbox.
- **Action:** File simplify-off, pin, label-first, draft-needs-To, activate-is-on, sheet-log. Do not send the CS agent.
- **Confidence:** high as a beginner-inbox anatomy
- **Source:** `HN0oWxbF2bM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** no model; bold md; attribution; draft To; finance spelling
- **Speech ≠ behavior:** "draft or reply, your choice" vs live CS auto-send; "mark unread" vs mark-as-read node

## C. Mental Models
Wireframe is the product. Four doors. Pin is money. Descriptions drift. Template when the facts are known. Draft the dangerous voice. Active or it sleeps. Skool room.

## D. Procedures
1. Draw the four exits before a node.
2. Labels in Gmail first.
3. Simplify off; pin.
4. Classifier + living defs; cheap model.
5. Label by message ID.
6. CS/HP: prefer **draft**; finance: template notify; promo: file away.
7. Strip attribution; set To on drafts.
8. Activate only after a human read; add a sheet.
Avoid: n8n-cloud as hive; auto-reply; $25 as our stack; activate-and-forget.

## E. Examples
**Simplify on:** Situation — login issue mail. Action — snippet only. Outcome — toggle off, full text. Lesson — the body is a setting.

**Draft without To:** Situation — Doomsday. Action — thread ID only. Outcome — draft not addressed. Lesson — reply-thread still needs a recipient field.

## F. Decision Rules
- IF the voice can be rude or wrong → draft, don't reply.
- IF the facts are in the trigger → skip the LLM.
- IF the workflow is inactive → the minute poll is theater.
- IF attribution is on → the tell is in the footer.
- Refuse: auto-send; n8n as hive; AIS hunt.

## G. Contrarian
Against one mega inbox agent. Against AI on every notify. Against test-mode-as-production.

## H. Assumptions
Caption-only. Complements newsletter/onboarding send tapes. Keep Plus-200.

## I. Questions
Did he ever put the CS path on draft in his own inbox? What did the logger change?

## J. Connections
SYSTEM SYNTHESIS → draft-not-send; `ask-principal`; n8nbuilder pin.

## K. Future-Use
Simplify-off + pin + draft-needs-To + activate-is-on as atoms.

## Steal / Operate-never

### Machine: four labeled doors; pin; draft the letter; log; don't sleep-send
- **Epistemic:** SOURCE
- **Workflow / loop:** wireframe → poll → classify → label → door → draft/notify → activate → sheet
- **Questions / signals:** Simplify on? To set? Active? Can it send?
- **Qualify / frame / objections:** Sample sheet is not a client inbox. $25 is his cloud.
- **Procedure:** D above.
- **Example that proves it:** 15s auto-reply; draft To miss; activate edit.
- **Why it works:** Doors and pins beat a smart blob.
- **Conditions / exceptions:** $ UNVERIFIED. Hive does not mail AIS.
- **Operate-never payload:** Auto-reply. n8n-cloud. Activate-and-forget. Plus as the only logger.
- **Hive run:** File draft-needs-To. Sends stay HITL.
- **Source:** `HN0oWxbF2bM` @ UNKNOWN

### Operate-never
- n8n-cloud as hive. Auto-reply. Quote $25 as our stack. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Upgrade old take: add simplify-off, draft-To, unread≠read. Hard steps HITL.
