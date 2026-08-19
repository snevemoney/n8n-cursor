# Day Planner — ZwQ8rJhVCr4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short: four RAG methods. Beats: filters (Bluetooth speakers sold Sept 16 → product-name then date filter → five); SQL agent on Postgres/Supabase sales (50 rows vs 20) — top three products by revenue (AI automation course 34.93 / consulting 33383 / workflow template 1659 + % — UNVERIFIED); full-context (read whole docs every time, not chunks) — chronological breakdown of “agent in 2 hours,” 4,000 / 400,000 tokens on GPT-5 Mini; vector search on the same two transcripts — faster/cheaper, worse on order. CTA to full (`kOKavHnlPik`). Timestamp UNKNOWN.

## B. Atomic Knowledge
### Pick the method by the question shape
- **Claim:** Filters, SQL, full-context, and vectors are different machines, not one “RAG.”
- **Reasoning:** A count-on-a-date is a filter; top-by-revenue is SQL; order-in-a-doc is full-context; cheap lookup is vectors.
- **Mechanism:** Four example workflows on one canvas.
- **Evidence:** “filters… SQL query… full context… vector database.”
- **Conditions:** You can name the question type.
- **Exceptions:** Vectors lose chronology (he shows it).
- **Action:** Name the question type before the block. Do not default to vectors.
- **Confidence:** high as the teaching.
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE

### Full-context vs vector is a cost/accuracy trade
- **Claim:** Same two docs: full-context keeps order (4k tokens); vectors are faster/cheaper and miss order.
- **Reasoning:** Chunks do not know sequence.
- **Mechanism:** Same Q twice, compare.
- **Evidence:** “not as accurate because it doesn’t understand order right now.”
- **Conditions:** The Q needs chronology.
- **Exceptions:** A fact-lookup Q may prefer vectors.
- **Action:** If order matters → full-context (or another ordered method). Token counts UNVERIFIED.
- **Confidence:** high as his contrast.
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Method follows question. He is willing to spend context to keep order. Priority: show all four, then CTA. Numbers on the SQL demo are props. Uncertainty: 34.93 vs 33383 looks like a caption glitch — UNVERIFIED.

## D. Procedures
1. Write the question.
2. Classify: filter / SQL / whole-doc / vector.
3. Run one method.
4. If order is wrong, do not “add more vectors” — change method.
Avoid: Supabase as SKU; quoting revenue rows as FACT.

## E. Examples
**Sept 16 Bluetooth count:** Situation → sales table. Action → filter product then date. Reasoning → exact rows. Outcome → five. Lesson → filter, not RAG.

**Chronology vs vectors:** Situation → same two transcripts. Action → full-context then vector, same Q. Reasoning → order vs cheap. Outcome → vector faster, order-blind. Lesson → steal the contrast.

## F. Decision Rules
- If the Q is a count/filter → no vector block.
- If the Q needs order → no chunk-only block.
- If a number looks broken (34.93 vs 33383) → UNVERIFIED.

## G. Contrarian
Rejects “everything in a vector DB.” Field assumption: RAG = embeddings. He starts with filters/SQL/full-context.

## H. Assumptions
Theirs: 4k/400k and the SQL totals are right. Ours: UNVERIFIED; caption may have dropped digits. Falsifier: a chronology Q that vectors nail. Survivorship: four happy demos.

## I. Questions
Full `kOKavHnlPik`? When does he combine methods? Is 34.93 a missing digit?

## J. Connections
- SYSTEM SYNTHESIS → `kOKavHnlPik` · `Fu6vOfzFmcw` · `4OOS96i2gfI` (agents overused) · `golden-test-loop`.

## K. Future-Use
Question-shape → method as a planning rule. Unassigned.

## Steal / Operate-never

### Machine: question-shape → method (filter/SQL/full-context/vector)
- **Epistemic:** SOURCE
- **Workflow / loop:** write the Q → pick method → run → if order/count is wrong, change method not “more chunks”
- **Questions / signals:** Is this a count, a rank, a chronology, or a lookup?
- **Qualify / frame / objections:** “Just RAG it” is the fail.
- **Procedure:** One method per Q. No new vector vendor.
- **Example that proves it:** Situation → chronology of a video. Action → full-context vs vectors. Reasoning → order lives in the whole doc. Outcome → vectors cheaper, order-blind. Lesson → steal the fork.
- **Why it works:** Wrong method looks fluent and is still wrong.
- **Conditions / exceptions:** Token budget may force vectors — then do not ask chronology.
- **Operate-never payload:** Quote tape revenue/$ as FACT; Supabase SKU; n8n-cloud.
- **Hive run (existing skills only):** `golden-test-loop`.
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN

### Operate-never
- Default every Q to vectors.
- Quote 5 / 4k / 400k / revenue rows as FACT.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as question-shape→method. Clients parked.
