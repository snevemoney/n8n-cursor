# Career Strategist — kOKavHnlPik
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption ingest (~4209 words). Four RAG methods in n8n. Beats: (1) people jump to vectors first (2) chunk search loses doc/order; YouTube summary ≠ whole video (3) tabular: “highest sales” returns the high *in the chunk*, misses weeks 4/14/19 (4) methods: filter, SQL, full context, vector (5) SQL for totals/averages/rankings/many rows (6) full transcript chrono vs vector: vector cheaper (~2600 vs ~2×) and **wrong order** (7) context engineering five: end in mind, pipeline, accuracy, windows, specialization. Token counts UNVERIFIED.

## B. Atomic Knowledge

### Pick retrieval from the question, not from “I need a vector DB”
- **Claim:** The question type picks the method. Totals need SQL/full table. Chronology needs order or full text. Vectors are cheap summaries of chunks.
- **Reasoning:** Same hoop-before-ball (`DTCyvo6cC54`).
- **Mechanism:** What will they ask → what must it see → then pick filter/SQL/full/vector.
- **Evidence:** “they immediately run straight to a vector database… there’s tons of problems with that.”
- **Conditions:** You can name the question class.
- **Exceptions:** Metadata can patch some vector holes (he defers).
- **Action:** No n8n RAG shop. Do steal question→method.
- **Confidence:** high.
- **Source:** `kOKavHnlPik`
- **Epistemic:** SOURCE

## C. Mental Models
Chunk ≠ document. Highest-in-chunk. SQL for math. Full context for order. Cheap-wrong vs expensive-right.

## D. Procedures
Write the question first. If it is a total/average, do not vector. If it is a whole-doc summary, do not chunk-only.

Questions: Math or meaning? Order matter? What would a missed row do?

## E. Examples
**Situation:** Highest sales week.  
**Action:** Vector returns a chunk; week 6 wins inside it.  
**Reasoning:** Other weeks were higher off-chunk.  
**Outcome:** Wrong.  
**Lesson:** Tabular + vectors is a trap.

## F. Decision Rules
- If the answer is a number over all rows, use SQL/full.
- If you only needed four chunks, you did not summarize the video.

## G. Contrarian
Title: RAG becomes easy. Body: vectors are the default people should *not* start with.

## H. Assumptions
**Theirs:** 2600 tokens; week numbers. **Ours:** UNVERIFIED as a general law. n8n/Supabase on-tape.

## I. Questions
- What are the other two of the four besides SQL and vector in the live graph?

## J. Connections
- SYSTEM SYNTHESIS → `QojPKL96Dx4` / `DTCyvo6cC54`.
- Stack Cursor + Grok.

## K. Future-Use
Unassigned: question-picks-retrieval. Not a four-RAG n8n kit.

## Steal / Operate-never

### Machine: question class → retrieval; vectors last
- **Epistemic:** SOURCE
- **Workflow / loop:** write the Q → math/order/meaning? → SQL/full/filter/vector
- **Questions / signals:** Highest-in-chunk risk?
- **Qualify / frame / objections:** Easy is a title.
- **Procedure:** No n8n vector default.
- **Example that proves it:** Sales week (E).
- **Why it works:** Chunks drop rows (B).
- **Operate-never payload:** Vectorizing the finance sheet.
- **Hive run:** none
- **Source:** `kOKavHnlPik`

### Operate-never
- Default every agent to a vector DB.
- Auto-write `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
Employment covers baseline. Steal question→retrieval. Do not steal the n8n RAG kit. Clients parked.
