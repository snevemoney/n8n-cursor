# Career Strategist — ZwQ8rJhVCr4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (2:59, 641 words). Four RAG-ish methods. Beats: (1) if answers are inaccurate, watch this (2) methods: filters, SQL, full context, vector DB (3) **filters:** “how many Bluetooth speakers sold Sep 16” → product-name filter then date filter → five speakers (4) **SQL:** Postgres/Supabase sales, 50 rows; “three highest earning products” → sums revenue; on-tape figures AI course 34.93, consulting 33383, template 1659 + percentages (UNVERIFIED demo numbers) (5) **full context:** two docs; do not chunk; agent reads the whole thing; chronological breakdown of “agent in 2 hours” video — hook, stack, personal context, lead gen, sales; 4,000 tokens of GPT-5 mini’s 400,000 window (UNVERIFIED) (6) **vector:** same two docs in Supabase; same chronology question is faster/cheaper and **less accurate because it does not understand order** (7) CTA.

## B. Atomic Knowledge

### Pick retrieval by the question type
- **Claim:** Structured counts use filters or SQL; narrative order needs full document; chunk vectors are cheaper/faster and lose order.
- **Reasoning:** He shows the same *kind* of failure people blame on “the agent.”
- **Mechanism:** four parallel examples.
- **Evidence:** vector run is “not as accurate because it doesn’t understand order right now.” @ UNKNOWN
- **Conditions:** You know whether the question is count, aggregate, chronology, or fuzzy lookup.
- **Exceptions:** Hybrid not built here.
- **Action:** Match method to question before tuning prompts.
- **Confidence:** high as his teaching point.
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE

### Full-context is affordable on a long window
- **Claim:** Whole-doc read of two transcripts used ~4k tokens vs a 400k window.
- **Reasoning:** Chunking is not mandatory when the corpus is small.
- **Mechanism:** attach full docs every turn.
- **Evidence:** “this only took 4,000 tokens out of GBT5 Mini’s 400,000 context window limit.” @ UNKNOWN
- **Conditions:** Small corpus; large window.
- **Exceptions:** Millions of docs (Nate wiki tape said markdown+index wins until then).
- **Action:** If the file fits, prefer order-true read for chronology.
- **Confidence:** numbers UNVERIFIED; logic clear.
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Inaccuracy is often method mismatch. SQL/filters are agents too. Cheap/fast is a trade, not a free lunch. Token windows change the default.

## D. Procedures
If count-in-table → filter or SQL.  
If “in order / whole story” → full context.  
If fuzzy fact in a big pile → vector, then expect order loss.  
Validate structured answers against the sheet (he points at the rows).

## E. Examples
**Situation:** Bluetooth speakers on Sep 16.  
**Action:** Two filters; answer five.  
**Reasoning:** Exact field match.  
**Outcome:** Number returned.  
**Lesson:** Do not embed a sales table to count rows.

**Situation:** Chronology of a video transcript.  
**Action:** Full read vs vector.  
**Reasoning:** Order lives in the whole file.  
**Outcome:** Full read structured; vector cheaper and worse on order.  
**Lesson:** Same question, two machines.

## F. Decision Rules
- If the answer is a count, do not RAG it.
- If the answer is a sequence, do not chunk-first.
- If you need cheap, accept order loss or change the question.

## G. Contrarian
Rejects “just put it in a vector DB” as the default brain.

## H. Assumptions
**Theirs:** Demo DBs (20 vs 50 rows), revenue figures, 4k/400k. **Ours:** UNVERIFIED. Falsifier: a chronology that chunking still gets right with better metadata.

## I. Questions
- How does he combine SQL + docs in one agent?
- Metadata for order in vectors?

## J. Connections
- SYSTEM SYNTHESIS → `kOKavHnlPik` / `QojPKL96Dx4` (RAG longs).
- SYSTEM SYNTHESIS → `sboNwYmH3AY` (wiki vs vector at scale).
- SYSTEM SYNTHESIS → `context-docs`.

## K. Future-Use
Unassigned: four-method chooser card for Researcher + this desk when reading an offer vs a corpus.

## Steal / Operate-never

### Machine: question-type → retrieval method
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** classify the question (count / aggregate / sequence / fuzzy) → pick filter, SQL, full-read, or vector → check against a known row or known order → stop
- **Questions / signals:** Does order matter? Is the source a table?
- **Qualify / frame / objections:** “Just RAG it” is a miss if they asked “how many” or “in order.”
- **Procedure:** Four methods as in D.
- **Example that proves it:** Chronology cheaper-and-wrong on vectors (E).
- **Why it works:** Failure modes differ by store (B/C).
- **Conditions / exceptions:** Small demo DBs. Employment docs: offer letters are full-read, not chunk trivia.
- **Operate-never payload:** Quote demo revenue as FACT; auto-answer customers; quit-job.
- **Hive run:** `context-docs` · `golden-test-loop` · `info-gain-cite`
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN

### Operate-never
- Quote on-tape revenue / token limits as FACT.
- Customer auto-answer. Employment send. Quit-job. Unpark clients.
- Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: salary/offer tables are SQL-or-full-read, not a vibe RAG. Story-of-the-year in gym is full-context from the vault, not a random chunk. Clients parked.
