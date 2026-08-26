# Forge — ZwQ8rJhVCr4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Four RAG methods teaser (long `kOKavHnlPik`). Beats: filters / SQL / full context / vector → **filters:** “how many Bluetooth speakers on Sept 16?” → product-name filter then date filter → **five** → **SQL:** Postgres/Supabase sales, 50 rows vs 20 → “three highest earning products” → AI automation course 34.93, consulting 33383, workflow template 1659 + % of revenue → **full context:** two docs, read entire file every time (not a chunk) → chronological breakdown of “agent in 2 hours” video (hook, stack, personal context, lead gen, sales…) because it read in order → **4,000 tokens of GPT-5 Mini’s 400,000** → **vector:** same two docs in Supabase → same chronological ask → faster/cheaper, **less accurate, loses order**. Play-button. Timestamp UNKNOWN. Counts/$ in the SQL demo UNVERIFIED (demo DB).

## B. Atomic Knowledge

### Pick the retrieve by the question shape
- **Claim:** Count-on-a-date → filters (or SQL). Chronology/order → full context. Vector is cheaper/faster and drops order.
- **Reasoning:** He runs the same-ish jobs on purpose to show the miss.
- **Mechanism:** Four graphs, four question types.
- **Evidence:** Speakers=5; top-3 SQL; full-context chronology; vector chronology worse.
- **Conditions:** Small tables / two transcripts.
- **Exceptions:** He does not say never use vectors.
- **Action:** Match method to question. Don’t default vector.
- **Confidence:** high.
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE

### Full context is a token budget, not a sin
- **Claim:** Whole-doc read used 4k / 400k on his mini model.
- **Reasoning:** “We all know what could happen” with chunking — so sometimes don’t chunk.
- **Mechanism:** Stuff the docs every turn.
- **Evidence:** Token aside.
- **Conditions:** Docs fit. Demo size.
- **Exceptions:** Millions of pages — not this tape (`sboNwYmH3AY` wiki vs RAG).
- **Action:** If order matters and the file fits, don’t chunk.
- **Confidence:** high on the rule; 4k/400k UNVERIFIED.
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE — token counts UNVERIFIED

## C. Mental Models
RAG is a menu. Vector is one plate. Accuracy vs cost/speed is explicit. Filters/SQL are agents too.

## D. Procedures
1. Name the question type (count, aggregate, order, semantic). 2. Pick filter / SQL / full / vector. 3. Run a question you can check. 4. If order dies on vector, switch.

## E. Examples
**Situation:** Bluetooth speakers on Sept 16.  
**Action:** Two filters.  
**Outcome:** Five.  
**Lesson:** Don’t embed a count.

**Situation:** Chronology of a video transcript.  
**Action:** Full context vs vector.  
**Outcome:** Full keeps order; vector cheaper and wrong.  
**Lesson:** Order questions hate chunks.

## F. Decision Rules
- If the answer is a count/sum → filter or SQL.
- If the answer is sequence → full context if it fits.
- If you only care “aboutness” and cost → vector.

## G. Contrarian
Field defaults to a vector DB. He shows three other methods first.

## H. Assumptions
Demo DBs are tiny. Falsifier: a chronology that vectors get right with better chunking.

## I. Questions
Long-tape decision tree? SQL injection / allow-list?

## J. Connections
SYSTEM SYNTHESIS: `kOKavHnlPik` long. `Fu6vOfzFmcw` ingest. `4OOS96i2gfI` ladder (deterministic before agent). `golden-test-loop`.

## K. Future-Use
Four-method card on any “just add RAG” brief.

## Steal / Operate-never

### Machine: question-shape → filter/SQL/full/vector
- **Epistemic:** SOURCE
- **Workflow / loop:** classify the question → pick method → run a checkable ask → compare → stop
- **Questions / signals:** Count, aggregate, order, or vibe-about?
- **Qualify / frame / objections:** “Accurate RAG” is not always vectors.
- **Procedure:** No default Supabase. No 10x as FACT.
- **Example that proves it:** Same chronology ask; vector loses order.
- **Why it works:** Method matches the failure you care about.
- **Conditions / exceptions:** Tiny demo data. Token counts UNVERIFIED.
- **Operate-never payload:** Vector mill for every ask; quote 34.93 / 5 sold as FACT.
- **Hive run:** `slice-build` + `golden-test-loop`.
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN

### Operate-never
- Install Supabase/n8n RAG for every question.
- Quote demo revenue/counts as FACT.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not default to embeddings. If the ask is a count or an order, I use a table or the whole file. Deploy HITL.
