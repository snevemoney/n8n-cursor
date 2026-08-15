# Forge — Fu6vOfzFmcw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
RAG ingest teaser. Beats: pipeline = new doc in a Drive folder → vector DB → Google Drive trigger “on changes involving a specific folder” / file created → fetch test event → second Drive node download-by-ID (ID from trigger) → Supabase vector store → run → **five items** → refresh, five rows appear → before the query pipeline, a quick agent with **no prompt**, only the tool → “what is our shipping policy?” → answer: process 1–2 business days, standard 3–7 → “it is correct” → play-button. Timestamp UNKNOWN. Sibling `kOKavHnlPik` / `ZwQ8rJhVCr4`.

## B. Atomic Knowledge

### Folder-create → download-by-ID → upsert
- **Claim:** Ingest is trigger on new file in a named folder, download that ID, write vectors.
- **Reasoning:** Super simple; ID must come from the trigger, not a hardcoded name.
- **Mechanism:** Drive trigger → download → Supabase vector store.
- **Evidence:** First two-thirds.
- **Conditions:** Connected Drive + chosen folder.
- **Exceptions:** He misspeaks “folder arrived” then corrects to file.
- **Action:** ID from trigger. Count the chunks (five) as the stop.
- **Confidence:** high.
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE

### Smoke the retrieve before building the second pipeline
- **Claim:** He validates with a bare agent (no system prompt) asking shipping policy; checks the answer against the doc.
- **Reasoning:** If retrieve works, the ingest worked.
- **Mechanism:** One question, one tool, compare to known text.
- **Evidence:** Close.
- **Conditions:** He already knows the policy text.
- **Exceptions:** “Look how smart” is theater; the check is the match.
- **Action:** One known question before more nodes.
- **Confidence:** high.
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Ingest is a pipeline, not an agent. The agent is a flashlight on the store. Chunk count is a receipt. No prompt needed to prove retrieve.

## D. Procedures
1. Pick folder. 2. Trigger on file created. 3. Download by trigger ID. 4. Upsert. 5. Refresh and count rows. 6. Ask one fact you already know. 7. Compare. Then build the real query path (long).

## E. Examples
**Situation:** Policy/FAQ dropped in Drive.  
**Action:** Ingest → 5 vectors → “shipping policy?”  
**Reasoning:** Validate readback.  
**Outcome:** 1–2 / 3–7 days — he says correct.  
**Lesson:** Known-answer smoke. Don’t trust “smart.”

## F. Decision Rules
- If rows ≠ expected chunks → do not query.
- If you need a clever prompt to retrieve → ingest is suspect.
- If the answer isn’t in the file → fail.

## G. Contrarian
Field starts at the chat UI. He starts at the folder trigger and a row count.

## H. Assumptions
Five chunks = the whole FAQ. Falsifier: a right-sounding policy that isn’t in the file.

## I. Questions
Chunking settings? Long-tape accuracy methods (`ZwQ8rJhVCr4`)?

## J. Connections
SYSTEM SYNTHESIS: `kOKavHnlPik`, `ZwQ8rJhVCr4` (filter/SQL/full-context/vector). `irg-2IfAjpo` Gemini file search. `golden-test-loop`.

## K. Future-Use
Known-answer retrieve as the only legal “RAG is done.”

## Steal / Operate-never

### Machine: folder ingest → count chunks → one known question
- **Epistemic:** SOURCE
- **Workflow / loop:** file created → download ID → upsert → count rows → ask a fact you know → match or fail
- **Questions / signals:** How many items landed? Does the answer match the file?
- **Qualify / frame / objections:** No system prompt on the smoke agent.
- **Procedure:** Do not build the second pipeline until the smoke passes.
- **Example that proves it:** Shipping policy 1–2 / 3–7.
- **Why it works:** Retrieve without a prompt isolates ingest.
- **Conditions / exceptions:** He already knew the answer. Supabase on-tape.
- **Operate-never payload:** Install Supabase/n8n RAG mill; quote “accurate” as FACT.
- **Hive run:** `slice-build` (one ingest) + `golden-test-loop`.
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN

### Operate-never
- Ship RAG because the agent “sounded smart.”
- New hunt. Prod vectors of client docs without HITL.
- Send / pay / deploy / book / publish. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not one-shot a RAG product. Ingest one folder, count rows, ask one known fact. No prompt theater. Deploy HITL.
