# Creative Studio — kOKavHnlPik
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Four retrieval methods; vector is the last resort. Beats: whiteboard — 20-page PDF → chunks → dots; YouTube chunks lose video/URL/timestamp unless metadata; “summarize the meeting” returns matching chunks not the day; **tabular fail**: “highest week” / “average” on one black chunk misses week 4/14/19. (1) **Filters** on n8n Data Table (20 sales rows): Bluetooth + Sep 16 → two tool filters + calc = **5** (1+4); human-would-filter rule; list valid names/date format (not semantic). (2) **SQL** on Supabase/Postgres (50 rows): “three highest earning” → GROUP BY / ORDER / LIMIT 3 — AI Automation Course 34.93, consulting 33.383, template 16.59, top three ~80% (UNVERIFIED); calc used for percents; human-would-pivot rule; optional schema tool. (3) **Full context**: two ~4–5 page transcripts; tool-pick one = ~4k tokens; both in prompt = ~6577, faster no-tool; dynamic vars same cost more flexible; Arena he jammed PDFs; human-would-read-the-whole. (4) **Vector** same two docs: chronological ask is cheaper (~2600) and **order-wrong**; raise top-k (4→20) helps. Context-engineering five (end in mind, pipeline, accuracy, windows, specialize). Plus ~3,000 (UNVERIFIED). Visual: whiteboard weeks, pivot chart.

## B. Atomic Knowledge

### Start from the question, not the vector
- **Claim:** “Needs external data” ≠ Pinecone. Filters if a human would filter; SQL if a human would pivot; full read if order/summary; chunks if one FAQ out of 100.
- **Evidence:** Highest-week chunk miss; “if a human would use filters in a spreadsheet, then use filters.”
- **Conditions:** Tabular + known fields → filter/SQL. Small docs → full text.
- **Exceptions:** Metadata can save vectors for “which video.”
- **Action:** Name the question type first; do not default vector.
- **Confidence:** SOURCE.
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE

### Filters are exact strings
- **Claim:** Product/date must match the cell (capitals, date shape). Semantic search is the wrong mental model here.
- **Evidence:** “if I just said phone case and then it spelled it wrong, our filter wouldn’t have actually worked.”
- **Conditions:** Legal values in the system prompt (sister `QCjMBOEhpLE`).
- **Exceptions:** SQL can compute in the database; he still listed columns/examples.
- **Action:** Enumerate the vocabulary the filter will see.
- **Confidence:** SOURCE.
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE

### Full context is an accuracy buy
- **Claim:** Whole transcript → real chronology (~4k). Vector chronology is a guessed order at half the tokens. Gap explodes as the store grows.
- **Evidence:** “it doesn’t understand order right now… 2600 tokens… about half.”
- **Conditions:** Fits the window; tool-choose vs always-both is a cost knob.
- **Exceptions:** Arena time-crunch he jammed everything.
- **Action:** Pay tokens when order is the answer.
- **Confidence:** SOURCE; token counts UNVERIFIED.
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Chunk = lose the document. Agent should pull *less* into n8n (tokens + hallucinate). SQL speaks totals; filters speak rows; vectors speak “a bit like this.” Beginner rules are human analogies.

## D. Procedures
1. What will they ask? What must it see?
2. Tabular + subset → filter (+ legal values).
3. Totals/rank/trend → SQL (schema in prompt).
4. Timeline/summary/small → full doc (tool or prompt or dynamic).
5. Needle in many similar bits → vector + metadata; raise k if order matters.
Avoid: n8n-cloud/Supabase as hive; 34.93 / 80% / 3,000 as FACT; Skool.

## E. Examples
**Situation:** Highest sales week on a chunked sheet.  
**Action:** Model answers from the black slice; real max is elsewhere.  
**Lesson:** Average/max are SQL questions.

**Situation:** Chronology of “agent in 2 hours.”  
**Action:** Full read vs four chunks.  
**Lesson:** Cheap vector, wrong order.

## F. Decision Rules
- If the human would filter/pivot/read-all/Ctrl-F one FAQ → match that method.
- If the filter string can typo → it will miss.
- If you need the whole meeting → do not embed-and-hope.
- If $ / scores / 3,000 from this tape → UNVERIFIED.

## G. Contrarian
Vector-first is the beginner trap. He used full-prompt dump in a timed arena and calls it valid.

## H. Assumptions
5 speakers, 34.93 / 80%, token counts, 3,000 Plus UNVERIFIED. On-tape n8n/Supabase. Clients parked.

## I. Questions
Visual of the week-19 miss on the whiteboard? Exact SQL text? Did Plus stay 3,000?

## J. Connections
- SYSTEM SYNTHESIS → `QCjMBOEhpLE` / `QojPKL96Dx4` (filter vs assistant vs vector).
- SYSTEM SYNTHESIS → `info-gain-cite`; `hQvwMj7IJe4` (whole tape vs chunks).

## K. Future-Use
Four-method chooser card. Unassigned.

## Steal / Operate-never

### Machine: human-would-X retrieval chooser
- **Epistemic:** SOURCE
- **Workflow / loop:** name the ask → filter / SQL / full-read / vector → enumerate legal values if exact → check the answer against the whole table/doc
- **Questions / signals:** Would a human filter, pivot, read all, or grab one FAQ?
- **Qualify / frame / objections:** “We need RAG” is not a method
- **Procedure:** Tool-pick docs when only one is needed
- **Example that proves it:** Week-max chunk miss; 4k chronology vs 2.6k wrong order
- **Why it works:** The method must see the same rows a careful human would
- **Conditions / exceptions:** Metadata can rescue vectors; $ UNVERIFIED
- **Operate-never payload:** n8n-cloud; 80%/34.93 as FACT; Plus 3,000
- **Hive run:** `info-gain-cite`; `golden-test-loop`; `ask-principal`
- **Source:** `kOKavHnlPik` @ UNKNOWN

### Operate-never
- Default every agent to a vector DB. Install n8n-cloud/Supabase.
- Quote 80% / 3,000 as FACT. Join Plus. New hunt.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: the **whiteboard week-miss** and the pivot-chart check are the plates. Steal “human would filter/pivot/read.” HITL. Clients parked.
