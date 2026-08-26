# Day Planner — kOKavHnlPik
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: four retrieval methods — **don’t default to vector**. Beats: whiteboard — chunks lose doc/URL/time; tabular chunk **misses the real max/avg** (week 6 vs 4/14/19); (1) **filters** on n8n table — Bluetooth + Sep 16 → 5; valid **exact** names/dates in the prompt (not semantic); human-spreadsheet rule; (2) **SQL** on Postgres/Supabase 50 rows — top-3 products, query does group/sort (then calc for %); human-**pivot** rule; optional schema tool (mentioned, not shown); (3) **full context** — two ~4–5p transcripts; tool-pick one = **~4k** tok; both in prompt = **~6.6k**; dynamic vars same $; use for summary/timeline/order; Arena = jam PDFs in the prompt; human-**read-the-whole** rule; (4) **vector** same two docs — chrono “ok-ish,” **~2.6k**, order guessed; raise `limit` 4→20; human-**one-FAQ** rule; five context-engineering bullets (end in mind, pipeline, accuracy, window, specialize); Plus ~3k. Caption-only. Timestamp UNKNOWN. Sales $ UNVERIFIED.

## B. Atomic Knowledge
### Question shape picks the method; vector is last for tables and whole-doc jobs
- **Claim:** “Needs external data” ≠ Pinecone; if a human would filter / pivot / read-all / grab-one-FAQ, pick that; filters need **exact** allowed values; chunks will lie about max/avg and about “the whole video.”
- **Reasoning:** Tokens and hallucinations grow with the dump; SQL is built for totals.
- **Mechanism:** Shape → filter | SQL | full-doc | vector.
- **Evidence:** “they immediately run straight to a vector database… tons of problems.” / “if a human would use filters in a spreadsheet, then use filters.”
- **Conditions:** You can name the question type first.
- **Exceptions:** Hybrid later (he waves at it).
- **Action:** Steal question→method. Do not vector-first. Do not Plus.
- **Confidence:** high (same spine as `XTBWVVcF3Pk`).
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** SQL still used calculator for %
- **Speech ≠ behavior:** none

## C. Mental Models
Begin with the questions you’ll get. Context engineering > “add RAG.” Priority: pull only what you need. Uncertainty: Plus 3k, token counts.

## D. Procedures
1. Write the question types first.
2. Tabular + known fields → filter (and list valid values).
3. Totals/rank/trend → SQL.
4. Order/summary of a small doc → full read (tool-pick if you can skip one).
5. One needle in a haystack of similars → vector.
Avoid: vector-first; dump-all-rows; Plus.

## E. Examples
**Fake max:** Situation → “highest sales week.” Action → vector returns a chunk. Reasoning → semantic “highest.” Outcome → week 6, misses 4/14/19. Lesson → steal the miss.

**Bluetooth 5:** Situation → product+date. Action → two filters + calc. Reasoning → spreadsheet. Outcome → 5. Lesson → steal the human-filter rule.

## F. Decision Rules
- IF the first node is a vector store and the data is a table → fail.
- IF the question is “summarize the whole X” → not chunks (unless you tagged the whole).
- IF filters are exact-match → publish the allowed values in the prompt.
- IF full-docs are in the system prompt every turn → you’re paying even when unused.

## G. Contrarian
Rejects RAG=vector. Field: embed everything. He: four doors.

## H. Assumptions
Theirs: 20/50-row toys generalize. Ours: we still don’t stand up Pinecone/Supabase. Falsifier: a table only a vector can answer. Survivorship: his four demos.

## I. Questions
Duplicate of `XTBWVVcF3Pk`? Arena tape id?

## J. Connections
- SYSTEM SYNTHESIS → `XTBWVVcF3Pk` · `QCjMBOEhpLE` · `QojPKL96Dx4`.

## K. Future-Use
Question→method. Valid-values list. Unassigned hybrid.

## Steal / Operate-never

### Machine: write the question type → filter | SQL | full-doc | vector (last)
- **Epistemic:** SOURCE
- **Workflow / loop:** what would a human do (filter / pivot / read-all / one FAQ)? → pick that door → if filter/SQL, list legal values
- **Questions / signals:** Table or prose? Whole or needle? Exact match?
- **Qualify / frame / objections:** “Just RAG it” is the fail. Week-6 miss is the tell.
- **Procedure:** No vector-first. No Plus. No dump.
- **Example that proves it:** Situation → highest week. Action → chunk. Reasoning → semantic. Outcome → wrong max. Lesson → steal the door.
- **Why it works:** The human analog is checkable; a default vector is a lie about totals.
- **Conditions / exceptions:** Token counts / sales $ UNVERIFIED.
- **Operate-never payload:** Vector-first; Plus; quote tape $ as FACT.
- **Hive run (existing skills only):** `XTBWVVcF3Pk`-shape · `coverage-loop`.
- **Source:** `kOKavHnlPik` @ UNKNOWN

### Operate-never
- Pinecone/Supabase as default.
- Plus / n8n-cloud.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as question-shape→method. Clients parked.
