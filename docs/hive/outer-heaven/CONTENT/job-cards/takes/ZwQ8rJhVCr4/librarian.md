# Librarian — ZwQ8rJhVCr4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** 4 Simple RAG Methods for Better AI Agents
**Channel:** Nate Herk | AI Automation
**Kind:** short (~2:59 / ~641 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. If agents aren't accurate, watch: four methods — filters, SQL, full context, vector DB.
2. Filters: "How many Bluetooth speakers sold on September 16th?" → product-name filter then date filter → five speakers.
3. SQL: sales in Postgres/Supabase, 50 rows vs 20; "three highest earning products" → AI automation course 34.93, consulting 33383, workflow template 1659 + % of revenue.
4. Full context: two documents; instead of chunk/vector, agent reads the entire document every time; chronological breakdown of "agent in 2 hours" video — hook, stack, personal context, lead gen, sales — in order; 4,000 tokens of GPT-5 Mini's 400,000 window.
5. Vector: same two docs in Supabase; same chronological question — faster/cheaper, less accurate, "doesn't understand order right now."
6. CTA: full breakdown.
Gap: when to pick which. Timestamp UNKNOWN. Supabase / GPT-5 Mini. Counts/$ UNVERIFIED.

## B. Atomic Knowledge

### Four retrieval methods, not one RAG religion
- **Claim:** Accuracy problems get filters, SQL, full-context, or vectors — not only vectors.
- **Reasoning:** He shows a structured count, a SQL top-N, a whole-doc chronology, then vector as cheaper/worse on order.
- **Evidence:** "filters" / "SQL query" / "full context" / "vector database"
- **Conditions:** Tabular vs document questions
- **Exceptions:** None on tape
- **Action:** File method-menu; park Supabase
- **Confidence:** high as his menu
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE

### Full context keeps order; vector is cheaper and loses order
- **Claim:** Whole-doc read preserved chronology; vector same question was faster/cheaper and not as accurate on order.
- **Evidence:** "it read the whole thing" / "not as accurate because it doesn't understand order right now"
- **Action:** File order-vs-cheap; 4k/400k UNVERIFIED as our limits
- **Confidence:** high as his comparison
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
"We all know what could happen" with chunking. Token window makes full-context cheap enough on this demo. Filters/SQL are RAG too. Numbers on tape are demo receipts, not hive FACT.

## D. Procedures
1. If the question is a count/filter on rows → filter or SQL, not vectors.
2. If order/chronology matters and the doc fits the window → full context.
3. If you choose vectors → expect order loss; measure it.
Avoid: hive Supabase. Signals: 5 speakers; three products; 4k/400k; order fail on vector.

## E. Examples
**Chronology A/B:** Situation — two transcripts. Action — full-context chronological breakdown vs same question on vectors. Reasoning — chunking loses order. Outcome — full-context in order; vector faster/cheaper/wrong order. Lesson — pick the method for the question.

## F. Decision Rules
- If the question is tabular → do not start in a vector store (this tape).
- If chronology matters → full context until it does not fit.
- If you only optimize cheap/fast → you may lose order.
- Refuse: Supabase as hive; quote 34.93/33383 as FACT revenue.

## G. Contrarian
Against vector-first RAG. Against chunking every document.

## H. Assumptions
Theirs: 400k window makes full-context free enough. Ours: teaser of `kOKavHnlPik`. Demo numbers UNVERIFIED. Do not flatten with "vectors are always worse."

## I. Questions
When does he switch to vectors besides cheap/fast? Long-tape decision tree?

## J. Connections
SYSTEM SYNTHESIS → `kOKavHnlPik`; `Fu6vOfzFmcw`; `QojPKL96Dx4`; `wiki-ingest` (whole page vs chunk).

## K. Future-Use
Method-menu + order-vs-cheap as atoms. Unassigned: hive wiki is full-context by default.

## Steal / Operate-never

### Machine: pick filter/SQL/full-context/vector by the question
- **Epistemic:** SOURCE
- **Workflow / loop:** classify the question (count / aggregate / chronology / similarity) → pick method → run → checkable stop = count matches rows OR chronology in order OR you accepted cheap/order-loss
- **Questions / signals:** Is it a row filter? Does order matter? Did vector scramble sequence?
- **Qualify / frame / objections:** "Accurate answers" is the hook
- **Procedure:** filters → SQL → full context → vector last on this short
- **Example that proves it:** Bluetooth 9/16 = 5; top-3 SQL; full-context chronology vs vector order-fail
- **Why it works:** method matches question shape
- **Conditions / exceptions:** small tables/docs on tape
- **Operate-never payload:** Supabase as hive; demo $ as FACT
- **Hive run:** `wiki-ingest` · `golden-test-loop`
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN

### Operate-never
- Supabase as hive RAG. Quote demo revenue as FACT. Vector-only religion.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File the four-method menu and order-vs-cheap. Outer Heaven pages are full-context; do not chunk the wiki into a theater graph.
