# Communications Manager — kOKavHnlPik
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** Once You Know This, Building RAG Agents Becomes Easy in n8n
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** tutorial · 4209 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Open: ‘my agent is not answering correctly’ — start from the end: what questions, what must it look at. Four RAG shapes in one n8n canvas: filters, SQL, full context, vector. People jump to vector first; that is the bug.
- Chunk lecture: 20-page PDF → dots. YouTube summary from chunks ≠ the video (no URL/timestamp unless metadata). Meeting ‘March 5’ summarizes the hits, not the meeting. Tabular trap: ‘highest sales week’ returns week 6 / 15,583 while weeks 4 / 14 / 19 were higher — UNVERIFIED demo. Same for averages over a slice.
- Filters: 20-row n8n data table. ‘How many Bluetooth speakers on September 16?’ → product filter then date filter then add (1+4=5). Use when a human would filter a sheet; name the exact product strings and date format in the prompt (not semantic). Cheap, accurate, until the set is huge or the math is a pivot — then SQL.
- SQL: 50-row Postgres/Supabase. ‘Three highest-earning products’ → GROUP BY / ORDER / LIMIT 3; calculator for share-of-revenue (~80% top three — UNVERIFIED). Rule: if a human would use a pivot, use SQL. Still give schema/examples; optional schema-lookup tool.
- Full context: two ~4–5 page transcripts. Chronological breakdown of ‘agent in 2 hours’ — 4k tokens via a choose-one tool vs 6.5k with both jammed in the prompt vs same cost if docs are injected as variables every turn. Use when a human would read the whole thing (timeline, onboarding). Agentic Arena: he jammed PDFs into the prompt on a time crunch.
- Vector on the same two docs: faster/cheaper (~2.6k) but order is guessed from four chunks. Raising top-k helps; gap vs full-read grows with corpus size. Close: context engineering five — end in mind, pipeline, accuracy, window, specialize. Plus ~3,000 / courses — UNVERIFIED.

## B. Atomic Knowledge

### Do not default to vector — pick the shape from the question
- **Claim:** Filters for ‘spreadsheet AND.’ SQL for pivot math. Full read for order. Vector for ‘find the one FAQ in 100.’ The wrong shape invents week 6.
- **Reasoning:** Chunk search is semantic and local. Tabular ‘highest’ is global. A letter that cites the local max is a lie.
- **Mechanism:** Ask: would a human filter, pivot, or read the whole card? Then stop. Do not mail 15,583.
- **Evidence:** Week 6 vs 4/14/19; five Bluetooth speakers; 4k vs 2.6k tokens.
- **Conditions:** External data in an answer.
- **Exceptions:** Demo figures UNVERIFIED. n8n/Supabase as ours is never. Classifier may filter; sender may not auto-reply.
- **Action:** Steal: shape-from-question. Never a chunk-reply bot.
- **Confidence:** high
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE

### Full context is a card, not the vault
- **Claim:** Two short transcripts fit. Jamming both every turn doubles tokens even when you only need one. A choose-one tool is cheaper than a permanent paste.
- **Reasoning:** Window is a budget. The vault is not a letter.
- **Mechanism:** Pull one verified card. Do not paste the transcript pile into mail.
- **Evidence:** 4k vs 6577; dynamic variables still pay both docs.
- **Conditions:** Small source set vs a wiki.
- **Exceptions:** Do not dump LEARNED.md into a draft.
- **Action:** One card. `wiki-ingest`. No send.
- **Confidence:** high
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- If a human would filter / pivot / read-all / Ctrl-F one FAQ — match that. **SOURCE**
- Exact strings for filters; schema for SQL. Not magic. **SOURCE**
- AI is only as smart as the context you give it. **SOURCE**

## D. Procedures
- End in mind → pick filter/SQL/full/vector → constrain the pull → check the number against the whole table. **SOURCE**
- This desk: one card; no chunk-math in a letter. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Highest sales week. → **Action:** Vector returns week 6 / 15,583. → **Reasoning:** Only that chunk was in context. → **Outcome:** Wrong week. → **Lesson:** Do not mail the chunk. Implicit rule: tape sales $ UNVERIFIED.

## F. Decision Rules
- If the question is a max/average over a table → not vector.
- If the letter needs the meeting → one card, not the pile.
- Refuse: 15,583 / five speakers / 3,000 as FACT. RAG auto-reply.
- Optimize: smallest true context.

## G. Contrarian
- Field hears ‘agent needs data’ and opens a vector store. He opens a whiteboard. **SOURCE**

## H. Assumptions
- Token ratios are one run. Falsifier: a filter agent that still hallucinates a product name.

## I. Questions
- Which draft number came from a chunk instead of the whole card?

## J. Connections
- **SYSTEM SYNTHESIS:** `QojPKL96Dx4` (highlights). `QCjMBOEhpLE` (filter then draft). `wiki-ingest`.

## K. Future-Use
- Shape-from-question as an ops note. Plus RAG SKU stays his.

## Steal / Operate-never

### Machine: Pick retrieval from the question; never mail chunk-math; never RAG-reply
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** What would a human look at? → pull that only → Control-F / table-check → Evens → stop.
- **Questions / signals:** Is this a pivot hiding in a vector?
- **Qualify / frame / objections:** Qualify: FAQ vs timeline vs table. Frame: wrong week is a lie. Objection: ‘we have RAG’ → not a sender.
- **Procedure:** 1) No n8n RAG pack. 2) No chunk $. 3) No send.
- **Example that proves it:** Week 6 loses to weeks 4/14/19.
- **Why it works:** Local max ≠ global max.
- **Conditions / exceptions:** RAG tapes. Exception: Cursor + Grok; send-removed.
- **Operate-never payload:** Quote 15,583 as FACT. Support bot from chunks.
- **Hive run (existing skills only):** `wiki-ingest`. `send-removed`. `playbook-before-send`.
- **Source:** `kOKavHnlPik` @ UNKNOWN


### Operate-never (this desk will not operate)
- Install his n8n RAG pack. RAG auto-reply. Quote 15,583 · week 6 · five speakers · 3,000 as FACT.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I do not operate a chunk-reply. I do not mail tape sales. I do not send. Clients parked.
