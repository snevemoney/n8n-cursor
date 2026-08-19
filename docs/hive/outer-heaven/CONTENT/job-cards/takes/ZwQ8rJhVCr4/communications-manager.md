# Communications Manager — ZwQ8rJhVCr4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ZwQ8rJhVCr4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** 4 Simple RAG Methods for Better AI Agents
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** short · 641 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Four methods: filters, SQL query, full context, vector DB.
- Filters: “How many Bluetooth speakers sold Sep 16 this year?” → product-name filter + date filter → five.
- SQL/Postgres/Supabase (50 rows vs 20): “three highest earning products” → AI automation course 34.93, consulting call 33383, workflow template 1659 + % of revenue (numbers as on tape, UNVERIFIED).
- Full context: don’t chunk; let the agent read the whole doc. Ask chronological breakdown of “agent in 2 hours” video — opening hook, stack, personal context, lead gen, sales moment, in order. 4,000 tokens of GPT-5 Mini’s 400,000 window.
- Vectors in Supabase of the same two docs: same question is faster/cheaper but less accurate on order because it doesn’t understand order.
- CTA: full. Long-form `kOKavHnlPik`.

## B. Atomic Knowledge

### Pick the retrieve method for the question type
- **Claim:** Counts/dates → filters. Aggregates → SQL. Order/chronology → full context. Cheap/fast → vectors (and you lose order).
- **Reasoning:** Method must match the question or you get a confident wrong.
- **Mechanism:** Four parallel examples on one canvas.
- **Evidence:** Vector path: “faster and cheaper… not as accurate because it doesn’t understand order.”
- **Conditions:** Structured tables vs long transcripts.
- **Exceptions:** Numbers on tape UNVERIFIED. GPT-5 Mini / 400k on-tape. Not a send.
- **Action:** Steal the match-method rule. Do not quote 34.93 / 33383 as our revenue.
- **Confidence:** high as heuristic
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Question type chooses the retrieve. **SOURCE**
- Full context is for order. Vectors are for cheap. **SOURCE**
- Token window flex (4k/400k) is not a quality bar. **INFERENCE**

## D. Procedures
- If count/date → filter. If top-N money → SQL. If chronology → whole doc. If cheap → vector and expect order loss. **SOURCE**
- This desk: if the letter needs order, don’t vector-summarize the tape. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Four question types. → **Action:** Filter 5 speakers; SQL top-3; full-doc chronology; vector same Q cheaper/wronger on order. → **Reasoning:** Match method. → **Outcome:** He shows the trade. → **Lesson:** Cheap retrieve loses sequence. Implicit rule: don’t use vectors to tell a story in order.

## F. Decision Rules
- If the answer needs order → full context, not vectors.
- If the answer is a count → filter/SQL, not an LLM guess (`NWbh5ZoEHkA`).
- Refuse: tape revenue as ours. Auto-answer customers.
- Optimize: method-match.

## G. Contrarian
- Field defaults to vectors. He shows three other methods first. **SOURCE**

## H. Assumptions
- 5 speakers / revenue figures / 4k/400k UNVERIFIED. Falsifier: SQL that sums the wrong column.

## I. Questions
- Are the two documents the same as the 2-hour agent video transcript?

## J. Connections
- **SYSTEM SYNTHESIS:** `kOKavHnlPik` · `Fu6vOfzFmcw` · `NWbh5ZoEHkA`. `golden-test-loop`.

## K. Future-Use
- Method-match card for any retrieve-before-draft.

## Steal / Operate-never

### Machine: Match retrieve to the question; don’t vector a chronology into a letter
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Need a fact → classify question (count / aggregate / order / cheap) → pick method → check → **stop**. No customer auto-answer. No tape $.
- **Questions / signals:** Does this need order? Is this a count? Did we use vectors on a story?
- **Qualify / frame / objections:** Qualify: method vs vibe-RAG. Frame: match. Objection: “just embed it” → not if order matters.
- **Procedure:** 1) Classify the Q. 2) Pick method. 3) Check. 4) Do not send.
- **Example that proves it:** Chronology via full context works; same Q via vectors loses order.
- **Why it works:** Wrong retrieve is how letters get the story backwards. Cheap is not the default for sequence.
- **Conditions / exceptions:** RAG-method tapes. Exceptions: no structured source → don’t invent SQL.
- **Operate-never payload:** Quote demo revenue. Auto-RAG customers. GPT-5 as stack.
- **Hive run (existing skills only):** `golden-test-loop` · `info-gain-cite` · `warm-draft-hitl`.
- **Source:** `ZwQ8rJhVCr4` @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote course/consulting revenue as FACT. Auto-RAG a customer. Vector a chronology into mail.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I pick a retrieve method before I draft a number or a sequence. I do not send. Clients parked.
