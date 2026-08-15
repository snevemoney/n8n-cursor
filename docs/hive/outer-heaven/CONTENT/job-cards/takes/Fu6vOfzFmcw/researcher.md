# Researcher — Fu6vOfzFmcw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
RAG ingest short. Beats: (1) Pipeline 1: new doc in a Google Drive folder → vector DB. (2) Drive trigger: changes in a specific folder; watch for file created; fetch test event. (3) Second Drive node: download file by ID from the trigger. (4) Supabase vector store; run; “five items”; refresh — five rows appear (policy/FAQ). (5) Before pipeline 2: tiny agent, no prompt, just a vector tool. (6) Ask “what is our shipping policy?” → processed 1–2 days; standard shipping 3–7 days; “it is correct.” (7) Play-button. Timestamp UNKNOWN. Long siblings: `QojPKL96Dx4`, `kOKavHnlPik`, `irg-2IfAjpo`. Supabase on-tape.

## B. Atomic Knowledge

### Folder-drop ingest
- **Claim:** RAG starts as “file created in a watched folder → download by ID → upsert vectors.”
- **Reasoning:** Super simple; the trigger ID is the file to download.
- **Mechanism:** Drive folder trigger → download → Supabase vector store → N chunks (here: 5).
- **Evidence:** Five items appear after refresh.
- **Conditions:** Connected Drive; chosen folder; vector store.
- **Exceptions:** This clip is ingest only; retrieval quality is one question.
- **Action:** Steal folder-drop → ID → chunk count as the checkable stop.
- **Confidence:** high for the happy path.
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE

### No-prompt agent + one gold question
- **Claim:** A tool-only agent with no system prompt can answer a shipping-policy question from the new vectors, and he checks the numbers.
- **Reasoning:** Validate ingest before building “the next pipeline.”
- **Mechanism:** Ask a known fact; compare to the doc.
- **Evidence:** 1–2 business days process; 3–7 standard shipping; “correct.”
- **Conditions:** You know the gold answer.
- **Exceptions:** One question ≠ RAG accuracy (`other tape: keep RAG accurate`).
- **Action:** One gold question after ingest, before more graph.
- **Confidence:** high as a smoke test; low as “the agent is smart.”
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Ingest and ask are two pipelines; he refuses to build the second before a smoke test. Chunk count (5) is a visible stop. “I didn’t even give a prompt” is a flex — also a risk (INFERENCE).

## D. Procedures
1. Watch a folder for file created.
2. Download by trigger file ID.
3. Upsert to a vector store; confirm chunk count.
4. Temporary agent + retrieval tool.
5. Ask one gold question; match the doc; then continue.

## E. Examples
- **Situation:** Policy/FAQ dropped in Drive. **Action:** Ingest → 5 vectors → “what is our shipping policy?” **Reasoning:** Validate read-back. **Outcome:** Matches 1–2 / 3–7 days. **Lesson:** Gold Q is the stop. Implicit rule: chunk count is necessary but not sufficient.

## F. Decision Rules
- If ingest just ran → count chunks, then ask a gold Q.
- If you have no gold Q → you are not validating.
- Refuse: Supabase as hive default; “look how smart” as FACT.

## G. Contrarian
Validates with zero prompt. Field often writes a long RAG prompt first.

## H. Assumptions
Five chunks are the whole doc. Shipping numbers are in the FAQ. One correct answer = pipeline works. Drive + Supabase on-tape.
**Desk dissent:** none yet. Other RAG tapes may demand more than one Q — do not flatten.

## I. Questions
- What is pipeline 2?
- Chunker settings?
- Wrong-answer behavior?

## J. Connections
- **SYSTEM SYNTHESIS:** `QojPKL96Dx4`, `kOKavHnlPik`, `irg-2IfAjpo`, `ZwQ8rJhVCr4`. `golden-test-loop`. No new ICP.

## K. Future-Use
Gold-question-after-ingest as unassigned RAG smoke test.

## Steal / Operate-never

### Machine: folder-ingest-count-then-gold-q
- **Epistemic:** SOURCE
- **Workflow / loop:** folder create → download by ID → upsert → check N chunks → ask one known Q → only then build more
- **Questions / signals:** How many chunks? Does the answer match the doc?
- **Qualify / frame / objections:** “The agent is smart” → he checked shipping days.
- **Procedure:** D.
- **Example that proves it:** FAQ → 5 items → shipping policy numbers match.
- **Why it works:** Separates ingest proof from app graph.
- **Conditions / exceptions:** One Q is a smoke test. Vendors on-tape.
- **Operate-never payload:** Supabase/Drive as hive SKU; quote “correct” as FACT; new RAG-product ICP.
- **Hive run:** `golden-test-loop` · `wiki-ingest` (if Evens points at our corpus)
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN

**Operate-never**
- Stand up Supabase RAG for a client. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Steal the smoke test. Do not implement Drive→Supabase. Keep one-Q vs multi-eval disagreement open when `8IUWeF3B-hk` is in the room.
