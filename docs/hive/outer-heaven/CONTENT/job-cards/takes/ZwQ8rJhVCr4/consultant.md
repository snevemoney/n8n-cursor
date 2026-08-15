# Consultant — ZwQ8rJhVCr4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Four RAG methods teaser (long `kOKavHnlPik`). Beats: four examples — filters, SQL, full context, vector DB. (1) Filters: “How many Bluetooth speakers did we sell on September 16th?” → product-name filter + date filter → five. (2) SQL on Postgres/Supabase sales, 50 rows: three highest-earning products → AI automation course 34.93, consulting call 33383, workflow template 1659 + % of revenue. (3) Full context: two docs, read entire document every time (not chunk); chronological breakdown of “agent in 2 hours” video — opening hook, stack, personal context, lead gen, sales moment, in order; 4,000 tokens of GPT-5 Mini’s 400,000 window. (4) Same docs in Supabase vectors: same chronological question is faster/cheaper but “not as accurate because it doesn't understand order.” CTA to the long. No VTT. UNKNOWN. ~641 words.

## B. Atomic Knowledge

### Pick the retrieval shape for the question
- **Claim:** Filters and SQL for tabular “how many / top N”; full document read when order matters; vectors when you want cheap/fast and can tolerate order loss.
- **Reasoning:** RAG is not one stack. The question type picks the method.
- **Mechanism:** Classify the question → choose filter / SQL / full-read / vector → run → check the failure mode.
- **Evidence:** On-tape four demos and the order-loss confession on vectors.
- **Conditions:** Small tables (20 and 50 rows) and two transcripts.
- **Exceptions:** SQL numbers look oddly formatted (34.93 vs 33383) — may be caption noise; treat as UNVERIFIED.
- **Action:** Do not default to vectors. Ask whether order or exact counts matter.
- **Confidence:** high
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN — “not as accurate because it doesn't understand order right now”
- **Epistemic:** SOURCE
### Full-read is affordable when the doc is small vs the window
- **Claim:** The chronological breakdown used 4,000 tokens against a 400,000 window, so “read the whole thing” was cheap here.
- **Reasoning:** Chunking is not mandatory when the doc fits and order matters.
- **Mechanism:** Measure tokens → if tiny vs window and order matters, full-read.
- **Evidence:** On-tape token note.
- **Conditions:** Two transcripts, GPT-5 Mini on tape.
- **Exceptions:** Bigger corpora will not fit. Cost/latency not fully shown.
- **Action:** Check fit before you chunk.
- **Confidence:** high as a condition
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN — “this only took 4,000 tokens out of GBT5 Mini's 400,000 context window limit”
- **Epistemic:** SOURCE


## C. Mental Models

He is teaching method selection, not a vendor religion. He is willing to show the vector path losing chronology. He likes exact-count questions for filters/SQL. He uses his own video transcript as the ordered doc. He is slightly salesy on the title (“if your agents aren’t accurate”).

## D. Procedures

1. Is it a count/filter on a table? Use filter or SQL. 2. Is it order/chronology on a short doc? Full-read. 3. Is it topical search on a big pile? Vector, and do not ask it for order. 4. Smoke-test the known failure. Avoid: one vector store for every question.

## E. Examples

**Situation:** Bluetooth-speaker count on a date; top products; chronological video breakdown. **Action:** Four methods. **Outcome:** Filters/SQL give numbers; full-read keeps order; vector is cheaper/faster and loses order. **Lesson:** Method follows question. Implicit rule: he says the vector miss out loud.

## F. Decision Rules

If the question is “how many on this date,” do not embed. If the question is “in order,” do not vector-only. If the doc no longer fits the window, the full-read condition died.

## G. Contrarian

Field default: everything is RAG/vectors. He shows three other methods first. Field default: hide the vector failure. He leads with it at the end.

## H. Assumptions

SQL figures may be caption-garbled UNVERIFIED. GPT/Supabase on-tape. Tiny data. Long `kOKavHnlPik`.

## I. Questions

What are the exact four methods’ setups on the long? When does he combine them?

## J. Connections

**SYSTEM SYNTHESIS:** Long `kOKavHnlPik`. Pair `Fu6vOfzFmcw` / `QojPKL96Dx4`. Maps to `wiki-ingest` (right store) + `golden-test-loop` + `info-gain-cite`.

## K. Future-Use

Unassigned: a four-way question→method card; order-loss as a vector warning label.

## Steal / Operate-never

### Machine: Question-type → retrieval method (vectors are not the default)
- **Epistemic:** SOURCE
- **Workflow / loop:** Classify question (count/filter vs order vs topical) → pick filter/SQL/full-read/vector → run a known question → check the known failure (order loss on vectors) → stop
- **Questions / signals:** Is this a count? Does order matter? Does the doc fit the window? Are we defaulting to vectors?
- **Qualify / frame / objections:** Qualify: they said “RAG” but the question is a SQL count. Frame: four methods. Objection: “just embed it” — he shows order loss.
- **Procedure:** Do not default to vectors. Do not install Supabase. Mark tape numbers UNVERIFIED.
- **Example that proves it:** Speakers-on-date via filters; top products via SQL; chronology via full-read; same Q via vectors loses order.
- **Why it works:** Accuracy is method-fit, not “we have RAG.” He proves it by breaking chronology on purpose.
- **Conditions / exceptions:** Tiny tables. Caption $ UNVERIFIED. Vendors on-tape.
- **Operate-never payload:** Install a vector DB for every client question. Quote SQL revenue as FACT. Call vectors accurate on ordered tasks.
- **Hive run (existing skills only):** `wiki-ingest` · `golden-test-loop` · `info-gain-cite` · `ask-principal`
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN


### Operate-never
- Default every job to a vector store.
- Quote the SQL product revenues as FACT.
- Install Supabase/GPT because of this short.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “make agents accurate / four RAG methods.” Felt problem is a wrong answer type — if named. Do not install four retrieval stacks on a parked client.

**Four-blank after constraint:** Toddler stop = we can say which of the four methods and what failure we checked.

**Skeptical-customer:** “Watch this video” titles are smash. Clients parked.
