# Day Planner — KVFfApQZhE4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KVFfApQZhE4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KVFfApQZhE4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short: Gemini file-search API in n8n. Beats: drop a doc → embeddings → chat; skip a “huge massive data pipeline”; four HTTP steps — (1) create store/“folder,” (2) upload file to Google Cloud, (3) move file into the store, (4) query; agent + tool; demo PDF = rules of golf ~22 pages; ask “what happens if your club breaks”; answer + source (rule 4, clubs). CTA to full (`irg-2IfAjpo`). Timestamp UNKNOWN. Title also says “10x cheaper” — not in this caption body. Vendor: Gemini — on-tape.

## B. Atomic Knowledge
### Four HTTP steps, not a homemade pipeline
- **Claim:** Create store → upload to Google → move into store → query is enough; you do not build a huge ingest graph.
- **Reasoning:** The API owns embeddings.
- **Mechanism:** Four HTTP requests, then an agent tool.
- **Evidence:** “without having to build a huge massive data pipeline.”
- **Conditions:** Gemini file search is available.
- **Exceptions:** You still must not skip move-into-store (upload ≠ in folder).
- **Action:** Steal the four-step order. Do not add Gemini as stack.
- **Confidence:** high as his order.
- **Source:** `KVFfApQZhE4` @ UNKNOWN
- **Epistemic:** SOURCE

### Answer must cite the store
- **Claim:** The club-break answer should also say where it came from (knowledge base / rule 4).
- **Reasoning:** A fluent answer without a source is not RAG.
- **Mechanism:** Agent → knowledge tool → short answer + source.
- **Evidence:** “tells us where it got it from… source was from the knowledge base… rule four, clubs.”
- **Conditions:** A real PDF in the store.
- **Exceptions:** No citation → fail even if it sounds right.
- **Action:** Citation is the checkable stop.
- **Confidence:** high he required it.
- **Source:** `KVFfApQZhE4` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Folder metaphor for a vector store. Upload and “in the folder” are different states — he insists on the move. Priority: skip pipeline complexity. Golf PDF is a neutral corpus. Uncertainty: 10x cheaper is title-only here.

## D. Procedures
1. Create store.
2. Upload.
3. Move into store (do not skip).
4. Query via tool.
5. Pass = answer + source pointer.
Avoid: Gemini install; treating title “10x” as FACT.

## E. Examples
**Broken club / rule 4:** Situation → 22-page golf PDF in the store. Action → ask club-break during a round. Reasoning → known rule. Outcome → continue/repair/replace + source rule 4. Lesson → citation is the stop.

## F. Decision Rules
- If the file is uploaded but not moved → not queryable (his own warning).
- If the answer has no source → fail.
- If “10x cheaper” is the reason for a block → CUT (UNVERIFIED).

## G. Contrarian
Rejects building your own chunk/embed/upsert graph when a file-search API exists. Sibling `Fu6vOfzFmcw` still builds Drive→Supabase — store the disagreement.

## H. Assumptions
Theirs: Gemini file search is accurate and cheaper. Ours: 10x UNVERIFIED; vendor on-tape. Falsifier: cited the wrong rule. Survivorship: one golf Q.

## I. Questions
What is the fourth request’s payload? Cost vs `Fu6vOfzFmcw`? Full `irg-2IfAjpo`?

## J. Connections
- SYSTEM SYNTHESIS → `irg-2IfAjpo` · `Fu6vOfzFmcw` (disagreement: DIY vs API) · `QrJhdTbK3TU` (OpenAI file search) · `golden-test-loop`.

## K. Future-Use
Upload ≠ in-store as a general state machine. Unassigned.

## Steal / Operate-never

### Machine: create → upload → move → query-with-citation
- **Epistemic:** SOURCE
- **Workflow / loop:** create store → upload → move → ask known Q → pass only with source
- **Questions / signals:** Is it in the folder yet? Where did the answer come from?
- **Qualify / frame / objections:** “We uploaded it” is not ready. Citation-less fluency is a fail.
- **Procedure:** One PDF dry-run. No Gemini billing from this desk. No 10x as FACT.
- **Example that proves it:** Situation → golf rules PDF. Action → four HTTP + club-break Q. Reasoning → API owns embed. Outcome → answer + rule 4. Lesson → move then cite.
- **Why it works:** A move step prevents querying an empty store; a citation is checkable.
- **Conditions / exceptions:** DIY pipeline (`Fu6vOfzFmcw`) is a different machine. Do not install Gemini to use this.
- **Operate-never payload:** Gemini as stack; quote 10x as FACT; n8n-cloud.
- **Hive run (existing skills only):** `golden-test-loop`.
- **Source:** `KVFfApQZhE4` @ UNKNOWN

### Operate-never
- Install Gemini / switch stack.
- Quote 10x / 22 pages as FACT quality.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as upload-then-move + citation stop. Clients parked.
