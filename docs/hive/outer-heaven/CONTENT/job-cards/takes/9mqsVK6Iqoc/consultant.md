# Consultant — 9mqsVK6Iqoc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Inbox-agent teaser. Beats: must start with a trigger → add Gmail → UI offers triggers because the canvas is empty → on message received. Next per wireframe: text classifier on subject+body into four categories. Execute fails because no AI connected → connect AI → rerun → lands in customer support; finance/billing/high priority/promotion have zero items. CTA to the long. No VTT. UNKNOWN. ~327 words.

## B. Atomic Knowledge

### Empty canvas forces a trigger first
- **Claim:** n8n knows there is nothing on the workflow yet, so it pushes a trigger (Gmail on message received).
- **Reasoning:** A classifier with no trigger is a brain with no ear.
- **Mechanism:** Add Gmail → pick message-received → then classify.
- **Evidence:** “it knows that there's nothing else on our workflow yet and it has to start with a trigger.”
- **Conditions:** New workflow. Gmail as the source.
- **Exceptions:** Other inboxes exist; this demo is Gmail.
- **Action:** Name the trigger before the model.
- **Confidence:** high
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN — “it has to start with a trigger”
- **Epistemic:** SOURCE
### Wireframe categories before the node
- **Claim:** He already has a wireframe: four categories; the classifier must send the email down one path.
- **Reasoning:** The branches are designed before the model is attached.
- **Mechanism:** Subject+body → text classifier → one of: customer support / finance / billing / high priority / promotion (he names four then shows five buckets on run).
- **Evidence:** Customer-support example run; other branches empty.
- **Conditions:** You have example mail and named buckets.
- **Exceptions:** He says “four categories” then the run shows five labels — tape inconsistency.
- **Action:** Write the buckets first. Do not invent them after a demo email.
- **Confidence:** high for wireframe-first; medium on the count
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN — “classify it in one of these four categories”
- **Epistemic:** SOURCE
### Classifier without a model errors
- **Claim:** Execute step fails until an AI model is connected to the text classifier; then the same email routes to customer support.
- **Reasoning:** The node is not magic; it needs a brain attached.
- **Mechanism:** Add classifier → fail → attach model → rerun → branch has one item.
- **Evidence:** On-tape error then success.
- **Conditions:** n8n text classifier node.
- **Exceptions:** Success on one email ≠ eval (`8IUWeF3B-hk`).
- **Action:** Treat the first green run as a smoke test, not a sell.
- **Confidence:** high
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN — “we get an error… we need to connect AI to this node”
- **Epistemic:** SOURCE


## C. Mental Models

He teaches from a wireframe, not from wandering the node list. He is comfortable failing on camera. He treats routing as the product (right path), not a reply. The long (`HN0oWxbF2bM`) is the course.

## D. Procedures

1. Draw buckets. 2. Add inbox trigger. 3. Add classifier on subject+body. 4. Attach a model. 5. Smoke one example. 6. Look which branch fired. Avoid: auto-reply from this teaser. Avoid: calling it done after one email.

## E. Examples

**Situation:** Customer-support example email. **Action:** Gmail trigger → text classifier; first execute errors; after model, item goes to customer support. **Outcome:** Other branches empty. **Lesson:** Right-path is the check. Implicit rule: wireframe before nodes.

## F. Decision Rules

If there is no trigger, stop. If buckets are unnamed, stop. If only one email has been tried, you have a smoke test, not an inbox agent. If the next node would send, that is a different (HITL) product.

## G. Contrarian

Field default: start with the agent node. He starts with Gmail received. Field default: hide the error. He shows it.

## H. Assumptions

Four vs five categories inconsistent on tape. One email. No send. Gmail vendor. Long course is the real procedure.

## I. Questions

What are the exact bucket definitions? Who handles each branch? Is high-priority orthogonal to the others?

## J. Connections

**SYSTEM SYNTHESIS:** Long `HN0oWxbF2bM`. Eval sibling `8IUWeF3B-hk`. Maps to `inbox-to-task-routing` (route, do not auto-send).

## K. Future-Use

Unassigned: wireframe-before-nodes as a consultant scope artifact; four-bucket toddler diagram.

## Steal / Operate-never

### Machine: Wireframe buckets → inbox trigger → classifier smoke test
- **Epistemic:** SOURCE
- **Workflow / loop:** Name buckets → Gmail (or inbox) on-received → text classifier on subject+body → attach model → run one example → see which branch got the item
- **Questions / signals:** What are the buckets in toddler words? Did a branch fire? Have we scored more than one email?
- **Qualify / frame / objections:** Qualify: they have an inbox leak (wrong person touches mail). Frame: route, not reply. Objection: “just have AI answer” — not on this teaser.
- **Procedure:** Draw the wireframe first. Show the error if the model is missing. Do not send.
- **Example that proves it:** Support example → customer-support branch = 1 item; other branches 0.
- **Why it works:** Routing is checkable (which pile). Replies are a harder, uglier product.
- **Conditions / exceptions:** One email. Bucket count inconsistent. No send.
- **Operate-never payload:** Auto-reply. Install Gmail-send. Call one green run a sold inbox agent.
- **Hive run (existing skills only):** `inbox-to-task-routing` · `golden-test-loop` · `send-removed` · `ask-principal`
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN


### Operate-never
- Auto-reply or auto-send from a classifier.
- Sell “inbox agent” on one smoke-test email.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “build your first inbox agent.” Felt problem is whose inbox, which pile is wrong — if a named owner said it. Do not install Gmail→classifier on a parked Path A.

**Four-blank after constraint:** Toddler stop = a named bucket received the example. Send stays off.

**Skeptical-customer:** Error-then-success is honest. “First inbox agent” is the smash. Clients parked.
