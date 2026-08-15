# Career Strategist — HN0oWxbF2bM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/HN0oWxbF2bM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/HN0oWxbF2bM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption ingest (~8953 words). Old take upgraded. Beginner n8n course: inbox agent that classifies/labels mail, then scales toward a “full inbox manager.” Beats in order: (1) wireframe before n8n (2) three tools: n8n (~$25/mo after 14-day trial), Gmail (Outlook possible, different clicks), Open Router (3) trigger = new Gmail (4) classifier on subject+body → four buckets: support, finance/billing, high priority, promotion (5) each branch is yours: label folder; optional AI **draft or reply** (6) he later prefers **create draft** + thread id so it does not go out; “we probably don’t want that to go out… make some tweaks” (7) his own inbox uses agents drafting/responding — still shows draft as the safe teaching path (8) long click-along (nodes, Open Router, labels). Visual-only: n8n canvas — unobserved. Gap: no miss-rate on the four labels; no production send policy written down.

## B. Atomic Knowledge

### Wireframe the states before you touch the canvas
- **Claim:** Trigger → classify → per-bucket actions. You are in control of what each category does. He will not start in n8n until the diagram exists.
- **Reasoning:** Same wireframe-first as `bxGE_LXPyAU`. Beginners skip this and then cannot debug.
- **Mechanism:** Four generic labels as a teaching set, not a universal taxonomy.
- **Evidence:** “You have to have all the steps of the process mapped out clearly before you actually start building.”
- **Conditions:** Mail is the process. Categories will be wrong for a real job inbox.
- **Exceptions:** Outlook clicks differ.
- **Action:** Gym a four-bucket map of Evens’s mail if useful. Do not build n8n.
- **Confidence:** high as a teaching order.
- **Source:** `HN0oWxbF2bM`
- **Epistemic:** SOURCE

### Draft is the career-safe default; send is a different product
- **Claim:** He names “draft or even just a reply,” then on the finance/high-priority path he switches to **create draft** because it should not go out. Drafts need a To: and thread id or they look wrong.
- **Reasoning:** Classifier errors × auto-reply = career incident. Labeling is cheap; sending is not.
- **Mechanism:** Gmail label + draft in thread; human sends.
- **Evidence:** “Let’s go ahead and send this back as a draft because we probably don’t want that to go out to someone.”
- **Conditions:** Gmail draft API behaves; he still says his live system may reply.
- **Exceptions:** His production inbox is not fully specified — do not copy “I auto-reply.”
- **Action:** Never auto-send. Hive HITL on email.
- **Confidence:** high for the teaching choice.
- **Source:** `HN0oWxbF2bM`
- **Epistemic:** SOURCE

## C. Mental Models
Inbox manager is a classifier plus a policy per bucket. Wireframe is the policy. Label ≠ reply. Draft is the HITL surface. $25 n8n is a vendor, not a skill.

## D. Procedures
His (do not run): trial n8n → Gmail trigger → Open Router classifier → four labels → draft in thread.  
Hive: if mail is a mess, write the four buckets on paper; Evens still sends.

Questions: What are the real buckets at work? Draft or send? Who is the To: on a draft?

Signals: “even just a reply.” Red: success message that is not “draft.”

## E. Examples
**Situation:** Support branch.  
**Action:** Label + optional agent reply.  
**Reasoning:** Teaching fork.  
**Outcome:** He later shows draft for the dangerous ones.  
**Lesson:** Default draft.

**Situation:** Draft without To:.  
**Action:** Looks wrong; he adds To: and deletes the bad draft.  
**Reasoning:** Draft API quirks.  
**Outcome:** Second draft works.  
**Lesson:** “Draft” still needs a human check.

## F. Decision Rules
- If it can email a stranger, it is a draft until Evens sends.
- If you have not drawn the buckets, do not open n8n.
- If the classifier is four generic labels, it is a tutorial, not a workplace policy.
- If n8n is $25/mo, that is a pay HITL — refuse as operator.

## G. Contrarian
Title is “full inbox agent.” The safe path on the tape is labels + drafts. Do not flatten to auto-reply. Later tapes graduate n8n (`35WuZxbAY68`) — keep labeled.

## H. Assumptions
**Theirs:** Four buckets cover a beginner inbox; Open Router is the model door; $25 is the price. **Ours:** n8n/Open Router/Gmail on-tape. Clients parked. Falsifier: work mail that cannot leave the corporate tenant.

## I. Questions
- What is his live miss-rate on “high priority”?
- How much of his real inbox is auto-reply vs draft?

## J. Connections
- SYSTEM SYNTHESIS → `bxGE_LXPyAU` (wireframe first).
- SYSTEM SYNTHESIS → `5p5cV0yVDvQ` (no-send).
- DISAGREEMENT keep labeled → n8n-first course vs n8n graduated.
- Stack Cursor + Grok. No n8n-cloud.

## K. Future-Use
Unassigned: four-bucket mail map as a personal-ops gym. Not an inbox agent deploy.

## Steal / Operate-never

### Machine: wireframe buckets → label → draft → human send
- **Epistemic:** SOURCE
- **Workflow / loop:** draw trigger + classes + per-class action → if action is email, stop at draft → Evens sends
- **Questions / signals:** Real buckets? Draft or reply?
- **Qualify / frame / objections:** Tutorial categories are not a workplace policy.
- **Procedure:** No n8n. No Open Router. No auto-reply.
- **Example that proves it:** Draft-not-send (B); To: miss (E).
- **Why it works:** Classifier error × send is the career incident (B/C).
- **Conditions / exceptions:** His live inbox may reply — do not copy that.
- **Operate-never payload:** n8n trial; auto-reply; quoting $25 as a plan; “full inbox manager” as a client SKU.
- **Hive run (existing skills only):** `ask-principal` · no-send
- **Source:** `HN0oWxbF2bM`

### Operate-never
- Send mail from a classifier.
- Install n8n / Open Router.
- Unpark clients.
- Auto-write `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
Employment covers baseline. Steal wireframe-plus-draft. Do not steal the n8n inbox agent or auto-reply. Clients parked. Old steal-note upgraded to A–L.
