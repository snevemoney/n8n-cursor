# Creative Studio — Fu6vOfzFmcw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Simple RAG pipeline short. Beats: new doc in a Google Drive folder → vector DB; Drive trigger on file created in a specific folder; fetch test event; download file by ID from the trigger; Supabase vector store; run → five items; refresh, five rows appear; before the next pipeline, a quick agent with no system prompt, only a tool; ask “what is our shipping policy?”; answer: processed 1–2 days, standard 3–7 days; “I didn’t even give the agent a prompt… look how smart”; play-button magnet. Caption ingest. On-tape: n8n, Drive, Supabase.

## B. Atomic Knowledge

### Folder-drop ingest
- **Claim:** Accuracy starts with a watched folder: new file → download by ID → embed → countable rows.
- **Reasoning:** The pipeline is the product; the agent is a probe.
- **Mechanism:** Drive folder create → download → Supabase → 5 items visible.
- **Evidence:** “takes a new doc that we drop into a Google Drive folder and it puts it into a vector database… five items should be there… they popped up right there.”
- **Conditions:** One folder, one file type he cares about (policy/FAQ).
- **Exceptions:** Dumping a whole drive is not this machine.
- **Action:** One drop folder; count the rows as the stop.
- **Confidence:** SOURCE.
- **Source:** `Fu6vOfzFmcw` @ 00:00
- **Epistemic:** SOURCE

### Probe with a known answer
- **Claim:** He validates by asking a question whose answer he already knows (shipping policy).
- **Evidence:** “what is our shipping policy… Orders are processed within one to two business days. Standard shipping takes 3 to seven… it is correct.”
- **Conditions:** A ground-truth sentence exists in the doc.
- **Exceptions:** “Look how smart” with no prompt is a vibe — the real stop is the matching sentence.
- **Action:** Ask a known-answer question; match the sentence; ignore the “no prompt” flex.
- **Confidence:** SOURCE for the Q; UNVERIFIED that the doc said exactly that.
- **Source:** `Fu6vOfzFmcw` @ 00:49
- **Epistemic:** SOURCE

## C. Mental Models
Ingest first, chat second. Row count is proof the pipe works. A dumb agent + a tool can look smart if the store is right. Folder, not graph.

## D. Procedures
1. Pick one folder.
2. Trigger on file created.
3. Download by trigger ID.
4. Embed; count rows.
5. Ask a known-answer question.
6. Stop when the sentence matches.

Avoid: chatting before the five rows exist.

## E. Examples
**Situation:** Policy/FAQ dropped.  
**Action:** Folder trigger → 5 vectors → shipping question → matching sentence.  
**Reasoning:** Pipe then probe.  
**Outcome:** “Correct.”  
**Lesson:** The walkthrough is five rows + a cited sentence, not a chat bubble.

## F. Decision Rules
- If rows are not visible → do not demo the agent.
- If the question is not known-answer → it is not a validation.
- If you need a long system prompt to “make RAG work” → the store is the problem.

## G. Contrarian
He flexes “no prompt.” Hive should treat that as a warning: the store did the work; do not ship unprompted agents as a SKU.

## H. Assumptions
Five chunks from one doc. Supabase on tape. Shipping numbers UNVERIFIED as policy FACT.

## I. Questions
What was the second pipeline he deferred? Chunking settings? Visual table?

## J. Connections
- SYSTEM SYNTHESIS → `ZwQ8rJhVCr4` (four RAG methods; full-context vs chunk).
- SYSTEM SYNTHESIS → `QojPKL96Dx4` / `kOKavHnlPik` / `KVFfApQZhE4`.
- SYSTEM SYNTHESIS → `golden-test-loop` (known-answer).

## K. Future-Use
Known-answer probe card for any ingest. Unassigned.

## Steal / Operate-never

### Machine: drop-count-probe
- **Epistemic:** SOURCE
- **Workflow / loop:** one folder drop → embed → count rows → known-answer question → sentence match stop
- **Questions / signals:** How many rows? Does the sentence match the doc?
- **Qualify / frame / objections:** “No prompt / so smart” is not the stop
- **Procedure:** Ingest visible before chat
- **Example that proves it:** FAQ drop → 5 rows → shipping policy sentence
- **Why it works:** You can see the store before you trust the mouth
- **Conditions / exceptions:** One folder; known answer required
- **Operate-never payload:** Supabase/n8n-cloud install; quote 1–2 / 3–7 days as FACT
- **Hive run:** `golden-test-loop`; `info-gain-cite`
- **Source:** `Fu6vOfzFmcw` @ 00:49

### Operate-never
- Install Supabase/n8n-cloud as hive SKU. New hunt.
- Quote shipping times as FACT. Auto-publish.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: “keep RAG accurate” — plate is **five rows + the cited sentence**, not a glowing brain. HITL. Clients parked.
