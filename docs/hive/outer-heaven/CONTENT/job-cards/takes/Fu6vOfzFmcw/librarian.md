# Librarian — Fu6vOfzFmcw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Fu6vOfzFmcw/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** How to Keep Your RAG Agent's ACCURATE
**Channel:** Nate Herk | AI Automation
**Kind:** short (~1:39 / ~397 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Simple RAG pipeline in n8n: new doc dropped in a Google Drive folder → vector database.
2. Google Drive trigger: on changes in a specific folder; watch for new file created; fetch test event → file arrives.
3. Second Drive node: download file by ID from the trigger.
4. Supabase vector store step; run; policy/FAQ doc → five items; refresh; five items appear.
5. Before the next pipeline: quick AI agent to validate it can read the document.
6. Ask "what is our shipping policy" with no system prompt — only a tool hooked up.
7. Answer: orders processed 1–2 business days; standard shipping 3–7 business days; he says it is correct.
8. CTA: full video.
Gap: chunking, embeddings, the "next pipeline" (query path). Timestamp UNKNOWN. n8n / Drive / Supabase on-tape. Shipping numbers UNVERIFIED as ours.

## B. Atomic Knowledge

### Ingest = folder trigger → download-by-ID → vector write
- **Claim:** RAG ingest is a Drive-folder create-trigger, download the triggering file by ID, write to a Supabase vector store.
- **Reasoning:** "Super simple" — the keep is the path, not a fancy index.
- **Mechanism:** on-create → download by ID → vector store → N items.
- **Evidence:** "takes a new doc that we drop into a Google Drive folder and it puts it into a vector database" / "five items should be there"
- **Conditions:** Drive folder + Supabase
- **Exceptions:** Next pipeline not built on this short
- **Action:** File ingest path; park Supabase as hive
- **Confidence:** high as demo
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE

### Validate with a no-prompt tool-only ask
- **Claim:** He validates by asking shipping policy with no system prompt — only a vector tool — and checks the answer against the doc.
- **Reasoning:** Title says ACCURATE; the stop is a correct cite from the just-ingested file.
- **Mechanism:** Agent + tool, no prompt → question → compare to source.
- **Evidence:** "I didn't even give the agent a prompt or anything. We just hooked it up to a tool" / "it is correct"
- **Conditions:** Doc just written; question is in the doc
- **Exceptions:** He does not show the PDF text on this short
- **Action:** File validate-after-ingest; shipping days UNVERIFIED as hive policy
- **Confidence:** medium (he asserts correct)
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Ingest first, query second. Five items popping up is the write receipt. No-prompt agent is a costume to show the tool is doing the work. Accuracy = matches the doc he just dropped.

## D. Procedures
1. Pick a Drive folder; trigger on new file created; fetch test event.
2. Download by the triggering file ID.
3. Write to vector store; refresh; count items.
4. Ask a question that is in the doc; no extra prompt; check the answer.
Avoid: hive Supabase. Signals: five items; shipping answer he calls correct.

## E. Examples
**Policy/FAQ ingest:** Situation — policy and FAQ dropped. Action — Drive trigger → download → Supabase; five items. Reasoning — simple ingest. Outcome — shipping-policy answer 1–2 / 3–7 days, called correct. Lesson — write-count + a source question is the accuracy stop.

## F. Decision Rules
- If items did not appear → ingest failed; do not query.
- If the answer is not in the dropped doc → do not call it accurate.
- Refuse: Supabase as hive RAG; quote shipping days as our policy.

## G. Contrarian
Against needing a system prompt to "make RAG accurate" on this short — he uses no prompt. Against building query before ingest validates.

## H. Assumptions
Theirs: five chunks + one question = accurate (thin). Ours: title overclaims; this is ingest+smoke. Falsifier: `kOKavHnlPik` / `QojPKL96Dx4` / `irg-2IfAjpo` may add eval — do not flatten. Idle vector $ from `lokbsA5VXOk` still operate-never.

## I. Questions
What is the next pipeline? Chunk size? Does the long show a miss?

## J. Connections
SYSTEM SYNTHESIS → `kOKavHnlPik`; `QojPKL96Dx4`; `irg-2IfAjpo`; `lokbsA5VXOk` (cite gap / idle GB); `wiki-ingest` (raw drop, not a second vector SKU).

## K. Future-Use
Validate-after-ingest atom. Unassigned: hive stays markdown wiki, not Supabase.

## Steal / Operate-never

### Machine: ingest-then-smoke-ask
- **Epistemic:** SOURCE
- **Workflow / loop:** drop doc → folder trigger → download-by-ID → vector write → count items → ask a question that is in the doc (no extra prompt) → checkable stop = item count + answer matches the source
- **Questions / signals:** How many items? Is the answer in the file?
- **Qualify / frame / objections:** "ACCURATE" is the title; the demo is a smoke test
- **Procedure:** no system prompt on the smoke agent
- **Example that proves it:** FAQ/policy → five items → shipping 1–2 / 3–7 called correct
- **Why it works:** write receipt + source question
- **Conditions / exceptions:** one question; Supabase on-tape
- **Operate-never payload:** Supabase as hive; shipping days as FACT; idle vector store
- **Hive run:** `wiki-ingest` · `golden-test-loop`
- **Source:** `Fu6vOfzFmcw` @ UNKNOWN

### Operate-never
- Supabase / Drive RAG as hive. Quote shipping SLA as FACT. Idle GB/day store.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File ingest path + smoke-ask. Do not stand up a vector SKU. Outer Heaven raw→page is the analog: drop, then ask a question the page must answer.
