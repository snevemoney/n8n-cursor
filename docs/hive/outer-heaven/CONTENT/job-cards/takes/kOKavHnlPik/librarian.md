# Librarian — kOKavHnlPik
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Once You Know This, Building RAG Agents Becomes Easy in n8n
**Channel:** Nate Herk | AI Automation
**Kind:** video (~4209 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. “Agent is wrong” → too many levers; start from the **end question** and what it must look at. Four retrieve methods. People jump to **vectors** first; he says that is often the mistake.
2. Chunk RAG: cheap/fast search, loses whole-doc context (no video/URL/timestamp unless metadata). Tabular fail: “highest sales week” / AOV — the model averages **the chunk**, misses weeks 4/14/19 (his board).
3. **Filters** (n8n Data Table, 20 sales rows): “Bluetooth speakers on Sept 16?” → product-name tool + date tool + calculator = **5** (1+4). Use when tabular, known fields, small subset. Human-filter rule. Enum product names + date format in the prompt (equality, not semantic). Schema-lookup tool can make SQL more dynamic (mentioned, not demoed).
4. **SQL** (Postgres/Supabase, 50 rows): “three highest-earning products?” → GROUP BY / ORDER / LIMIT 3. Pivot-chart check: AI automation course 34.93, consulting 33,383, workflow template 1,659 (UNVERIFIED). Calculator used for **percentages** (~80% of revenue). Use when totals/averages/rankings/trends, many rows, combine/compare. Human-pivot rule. Still cheaper/more accurate than vectors on structured data.
5. **Full context:** two YT transcripts (~4–5 pages). Chronological breakdown of “agent in 2 hours.” Tool-pick one doc = **4k** tokens / 400k window (GPT-5 Mini). Both jammed in the prompt = **6,577**, faster (no tool) but always paid. Dynamic vars = same cost, easier to swap sources. Use for summaries/timelines/order-matters / small enough to fit. Agentic Arena: jammed PDFs under time pressure. Human-would-read-the-whole-doc rule (onboarding vs one FAQ).
6. **Vectors** (same two docs in Supabase): same chrono Q — faster/cheaper (**2,600** tokens) but order is guessed; raising chunk limit (4→20) helps. Gap vs full-context **explodes** as the corpus grows.
7. Context-engineering five: end in mind, pipeline, accuracy, window, specialization. Plus 3,000 / courses (UNVERIFIED). Skool template.
Gap: whiteboard, SQL UI. Timestamp UNKNOWN. n8n/Supabase/Plus on-tape.

## B. Atomic Knowledge

### Pick retrieve by the human move, not by “RAG”
- **Claim:** Filter if a human would filter a sheet; SQL if a human would pivot; full-doc if a human would read it; vectors if a human would grab one FAQ. Vectors first is the common miss — especially on tables.
- **Reasoning:** Chunks drop order and miss out-of-chunk maxima. Tokens and hallucination rise when you dump the table.
- **Mechanism:** Enum+filter tools; SQL does the math; full-doc as tool or prompt; vectors for needle-in-haystack.
- **Evidence:** 5 speakers; top-3 SQL vs pivot; 4k vs 6577 vs 2600 tokens; chunk-AOV fail.
- **Conditions:** Tiny tables; earnings/token numbers UNVERIFIED as general law.
- **Exceptions:** Schema-lookup can loosen SQL enums (not shown).
- **Action:** File the four-way rule. Do not install n8n/Pinecone/Supabase as hive. Do not flatten “vectors always cheaper.”
- **Confidence:** high as a retrieve-routing machine
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** SQL still used calculator for %
- **Speech ≠ behavior:** “won’t need calculator” vs four calculator calls

## C. Mental Models
Begin with the question. Limit what enters the window. Equality filters need enums. Order wants the whole doc.

## D. Procedures
1. Write the question and the human move it implies.
2. Structured + known fields → filter + calculator.
3. Aggregations → SQL.
4. Order/summary on a small doc → full context (tool-pick if one of many).
5. One FAQ in a large pile → vectors; raise `k` if order is weak.
Avoid: vector-first on sales tables; n8n-cloud; Plus 3000 as FACT.

## E. Examples
**Sept 16 speakers:** Situation — 20-row table. Action — two filters + add. Outcome — 5. Lesson — human-filter.

**Chrono breakdown:** Situation — same Q three ways. Action — full-doc vs jammed prompt vs vectors. Outcome — 4k / 6577 / 2600; vectors lose order. Lesson — cheap ≠ right.

## F. Decision Rules
- IF the answer can hide in another chunk → do not vector a table.
- IF order matters and the doc fits → full context.
- IF you add a product name → update the enum.
- Refuse: n8n as hive; 3000 as FACT.

## G. Contrarian
Against vector-default RAG. Against “just dump the sheet into the prompt” when filters exist.

## H. Assumptions
Complements `QojPKL96Dx4` / `QCjMBOEhpLE`. Caption-only.

## I. Questions
Where is the schema-lookup demo? What `k` fixed chrono?

## J. Connections
SYSTEM SYNTHESIS → `QojPKL96Dx4`; `QCjMBOEhpLE`; `irg-2IfAjpo`.

## K. Future-Use
Four-way retrieve + enum-filter + human-move rule as atoms.

## Steal / Operate-never

### Machine: retrieve = the human move (filter / SQL / full-doc / vector)
- **Epistemic:** SOURCE
- **Workflow / loop:** name the question → name the human move → pick the method → enum or schema → checkable stop = a number you can recompute or a timeline that matches the doc order
- **Questions / signals:** Table or prose? Order? Aggregation? One FAQ?
- **Qualify / frame / objections:** Vectors lose the rest of the table.
- **Procedure:** D above.
- **Example that proves it:** week-max chunk miss; 5 speakers; 4k vs 2600 chrono.
- **Why it works:** You only pay for the context the question needs.
- **Conditions / exceptions:** Token gaps grow with corpus; % still needed a calculator.
- **Operate-never payload:** n8n/Supabase as hive; Plus; demo $ as FACT.
- **Hive run:** Same four-way on our files. Do not add a vector SKU.
- **Source:** `kOKavHnlPik` @ UNKNOWN

### Operate-never
- n8n-cloud / Supabase as hive. Quote demo revenue as FACT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File four-way retrieve next to cite-the-page. Do not default hive RAG to vectors.
