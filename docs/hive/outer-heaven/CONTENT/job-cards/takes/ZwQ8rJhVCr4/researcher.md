# Researcher — ZwQ8rJhVCr4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Four RAG methods, one short. Beats: (1) Hook: agents not accurate. (2) Four examples: filters, SQL, full context, vector DB. (3) **Filters:** “How many Bluetooth speakers on September 16th?” → product-name filter then date filter → **five**. (4) **SQL:** Postgres in Supabase, sales, 50 rows vs 20; “three highest earning products” → AI automation course 34.93, consulting call 33383, workflow template 1659 + % of revenue. (5) **Full context:** two docs; don’t chunk; agent reads the whole thing every time; chronological breakdown of “agent in 2 hours” video (hook, stack, personal, lead gen, sales…) because it read the whole; **4,000 tokens of GPT-5 Mini’s 400,000**. (6) **Vector:** same two docs in Supabase; same chronological Q → faster/cheaper, **less accurate, doesn’t understand order**. (7) Play-button. Timestamp UNKNOWN. Long siblings: `kOKavHnlPik`, `QojPKL96Dx4`. $ / row counts / token limits UNVERIFIED. ASR “33383” vs “34.93” — do not tidy into one scale.

## B. Atomic Knowledge

### Pick method by question type
- **Claim:** Accuracy problems are often the wrong retrieval method, not a dumber model.
- **Reasoning:** Count/date → filter; aggregates → SQL; order/plot → full doc; cheap FAQ → vectors.
- **Mechanism:** Four parallel agents on different stores.
- **Evidence:** Filter→5 speakers; SQL→three products; full context keeps chronology; vectors lose order.
- **Conditions:** You can choose per question.
- **Exceptions:** Numbers on tape are demo data (course 34.93 vs consulting 33383 look inconsistent — store as spoken).
- **Action:** Classify the question before picking RAG.
- **Confidence:** high as a teaching frame.
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE

### Full context vs chunk is an accuracy/cost trade
- **Claim:** Whole-doc read preserves order and used 4k/400k; vectors are cheaper/faster and scramble chronology.
- **Reasoning:** Chunks don’t know sequence.
- **Mechanism:** Same two transcripts, two methods, same Q.
- **Evidence:** He states the accuracy drop and the token fraction.
- **Conditions:** Docs fit the window (he chose mini + 4k).
- **Exceptions:** Docs that do not fit → you cannot use this full-context move.
- **Action:** If the Q is chronological/structural, prefer full read; do not default vector.
- **Confidence:** high as his A/B on this Q.
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
“RAG” is four methods, not one vector store. Filters/SQL are RAG in his mouth. Token headroom is why full context is allowed. He is willing to show the vector method lose.

## D. Procedures
1. Classify Q: count/filter, aggregate/SQL, structure/order, or fuzzy lookup.
2. Run the matching method.
3. For structure Qs, A/B full vs vector on the same Q.
4. Record tokens and whether order survived.
5. Do not quote 5 / 34.93 / 4k/400k as FACT.

## E. Examples
- **Situation:** Bluetooth speakers on Sep 16. **Action:** Two filters (product, date). **Outcome:** Five. **Lesson:** Don’t embed a count.
- **Situation:** Chronology of a video transcript. **Action:** Full read vs vectors. **Outcome:** Full keeps order; vector cheaper and wrong-order. **Lesson:** Method × question. Implicit rule: same corpus, different method, different truth.

## F. Decision Rules
- If the Q is “how many / on date” → filter or SQL, not vectors.
- If the Q is “in order” → full context if it fits.
- Refuse: one default RAG; Supabase as hive; quote benches as FACT.

## G. Contrarian
Vectors are the last method and he shows them losing. Field default is “just embed it.”

## H. Assumptions
5 and the revenue figures are correct for his tables. 400k window for “GBT5 Mini” is vendor/on-tape. Two transcripts are the same bytes in both methods.
**Desk dissent:** none yet. Do not flatten with “just drop a file” Gemini (`KVFfApQZhE4`).

## I. Questions
- What are the other two docs besides the 2-hour video?
- Would SQL have answered the Bluetooth count better than filters?

## J. Connections
- **SYSTEM SYNTHESIS:** `kOKavHnlPik`, `QojPKL96Dx4`, `Fu6vOfzFmcw`, `8IUWeF3B-hk`. `tNOk29fs_aY` / `8C6iCpJ9HPo` (the 2-hour agent video he summarized). `golden-test-loop`.

## K. Future-Use
Question-type → method card as unassigned retrieval doctrine.

## Steal / Operate-never

### Machine: classify-question-then-pick-retrieval
- **Epistemic:** SOURCE
- **Workflow / loop:** classify Q (filter / SQL / full / vector) → run that path → if order matters, A/B full vs vector → keep the one that preserves the needed structure
- **Questions / signals:** Is this a count, an aggregate, a chronology, or a fuzzy fact?
- **Qualify / frame / objections:** “Just use a vector DB” → he shows order loss.
- **Procedure:** D.
- **Example that proves it:** Speakers=5 via filters; chronology survives full 4k tokens and dies on vectors.
- **Why it works:** Method matches the question’s structure.
- **Conditions / exceptions:** Demo tables. Token numbers UNVERIFIED. Full context requires fit.
- **Operate-never payload:** Supabase/Postgres as hive default; quote 5/34.93/4k as FACT; new ICP.
- **Hive run:** `golden-test-loop` · `wiki-ingest` (when Evens names a corpus)
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN

**Operate-never**
- One-size vector RAG. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
This is the retrieval doctrine for the rest of the RAG cluster. Do not implement four stores. Keep Gemini/OpenAI/Drive paths as additional, not replacements.
