# Forge — kOKavHnlPik
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **four ways to fetch** (don’t default to a vector DB). Beats: “agent is wrong” → start from **end goal + question types + what it must see** → whiteboard: chunk retrieval is cheap/fast but **loses the document**; YouTube chunks without URL/ts unless metadata; “summarize the Mar 5 meeting” → only the hit chunks → **tabular failure**: “highest sales week” / “AOV” on a chunk picks a **local** max/avg (week 6 **15,583** vs real weeks 4/14/19) UNVERIFIED. **(1) Filters** on an n8n table (20 sales rows): “Bluetooth speakers on Sep 16?” → product filter then date filter then calculator → **5** (1+4); human-spreadsheet test; prompt must list **exact** product strings + date format (not semantic); cheap/accurate until the set is huge. **(2) SQL** on Supabase/Postgres (50 rows): “three highest-earning products?” → `GROUP BY` / `ORDER BY` / `LIMIT 3`; calculator only for **%**; AI Automation course **34.93**, consulting **33,383**, template **1,659**, top3 **~80%** UNVERIFIED; give schema/examples or a schema-lookup tool; human-pivot test. **(3) Full context:** two ~4–5 page transcripts; chronological breakdown of “agent in 2 hours”; tool-pick-one **~4k** tokens vs both-in-prompt **~6,577**; dynamic vars = same cost, easier swap; use for summary/timeline/order; Agentic Arena he **jammed PDFs in the prompt**. Human-would-read-the-whole-doc test. **(4) Vector/Supabase:** same two docs; same chrono Q → faster, **~2,600** tokens, **order guessed**; raising `limit` 4→20 helps; gap explodes as the corpus grows. Close: context engineering five (end in mind, pipeline, accuracy, windows, specialization); Plus **3,000+**. Timestamp UNKNOWN. n8n / Supabase / Plus on-tape.

## B. Atomic Knowledge

### Match the fetch to the question, not to the fashion
- **Claim:** Vector-first is the common miss. Filters for “spreadsheet AND.” SQL for totals/rank/trend. Full doc when order/summary matters and it fits. Chunks when you need a cheap needle and can live without the whole.
- **Reasoning:** A chunk cannot answer “highest week” or “average” or “chrono of the video.”
- **Mechanism:** Exact-match filters need a closed vocab in the prompt. SQL does the math in the DB. Full context = tokens. Vector = speed.
- **Evidence:** Speakers=5; top-3 matches his pivot; 4k vs 6.5k vs 2.6k.
- **Conditions:** Tiny demo tables/docs.
- **Exceptions:** Huge tables need SQL not 20-row filters. Huge corpora make full-context illegal.
- **Action:** Steal the four-way chooser. Do not add n8n-cloud / Supabase as hive RAG.
- **Confidence:** high on the chooser; all $ / 3,000+ / row math UNVERIFIED.
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Begin with the question, not the store. Semantic ≠ exact. Tool-choice vs always-in-prompt is a token tax. Context engineering > model brand.

## D. Procedures
1. Don’t stand up a vector DB because the agent “needs data.” 2. Ask: filter / SQL / whole / chunk? 3. If filter: closed vocab. 4. Don’t quote 15,583 / 80% / 3,000+ as FACT. 5. Don’t join Plus for the template.

## E. Examples
**Situation:** Highest sales week on chunks.  
**Action:** Local max in the black box.  
**Reasoning:** Other weeks never arrived.  
**Outcome:** Wrong week.  
**Lesson:** Aggregates need SQL or the whole table.

**Situation:** Chrono of a video.  
**Action:** Full transcript vs 4 chunks.  
**Reasoning:** Order lives in the whole.  
**Outcome:** Full is right; vector is cheaper and guessed.  
**Lesson:** Human-would-read-it-all.

## F. Decision Rules
- If a human would filter a sheet → filter.
- If a human would pivot → SQL.
- If a human would read the doc → full (if it fits).
- If a human would Ctrl+F one FAQ → chunk.
- If 3,000+ / Plus CTA → park.

## G. Contrarian
Field vectors everything. He has three cheaper answers first. Field stuffs every doc in the prompt; he shows the token double and the tool-pick-one.

## H. Assumptions
Demo rows as shown. Falsifier: production SQL injection / bad schema. We do not run n8n-cloud. Tape numbers UNVERIFIED.

## I. Questions
Are we vectorizing hive packets that should stay whole-doc takes?

## J. Connections
SYSTEM SYNTHESIS: `QojPKL96Dx4` highlights vs summary. `QCjMBOEhpLE` / `lcNN3X9gXls` tables. `hQvwMj7IJe4` wiki = routed whole pages, not random chunks. No n8n-cloud / Supabase hive.

## K. Future-Use
Four-way fetch card. Closed vocab on filters. Don’t default to vectors.

## Steal / Operate-never

### Machine: question → filter / SQL / whole / chunk; never vector-first
- **Epistemic:** SOURCE
- **Workflow / loop:** what must it see? → pick the cheapest complete fetch → prompt the exact strings if it’s a filter
- **Questions / signals:** Aggregate? Timeline? One row? Needle in a haystack?
- **Qualify / frame / objections:** Tiny demos. Full context dies at scale.
- **Procedure:** No new vector DB. No Plus. No n8n-cloud.
- **Example that proves it:** Chunk AOV lie; SQL top-3; 4k vs 2.6k chrono.
- **Why it works:** The store must match the question. Semantic search is not a spreadsheet.
- **Conditions / exceptions:** Tape math UNVERIFIED.
- **Operate-never payload:** Vector-everything; quote 80%/3,000+ as FACT.
- **Hive run:** existing packets as whole docs. Deploy HITL.
- **Source:** `kOKavHnlPik` @ UNKNOWN

### Operate-never
- Stand up n8n-cloud / Supabase as the hive brain.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not add a vector DB for these packets. Fetch matches the question. Deploy HITL.
