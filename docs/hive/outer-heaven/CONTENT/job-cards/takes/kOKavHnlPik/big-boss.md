# Big Boss — kOKavHnlPik
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 18:08, 4209 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: whiteboard chunk diagram, n8n table (20 rows), Postgres/Supabase (50 rows), Excel pivot, two transcript docs, token counts, Superbase vectors, Plus course list.

Beats, in order:

1. Cold: “agent answers wrong” — he has many questions. Start from **end goal**: what questions will be asked, and what must it look at.
2. Four RAG methods in one workflow: filters, SQL, full context, vectors. Default-to-vectors is the bug.
3. Whiteboard: chunk retrieval is cheaper/faster but loses document / URL / timestamp. “March 5 meeting summary” summarizes **hit chunks**, not the meeting. Metadata tagging = other videos.
4. Tabular failure: “highest sales week” on a chunk picks week 6 in-frame; weeks 4/14/19 were higher off-frame. Same for averages.
5. **Filters:** n8n data table, 20 sales rows. “How many Bluetooth speakers on September 16?” → product filter + date filter + add qty = **five** (1+4). Human would do the same. Use when tabular, known fields, small subset. Fast/cheap/accurate. Thumb: if a human would filter a spreadsheet, filter. Prompt must list **valid product names** (capitals) and date format — equality, not semantic. New category = update the prompt. More dynamic: schema-lookup tool (mentioned, not demoed).
6. **SQL:** Postgres/Supabase, 50 rows. Pivot in Excel as truth. “Three highest earning products?” → GROUP BY / SUM / ORDER / LIMIT 3. Calculator used for **percentages**; top three ≈ **80%** revenue on tape. Use for totals, averages, rankings, trends, many rows, combine/compare. Thumb: if a human would pivot, use SQL. Still give table/column examples in the prompt.
7. **Full context:** two YouTube transcripts (~4–5 pages). Chronological breakdown of “agent in 2 hours.” **~4,000** tokens of GPT-5 Mini’s **400k** window. Variants: tool-choose one/both docs vs jam both in the system prompt (**6,577** tokens, faster, no tool, always pays). Dynamic variables = same cost, easier to update. Use for summaries/timelines/order, or data small enough to fit. Arena story: jammed PDFs on a time crunch. Thumb: if a human would read the whole doc, read the whole doc. FAQ needle ≠ whole handbook.
8. **Vectors:** same two docs in Superbase. Same chronological question: faster/cheaper (**~2,600** tokens, ~half), order-blind; model guesses sequence. Raising chunk limit (4→20) would help. Gap vs full-read grows with corpus size.
9. Context engineering five: begin with end in mind, design the pipeline, data accuracy, optimize windows, specialize.
10. Close: Plus — **3,000** members, Agent Zero, 10 hours to 10 seconds, one-person agency, subs-to-sales, weekly Q&A. **$ / counts UNVERIFIED.**

Off-topic / not skipped: Skool download of the workflow; “I built an agent in 2 hours” as a **document** inside this tape (`bxGE_LXPyAU` sibling).

## B. Atomic Knowledge

### Start from the questions and the look-at
- **Claim:** Wrong answers are a retrieve problem before they are a prompt problem.
- **Reasoning:** Many levers. The first is: what will they ask, and what must be in front of the model to answer.
- **Mechanism:** Pick filter / SQL / full / vector from that pair — not from fashion.
- **Evidence:** Cold open + four worked examples.
- **Conditions:** You can name the question class.
- **Exceptions:** Mixed question classes need more than one retrieve.
- **Action:** No vector store because “the agent needs knowledge.” Name the question first.
- **Confidence:** high
- **Source:** `kOKavHnlPik` @ UNKNOWN — “what type of questions will be asked and what does it need to look at”
- **Epistemic:** SOURCE

### Default-to-vectors is the bug
- **Claim:** When people hear “external data,” they run to a vector DB. That loses whole-doc and tabular truth.
- **Reasoning:** Chunks are semantic pieces, not the document, not the table.
- **Mechanism:** Embed dots; retrieve k; answer from those only.
- **Evidence:** Meeting-summary and highest-sales whiteboard.
- **Conditions:** Vectors are fine for needle-in-haystack FAQ.
- **Exceptions:** Metadata tagging can restore some lost fields — other tapes.
- **Action:** Vectors last, not first.
- **Confidence:** high
- **Source:** `kOKavHnlPik` @ UNKNOWN — “they immediately run straight to a vector database”
- **Epistemic:** SOURCE

### Chunks lose document, URL, timestamp
- **Claim:** A hit chunk does not know which video, URL, or time it came from unless you tagged it.
- **Reasoning:** The embed is the chunk, not the parent.
- **Mechanism:** 20-page PDF → many vectors. Retrieve ≠ “the PDF.”
- **Evidence:** Three YouTube transcripts thought-experiment; March 5 summary of chunks.
- **Conditions:** Parent metadata not stored.
- **Exceptions:** Tagging (not shown).
- **Action:** If the answer needs the whole tape, don’t chunk-search it.
- **Confidence:** high
- **Source:** `kOKavHnlPik` @ UNKNOWN — “we wouldn’t really know what YouTube video it came from”
- **Epistemic:** SOURCE

### Tabular questions fail on chunks
- **Claim:** “Highest week” / “average” on a chunk is local math, not the table.
- **Reasoning:** The model only sees the black box of rows.
- **Mechanism:** Semantic hit on “highest sales” → argmax inside the hit.
- **Evidence:** Week 6 in-chunk vs weeks 4/14/19 higher.
- **Conditions:** Any aggregate over rows.
- **Exceptions:** If the whole table fits in one chunk — lucky, not a design.
- **Action:** Filters or SQL for tables.
- **Confidence:** high
- **Source:** `kOKavHnlPik` @ UNKNOWN — “not giving us a holistic picture”
- **Epistemic:** SOURCE

### If a human would filter, filter
- **Claim:** Structured rows + known fields + subset question → equality filters, then a calculator.
- **Reasoning:** Fast, cheap, accurate; fewer tokens than dumping 20 rows; less hallucination.
- **Mechanism:** Product = Bluetooth speaker AND date = Sept 16 → qty 1+4 = 5.
- **Evidence:** Manual check matches. Tools show two queries.
- **Conditions:** You already know the fields. Dataset not so big that you need SQL math.
- **Exceptions:** Complex totals/rankings → SQL.
- **Action:** Contact/sales tables start here.
- **Confidence:** high
- **Source:** `kOKavHnlPik` @ UNKNOWN — “if a human would use filters in a spreadsheet, then use filters”
- **Epistemic:** SOURCE

### Enums must be listed; equality is not semantic
- **Claim:** Filter agents need valid product strings and date formats in the prompt (or a schema tool).
- **Reasoning:** `phone case` ≠ `Phone Case`. Misspelling = empty set, not a close match.
- **Mechanism:** Closed lists in the system prompt. SQL agent also gets columns + examples.
- **Evidence:** He pauses on the sales-agent prompt. Schema-lookup mentioned, not built.
- **Conditions:** Closed catalog. New SKU = prompt change unless schema tool exists.
- **Exceptions:** Schema tool would make it dynamic — **not shown**.
- **Action:** Stale enums are why it lies. Tell the schema or give a lookup.
- **Confidence:** high
- **Source:** `kOKavHnlPik` @ UNKNOWN — “it’s not doing semantic search. It’s doing explicit does X equal Y”
- **Epistemic:** SOURCE

### If a human would pivot, use SQL
- **Claim:** Totals, averages, rankings, trends, many rows, compare → SQL. The database does the math.
- **Reasoning:** Built for this. More reliable than all-rows-in-context or a few filters. Cheaper/more accurate than vectors on structured data.
- **Mechanism:** AI writes SQL → Postgres. Top-3 revenue; calculator only for share %.
- **Evidence:** Matches his Excel pivot; **~80%** on top three — **UNVERIFIED** as a law, SOURCE as this run.
- **Conditions:** Table lives in a real DB. Prompt still names columns.
- **Exceptions:** He still used the calculator four times for percentages.
- **Action:** Pivot-shaped questions do not go to embeddings.
- **Confidence:** high
- **Source:** `kOKavHnlPik` @ UNKNOWN — “if a human would use a pivot table or formulas, use SQL”
- **Epistemic:** SOURCE

### If a human would read the whole memo, read the whole memo
- **Claim:** Order-sensitive jobs (chronology, summary, steps) on a small doc → full read.
- **Reasoning:** Chunks shuffle. Full read keeps sequence. Cost is tokens; window is the cap.
- **Mechanism:** Tool-choose one transcript (~4k tokens) vs jam both (~6577) vs dynamic variables (same cost, less stale).
- **Evidence:** Chronological outline of the 2-hour-agent video. Arena jam-PDFs aside.
- **Conditions:** Fits the window. FAQ needle should **not** pull the handbook.
- **Exceptions:** Hybrid chunking mentioned, not shown.
- **Action:** Onboarding SOP = full. One FAQ = one FAQ.
- **Confidence:** high
- **Source:** `kOKavHnlPik` @ UNKNOWN — “if a human would read the whole document before answering”
- **Epistemic:** SOURCE

### Vectors are cheaper and order-blind
- **Claim:** Same chronology question on vectors: ~2600 tokens, faster, less accurate on order.
- **Reasoning:** Model re-orders whatever chunks returned. Limit↑ helps. Gap vs full-read grows with corpus.
- **Mechanism:** Superbase vectors, k=4 on tape.
- **Evidence:** Token compare vs full-read.
- **Conditions:** Needle search, large corpus, order optional.
- **Exceptions:** He says it “does a decent job” guessing order — not a proof.
- **Action:** Use when cheap/fast matters more than sequence.
- **Confidence:** high for the trade; medium for “decent”
- **Source:** `kOKavHnlPik` @ UNKNOWN — “only took 2600 tokens” / “doesn’t understand order”
- **Epistemic:** SOURCE

## C. Mental Models

- **Retrieve is chosen by the question, not by fashion.** **SOURCE**
- **Human analog is the thumb:** filter / pivot / read-all / grep-a-needle. **SOURCE**
- **Limit what enters the window.** Huge table on one side, agent on the other. **SOURCE**
- **Equality needs a schema.** Semantic search will not save a typo. **SOURCE**
- **Context engineering is five jobs, not a vendor.** **SOURCE**
- **Token counts are demo receipts, not laws.** **INFERENCE**
- **Plus is the close.** **INFERENCE**

## D. Procedures

1. Write the question classes the desk will get.
2. For each class, name what a careful human would look at.
3. Map: spreadsheet filter → filter; pivot/formula → SQL; whole memo → full; FAQ needle → vector (or grep).
4. If filter/SQL: put enums/columns in the prompt **or** a schema tool.
5. If full: prefer tool-choose over jam-always, unless the set is tiny and always needed.
6. Measure tokens and a known-good answer (his pivot / manual 5).
7. Do not stand up a vector DB as the default knowledge plane.

**Qualify / frame:** Retrieval-ladder teaching tape. n8n/Supabase on tape.
**Objections:** “We need RAG” — which of the four. “Vectors are cheaper” — and order-blind.
**Avoid:** default vector; quote 5 / 80% / 2600 / 400k as FACT; switch stack.
**When to change:** question class changes; catalog adds a product; corpus no longer fits.

## E. Examples

**Situation:** “Bluetooth speakers on Sept 16?”  
**Action:** Two equality filters + add.  
**Reasoning:** Human would filter the sheet.  
**Outcome:** Five. Matches manual.  
**Lesson:** Filter when the field is known. Implicit rule: list valid names.

**Situation:** “Three highest-earning products?”  
**Action:** SQL group/sum/order/limit; calculator for %.  
**Reasoning:** Human would pivot.  
**Outcome:** Matches Excel; ~80% story.  
**Lesson:** Math in the query. Implicit rule: still show columns to the agent.

**Situation:** “Chronological breakdown of the 2-hour video.”  
**Action:** Full transcript read (~4k) vs jammed both (~6.6k) vs vectors (~2.6k, order guessed).  
**Reasoning:** Order matters; size fits.  
**Outcome:** Full read is the accurate one on tape.  
**Lesson:** Cheap ≠ right. Implicit rule: pick retrieve by the question.

## F. Decision Rules

- If they would filter → filter.
- If they would pivot → SQL.
- If they would read the memo → full.
- If they would find one FAQ → vector/grep.
- If the catalog can change → schema tool, not a stale list only.
- If someone says “add a vector DB” → ask the question class first.
- Optimize: least data in the window that still answers.
- Refuse: vectors-by-default; n8n-only RAG as hive OS.

## G. Contrarian

- Against “RAG = embeddings.”
- Against “more context is always better” (jam-both always pays).
- Against “the model will figure out the table.”
- Field assumes a vector product. He taught a ladder.

## H. Assumptions

**His:** Mini 400k window makes full-read easy; Sheet/Postgres demos generalize; Plus courses deepen context engineering.

**Ours:** Captions complete (4209 words). 5 speakers / 80% / 2600 / 4000 / 6577 / 400k / 3,000 members = **UNVERIFIED** as laws (SOURCE as this run). Domain: sales tables + his own transcripts.

**Falsifiers:** Schema drifts and filters empty. SQL injection / bad query. Full-read exceeds window. Vector k=20 still shuffles chronology.

**Disagreement (keep labeled):** We will not stand up Supabase vectors as the hive brain. The **question→retrieve** ladder is stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Schema-lookup tool — what does the call look like? Not shown.
- Hybrid chunks — mentioned, not built.
- Who updates enums when a product ships?
- Arena jam-PDFs: did it actually win, or just finish?

## J. Connections

- **SYSTEM SYNTHESIS** → `irg-2IfAjpo`: convenience RAG still chunks; “how many rules” fails the same way.
- **SYSTEM SYNTHESIS** → `bxGE_LXPyAU`: status filters on a sheet = this ladder’s first rung.
- **SYSTEM SYNTHESIS** → `info-gain-cite` / wiki: our full-read analog.
- **SYSTEM SYNTHESIS** → `golden-test-loop`: pivot as known-good.

## K. Future-Use

- Schema-lookup as a Librarian tool (unassigned).
- Question-class matrix on each desk card (unassigned).
- Token receipts on Watchdog smokes (unassigned).

## Steal / Operate-never

### Machine: Pick the retrieve by the question
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** name question class → name what a human would look at → choose filter / SQL / full / vector → give schema or schema tool → check against a known-good (manual count / pivot) → only then answer.
- **Questions / signals:** “Would a human filter, pivot, read-all, or find one FAQ?” “What enums exist?”
- **Qualify / frame / objections:** Teaching tape, not a RAG product. Objection: “we need knowledge” — which retrieve.
- **Procedure:** D steps 1–7. Checkable stops: (1) question class written, (2) retrieve named, (3) schema present, (4) known-good matches.
- **Example that proves it:** Sept 16 speakers = 5 via filters; top-3 via SQL matches pivot; chronology fails on vectors. Lesson: fashion is the bug.
- **Why it works:** The failure is missing rows/order, not a shy model. Conditions: you can name the class. Exceptions: mixed classes; metadata tagging not shown.
- **Conditions / exceptions:** Cursor + Grok only. n8n / Supabase / Plus on tape. Tape counts UNVERIFIED as laws.
- **Operate-never payload:** Default vector store; switch stack; quote 5 / 80% / 2600 / 400k as FACT; Plus as SKU.
- **Hive run (existing skills only):** `info-gain-cite` · `wiki-ingest` · `golden-test-loop` · `agent-job-card` (question classes).
- **Source:** `kOKavHnlPik` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Default every desk to a vector store
- Switch stack to n8n-only RAG · Cursor + Grok only
- Quote five speakers / 80% / 2600 tokens / 400k window / 3,000 members as FACT
- Plus / Skool as a hive SKU
- New hunt / unpark Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md`

## L. Role-Specific Applications

I manage; I do not buy a vector because the agent “needs knowledge.”

- **Done:** one question type → one retrieve → a known-good check. Not four RAG products.
- **Delegate without being asked:** Researcher names the question class; Forge/Watchdog keep the pivot/manual five; Librarian owns schema lists.
- **Skeptical review:** Token slides are demo receipts. Plus is the close.
- **One system this take:** one question type, one retrieve. Not a Plus course.
- Live hunt stays parked.
