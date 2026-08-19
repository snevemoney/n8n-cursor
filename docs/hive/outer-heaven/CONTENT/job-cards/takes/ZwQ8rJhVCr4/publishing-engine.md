# Publishing Engine — ZwQ8rJhVCr4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** 4 Simple RAG Methods for Better AI Agents
**Channel:** Nate Herk | AI Automation

## A. Source Map
1. If agents aren't accurate, watch this. Four methods: filters, SQL query, full context, vector database.
2. Filters: 'How many Bluetooth speakers did we sell on September 16th?' Product-name filter then date filter → five speakers.
3. SQL agent: sales data in Postgres/Supabase, 50 rows vs 20. 'Three highest earning products' → sums revenue: AI automation course 34.93, consulting call 33383, workflow template 1659 + percentages. Figures UNVERIFIED / demo.
4. Full context: two documents; instead of chunking, let the agent read the entire document every time. Ask chronological breakdown of the 'agent in 2 hours' video → opening hook, stack, personal context, lead gen, sales moment, in order. 4,000 tokens of GPT-5 Mini's 400,000 window.
5. Vector: same two docs in Supabase. Same chronological Q — faster/cheaper, less accurate, does not understand order.
6. CTA: full breakdown.
Timestamp UNKNOWN (no VTT unless noted). Tape $ / student counts / job-loss % = UNVERIFIED.

## B. Atomic Knowledge

### Pick method by the question's shape
- **Claim:** Count-on-a-date → filters. Top-N revenue → SQL. Order-of-a-doc → full context. Cheap lookup → vector.
- **Reasoning:** Accuracy fails when you use vectors for a question that needs order or exact sums.
- **Mechanism:** Classify the question → pick filter / SQL / full / vector.
- **Evidence:** We're also of course going to notice that it's not as accurate because it doesn't understand order right now.
- **Conditions:** You know whether you need order, a sum, or a fuzzy lookup.
- **Exceptions:** One default RAG for every question is the fail he is teaching against.
- **Action:** On any Q&A pack, name which of the four we used and why.
- **Confidence:** high
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE

### Full context wins order; vector wins cost
- **Claim:** Chronological breakdown is correct when the model reads the whole transcript; vector is faster/cheaper and loses order.
- **Reasoning:** 4k/400k is his proof that 'whole doc' is affordable here.
- **Mechanism:** Same two docs, same Q, two methods, compare order + cost.
- **Evidence:** This only took 4,000 tokens out of GBT5 Mini's 400,000 context window limit.
- **Conditions:** The doc fits. You care about sequence.
- **Exceptions:** A 200k-token lake will not get this full-context pass.
- **Action:** If the pack needs sequence (a tape walk), prefer full read. Do not quote 4k/400k as a law.
- **Confidence:** high
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
- Four methods, not one RAG religion.
- Filters/SQL are not 'AI.' They are the first two.
- Token window is a condition, not a flex.

## D. Procedures
- Classify the question before you embed.
- If you need order, read the whole thing (if it fits).
- Do not publish the demo revenue figures.

## E. Examples
- Situation: Sales count vs top products vs chronology of a tape. Action: Filters; SQL; full read; vector. Reasoning: Shape of Q. Outcome: 5 speakers; ranked products; ordered breakdown vs cheaper unordered. Lesson: Method-follows-question; vector is last, not default.

## F. Decision Rules
- If we default to vectors for chronology → fail.
- If we quote course/$ revenue as FACT → never.
- Do not stand up their Postgres.

## G. Contrarian
- Field defaults to embeddings. He starts with filters and SQL.

## H. Assumptions
- Theirs: 5 speakers / those revenues are real. Demo tables. UNVERIFIED.
- 400k window is model-specific and will rot.

## I. Questions
- What are the two documents besides the 2-hour video?
- Is there a hybrid he prefers in the long video?
- Who typed the SQL — model or node?

## J. Connections
- **SYSTEM SYNTHESIS:** `kOKavHnlPik` / `QojPKL96Dx4` RAG long forms. `Fu6vOfzFmcw` ingest.
- **SYSTEM SYNTHESIS:** This fleet walk is a full-context job, not a vector skim — protocol A–K.

## K. Future-Use
- Unassigned: four-method picker card on any Q&A.
- Unassigned: full-context for tape chronology (this desk).

## Steal / Operate-never

### Machine: method-follows-question
- **Epistemic:** SOURCE
- **Workflow / loop:** name the Q shape (count / sum / order / fuzzy) → pick filter, SQL, full read, or vector → run → checkable stop = method named + a grade (count matches / order intact / cite)
- **Questions / signals:** Do we need order? A sum? A date filter? Why are we in a vector DB?
- **Qualify / frame / objections:** Not 'just add RAG.'
- **Procedure:** I pick full-read for tape chronology. I do not embed this corpus as a substitute for A–K.
- **Example that proves it:** Same chronology Q: full context keeps order; vector is cheaper and loses order.
- **Why it works:** Accuracy is a method choice. Cost is a method choice. Default vector is how you get wrong order.
- **Conditions / exceptions:** Demo $ UNVERIFIED. Windows rot. On-tape DB not ours.
- **Operate-never payload:** Quote demo revenue as FACT; one-RAG-religion; skip A–K because we embedded full.txt.
- **Hive run (existing skills only):** `deep-video-learning` · `wiki-ingest` · `info-gain-cite`
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN

**Operate-never**
- Publish / schedule live / paid boost without Evens.
- Republish Nate or any source creator.
- Quote tape $ / hours×rate / student counts as FACT or as our price.
- Send / pay / deploy / book.
- New icp_id / unpark a client / Grok Bot sendPrompt.
- Install on-tape vendors (n8n-cloud, Skool, Vapi, Claude, ChatGPT, Gemini, Coda, Abacus).
- Quote the demo product revenues as FACT.
- Default every question to vectors.
- Skip a transcript because a vector store exists.

## L. Role-Specific Applications
- I will name which of the four methods a pack used.
- Tape chronology stays full-read (this protocol). I will not skim-embed the 82.
- Evens publishes. I do not.
