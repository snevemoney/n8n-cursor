# Creative Studio — ZwQ8rJhVCr4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Four RAG methods short. Beats: inaccurate answers → this video; four examples: filters, SQL, full context, vector DB. (1) Filters: “how many Bluetooth speakers on September 16th?” → product-name filter + date filter → five. (2) SQL on Postgres/Supabase sales, 50 rows: “three highest earning products” → AI automation course 34.93, consulting call 33383, workflow template 1659 + % of revenue. (3) Full context: two docs, do not chunk; agent reads the whole thing; “chronological breakdown of the agent in 2 hours video” → hook, stack, personal context, lead gen, sales, in order; 4,000 tokens of GPT-5 Mini’s 400,000 window. (4) Same two docs in Supabase vectors: same question is faster/cheaper but **not as accurate** because it does not understand order. Play-button magnet. Numbers UNVERIFIED.

## B. Atomic Knowledge

### Method follows the question
- **Claim:** Count/filter questions use filters or SQL; order/story questions need full context; chunk RAG is cheaper and loses order.
- **Reasoning:** He shows the same chronological ask failing on vectors.
- **Evidence:** “it's faster and cheaper, but… it's not as accurate because it doesn't understand order right now.”
- **Conditions:** The question cares about sequence.
- **Exceptions:** A lookup (“shipping policy”) can be chunk (`Fu6vOfzFmcw`).
- **Action:** Pick the method from the question type, not from “we have a vector DB.”
- **Confidence:** SOURCE as his contrast.
- **Source:** `ZwQ8rJhVCr4` @ 01:32
- **Epistemic:** SOURCE

### Full context is still cheap on a big window
- **Claim:** Whole-doc read used 4k / 400k tokens — his argument that “always chunk” is a habit, not a need.
- **Evidence:** “this only took 4,000 tokens out of GBT5 Mini's 400,000 context window limit.”
- **Conditions:** Docs fit.
- **Exceptions:** Millions of docs (wiki tapes). Token counts UNVERIFIED.
- **Action:** If it fits, prefer order-true full read for chronology.
- **Confidence:** SOURCE as demo math.
- **Source:** `ZwQ8rJhVCr4` @ 01:32
- **Epistemic:** SOURCE

## C. Mental Models
Four doors, one agent family. Spreadsheet filters are RAG. SQL can add percentages he did not ask for (he likes that). Chunking is a known accuracy tax on order.

## D. Procedures
1. Classify the ask: count, rank, chronology, lookup.
2. Filters / SQL / full read / vectors.
3. For chronology, prefer full read.
4. Checkable stop: the number or the ordered outline.

Avoid: defaulting to vectors; quoting 34.93 / 33383 as FACT.

## E. Examples
**Situation:** Bluetooth speakers on a date.  
**Action:** Two filters → five.  
**Lesson:** Structured data is not a vector problem.

**Situation:** Chronology of a video transcript.  
**Action:** Full read → ordered outline; vector same ask → cheaper, wrong order.  
**Lesson:** Order questions fail chunk RAG.

## F. Decision Rules
- If the answer is a count on a table → filter/SQL.
- If the answer is a sequence → full context.
- If you only have vectors → warn about order.

## G. Contrarian
Rejects “RAG = vector DB.” Three of four methods are not embeddings.

## H. Assumptions
Demo DBs (20 vs 50 rows). Revenue figures look internally inconsistent (34.93 vs 33383) — keep UNVERIFIED / possible ASR. GPT-5 Mini window UNVERIFIED.

## I. Questions
ASR on 34.93 / 33383? Visual tables? Full methods long?

## J. Connections
- SYSTEM SYNTHESIS → `Fu6vOfzFmcw`, `kOKavHnlPik`, `QojPKL96Dx4`.
- SYSTEM SYNTHESIS → wiki vs RAG (`sboNwYmH3AY` in 18-corpus).

## K. Future-Use
Question-type → method card. Unassigned.

## Steal / Operate-never

### Machine: question-type then retrieval-door
- **Epistemic:** SOURCE
- **Workflow / loop:** classify ask → pick filter/SQL/full/vector → run → check number or order → stop
- **Questions / signals:** Count, rank, sequence, or lookup?
- **Qualify / frame / objections:** “We have vectors” is not a reason
- **Procedure:** Chronology → full read if it fits
- **Example that proves it:** Date+product = 5; chronology full-read vs cheap wrong-order vectors
- **Why it works:** The door matches the shape of the truth
- **Conditions / exceptions:** Tiny demo DBs; token % UNVERIFIED
- **Operate-never payload:** Quote revenue rows as FACT; Supabase as hive SKU
- **Hive run:** `info-gain-cite`; `golden-test-loop`
- **Source:** `ZwQ8rJhVCr4` @ 01:32

### Operate-never
- Default-everything-to-vectors. Quote demo $ as FACT.
- Switch stack. New hunt. Merge `LESSONS-FROM-TAPE.md`.
- Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: four-door diagram is the plate — **filters / SQL / full / vector**, not a glowing brain. HITL. Clients parked.
