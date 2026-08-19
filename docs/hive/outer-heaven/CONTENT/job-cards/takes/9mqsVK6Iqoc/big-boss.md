# Big Boss — 9mqsVK6Iqoc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Short (PACKET: 1:24, 327 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: the wireframe, the Gmail trigger picker (he says 26 actions), the classifier branches, and the email that landed in “customer support” are described, not seen. Title says “30 minutes”; that duration is **UNVERIFIED** (not in the spoken captions).

Beats, in order:

1. Claim: “Here’s how to build your first inbox agent in Nitn” (n8n, on-tape).
2. Start with a Gmail trigger. Add first step → type Gmail.
3. UI behavior: it pops triggers; 26 actions exist; because the canvas is empty, it knows it must start with a trigger and prompts **on message received**.
4. Event = message received.
5. Next, “according to our wireframe”: AI classifier reads subject + body and classifies into **four** categories.
6. He adds a text classifier after the Gmail trigger.
7. This is a customer-support email example. He hits execute step.
8. **Error:** classifier needs AI connected; they have not connected AI yet.
9. He connects AI (how is visual-only). Re-executes. It works.
10. Output: customer-support branch has **one item**. Finance, billing, high priority, and promotion have **no items**.
11. He says it sent the email down the right path, matching the wireframe.
12. CTA: play-button to the full breakdown. Short ends before any reply, label, or send.

Off-topic / not skipped: empty-canvas trigger prompt; 26 Gmail actions; four named buckets (customer support, finance, billing, high priority, promotion — he lists four after support, so **five names** appear; treat as caption slip); wireframe-before-nodes.

## B. Atomic Knowledge

### Empty canvas forces a trigger first
- **Claim:** With nothing on the workflow, the Gmail node prompts a trigger (message received) instead of an action.
- **Reasoning:** An inbox agent that does not start on a new message is not this machine.
- **Mechanism:** Add first step → Gmail → UI offers triggers; event = message received.
- **Evidence:** “it knows that there’s nothing else on our workflow yet and it has to start with a trigger.”
- **Conditions:** First node. Later Gmail nodes can be actions (he mentions 26).
- **Exceptions:** Tape does not show starting from a webhook or a schedule instead.
- **Action:** Definition of done for step 1 = a real inbound trigger, not a chat window.
- **Confidence:** high
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN — “it has to start with a trigger”
- **Epistemic:** SOURCE

### Wireframe names the buckets before the node
- **Claim:** The classifier exists because a wireframe already named the categories and the read fields (subject + body).
- **Reasoning:** You do not discover buckets on the canvas. You execute a picture you already drew.
- **Mechanism:** Text classifier after Gmail; four (named) categories; execute.
- **Evidence:** “according to our wireframe… classify it in one of these four categories.”
- **Conditions:** Wireframe exists before the plus-click. Categories are discrete.
- **Exceptions:** Caption lists customer support plus finance, billing, high priority, promotion — count is messy. Do not invent a fifth rule.
- **Action:** Checkable stop = written buckets + which fields are read, before adding AI.
- **Confidence:** high that a wireframe led; medium on the exact bucket count
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN — “according to our wireframe”
- **Epistemic:** SOURCE

### Classifier without a brain is a useful error
- **Claim:** First execute fails because AI is not connected to the text classifier.
- **Reasoning:** The node is not magic. No model = no classify. The error is the lesson.
- **Mechanism:** Execute → error → connect AI → execute again → branch fires.
- **Evidence:** “we get an error… we need to connect AI to this node.”
- **Conditions:** First-time setup. Once connected, re-execute works on this tape.
- **Exceptions:** He does not show a wrong-bucket miss, only a missing-brain miss.
- **Action:** A red execute is a setup stop, not a product failure. Do not skip it in the write-up.
- **Confidence:** high
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN — “the reason why is because we need to connect AI”
- **Epistemic:** SOURCE

### Right path = one item on the intended branch, zero on the others
- **Claim:** Success is visible as item counts: support = 1; other branches = 0.
- **Reasoning:** Classification is a router. Proof is which path got the item.
- **Mechanism:** Text classifier outputs to named branches; he reads the item counts.
- **Evidence:** “output it in the customer support branch… one item… finance, billing, high priority, and promotion… no items.”
- **Conditions:** One example email he already believed was support. Not a six-row eval.
- **Exceptions:** No reply, no human review, no send. “Right path” is one happy example.
- **Action:** Branch item-count is a smoke, not eval. Do not ship a router on one green execute.
- **Confidence:** high for the demo; low as proof the classifier is good
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN — “sent it down the right path just like we talked about in our wireframe”
- **Epistemic:** SOURCE

## C. Mental Models

- **Wireframe before nodes.** The canvas executes a picture. **SOURCE**
- **Inbox agent = trigger + router.** Not a chatbot that “handles email.” **INFERENCE**
- **The UI knows you need a trigger when the canvas is empty.** He treats that as helpful, not as a constraint to fight. **SOURCE**
- **Error is part of the teach.** Missing AI is shown, not edited out. **SOURCE**
- **Item count on a branch is the receipt.** **SOURCE**
- **“First inbox agent” is the magnet; send/reply is withheld.** **INFERENCE**
- **30 minutes (title) is not spoken. Do not promote it to FACT.** **SYSTEM SYNTHESIS**

## D. Procedures

1. **Draw the wireframe first:** trigger, read fields, named buckets, what happens on each path (reply/send stay off unless Evens).
2. **Add the inbound trigger** (his: Gmail message received). Empty canvas should start here.
3. **Add the classifier** only after buckets are named.
4. **Connect the brain** before you call execute “broken.”
5. **Execute one known example.** Read item counts: intended branch = 1; others = 0.
6. **Treat that as a smoke, not eval.** Next would be a labeled set (not on this short).
7. **Do not add send/reply** from this short.

**Qualify / frame:** first-inbox tutorial, not a client comms SKU. Gmail/n8n stay on tape. Communications Manager = read/classify/draft only.
**Objections:** “The agent handles the inbox” — answer with: it routed one example; no reply on tape.
**Avoid:** Gmail as Lead Hunter; auto-reply; installing n8n.
**When to change:** if buckets are unnamed, do not add a classifier. If AI is disconnected, do not debug the prompt. If only one example passed, do not call it evaluated.

## E. Examples

**Situation:** Empty n8n canvas; he wants an inbox agent.  
**Action:** Gmail first step; UI pushes “on message received.”  
**Reasoning:** No trigger, no agent.  
**Outcome:** Event = message received.  
**Lesson:** Start on inbound. Implicit rule: empty canvas + action node is the wrong first click.

**Situation:** Wireframe says classify subject+body into named buckets.  
**Action:** Adds text classifier; executes; errors because AI is not connected.  
**Reasoning:** Classifier is a node that needs a model.  
**Outcome:** Error, then connect, then it runs.  
**Lesson:** Missing brain is a setup error. Implicit rule: show the fail; do not skip to green.

**Situation:** A customer-support example email.  
**Action:** Re-execute; support branch = 1 item; other branches = 0.  
**Reasoning:** Right path is item counts matching the wireframe.  
**Outcome:** He calls it correct.  
**Lesson:** One green route is a smoke. Implicit rule: zero on other branches is part of the receipt.

## F. Decision Rules

- If there is no wireframe → do not add nodes.
- If the canvas is empty → trigger first.
- If the classifier errors → check brain connection before rewriting categories.
- If one example routed right → smoke only; do not sell/ship the inbox agent.
- If the next node is send/reply → stop; HITL.
- Optimize: wireframe → trigger → classify → item-count smoke.
- Refuse (on this desk): auto-reply; Gmail-as-hunter; “30 minutes” as FACT; n8n inbox army.

## G. Contrarian

- Against “start with the AI node”: he starts with Gmail trigger; AI is the second brain, and it fails when missing.
- Against “the agent talks to the inbox”: this short only routes.
- Against editing out the error: the fail is the teach.
- Field assumes an inbox agent sends. He withholds send (whether by design or by magnet).

## H. Assumptions

**His:** Wireframe is already done; four buckets are the right cut; one support email proves the path; n8n + Gmail is the OS; the long will finish the build.

**Ours:** 327 words. Bucket count in captions is messy (four vs the names he lists). Title “30 minutes” **UNVERIFIED**. No $. Domain-specific: shared inbox routing, not a local-pro book-flow.

**Falsifiers:** Real mail hits two buckets. Promotion and high-priority collide. Connecting AI still misroutes. Long adds auto-send.

**Disagreement (keep labeled):** Hive will not operate an n8n Gmail agent. The **wireframe → trigger → classify → item-count smoke** machine is still stolen. Send stays never. **SYSTEM SYNTHESIS**

## I. Questions

- Where is the wireframe, and who drew the four buckets?
- Why do captions list five names after “four categories”?
- What happens on each branch after route? Not on this short.
- Is high-priority a category or a severity overlay?
- Sibling long: PACKET does not bind an id.
- Title “30 minutes” — not spoken. Do not treat as FACT.

## J. Connections

- **SYSTEM SYNTHESIS** → `agent-job-card`: classifier owns route, never send.
- **SYSTEM SYNTHESIS** → Communications Manager doctrine: read/classify/draft only → HITL for send.
- **SYSTEM SYNTHESIS** → `golden-test-loop`: one green email is a smoke; next is a labeled set (`8IUWeF3B-hk` eval shape).
- **SYSTEM SYNTHESIS** → `ask-principal`: reply/send stay gated.
- **SYSTEM SYNTHESIS** → `playbook-before-send`: no one is approved to send from this router.
- Do not force a Path A client out of a support-inbox demo.

## K. Future-Use

- Empty-canvas trigger prompt as a Forge “start on inbound” check (unassigned).
- Item-count receipt as a Watchdog smoke format (unassigned).
- Bucket-count slip (4 vs 5 names) as a caption-quality warning (unassigned).
- Wireframe-before-nodes as Consultant scope (unassigned).

## Steal / Operate-never

### Machine: Wireframe buckets → inbound trigger → classifier + brain → item-count smoke
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** draw buckets + read fields → add inbound trigger → add classifier → connect brain → execute one known example → intended branch = 1, others = 0 → that is smoke, not ship → draft only; send = HITL. Checkable stop = wireframe + smoke counts.
- **Questions / signals:** “Where is the wireframe?” “What are the buckets?” “Is the brain connected?” “Which branch got the item?” “Is anyone about to send?”
- **Qualify / frame / objections:** First-inbox tutorial, not a comms SKU. Objection: it handles email — answer with: it routed one example; reply not on tape.
- **Procedure:** D steps 1–6. Checkable stops: (1) written buckets, (2) trigger, (3) brain connected, (4) item-count smoke, (5) no send.
- **Example that proves it:** Gmail message-received → text classifier errors without AI → connect → support = 1, other branches = 0. Lesson: wireframe first; show the missing-brain fail; item counts are the receipt.
- **Why it works:** A router needs named exits. A trigger makes it an inbox machine. A forced error teaches setup. Conditions: discrete buckets, one known example, human still owns reply. Exceptions: bucket-count caption mess; no eval set; Gmail/n8n on tape; title minutes **UNVERIFIED**.
- **Conditions / exceptions:** Cursor + Grok only. Gmail/n8n stay on tape. Clients parked. Communications = draft only.
- **Operate-never payload:** Auto-reply; Gmail as Lead Hunter; “30 minutes” as FACT; inbox-agent SKU; install n8n.
- **Hive run (existing skills only):** `agent-job-card` · `golden-test-loop` · `playbook-before-send` · `ask-principal` · `slice-build` (router only) · `context-docs` (wireframe as the judgment Gmail never captured).
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-reply / auto-send from a classifier
- Gmail + n8n inbox agent as hive OS
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- Quote “30 minutes” or any $ as FACT
- New `icp_id` / unpark Normand / inbox-agent hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not chat an inbox agent into send.

- **Done** on this slice: written buckets + inbound trigger + brain connected + item-count smoke. A replied email is not done and is not on tape.
- **Delegate without being asked:** Communications classifies/drafts only. HITL holds send. Watchdog records branch counts. Forge fails the slice if reply is wired. Librarian keeps the wireframe.
- **Skeptical review:** “First inbox agent in 30 minutes” is the title’s job. I will not approve a Gmail worker because one support example went right.
- **One system this take:** one router smoke. Not “handle the inbox.”
- Live hunt stays parked. I do not rotate to support-inbox because a classifier nodded.
