# Product GTM — kOKavHnlPik
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk. Title: “Once You Know This, Building RAG Agents Becomes Easy in n8n.” Beats: (1) “My agent is wrong” → he asks what questions and what it must look at; four retrievals: **filters, SQL, full context, vectors**; people jump to vectors; (2) whiteboard: chunk retrieval is cheap/fast but **loses the document**; YouTube chunks without URL/timestamp unless metadata; “summarize the March 5 meeting” = summarize the *hits*, not the meeting; (3) tabular fail: “highest sales week” / “AOV” on a chunk — week 6 = 15,583 in-chunk but weeks 4/14/19 higher (UNVERIFIED); average of the chunk ≠ average of the book; (4) **filters** demo: n8n table, 20 sales rows; “Bluetooth speakers on Sept 16?” → product filter + date filter + calculator = **5** (1+4); use when tabular, fields known, small subset; human-spreadsheet rule; full 20 rows = more tokens/hallucination; bigger/mathier → SQL. Skool template. Rest of tape = SQL / full-context / vector examples. Timestamp UNKNOWN. **15,583 / week numbers UNVERIFIED.**

## B. Atomic Knowledge
### Name the question before you pick the retrieval
- **Claim:** RAG is not a vector store. It is “what must it look at to be right.” Chunks lie on max/avg and on whole-doc asks.
- **Reasoning:** Same as four blanks (`LVAHYV4Xrto`): name the job before the tool. Vectors are the last ladder, not the first.
- **Mechanism:** Filters when a human would filter a sheet. SQL when the math spans the table. Full context when the whole doc is the unit. Vectors when semantic search over prose is the unit.
- **Evidence:** Bluetooth 5 via two filters; chunk-max miss on the whiteboard.
- **Conditions:** On-tape n8n. Pattern is portable.
- **Exceptions:** 20-row demo is toy scale.
- **Action:** Steal the four-way chooser. Do not productize n8n RAG or Skool.
- **Confidence:** high as teaching tape.
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Question → retrieval. Chunk ≠ document. Tabular max/avg trap. Human-spreadsheet test.

## D. Procedures
Write the question class. If a human would filter/SQL/read-all/search-prose, pick that. Do not start in a vector DB.

## E. Examples
**Situation:** Highest-sales week. **Action:** Chunk retrieval. **Outcome:** Wrong week. **Lesson:** The chunk cannot see week 19.

## F. Decision Rules
- If they said “add RAG” → ask the question class first.
- If the data is a table → not vectors.
- Refuse: n8n RAG SKU; Skool; 15,583 as FACT.

## G. Contrarian
Against “agent needs data → vector DB.”

## H. Assumptions
Theirs: n8n tables. Ours: Cursor + Grok. Falsifier: a Path A corpus (still four-way chooser, no n8n).

## I. Questions
SQL / full-context / vector demos in the rest. Sibling `QojPKL96Dx4` · `irg-2IfAjpo`.

## J. Connections
**SYSTEM SYNTHESIS:** Name the metric = `vY0EzTP-7EA`. Four blanks = `LVAHYV4Xrto`. Maps to `ask-principal`.

## K. Future-Use
Unassigned: “question class → retrieval.” Keep.

## Steal / Operate-never

### Machine: pick retrieval from the question — vectors last
- **Epistemic:** SOURCE
- **Workflow / loop:** what will they ask → what must it see → filter / SQL / whole doc / vectors
- **Questions / signals:** Would a human filter a sheet? Is this a max/avg over the book?
- **Qualify / frame / objections:** “RAG becomes easy” is the magnet.
- **Procedure:** No n8n/Skool. Cite+check if prose (`QojPKL96Dx4`).
- **Example that proves it:** Bluetooth 5; chunk-max miss.
- **Why it works:** The wrong index is a confident wrong.
- **Conditions / exceptions:** Toy 20 rows; $ / counts UNVERIFIED.
- **Operate-never payload:** n8n RAG; Skool; vector-first
- **Hive run (existing skills only):** `ask-principal`
- **Source:** `kOKavHnlPik` @ UNKNOWN

### Operate-never
- Productize n8n RAG / Skool
- Jump to vectors
- New hunt; merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Do not anneal a RAG SKU. Clients parked.
