# Product GTM — ZwQ8rJhVCr4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (title: “4 Simple RAG Methods for Better AI Agents” 2:59). Beats: (1) if answers are inaccurate, watch; four methods: filters, SQL, full context, vector DB; (2) filters: “how many Bluetooth speakers sold Sep 16” → product-name filter then date filter → five; (3) SQL agent: Postgres/Supabase sales, 50 rows vs 20; “three highest earning products” → AI automation course 34.93, consulting call 33383, workflow template 1659 + % of revenue; (4) full context: two docs, do not chunk — agent reads the entire document every time; chronological breakdown of “agent in 2 hours” video (hook, stack, personal context, lead gen, sales moment) because it read the whole thing; 4,000 tokens of GPT-5 Mini’s 400,000 window; (5) same two docs in Supabase vectors; same chronological question — faster/cheaper but not as accurate, does not understand order. Timestamp UNKNOWN. Long: `kOKavHnlPik` / `QojPKL96Dx4`. **Counts / tokens / $ UNVERIFIED.**

## B. Atomic Knowledge
### Method must match the question (filter / SQL / whole-doc / chunk)
- **Claim:** Four retrieval shapes: structured filters, SQL over a table, whole-document context, vector chunks — pick by the job.
- **Reasoning:** Same “chronological breakdown” question exposes vector’s order-blindness vs full-read.
- **Mechanism:** Filters for exact SKU+date; SQL for top-N revenue; full read for order; vectors for cheap/fast.
- **Evidence:** 5 speakers; three products + %; token 4k/400k; vector “not as accurate… doesn’t understand order.”
- **Conditions:** Small tables / two transcripts that fit.
- **Exceptions:** He still shows vectors as the last method (cheaper/faster).
- **Action:** Steal match-method-to-question. Do not productize a vector pipeline.
- **Confidence:** high as his compare.
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Inaccuracy is often the wrong retrieval, not a dumber model. Order questions hate chunks. Token windows make full-read cheap on short docs. His sample “revenue” is course/consult/template — not hive FACT.

## D. Procedures
1. If the question is a counted filter (SKU + date) → filter rows.
2. If it is an aggregate (top N by revenue) → SQL.
3. If it needs order/chronology → read the whole doc (if it fits).
4. If you need cheap/fast and can lose order → vectors — and say so.
- Avoid: defaulting to vectors for a timeline.

## E. Examples
**Situation:** Bluetooth speakers on Sep 16. **Action:** Two filters. **Outcome:** Five. **Lesson:** Structured beat RAG.

**Situation:** Chronology of a sold-agent video. **Action:** Full read vs vectors. **Outcome:** Full read keeps order; vectors cheaper/wrong order. **Lesson:** Cheap is not the offer if order is the job.

## F. Decision Rules
- If the user asks “in order” → do not chunk.
- If the table is sales facts → SQL/filter, not embeddings.
- Refuse: “4 RAG methods” SKU; quote 34.93 / 33383 as FACT.

## G. Contrarian
Against “just throw it in a vector DB” (he says we all know what happens). Against one RAG religion.

## H. Assumptions
Theirs: 20–50 rows and two transcripts represent production. Ours: wiki/index may already be the full-context analog. Falsifier: a doc that does not fit the window.

## I. Questions
What are the exact four when the long expands? Filter vs SQL overlap?

## J. Connections
**SYSTEM SYNTHESIS:** Longs `kOKavHnlPik`, `QojPKL96Dx4`. Maps to `golden-test-loop` (right method = checkable). Karpathy wiki: raw in, not vector-first.

## K. Future-Use
Unassigned: 4k/400k as a “full-read is fine” heuristic. Keep; UNVERIFIED.

## Steal / Operate-never

### Machine: pick retrieval by question type (filter / SQL / whole / chunk)
- **Epistemic:** SOURCE
- **Workflow / loop:** classify the question (count, aggregate, chronology, fuzzy) → pick method → run → if chronology failed, switch off vectors
- **Questions / signals:** Do we need order? Is it in a table?
- **Qualify / frame / objections:** “We have RAG” is not an answer
- **Procedure:** Do not default to embeddings
- **Example that proves it:** Sep 16 speakers=5; chronology dies on vectors
- **Why it works:** Method/job match; cheap/fast is an exception with a known miss
- **Conditions / exceptions:** Small demo data. Vendor GPT/Supabase
- **Operate-never payload:** RAG-methods course; 10x vector SKU
- **Hive run (existing skills only):** `golden-test-loop`
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN

### Operate-never
- Productize the four-method pack
- Quote table $ as FACT
- Switch stack; new hunt; merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Do not sell RAG. If a walkthrough answers “in order,” full-read (or a wiki) beats a chunk still. Clients parked.
